const express = require("express");
const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors"); // Import CORS middleware
const { authenticateJWT } = require('./auth'); // Import your authentication middleware
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require("./config");
const nodemailer = require('nodemailer');

// Allow requests from http://localhost:3000
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specific headers
};
const app = express();
const port = 5000;

app.use(cors(corsOptions));




const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Online Task Management System",
    password: "root",
    port: 5432
})
client.connect();
app.use(express.json())

client.query('SELECT NOW()')
    .then(() => console.log("Db connected"))
    .catch((error) => console.log(error, "error"))


app.get('/', (req, res) => {
    res.send('Task Management Backend');
});


// Configure nodemailer to send emails
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'jpmca31@gmail.com',
        pass: 'stvtanblvcahjntq'
    }
});
function generateOTP(length) {
    const characters = '0123456789'; // Characters from which OTP will be generated
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += characters[Math.floor(Math.random() * characters.length)];
    }

    return otp;
}
// Endpoint to send OTP to user's email
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = generateOTP(6); // Function to generate OTP (implement as per your needs)

    // Check if email exists in otpcodes table
    const existingOTP = await client.query('SELECT * FROM otpcodes WHERE email = $1', [email]);

    if (existingOTP.rows.length > 0) {
        // If email exists, update the OTP record
        await client.query('UPDATE otpcodes SET otpcode = $1 WHERE email = $2', [otp, email]);
    } else {
        // If email does not exist, insert a new OTP record
        await client.query('INSERT INTO otpcodes (id, email, otpcode) VALUES ($1, $2, $3)', [uuidv4(), email, otp]);
    }
    // Send OTP to user's email
    try {
        await transporter.sendMail({
            from: 'jpmca31@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        });

        res.status(200).send({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).send({ error: 'Failed to send OTP' });
    }

});
app.post('/api/login', async (req, res) => {
    const { email_id, password } = req.body;

    try {
        // Example: Fetch user from database based on email
        const user = await client.query('SELECT * FROM users_profiles WHERE LOWER(email_id) = LOWER($1)', [email_id.toLowerCase()]);

        if (!user.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = {
            id: user.rows[0].id,
            email_id: user.rows[0].email_id
            // Add more fields as needed
        };

        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

        res.json({
            token, user: {
                id: user?.rows?.[0]?.id,
                email_id: user.rows[0].email_id,
                name: user.rows[0].name,
                role: user.rows[0].role,
                ...user?.rows?.[0]

            }
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// / /Route: /api / users_profiles / reset - password
app.post('/api/reset-password', async (req, res) => {
    const { email, newPassword, otp } = req.body;

    try {
        // Fetch OTP record from otpcodes table based on email
        const otpRecord = await client.query('SELECT * FROM otpcodes WHERE email = $1', [email]);

        if (otpRecord.rows.length === 0) {
            return res.status(404).json({ error: 'OTP not found or expired. Please request a new OTP.' });
        }

        const storedOTP = otpRecord.rows[0].otpcode;

        // Validate OTP
        if (otp === storedOTP) {
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update user's password in the database
            await client.query('UPDATE users_profiles SET password = $1 WHERE email_id = $2', [hashedPassword, email]);

            // Delete OTP record from otpcodes table
            await client.query('DELETE FROM otpcodes WHERE email = $1', [email]);

            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ error: 'Invalid OTP. Please enter the correct OTP.' });
        }
    } catch (error) {
        console.error('Error in /api/reset-password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/users_profiles/reset-password', async (req, res) => {
    const { email_id, new_password } = req.body;

    try {

        // Fetch user from database based on email
        const user = await client.query('SELECT * FROM users_profiles WHERE email_id = $1', [email_id]);

        if (!user.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update user's password in the database
        await client.query('UPDATE users_profiles SET password = $1 WHERE email_id = $2', [hashedPassword, email_id]);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error in /api/users_profiles/reset-password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Route: /api/users_profiles/upsert



// Upsert API for users_profiles
app.post('/api/users_profiles/upsert', async (req, res) => {
    const { id, name, email_id, phone_no, password, created_at = new Date(), updated_at = new Date(), role, is_active } = req.body;
    try {
        // Check if user already exists based on email


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        if (id?.length > 0) {
            // If the profile exists, perform a partial update
            const updatedProfile = await client.query(
                `UPDATE users_profiles
                     SET name = COALESCE($2, name),
                         email_id = COALESCE($3, email_id),
                         phone_no = COALESCE($4, phone_no),
                         password = COALESCE($5, password),
                         created_at = COALESCE($6, created_at),
                         updated_at = COALESCE($7, updated_at),
                         role = COALESCE($8, role ),
                         is_active  = COALESCE($9, is_active )
                     WHERE id = $1
                     RETURNING *;`,
                [id, name, email_id, phone_no, hashedPassword, created_at, updated_at, role, is_active]
            );

            res.json(updatedProfile.rows[0]);

        } else {
            const existingUser = await client.query('SELECT * FROM users_profiles WHERE email_id = $1', [email_id]);

            if (existingUser.rows.length > 0) {
                // User exists, update the profile (if needed in your logic)
                // Example: Update only if certain conditions met, otherwise send a conflict response
                return res.status(409).json({ error: 'User already exists' });
            }
            // If the profile doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO users_profiles (id, name, email_id, phone_no,password,created_at ,updated_at,role,is_active )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     RETURNING *;`,
                [uuidv4(), name, email_id, phone_no, hashedPassword, created_at, updated_at, role, is_active]
            );
            await transporter.sendMail({
                from: 'jpmca31@gmail.com',
                to: email_id,
                subject: `Welcome to Our Organization`,
                text: `Dear ${name},
                Welcome aboard to Our Organization! We are thrilled to have you join our team of talented members. Your skills and expertise will play a crucial role in our ongoing projects and the future growth of our organization.
 we are committed to fostering a collaborative and innovative environment where every team member contributes to our collective success. We believe in pushing boundaries, embracing challenges, and delivering exceptional results.
 your login details email =${email_id},password =${password}. please reset your password ASAP.
 
 `
            });
            res.json(result.rows[0]);

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Upsert API for projects
app.post('/api/projects/upsert', async (req, res) => {
    const { id, name, description, start_date, end_date, project_status, created_at = new Date(), updated_at = new Date(), team_members, is_active } = req.body;

    try {
        if (id?.length > 0) {
            // If the project exists, perform a partial update
            const updatedProject = await client.query(
                `UPDATE projects
                     SET name = COALESCE($2, name),
                         description = COALESCE($3, description),
                         start_date = COALESCE($4, start_date),
                         end_date = COALESCE($5, end_date),
                         project_status = COALESCE($6, project_status),
                         created_at = COALESCE($7, created_at),
                         updated_at = COALESCE($8, updated_at),
                         team_members = COALESCE($9, team_members),
                         is_active = COALESCE($10, is_active)
                     WHERE id = $1
                     RETURNING *;`,
                [id, name, description, start_date, end_date, project_status, created_at, updated_at, team_members, is_active]
            );

            res.json(updatedProject.rows[0]);

        } else {
            // If the project doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO projects (id, name, description, start_date,end_date ,project_status ,created_at,updated_at,team_members,is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)
                     RETURNING *;`,
                [uuidv4(), name, description, start_date, end_date, project_status, created_at, updated_at, team_members, is_active]
            );
            if (result?.rows[0]) {
                team_members?.map(async (i) => {
                    await client.query(
                        `INSERT INTO notifications (id, name, send_to,description, notification_status,project_id,notification_date,is_active,is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                        [uuidv4(), `"You are added to New Project" ${name}`, i, description, "projects", result?.rows?.[0]?.id ?? undefined, new Date(), true, false]
                    );
                })
            }

            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upsert API for tasks
app.post('/api/tasks/upsert', async (req, res) => {
    const { id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at = new Date(), updated_at = new Date(), is_active, task_status = false } = req.body;

    try {
        if (id) {
            // If ID exists, update the task
            const updatedTask = await client.query(
                `UPDATE tasks
                 SET name = COALESCE($2, name),
                     project_id = COALESCE($3, project_id),
                     description = COALESCE($4, description),
                     start_date = COALESCE($5, start_date),
                     end_date = COALESCE($6, end_date),
                     task_priority = COALESCE($7, task_priority),
                     assigned_id = COALESCE($8, assigned_id),
                     created_at = COALESCE($9, created_at),
                     updated_at = COALESCE($10, updated_at),
                     is_active = COALESCE($11, is_active),
                     task_status = COALESCE($12, task_status)
                 WHERE id = $1
                 RETURNING *;`,
                [id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active, task_status]
            );

            res.json(updatedTask.rows[0]);
        } else {
            // If ID doesn't exist, insert a new task
            const result = await client.query(
                `INSERT INTO tasks (id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active,task_status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)
                 RETURNING *;`,
                [uuidv4(), name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active, task_status]
            );
            if (result?.rows[0]) {
                await client.query(
                    `INSERT INTO notifications (id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                    [uuidv4(), `"New Task is Assigned To you" ${name}`, assigned_id, description, "tasks", result?.rows?.[0]?.id ?? undefined, new Date(), true, false]

                );
            }
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error("Error in /api/tasks/upsert", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upsert API for notifications
app.post('/api/notification/upsert', async (req, res) => {
    const { id, name, send_to, description, notification_status, task_id, notification_date = new Date(), is_active = true, is_read = false } = req.body;

    try {
        if (id?.length > 0) {
            // If the notifications exists, perform a partial update
            const updatednotifications = await client.query(
                `UPDATE notifications
                     SET name = COALESCE($2, name),
                         send_to = COALESCE($3, send_to),
                         description = COALESCE($4, description),
                         notification_status = COALESCE($5, notification_status),
                         task_id = COALESCE($6, task_id),
                         notification_date = COALESCE($7,notification_date),
                         is_active = COALESCE($8, is_active),
                         is_read= COALESCE($9,is_read)
                     WHERE id = $1
                     RETURNING *;`,
                [id, name, send_to, description, notification_status, task_id, notification_date, is_active, is_read]
            );

            res.json(updatednotifications.rows[0]);

        } else {
            // If the noupdatednotifications doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO notifications (id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                [uuidv4(), name, send_to, description, notification_status, task_id, notification_date, is_active, is_read]

            );

            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Get all users_profiles
app.post('/api/users_profiles', async (req, res) => {
    let { user_profile_id, search, start_date, end_date, offset = 0, limit = 10, is_active = true, role = [] } = req.body;

    try {
        let query = 'SELECT * FROM users_profiles';
        let countQuery = 'SELECT COUNT(*) FROM users_profiles';
        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Construct the base query and count query
        if (user_profile_id && user_profile_id.length > 0) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' users_profiles.id IN (' + user_profile_id.map((_, index) => '$' + (paramCount + index)).join(', ') + ')';
            countQuery += ' users_profiles.id IN (' + user_profile_id.map((_, index) => '$' + (paramCount + index)).join(', ') + ')';
            params.push(...user_profile_id);
            paramCount += user_profile_id.length;
            filterAdded = true;

        }

        // Add other filters based on conditions
        if (search) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' (name ILIKE $' + paramCount + ' OR email_id ILIKE $' + (paramCount + 1) + ')';
            countQuery += ' (name ILIKE $' + paramCount + ' OR email_id ILIKE $' + (paramCount + 1) + ')';
            params.push(`%${search}%`, `%${search}%`);
            paramCount += 2;
            filterAdded = true;
        }

        if (start_date) {
            const startTimestamp = new Date(start_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' created_at >= $' + paramCount;
            countQuery += ' created_at >= $' + paramCount;
            params.push(startTimestamp);
            paramCount++;
            filterAdded = true;
        }

        if (end_date) {
            const endTimestamp = new Date(end_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' created_at <= $' + paramCount;
            countQuery += ' created_at <= $' + paramCount;
            params.push(endTimestamp);
            paramCount++;
            filterAdded = true;
        }

        if (role.length > 0) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' users_profiles.role IN (' + role.map((_, index) => '$' + (paramCount + index)).join(', ') + ')';
            countQuery += ' users_profiles.role IN (' + role.map((_, index) => '$' + (paramCount + index)).join(', ') + ')';
            params.push(...role);
            paramCount += role.length;
            filterAdded = true;
        }



        // Add is_active filter
        query += filterAdded ? ' AND' : ' WHERE';
        countQuery += filterAdded ? ' AND' : ' WHERE';
        query += ' is_active = $' + paramCount;
        countQuery += ' is_active = $' + paramCount;
        params.push(is_active);
        paramCount++;

        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging


        // Execute main query to fetch filtered user profiles
        const result = await client.query(query, params);
        const finalResults = result.rows.map((profile) => ({
            ...profile,
            isActive: profile.is_active ? "active" : "inactive",
            totalCount
        }));

        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/api/dashboard', async (req, res) => {
    const { user_profile_id } = req.query;

    try {
        let query = `
            SELECT 
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1` : '1=1'}) as total_users_profiles,
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1 AND role = 'Admin'` : ` role = 'Admin'`}) as total_admin,
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1 AND role = 'HR'` : ` role = 'HR'`}) as total_hr,
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1 AND role = 'Manager'` : ` role = 'Manager'`}) as total_manager,
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1 AND role = 'Developer'` : ` role = 'Developer'`}) as total_developer,
                (SELECT COUNT(*) FROM users_profiles WHERE is_active = true AND ${user_profile_id ? `id = $1 AND role = 'Designer'` : ` role = 'Designer'`}) as total_designer,
                (SELECT COUNT(*) FROM tasks WHERE is_active = true AND ${user_profile_id ? `assigned_id = $1` : '1=1'}) as total_tasks,
                (SELECT COUNT(*) FROM task_doubts WHERE  ${user_profile_id ? `user_id = $1` : '1=1'}) as total_task_doubts,
                (SELECT COUNT(*) FROM projects WHERE is_active = true AND ${user_profile_id ? `team_members @> ARRAY[$1]` : '1=1'}) as total_projects,
                (SELECT COUNT(*) FROM notifications WHERE is_active = true AND ${user_profile_id ? `send_to = $1` : '1=1'}) as total_notifications,
       (SELECT COUNT(*) FROM notifications WHERE is_active = true AND ${user_profile_id ? `send_to = $1 AND is_read = false` : `is_read = false`}) as unread_notifications,
       (SELECT COUNT(*) FROM notifications WHERE is_active = true AND ${user_profile_id ? `send_to = $1 AND is_read = true` : ` is_read = true`}) as read_notifications,
                (SELECT COUNT(*) FROM projects WHERE ${user_profile_id ? `team_members @> ARRAY[$1] AND project_status = 'Completed'` : `project_status = 'Completed'`}) as completed_projects,
                (SELECT COUNT(*) FROM projects WHERE ${user_profile_id ? `team_members @> ARRAY[$1] AND project_status = 'In progress'` : `project_status = 'In progress'`}) as inprogress_projects,
                (SELECT COUNT(*) FROM projects WHERE ${user_profile_id ? `team_members @> ARRAY[$1] AND project_status = 'Yet to start'` : `project_status = 'Yet to start'`}) as yet_to_start_projects,
                (SELECT COUNT(*) FROM tasks WHERE ${user_profile_id ? `assigned_id = $1 AND task_status = true` : `task_status = true`}) as completed_tasks,
                (SELECT COUNT(*) FROM tasks WHERE ${user_profile_id ? `assigned_id = $1 AND task_status = false` : `task_status = false`}) as not_completed_tasks,
                (SELECT COUNT(*) FROM task_doubts WHERE ${user_profile_id ? `user_id = $1 AND resolved = true` : `resolved = true`}) as resolved_task_doubts,
                (SELECT COUNT(*) FROM task_doubts WHERE ${user_profile_id ? `user_id = $1 AND resolved = false` : `resolved = false`}) as not_resolved_task_doubts,
                (SELECT COUNT(*) FROM tasks WHERE ${user_profile_id ? `assigned_id = $1 AND task_priority = 'high'` : `task_priority = 'high'`}) as high_priority_tasks,
                (SELECT COUNT(*) FROM tasks WHERE ${user_profile_id ? `assigned_id = $1 AND task_priority = 'medium'` : `task_priority = 'medium'`}) as medium_priority_tasks,
                (SELECT COUNT(*) FROM tasks WHERE ${user_profile_id ? `assigned_id = $1 AND task_priority = 'low'` : `task_priority = 'low'`}) as low_priority_tasks
                `;

        let params = user_profile_id ? [user_profile_id] : [];

        const result = await client.query(query, params);
        const [totals] = result.rows;

        res.json({
            total_tasks: parseInt(totals.total_tasks),
            total_projects: parseInt(totals.total_projects),
            total_notifications: parseInt(totals.total_notifications),
            total_task_doubts: parseInt(totals.total_task_doubts),
            unread_notifications: parseInt(totals.unread_notifications),
            read_notifications: parseInt(totals.read_notifications),
            completed_projects: parseInt(totals.completed_projects),
            inprogress_projects: parseInt(totals.inprogress_projects),
            yet_to_start_projects: parseInt(totals.yet_to_start_projects),
            completed_tasks: parseInt(totals.completed_tasks),
            not_completed_tasks: parseInt(totals.not_completed_tasks),
            resolved_task_doubts: parseInt(totals.resolved_task_doubts),
            not_resolved_task_doubts: parseInt(totals.not_resolved_task_doubts),
            high_priority_tasks: parseInt(totals.high_priority_tasks),
            medium_priority_tasks: parseInt(totals.medium_priority_tasks),
            low_priority_tasks: parseInt(totals.low_priority_tasks),
            users_profiles: !user_profile_id && parseInt(totals.total_users_profiles),
            total_admin: !user_profile_id && parseInt(totals.total_admin),
            total_hr: !user_profile_id && parseInt(totals.total_hr),
            total_manager: !user_profile_id && parseInt(totals.total_manager),
            total_developer: !user_profile_id && parseInt(totals.total_developer),
            total_designer: !user_profile_id && parseInt(totals.total_designer),
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Get projects assigned to a specific user profile
app.post('/api/projects', async (req, res) => {
    let { user_profile_id, search, start_date, end_date, offset = 0, limit = 10, is_active = true, project_id } = req.body;

    try {
        let query = 'SELECT p.* FROM projects p ';
        let countQuery = 'SELECT COUNT(*) FROM projects p';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Join with user_profile if filtering by user_profile_id
        if (user_profile_id && user_profile_id.length > 0) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' JOIN user_profile up ON $' + paramCount + ' = ANY(p.team_members) AND up.user_profile_id = $' + paramCount;
            countQuery += ' JOIN user_profile up ON $' + paramCount + ' = ANY(p.team_members) AND up.user_profile_id = $' + paramCount;
            params.push(user_profile_id);
            paramCount++;
            filterAdded = true;
        }
        if (project_id && project_id.length > 0) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' p.id = $' + paramCount;
            countQuery += ' p.id = $' + paramCount;
            params.push(project_id);
            paramCount++;
            filterAdded = true;
        }

        // Apply filters based on conditions
        if (search) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' p.name ILIKE $' + paramCount;
            countQuery += ' p.name ILIKE $' + paramCount;
            params.push(`%${search}%`);
            paramCount++;
            filterAdded = true;
        }

        if (start_date) {
            // Convert start_date to UTC ISO format
            const startTimestamp = new Date(start_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' p.start_date >= $' + paramCount;
            countQuery += ' p.start_date >= $' + paramCount;
            params.push(startTimestamp);
            paramCount++;
            filterAdded = true;
        }

        if (end_date) {
            // Convert end_date to UTC ISO format
            const endTimestamp = new Date(end_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' p.end_date <= $' + paramCount;
            countQuery += ' p.end_date <= $' + paramCount;
            params.push(endTimestamp);
            paramCount++;
            filterAdded = true;
        }

        // Add is_active filter
        query += filterAdded ? ' AND' : ' WHERE';
        countQuery += filterAdded ? ' AND' : ' WHERE';
        query += ' p.is_active = $' + paramCount;
        countQuery += ' p.is_active = $' + paramCount;
        params.push(is_active);
        paramCount++;

        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging


        // Execute main query to fetch filtered projects
        const result = await client.query(query, params);
        const finalResults = result.rows?.map((project) => ({
            ...project,
            isActive: project.is_active ? "active" : "inactive",
            totalCount
        }));

        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get tasks assigned to a specific user profile
app.post('/api/tasks', async (req, res) => {
    let { user_profile_id, search, start_date, end_date, offset = 0, limit = 10, is_active = true } = req.body;

    try {
        let query = 'SELECT t.*,projects.name AS project_name, users_profiles.name AS user_profile_name FROM tasks t LEFT JOIN projects ON t.project_id = projects.id LEFT JOIN users_profiles ON t.assigned_id = users_profiles.id';
        let countQuery = 'SELECT COUNT(*) FROM tasks t LEFT JOIN projects ON t.project_id = projects.id LEFT JOIN users_profiles ON t.assigned_id = users_profiles.id';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Join with user_profile if filtering by user_profile_id
        if (user_profile_id && user_profile_id.length > 0) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' t.assigned_id = $' + paramCount;
            countQuery += ' t.assigned_id = $' + paramCount;
            params.push(user_profile_id);
            paramCount++;
            filterAdded = true;
        }

        // Apply filters based on conditions
        if (search) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' t.name ILIKE $' + paramCount;
            countQuery += ' t.name ILIKE $' + paramCount;
            params.push(`%${search}%`);
            paramCount++;
            filterAdded = true;
        }

        if (start_date) {
            // Convert start_date to UTC ISO format
            const startTimestamp = new Date(start_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' t.start_date >= $' + paramCount;
            countQuery += ' t.start_date >= $' + paramCount;
            params.push(startTimestamp);
            paramCount++;
            filterAdded = true;
        }

        if (end_date) {
            // Convert end_date to UTC ISO format
            const endTimestamp = new Date(end_date).toISOString();
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' t.end_date <= $' + paramCount;
            countQuery += ' t.end_date <= $' + paramCount;
            params.push(endTimestamp);
            paramCount++;
            filterAdded = true;
        }

        // Add is_active filter
        query += filterAdded ? ' AND' : ' WHERE';
        countQuery += filterAdded ? ' AND' : ' WHERE';
        query += ' t.is_active = $' + paramCount;
        countQuery += ' t.is_active = $' + paramCount;
        params.push(is_active);
        paramCount++;
        console.log("Final Query:", countQuery);
        console.log("Parameters:", params);
        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging


        // Execute main query to fetch filtered tasks
        const result = await client.query(query, params);
        const finalResults = result.rows?.map((task) => ({
            ...task,
            isActive: task.is_active ? "active" : "in-active",
            totalCount
        }));

        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get tasks assigned to a specific user profile
// Get tasks assigned to a specific user profile
app.post('/api/task_doubts', async (req, res) => {
    let { user_profile_id, search, offset = 0, limit = 10, is_active = true } = req.body;

    try {
        let query = `
            SELECT 
                td.*,
                tasks.name AS task_name,
                up.name AS asked_by,
                upp.name AS asked_to
            FROM 
                task_doubts td
            LEFT JOIN 
                tasks ON td.task_id = tasks.id
            LEFT JOIN 
                users_profiles up ON td.user_id = up.id
            LEFT JOIN 
                users_profiles upp ON td.resolved_by = upp.id
        `;
        let countQuery = 'SELECT COUNT(*) FROM task_doubts td';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Join with user_profile if filtering by user_profile_id
        if (user_profile_id && user_profile_id.length > 0) {
            query += ' JOIN users_profiles up ON td.user_id = up.id AND up.id = $' + paramCount;
            countQuery += ' JOIN users_profiles up ON td.user_id = up.id AND up.id = $' + paramCount;
            params.push(user_profile_id);
            paramCount++;
            filterAdded = true;
        }

        // Apply filters based on conditions
        if (search) {
            query += filterAdded ? ' AND' : ' WHERE';
            countQuery += filterAdded ? ' AND' : ' WHERE';
            query += ' td.doubt_message ILIKE $' + paramCount;
            countQuery += ' td.doubt_message ILIKE $' + paramCount;
            params.push(`%${search}%`);
            paramCount++;
            filterAdded = true;
        }

        // Add is_active filter
        query += filterAdded ? ' AND' : ' WHERE';
        countQuery += filterAdded ? ' AND' : ' WHERE';
        query += ' td.is_active = $' + paramCount;
        countQuery += ' td.is_active = $' + paramCount;
        params.push(is_active);
        paramCount++;


        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging


        // Execute main query to fetch filtered tasks
        const result = await client.query(query, params);
        const finalResults = result.rows?.map((doubt) => ({
            ...doubt,
            isActive: doubt.is_active ? "active" : "in-active",
            totalCount
        }));

        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/task_doubts/upsert', async (req, res) => {
    const { id, task_id, user_id, doubt_message, resolved, resolved_by, resolved_date = resolved ? new Date() : null, raised_date = new Date(), is_active = true } = req.body;

    try {
        if (id?.length > 0) {
            // If the task_doubts exists, perform a partial update
            const updatedTask_doubts = await client.query(
                `UPDATE task_doubts
                     SET task_id = COALESCE($2, task_id),
                         user_id = COALESCE($3, user_id),
                         doubt_message = COALESCE($4, doubt_message),
                         resolved = COALESCE($5, resolved),
                         resolved_by = COALESCE($6, resolved_by),
                          resolved_date= COALESCE($7,resolved_date ),
                          raised_date= COALESCE($8,raised_date ),
                          is_active= COALESCE($9,is_active )
                     WHERE id = $1
                     RETURNING *;`,
                [id, task_id, user_id, doubt_message, resolved, resolved_by, resolved_date, raised_date, is_active]
            );

            res.json(updatedTask_doubts.rows[0]);

        } else {
            // If the task doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO task_doubts (id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_date,raised_date,is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                [uuidv4(), task_id, user_id, doubt_message, resolved, resolved_by, resolved_date, raised_date, is_active]

            );
            if (result?.rows[0]) {
                resolved ? await client.query(
                    `INSERT INTO notifications (id, name, send_to,description, notification_status,task_doubt_id,notification_date,is_active,is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                    [uuidv4(), "The Task Doubt is You asked is resolved", user_id, doubt_message, "tasks_doubts", result?.rows?.[0]?.id ?? undefined, new Date(), true, false]

                ) :
                    await client.query(
                        `INSERT INTO notifications (id, name, send_to,description, notification_status,task_doubt_id,notification_date,is_active,is_read)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
                     RETURNING *;`,
                        [uuidv4(), `"New Task Doubt is Assigned To you" ${doubt_message}`, resolved_by, doubt_message, "tasks_doubts", result?.rows?.[0]?.id ?? undefined, new Date(), true, false]

                    );
            }
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get tasks assigned to a specific user profile
app.post('/api/notifications', async (req, res) => {
    let { user_profile_id, is_common = false, offset = 0, limit = 10000 } = req.body;

    try {
        let query = 'SELECT t.* FROM notifications t';
        let countQuery = 'SELECT COUNT(*) FROM notifications t WHERE t.is_read = false';

        let params = [];
        let paramCount = 1;
        let filterAdded = false;

        // Conditionally add filters based on request parameters
        if (user_profile_id && user_profile_id.length > 0) {
            query += ' WHERE t.send_to = $' + paramCount;
            countQuery += ' AND t.send_to = $' + paramCount;
            params.push(user_profile_id);
            paramCount++;
            filterAdded = true;
        }

        if (is_common) {
            query += filterAdded ? ' AND' : ' WHERE';
            query += ' t.notification_status = $' + paramCount;
            countQuery += ' AND t.notification_status = $' + paramCount;
            params.push("All");
            paramCount++;
            filterAdded = true;
        }
        console.log(countQuery);
        console.log(params);
        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging
        console.log(query);
        console.log(params);

        // Execute main query to fetch filtered notifications
        const result = await client.query(query, params);
        const finalResults = result.rows.map((notification) => ({
            ...notification,
            totalCount
        }));

        res.json(finalResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`server is running ${port}`);
})
// Upsert API for task_doubts

