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
        const { id, name, email_id, phone_no, password,created_at ,updated_at,role,is_active } = req.body;
        try {
            if (id?.length > 0) {
                // If the profile exists, perform a partial update
                const updatedProfile = await client.query(
                    `UPDATE users_profiles
                     SET name = COALESCE($2, name),
                         email_id = COALESCE($3, email_id),
                         phone_no = COALESCE($4, phone_no),
                         password = COALESCE($6, password),
                         created_at = COALESCE($7, created_at),
                         updated_at = COALESCE($8, updated_at),
                         role = COALESCE($9, role ),
                         is_active  = COALESCE($10, is_active )
                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, email_id, phone_no, password,created_at ,updated_at,role,is_active]
                );
    
                res.json(updatedProfile.rows[0]);
    
            } else {
                // If the profile doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO users_profiles (id, name, email_id, phone_no,password,created_at ,updated_at,role,is_active )
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                     RETURNING *;`,
                    [uuidv4(), name, email_id, phone_no, password,created_at ,updated_at,role,is_active]
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
        const { id, name, description,start_date,end_date ,project_status ,created_at,updated_at,team_manager,is_active } = req.body;
    
        try {
            if (id?.length > 0) {
                console.log("coming");
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
                         team_manager = COALESCE($9, team_manager),
                         is_active = COALESCE($10, is_active),
                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, description, start_date,end_date ,project_status , created_at,updated_at,team_manager,is_active]
                );
    
                res.json(updatedProject.rows[0]);
    
            } else {
                // If the project doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO projects (id, name, description, start_date,end_date ,project_status ,created_at,updated_at,team_manager,is_active)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10)
                     RETURNING *;`,
                    [uuidv4(), name, description,start_date,end_date ,project_status ,created_at,updated_at,team_manager,is_active]
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
        const { id, name,project_id,description,start_date,end_date,task_priority,assigned_id,created_at,updated_at,is_active} = req.body;
    
        try {
            if (id?.length > 0) {
                // If the task exists, perform a partial update
                const updatedTask = await client.query(
                    `UPDATE tasks
                     SET name = COALESCE($2, name),
                         project_id = COALESCE($3, project_id),
                         description = COALESCE($4, description),
                         start_date = COALESCE($5, start_date),
                         end_date = COALESCE($6, end_date),
                          task_priority= COALESCE($7,priority ),
                         assigned_id = COALESCE($8, assigned_id),
                         created_at = COALESCE($9, created_at),
                         updated_at = COALESCE($10, updated_at),
                         is_active = COALESCE($11, is_active),

                     WHERE id = $1
                     RETURNING *;`,
                    [id, name, project_id,description,start_date,end_date,task_priority,assigned_id,created_at,updated_at,is_active]
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
        const { id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read } = req.body;
    
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
                    [id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read]
                );
    
                res.json(updatednotifications.rows[0]);
    
            } else {
                // If the noupdatednotifications doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO noupdatednotifications (id, name, send_to,description, notification_status,task_id,notification_date,is_active,is_read]
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,)
                     RETURNING *;`,
                    [uuidv4(), name, send_to,description, notification_status,task_id,notification_date,is_active,is_read]
                    
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
        const { id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_date,raised_date} = req.body;
    
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
                    [id, task_id, user_id, doubt_message,resolved,resolved_by,resolved_date,raised_date ]
                );
    
                res.json(updatedTask_doubts.rows[0]);
    
            } else {
                // If the task doesn't exist, insert a new one
                const result = await client.query(
                    `INSERT INTO tasks (id, task_id,user_id,doubt_message,resolved,resolved_by,resolved_date,raised_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8,)
                     RETURNING *;`,
                    [uuidv4(), task_id, user_id, doubt_message,resolved,resolved_by,resolved_date,raised_date ]
        
                );
    
                res.json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
