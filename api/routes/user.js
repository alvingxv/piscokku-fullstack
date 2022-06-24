const express = require('express');
const userRouter = express.Router();

var user_controller = require('../controllers/usercontroller');

userRouter.get('/profile', user_controller.profile);
userRouter.post('/addproduct', user_controller.add_product);
userRouter.post('/updateproduct', user_controller.update_product);
userRouter.get('/getallproduct', user_controller.get_all_product);
userRouter.post('/buy', user_controller.buy_product);
userRouter.get('/myorder', user_controller.my_order);
userRouter.post('/pay', user_controller.pay_orders);
userRouter.post('/sellerconfirm', user_controller.seller_confirm);
userRouter.post('/buyerconfirm', user_controller.buyer_confirm);
userRouter.post('/withdraw', user_controller.withdraw_funds);

module.exports = userRouter;