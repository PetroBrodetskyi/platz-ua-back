const isAdmin = (req, res, next) => {
    if (req.user && req.user.subscription === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Access denied' });
};

export default isAdmin;