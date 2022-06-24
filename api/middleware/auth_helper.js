const jsonwebtoken = require("jsonwebtoken");

async function verifyTokenAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === undefined) {
        return res.json({
            message: "Access Denied! Unauthorized User",
        });
    } else {
        jsonwebtoken.verify(token, process.env.SECRET_KEY, (err, authData) => {
            if (err) {
                res.json({
                    message: "Invalid Token...",
                });
            } else {
                const role = authData.user.users_role;
                if (role === "admin") {
                    next();
                } else {
                    return res.json({
                        message: "Access Denied!",
                    });
                }
            }
        });
    }
}

async function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === undefined) {
        return res.json({
            message: "Access Denied! Unauthorized User",
        });
    } else {
        jsonwebtoken.verify(token, process.env.SECRET_KEY, (err, authData) => {
            if (err) {
                res.json({
                    message: "Invalid Token...",
                });
            } else {
                const role = authData.user.users_role;
                if (role === "user") {
                    next();
                } else {
                    return res.json({
                        message: "Access Denied!",
                    });
                }
            }
        });
    }
}

module.exports = {verifyTokenAdmin, verifyToken}
