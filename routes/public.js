const express = require("express");
const public = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const db = require("../models/db");
const { cookieauth, cookieauthadmin, isauthenticated, } = require("../middleware/cookieauth");



public.get('/', isauthenticated, (req, res) => {
    res.send('halo ini main page');
});

public.get('/login', isauthenticated, (req, res) => {
    res.render('login');
});
public.post('/login', async (req, res) => {
    try {
        const number = req.body.number;
        const password = req.body.password;
        user = await db.get_user_by_number(number);


        if (!user) {
            return res.render('login', { message: "Invalid number or password" });
        }

        const isValidPassword = compareSync(password, user.users_password);
        if (isValidPassword) {
            user.password = undefined;
            const jsontoken = jsonwebtoken.sign({
                users_name: user.users_name,
                users_number: user.users_number,
                users_role: user.users_role
            },
                process.env.SECRET_KEY, {
                expiresIn: "30m",
            }
            );
            res.cookie("token", jsontoken, {
                httpOnly: true,
            });
            return res.redirect('/main');
        } else {
            return res.render('login', { message: "Invalid number or password" });
        }
    } catch (e) {
        console.log(e);
    }

});

public.get('/register', isauthenticated, (req, res) => {
    res.render('register');
});
public.post('/register', async (req, res) => {
    try {
        const name = req.body.name;
        const number = req.body.number;
        let password = req.body.password;
        var datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');


        if (!name || !password || !number) {
            return res.sendStatus(400);
        }

        checkname = await db.get_user_by_name(name);
        checknumber = await db.get_user_by_number(number);

        if (checkname || checknumber) {
            return res.render('register', { message: "name/number has been taken", });
        }

        const salt = genSaltSync(10);
        password = hashSync(password, salt);

        const user = await db.insert_user(name, password, number, datetime);

        req.flash('info', 'Signup Successful');
        return res.redirect('/login');
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }

});

public.get('/main', (req, res) => {
    res.render('main');
});

//create a get route for the profile page
public.get('/profile', cookieauth, (req, res) => {
    const token = req.cookies.token;
    const user = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    console.log(user);

    // res.render('profile');
    res.send('halo ini user page');
});


public.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.redirect('/login');
});

public.get('/home', cookieauth, (req, res) => {
    res.render('home');
});

// public.get('*', function(req, res) {
//     res.send('404');
// });


module.exports = public;