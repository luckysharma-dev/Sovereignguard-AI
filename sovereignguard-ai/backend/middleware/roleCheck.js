module.exports = function (roles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: "Authentication required" });
        }

        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "ACCESS_DENIED: INSUFFICIENT_PERMISSIONS" });
        }

        next();
    };
};
