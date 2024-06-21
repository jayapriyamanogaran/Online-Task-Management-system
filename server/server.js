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
        const user = await client.query('SELECT * FROM users_profiles WHERE email_id = $1', [email_id]);

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
app.post('/api/users_profile/upsert', async (req, res) => {
    const { email_id, password, first_name, last_name } = req.body;

    try {
        // Check if user already exists based on email
        const existingUser = await client.query('SELECT * FROM users_profiles WHERE email_id = $1', [email_id]);

        if (existingUser.rows.length > 0) {
            // User exists, update the profile (if needed in your logic)
            // Example: Update only if certain conditions met, otherwise send a conflict response
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        const newUser = await client.query(
            'INSERT INTO users_profiles (email_id, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
            [email_id, hashedPassword, first_name, last_name]
        );

        // Generate JWT token
        const payload = {
            id: newUser.rows[0].id,
            email_id: newUser.rows[0].email_id,
            // Add more fields as needed
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error in /api/users_profiles/upsert:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


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

            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upsert API for tasks
app.post('/api/tasks/upsert', async (req, res) => {
    const { id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at = new Date(), updated_at = new Date(), is_active } = req.body;

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
                     is_active = COALESCE($11, is_active)
                 WHERE id = $1
                 RETURNING *;`,
                [id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active]
            );

            res.json(updatedTask.rows[0]);
        } else {
            // If ID doesn't exist, insert a new task
            const result = await client.query(
                `INSERT INTO tasks (id, name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 RETURNING *;`,
                [uuidv4(), name, project_id, description, start_date, end_date, task_priority, assigned_id, created_at, updated_at, is_active]
            );

            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error("Error in /api/tasks/upsert", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Upsert API for notifications
app.post('/api/notifications/upsert', async (req, res) => {
    const { id, name, send_to, description, notification_status, task_id, notification_date, is_active, is_read } = req.body;

    try {
        if (id?.length > 0) {
            // If the notifications exists, perform a partial update
            const updatednotifications = await client.query(
                `UPDATE notifications
                     SET name = COALESCE($2, name),
                         send_to = COALESCE($3, send_to),
                         description = COALESCE($4, description),
                         notifications_status = COALESCE($5, notifications_status),
                         task_id = COALESCE($6, task_id),
                         notification_date = COALESCE($7,notification_date),
                         is_active = COALESCE($8, is_active),
                         is_read= COALESCE($9,is_read),
                     WHERE id = $1
                     RETURNING *;`,
                [id, name, send_to, description, notification_status, task_id, notification_date, is_active, is_read]
            );

            res.json(updatednotifications.rows[0]);

        } else {
            // If the noupdatednotifications doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO notifications (id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read]
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,)
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
// Get user profiles with filters
app.post('/api/users_profiles', async (req, res) => {
    let { user_profile_id, search, start_date, end_date, offset = 0, limit = 10, is_active = true } = req.body;

    try {
        let query = 'SELECT * FROM users_profiles';
        let countQuery = 'SELECT COUNT(*) FROM users_profiles';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Filter by user_profile_id and join if provided
        if (user_profile_id && user_profile_id.length > 0) {
            query += ' WHERE $' + paramCount + ' = ANY(users_profiles.team_members)';
            countQuery += ' WHERE $' + paramCount + ' = ANY(users_profiles.team_members)';
            params.push(user_profile_id);
            paramCount++;
            filterAdded = true;
        }

        // Apply filters based on conditions
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
        console.log("Final Query:", query);
        console.log("Parameters:", params);

        // Execute main query to fetch filtered user profiles
        const result = await client.query(query, params);
        const finalResults = result.rows?.map((profile) => ({
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


// Get projects assigned to a specific user profile
app.post('/api/projects', async (req, res) => {
    let { user_profile_id, search, start_date, end_date, offset = 0, limit = 10, is_active = true } = req.body;

    try {
        let query = 'SELECT p.* FROM projects p';
        let countQuery = 'SELECT COUNT(*) FROM projects p';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Join with user_profile if filtering by user_profile_id
        if (user_profile_id && user_profile_id.length > 0) {
            query += ' JOIN user_profile up ON $' + paramCount + ' = ANY(p.team_members) AND up.user_profile_id = $' + paramCount;
            countQuery += ' JOIN user_profile up ON $' + paramCount + ' = ANY(p.team_members) AND up.user_profile_id = $' + paramCount;
            params.push(user_profile_id);
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
        console.log("Final Query:", query);
        console.log("Parameters:", params);

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
        let query = 'SELECT t.* FROM tasks t';
        let countQuery = 'SELECT COUNT(*) FROM tasks t';

        let paramCount = 1;
        let params = [];
        let filterAdded = false;

        // Join with user_profile if filtering by user_profile_id
        if (user_profile_id && user_profile_id.length > 0) {
            query += ' JOIN user_profile up ON $' + paramCount + ' = ANY(t.assigned_to) AND up.user_profile_id = $' + paramCount;
            countQuery += ' JOIN user_profile up ON $' + paramCount + ' = ANY(t.assigned_to) AND up.user_profile_id = $' + paramCount;
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

        // Execute count query to get total count
        const countResult = await client.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count);

        // Apply offset and limit to main query
        offset = parseInt(offset) || 0;
        limit = parseInt(limit) || 10;
        query += ' OFFSET $' + paramCount + ' LIMIT $' + (paramCount + 1);
        params.push(offset, limit);

        // Log the final query and params for debugging
        console.log("Final Query:", query);
        console.log("Parameters:", params);

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


app.post('/api/task_doubts/upsert', async (req, res) => {
    const { id, task_id, user_id, doubt_message, resolved, resolved_by, resolved_date, raised_date } = req.body;

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
                          raised_date= COALESCE($7,raised_date ),
                     WHERE id = $1
                     RETURNING *;`,
                [id, task_id, user_id, doubt_message, resolved, resolved_by, resolved_date, raised_date]
            );

            res.json(updatedTask_doubts.rows[0]);

        } else {
            // If the task doesn't exist, insert a new one
            const result = await client.query(
                `INSERT INTO task_doubts (id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_date,raised_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,)
                     RETURNING *;`,
                [uuidv4(), task_id, user_id, doubt_message, resolved, resolved_by, resolved_date, raised_date]

            );

            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`server is running ${port}`);
})
// Upsert API for task_doubts

