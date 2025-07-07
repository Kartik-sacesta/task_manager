const jwt = require('jsonwebtoken');
const User = require('../model/User');

const authMiddleware = async (req, res, next) => {

    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(403).json({ message: 'user not found ' });
        }
        req.user = user;
     
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;