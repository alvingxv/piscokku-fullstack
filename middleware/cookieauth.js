const jsonwebtoken = require('jsonwebtoken');

async function cookieauth(req, res, next) {
    try {
        const token = req.cookies.token;
        const user = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        const role = user.users_role;
        // console.log(user);
        if (role === "user") {
            next();
        } else if (role === "admin") {
            return res.redirect('/admin');
        } else {
            res.clearCookie('token');
            return res.redirect('/profile');
        }
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
}
async function cookieauthadmin(req, res, next) {
    try {
        const token = req.cookies.token;
        const user = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        const role = user.users_role;
        // console.log(user);
        if (role === "admin") {
            next();
        } else if (role === "user") {
            return res.redirect('/profile');
        } else {
            res.clearCookie('token');
            return res.redirect('/login');
        }
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
}

async function isauthenticated(req, res, next) {
    const token = req.cookies.token;
    //if token exist redirect to profile
    if (token) {
        const user = jsonwebtoken.verify(token, process.env.SECRET_KEY);
        const role = user.users_role;
        if (role === "user") {
            return res.redirect('/profile');
        } else if (role === "admin") {
            return res.redirect('/admin');
        }
    }
    next();
};

module.exports = { cookieauth, cookieauthadmin, isauthenticated }