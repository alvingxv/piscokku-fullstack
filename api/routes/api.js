const express = require("express");
const api = express.Router();
const adminRouter = require("./admin");
const userRouter = require("./user");
var public_controller = require('../controllers/publiccontroller');
const { verifyToken, verifyTokenAdmin } = require("../middleware/auth_helper")

api.get('/', (req, res) => {
    res.status(200).json({
        message: "Selamat Datang di Api PISCOKKU",
        daftarEndpoint: [
            "/api/login",
            "/api/register",
            "/api/searchproduct",
            "/api/admin (get)",
            "/api/user/profile",
            "/api/user/addproduct",
            "/api/user/updateproduct",
            "/api/user/getallproduct",
            "/api/user/buy",
            "/api/user/pay",
            "/api/user/sellerconfirm",
            "/api/user/buyerconfirm",
            "/api/user/myorder"
        ],
    });
});
api.post('/register', public_controller.register);
api.post('/login', public_controller.login);
api.post('/searchproduct', public_controller.search_product);

api.use("/admin", verifyTokenAdmin, adminRouter);
api.use("/user", verifyToken, userRouter);

module.exports = api;