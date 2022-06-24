require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const { cookieauth, cookieauthadmin, isauthenticated, } = require("../middleware/cookieauth");



const api = require('../api/routes/api');
const public = require("../routes/public");
const admin = require("../routes/admin");

const app = express();

app.set('views', path.join(__dirname, '../views/'))
app.set('view engine', 'ejs');
app.use("/public", express.static('public'))
app.use(express.urlencoded({ extended: false }));




const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(cors());
app.use(cookieParser());
app.use(session({
    secret: 'something',
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use('/', public)
app.use('/admin', cookieauthadmin, admin)
app.use('/api', api)

app.get('*', function (req, res) {
    res.send('404');
});

app.listen(PORT, () => {
    console.log(`server is listening  on ${PORT}`);
});

module.exports = app;