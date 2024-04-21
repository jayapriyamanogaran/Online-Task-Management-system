const express= require("express");
const {Client}= require("pg");
const {v4:uuidv4}= require("uuid");

const app=express();
const port=5000;

const client= new Client({
    user:"postgres",
    host:"localhost",
    database:"Online Task Management System",
    password:"root",
    port:5432
})
client.connect();
app.use(express.json())

client.query('SELECT NOW()')
    .then(()=>console.log("Db connected"))
    .catch((error)=>console.log(error,"error"))


    app.get('/', (req, res) => {
        res.send('Task Management Backend');
    });
    
    // Upsert API for users_profiles
    app.post('/api/users_profiles/upsert', async (req, res) => {
        const { id, name, email, phone_no,  is_active, password, role,created_at ,updated_at  } = req.body;
        try {
            if (id?.length > 0) {
                // If the profile exists, perform a partial update
                const updatedProfile = await client.query(
                    `UPDATE users_profiles
                     SET name = COALESCE($2, name),
                         email = COALESCE($3, email),
                         phone_no = COALESCE($4, phone_no),
                         is_active = COALESCE($6, is_active),
                         password = COALESCE($7, password),
                         role = COALESCE($8, role),
                         created_at  = COALESCE($9, created_at ),
                         updated_at  = COALESCE($10, updated_at )
                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, email, phone_no,  is_active, password, role, created_at ,updated_at]
                );
    
                res.json(updatedProfile.rows[0]);
    
            } else {
                // If the profile doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO users_profiles (id, name, email, phone_no,  is_active, password, role,created_at ,updated_at )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING *;`,
                    [uuidv4(), name, email, phone_no,  is_active, password, role, created_at ,updated_at]
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
        const { id, name, description, is_active, project_status, start_date, end_date ,created_at,updated_at ,team_members } = req.body;
    
        try {
            if (id?.length > 0) {
                console.log("coming");
                // If the project exists, perform a partial update
                const updatedProject = await client.query(
                    `UPDATE projects
                     SET name = COALESCE($2, name),
                         description = COALESCE($3, description),
                         is_active = COALESCE($4, is_active),
                         project_status = COALESCE($5, project_status),
                         start_date = COALESCE($6, start_date),
                         end_date = COALESCE($7, end_date),
                         created_at = COALESCE($8, created_at),
                         updated_at = COALESCE($9, updated_at),
                         team_members= COALESCE($10, team_members)
                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, description, is_active, project_status, start_date, end_date ,created_at,updated_at ,team_members]
                );
    
                res.json(updatedProject.rows[0]);
    
            } else {
                // If the project doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO projects (id, name, description, is_active, project_status, start_date, end_date ,created_at,updated_at ,team_members
                    )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)
                     RETURNING *;`,
                    [uuidv4(), name, description, is_active, project_status, start_date, end_date ,created_at,updated_at ,team_members]
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
        const { id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_at} = req.body;
    
        try {
            if (id?.length > 0) {
                // If the task exists, perform a partial update
                const updatedTask = await client.query(
                    `UPDATE tasks
                     SET name = COALESCE($2, name),
                         description = COALESCE($3, description),
                         is_active = COALESCE($4, is_active),
                         start_date = COALESCE($5, status),
                         assignee_id = COALESCE($6, assignee_id),
                          end_date= COALESCE($7,end_date ),
                         project_id = COALESCE($8, project_id),
                         created_at = COALESCE($9, created_at),
                         updated_at = COALESCE($810, updated_at),
                         task_priority = COALESCE($11, task_priority),

                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, description, is_active,start_date, assignee_id, end_date, project_id ,created_at,updated_at,task_priority ]
                );
    
                res.json(updatedTask.rows[0]);
    
            } else {
                // If the task doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO tasks (id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11)
                     RETURNING *;`,
                    [uuidv4(), name, description, is_active,start_date, assignee_id, end_date, project_id ,created_at,updated_at,task_priority ]
                );
    
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    // Upsert API for notifications
    app.post('/api/notifications/upsert', async (req, res) => {
        const { id, name, description, is_active, notification_status, send_to ,created_at,updated_at ,is_read } = req.body;
    
        try {
            if (id?.length > 0) {
                // If the notifications exists, perform a partial update
                const updatednotifications = await client.query(
                    `UPDATE notifications
                     SET name = COALESCE($2, name),
                         description = COALESCE($3, description),
                         is_active = COALESCE($4, is_active),
                         notifications_status = COALESCE($5, notifications_status),
                         send_to = COALESCE($6, send_to),
                         created_at = COALESCE($7,created_at),
                         updated_at = COALESCE($8, updated_at),
                         is_read= COALESCE($9,is_read),
                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, description, is_active, notification_status, send_to ,created_at,updated_at ,is_read]
                );
    
                res.json(updatednotifications.rows[0]);
    
            } else {
                // If the noupdatednotifications doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO noupdatednotifications (id, name, description, is_active, notification_status, send_to ,created_at,updated_at ,is_read]
                    );)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,)
                     RETURNING *;`,
                    [uuidv4(), name, description, is_active, notification_status, send_to ,created_at,updated_at ,is_read]
                );
                
    
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    
    
    // Get all users_profiles
    app.get('/api/users_profiles', async (req, res) => {
        try {
            const result = await client.query('SELECT * FROM users_profiles');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    // Get projects assigned to a specific user profile
    app.get('/api/projects', async (req, res) => {
        const { user_profile_id } = req.body;
    
        try {
            if(user_profile_id?.length>0){
                const result = await client.query(
                    'SELECT * FROM projects WHERE $1 = ANY(team_member)',
                    [user_profile_id]
                );
                res.json(result.rows);
            }else{
            const result = await client.query(
                'SELECT * FROM projects',
                
            );
            res.json(result.rows);
        }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    // Get tasks assigned to a specific user profile
    app.get('/api/tasks', async (req, res) => {
        const { user_profile_id } = req.body;
    
        try {
            const result = await client.query(
                'SELECT * FROM tasks WHERE $1 = ANY(assigned_to)',
                [user_profile_id]
            );
    
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

      app.listen(port,()=>{
        console.log(`server is running ${port}`);
    })
    // Upsert API for task_doubts
    app.post('/api/task_doubts/upsert', async (req, res) => {
        const { id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_at} = req.body;
    
        try {
            if (id?.length > 0) {
                // If the task_doubts exists, perform a partial update
                const updatedTask_dobts = await client.query(
                    `UPDATE task_doubts
                     SET task_id = COALESCE($2, task_id),
                         user_id = COALESCE($3, user_id),
                         doubt_message = COALESCE($4, doubt_message),
                         resolved = COALESCE($5, resolved),
                         resolved_by = COALESCE($6, resolved_by),
                          resolved_at= COALESCE($7,resolved_at ),
                     WHERE id = $1
                     RETURNING *;`,
                    [id, task_id, user_id, doubt_message,resolved,resolved_by,resolved_at ]
                );
    
                res.json(updatedTask_dobts.rows[0]);
    
            } else {
                // If the task doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO tasks (id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11)
                     RETURNING *;`,
                    [uuidv4(), task_id, description, is_active,start_date, assignee_id, end_date, project_id ,created_at,updated_at,task_priority ]
                );
    
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
