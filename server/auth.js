// auth.js

const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require("uuid");
const { config } = require('./config');

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "Online Task Management System",
    password: "root",
    port: 5432
});
client.connect();

// JWT Strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret
};

passport.use(new Strategy(opts, async (payload, done) => {
    try {
        // Example: Fetch user from database based on payload information
        const user = await client.query('SELECT * FROM users_profiles WHERE id = $1', [payload.id]);

        if (!user.rows[0]) {
            return done(null, false);
        }

        return done(null, user.rows[0]);
    } catch (error) {
        console.error('Error in JWT strategy:', error);
        return done(error, false);
    }
}));

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Error in authenticateJWT middleware:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.user = user;
        next();
    })(req, res, next);
};

module.exports = { authenticateJWT };
