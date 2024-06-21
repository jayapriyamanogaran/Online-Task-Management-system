// config.js

const config = {
    jwtSecret: 'my_jwt_secretOnline_Task_Management_System',
    database: {
        user: "postgres",
        host: "localhost",
        database: "Online Task Management System",
        password: "root",
        port: 5432
    }
};

module.exports = { config };
