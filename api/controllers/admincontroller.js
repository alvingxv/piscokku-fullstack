const db = require("../../models/db");
const {
    hashSync,
    genSaltSync,
    compareSync
} = require("bcrypt");



exports.get_user_by_number = async (req, res, next, userId) => {
    try {
        const number = req.body.number
        const user = await db.get_user_by_number(number);
    } catch (e) {
        console.log(e);
        res.sendStatus(404);
    }
};

exports.delete_user = async (req, res, next) => {
    try {
        const number = req.body.number
        const user = await db.delete_user(number);
        return res.status(200).json({
            messeage: `User ${number} deleted`
        });

    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
};

exports.get_all_user = async (req, res, next) => {
    try {
        const users = await db.get_all_user();
        res.json({
            users: users
        });
    } catch (e) {
        console.log(e);
    }
};
