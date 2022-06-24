const express = require('express');
const adminRouter = express.Router();

var admin_controller = require('../controllers/admincontroller');

adminRouter.get('/getuserbynumber', admin_controller.get_user_by_number);
adminRouter.delete('/', admin_controller.delete_user);
adminRouter.get('/', admin_controller.get_all_user);

module.exports = adminRouter;