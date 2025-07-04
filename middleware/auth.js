const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token) {
            return res.status(401).json({error: 'No token provided'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId);

        if(!user) {
            return res.status(401).json({error: "Invalid Token"});
        }

        req.user = user;
        next();
    } catch(err) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = auth;
