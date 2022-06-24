const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const admin = express.Router();

admin.get('/', (req, res) => {
    const token = req.cookies.token;
    const user = jsonwebtoken.verify(token, process.env.SECRET_KEY);
    console.log(user);

    //res.render('admin');
    res.send('halo ini admin page');
});

module.exports = admin;