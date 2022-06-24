const {
    CLIENT_IGNORE_SIGPIPE
} = require("mysql/lib/protocol/constants/client");
const db = require("../../models/db");
const axios = require("axios").default;


exports.add_product = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);


        const productname = req.body.product_name;
        const productprice = req.body.product_price;
        const productqty = req.body.product_qty;
        const productseller = tokendata.user.users_name;

        const isproductavail = await db.check_productname(productname)

        if (isproductavail) {
            return res.status(409).json({
                status: 409,
                message: "Product name already exist",
            });
        }

        if (!productname || !productprice || !productqty) {
            return res.status(400).json({
                status: 400,
                message: "Bad Request"
            });
        }

        await db.add_product(productname, productprice, productqty, productseller)
        return res.status(200).json({
            status: 200,
            message: "Product Added"
        });


    } catch (e) {
        console.log(e);
        res.sendStatus(404);
    }
};

exports.update_product = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const productname = req.body.product_name;
        const productprice = req.body.product_price;
        const productqty = req.body.product_qty;
        const productseller = tokendata.user.users_name;

        if ((!productname) || (!productprice && !productqty)) {
            return res.status(400).json({
                status: 400,
                message: "Please Enter Product name and product price or qty"
            });
        }

        if (productprice && !productqty) {
            await db.update_price(productname, productprice, productseller);
            return res.status(200).json({
                status: 200,
                message: "Product Price updated"
            });
        } else if (productqty && !productprice) {
            await db.update_qty(productname, productqty, productseller);
            return res.status(200).json({
                status: 200,
                message: "Product Qty updated"
            });
        } else if (productqty && productprice) {
            await db.update_price(productname, productprice, productseller);
            await db.update_qty(productname, productqty, productseller);
            return res.status(200).json({
                status: 200,
                message: "Product Updated"
            });
        }

    } catch (e) {
        res.status(409).json({
            status: 409,
            message: "Failed to update",
        })
    }
};

exports.get_all_product = async (req, res, next) => {
    try {
        const product = await db.get_all_product()

        res.json({
            Product: product
        });

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.my_order = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const ordername = tokendata.user.users_name;

        try {
            const order = await db.get_my_order(ordername);
            res.json({
                Order: order
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "errormaszeh",
            })
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.profile = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        console.log(tokendata.user.users_name);
        const user = await db.get_user_by_name(tokendata.user.users_name)


        res.json({
            User: user
        });

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.withdraw_funds = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const amount = req.body.amount;
        const emoney = req.body.emoney;
        const tujuan = req.body.tujuan;
        const name = tokendata.user.users_name;
        const user = await db.get_user_by_name(tokendata.user.users_name)
        var url;

        if (!amount || !emoney || !tujuan) {
            return res.status(400).json({
                status: 400,
                message: "Please Enter amount withdraw, destination and emoney"
            });
        }

        if (amount > user.users_balance || amount < 0) {
            return res.status(400).json({
                status: 400,
                message: "You don't have enough balance"
            });
        }

        if (emoney == "PeacePay") {
            const resp = await axios
                .post("https://e-money-kelompok-12.herokuapp.com/api/login", {
                    number: "082133453710",
                    password: "piscokku"
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        res.send(err);
                        return;
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://e-money-kelompok-12.herokuapp.com/api/transfer", {
                    tujuan: tujuan,
                    amount: amount,
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data;
                    const status = hasil.status
                    if (status == 200) {
                        db.deduct_funds(amount, name);
                        res.status(200).json({
                            status: 200,
                            message: "Withdraw Success"
                        });
                        return;
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: "Withdraw Failed"
                        });
                        return;
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

        } else if (emoney == "Buski Coins") {
            url = "buskidicoin";
        } else if (emoney == "KCN Pay") {
            url = "kcnpay";
        } else if (emoney == "Gallecoins") {
            url = "gallecoins";
        } else if (emoney == "CuanIND") {
            url = "cuanind";
        } else if (emoney == "MoneyZ") {
            url = "moneyz";
        } else if (emoney == "Payfresh") {
            url = "payfresh";
        } else if (emoney == "PadPay") {
            url = "padpay";
        } else if (emoney == "PayPhone") {
            url = "payphone";
        } else if (emoney == "ECoin") {
            url = "ecoin";
        } else if (emoney == "Talangin") {
            url = "talangin";
        } else {
            return res.status(400).json({
                message: "Emoney Tidak tersedia, Coba ulang dengan nama Emoney yang benar (case sensitive)",
                daftarEmoney: [
                    "Buski Coins",
                    "KCN Pay",
                    "Gallecoins",
                    "CuanIND",
                    "Payfresh",
                    "MoneyZ",
                    "PadPay",
                    "PayPhone",
                    "ECoin",
                    "Talangin",
                    "PeacePay",
                ],
            });
        }
        try {
            const resp = await axios
                .post("https://e-money-kelompok-12.herokuapp.com/api/login", {
                    number: "082133453710",
                    password: "piscokku"
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    `https://e-money-kelompok-12.herokuapp.com/api/${url}`, {
                    tujuan: tujuan,
                    amount: amount,
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                })
                .then((response) => {
                    const hasil = response.data;
                    const status = hasil.status
                    if (status == 200) {
                        db.deduct_funds(amount, name);
                        return res.status(200).json({
                            status: 200,
                            message: "Withdraw Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Withdraw Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error) {
                        const err = error.response.data; // => the response payload
                        res.send(err);
                        return;
                    }
                });
        } catch (error) {
            console.log(error);
        }



    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
        return;
    }
};

exports.seller_confirm = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const idorder = req.body.orders_id;
        const orderinfo = await db.check_order(idorder);

        const sellername = tokendata.user.users_name;
        const ordersellername = orderinfo.seller_name;

        if (orderinfo == undefined) {
            return res.status(404).json({
                status: 404,
                message: "Order Id Not Found"
            });
        }

        if (sellername != ordersellername) {
            return res.status(400).json({
                status: 400,
                message: "This is not your Order"
            });
        }

        if (orderinfo.orders_status == "Paid") {

            try {
                await db.update_status("Product has been sent", idorder);
                return res.status(200).json({
                    status: 200,
                    message: "Confirmation successful (product sent)"
                });
            } catch (e) {
                res.status(500).json({
                    status: 500,
                    message: "Server Error",
                })
            }
        } else {
            return res.status(400).json({
                status: 400,
                message: "This order hasn't been paid yet"
            });
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.buyer_confirm = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const idorder = req.body.orders_id;
        const orderinfo = await db.check_order(idorder);

        const buyername = tokendata.user.users_name;
        const orderbuyername = orderinfo.buyer_name;

        if (orderinfo == undefined) {
            return res.status(404).json({
                status: 404,
                message: "Order Id Not Found"
            });
        }

        if (buyername != orderbuyername) {
            return res.status(400).json({
                status: 400,
                message: "This is not your Order"
            });
        }

        if (orderinfo.orders_status == "Product has been sent") {

            try {
                await db.update_status("Order has been received (done)", idorder);
                await db.add_balance(orderinfo.orders_price, orderinfo.seller_name)
                return res.status(200).json({
                    status: 200,
                    message: "Confirmation successful (product received)"
                });
            } catch (e) {
                res.status(500).json({
                    status: 500,
                    message: "Server Error",
                })
            }
        } else if (orderinfo.orders_status == "Order has been received (done)") {
            return res.status(400).json({
                status: 400,
                message: "This order is finished"
            });
        } else {
            return res.status(400).json({
                status: 400,
                message: "This order hasn't been paid yet"
            });
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.buy_product = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);

        const buyer = tokendata.user.users_name;
        const buyname = req.body.product_name;
        const buyqty = req.body.product_qty;

        if ((!buyname && !buyqty)) {
            return res.status(400).json({
                status: 400,
                message: "Please Enter Product name and quantity"
            });
        }

        const product = await db.check_productname(buyname)
        if (product === undefined) {
            return res.status(404).json({
                status: 404,
                message: "Product Not Found"
            });
        }

        const productid = product.product_id;
        const productprice = product.product_price;
        const productqty = product.product_qty;
        const productseller = product.product_seller;

        const totalprice = buyqty * productprice

        if (buyqty > productqty) {
            console.log("stock habis");
            return res.status(410).json({
                status: 410,
                message: "Not Enough Stock"
            });
        }

        try {
            await db.add_orders(productid, buyqty, totalprice, buyer, productseller)
            await db.deduct_product_qty(buyqty, buyname)
            return res.status(410).json({
                status: 200,
                message: "Product Ordered, Waiting for Payment"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to Buy",
            })
        }

    } catch (e) {
        res.status(500).json({
            status: 500,
            message: "Server Error",
        })
    }
};

exports.pay_orders = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const tokenDecodablePart = token.split(".")[1];
        const decoded = Buffer.from(tokenDecodablePart, "base64").toString();
        var tokendata = JSON.parse(decoded);
        const numberpiscokku = "082133453710"

        const idorder = req.body.orders_id;
        const emoney = req.body.emoney;
        const orderinfo = await db.check_order(idorder);

        if (orderinfo == undefined) {
            return res.status(404).json({
                status: 404,
                message: "Order Id Not Found"
            });
        }
        if (orderinfo.orders_status != "Waiting for Payment") {
            return res.status(400).json({
                status: 400,
                message: "This order Already Paid"
            });
        }

        if (orderinfo.buyer_name != tokendata.user.users_name) {
            return res.status(404).json({
                status: 404,
                message: "This is not your order"
            });
        }
        //! ================== PEACEPAY =====================
        if (emoney == "PeacePay") {
            const numberlogin = req.body.number;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !numberlogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "number" and "password" to log in to PeacePay'
                });
            }
            const resp = await axios
                .post("https://e-money-kelompok-12.herokuapp.com/api/login", {
                    number: numberlogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://e-money-kelompok-12.herokuapp.com/api/transfer", {
                    tujuan: numberpiscokku,
                    amount: orderinfo.orders_price,
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data;
                    const status = hasil.status
                    if (status == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            // !========================================== BUSKI START HERE =====================================
        } else if (emoney == "Buski Coins") {
            const usernamelogin = req.body.username;
            const passwordlogin = req.body.password;
            const numberlogin = req.body.number;
            if (!passwordlogin || !numberlogin || !usernamelogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "username", "password" and "number" to log in to Buski Coins'
                });
            }
            var formData = new URLSearchParams();
            formData.append("username", usernamelogin);
            formData.append("password", passwordlogin);
            var resp = await axios
                .post(
                    "https://arielaliski.xyz/e-money-kelompok-2/public/buskidicoin/publics/login",
                    formData
                )
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to Buski Coins Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.message.token;
            } catch (error) {
                console.log("error");
                return;
            }


            var formData = new URLSearchParams();
            formData.append("nomer_hp", numberlogin);
            formData.append("nomer_hp_tujuan", numberpiscokku);
            formData.append("e_money_tujuan", "PeacePay");
            formData.append("amount", orderinfo.orders_price);
            await axios
                .post(
                    "https://arielaliski.xyz/e-money-kelompok-2/public/buskidicoin/admin/transfer",
                    formData, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data; // => the response payload
                    if (hasil.status == 201) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });

                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }

                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

            // ! ========================================== KCN Pay START HERE =====================================

        } else if (emoney == "KCN Pay") {
            const emaillogin = req.body.email;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !emaillogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "email" and "password" to log in to KCN Pay'
                });
            }
            const resp = await axios
                .post("https://kecana.herokuapp.com/login", {
                    email: emaillogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to KCN Pay Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data;
            } catch (error) {
                console.log("error");
                return;
            }

            const resp2 = await axios
                .get("https://kecana.herokuapp.com/me", {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Error"
                        });
                    }
                });
            try {
                idkcn = resp2.data.id
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .patch(
                    "https://kecana.herokuapp.com/transferemoneylain ", {
                    id: idkcn,
                    nohp: numberpiscokku,
                    nominaltransfer: orderinfo.orders_price,
                    emoneytujuan: "Peace Pay"
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data.status; // => the response payload
                    if (hasil == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });

                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });


            //! ========================================== Gallecoins START HERE =====================================
        } else if (emoney == "Gallecoins") {
            const usernamelogin = req.body.username;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !usernamelogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "username" and "password" to log in to Gallecoins'
                });
            }
            const resp = await axios
                .post("https://gallecoins.herokuapp.com/api/users", {
                    username: usernamelogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to CuanIND Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://gallecoins.herokuapp.com/api/transfer/peacepay ", {
                    phone_target: numberpiscokku,
                    amount: orderinfo.orders_price
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data.status; // => the response payload
                    if (hasil == "1") {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

            //! ========================================== CuanIND START HERE =====================================
        } else if (emoney == "CuanIND") {
            const numberlogin = req.body.number;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !numberlogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "number" and "password" to log in to CuanIND'
                });
            }
            const resp = await axios
                .post("https://e-money-kelompok5.herokuapp.com/cuanind/user/login", {
                    notelp: numberlogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to CuanIND Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://e-money-kelompok5.herokuapp.com/cuanind/transfer/peacepay", {
                    target: numberpiscokku,
                    amount: orderinfo.orders_price
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data; // => the response payload
                    if (hasil == "berhasil") {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

            // !========================================== Moneyz START HERE =====================================
        } else if (emoney == "MoneyZ") {
            const numberlogin = req.body.number;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !numberlogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "number" and "password" to log in to MoneyZ'
                });
            }

            const resp = await axios
                .post("https://moneyz-kelompok6.herokuapp.com/api/login", {
                    phone: numberlogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to MoneyZ Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }
            await axios
                .post(
                    "https://moneyz-kelompok6.herokuapp.com/api/user/transferTo", {
                    tujuan: numberpiscokku,
                    amount: orderinfo.orders_price,
                    emoney: "PeacePay",
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data; // => the response payload
                    if (hasil.status == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            //! ========================================== Payfresh START HERE =====================================
        } else if (emoney == "Payfresh") {
            const emaillogin = req.body.email;
            const passwordlogin = req.body.password;
            if (!passwordlogin || !emaillogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "email" and "password" to log in to Payfresh'
                });
            }
            const resp = await axios
                .post("https://payfresh.herokuapp.com/api/login", {
                    email: emaillogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to Payfresh Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://payfresh.herokuapp.com/api/user/peacepay", {
                    tujuan: numberpiscokku,
                    amount: orderinfo.orders_price
                }, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data;
                    const status = hasil.status
                    if (status == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            //! ========================================== PayPhone START HERE =====================================
        } else if (emoney == "PayPhone") {
            const passwordlogin = req.body.password;
            const numberlogin = req.body.number;

            if (!passwordlogin || !numberlogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "number" and "password" to log in to PayPhone'
                });
            }
            var formData = new URLSearchParams();
            formData.append("telepon", numberlogin);
            formData.append("password", passwordlogin);
            var resp = await axios
                .post(
                    "http://fp-payphone.herokuapp.com/public/api/login",
                    formData
                )
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to PayPhone Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.token;
            } catch (error) {
                console.log("error");
                return;
            }

            var formData = new URLSearchParams();
            formData.append("telepon", numberpiscokku);
            formData.append("emoney", "Peacepay");
            formData.append("jumlah", orderinfo.orders_price);
            await axios
                .post(
                    "http://fp-payphone.herokuapp.com/public/api/transfer",
                    formData, {
                    headers: {
                        Authorization: "Bearer " + tokentransfer,
                    },
                }
                )
                .then((response) => {
                    const hasil = response.data; // => the response payload
                    if (hasil.status == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }

                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });
            //! ========================================== PadPay START HERE =====================================
        } else if (emoney == "PadPay") {
            const emaillogin = req.body.email;
            const passwordlogin = req.body.password;

            if (!passwordlogin || !emaillogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "email" and "password" to log in to PadPay'
                });
            }

            const resp = await axios
                .post("https://mypadpay.xyz/padpay/api/login.php", {
                    email: emaillogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to Payfresh Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.Data.jwt;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://mypadpay.xyz/padpay/api/coin/peacepay.php", {
                    email: emaillogin,
                    password: passwordlogin,
                    jwt: tokentransfer,
                    tujuan: numberpiscokku,
                    jumlah: orderinfo.orders_price,
                }
                )
                .then((response) => {

                    const hasil = response.data;
                    const status = hasil.status
                    if (hasil == `{"status":200,"msg":"Transfer berhasil dilakukan."}{"msg":"transfer Successfully","status":200}{"msg":"Record Insert Successfully to history","status":200}`) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

            //! ========================================== ECoin START HERE =====================================

        } else if (emoney == "ECoin") {
            const phonelogin = req.body.number;
            const passwordlogin = req.body.password;

            if (!passwordlogin || !phonelogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "email" and "password" to log in to ECoin'
                });
            }

            const resp = await axios
                .post("https://ecoin10.my.id/api/masuk", {
                    phone: phonelogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to ECoin Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.accessToken;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://ecoin10.my.id/api/transfer", {
                    amount: orderinfo.orders_price,
                    dest_emoney: "PeacePay",
                    phone2: numberpiscokku,
                    description: `Piscokku Payment order_id ${orderinfo.orders_id}`
                },
                    {
                        headers: {
                            Authorization: "Bearer " + tokentransfer,
                        }
                    }

                )
                .then((response) => {
                    const hasil = response.data;
                    const status = hasil.status
                    if (status == 200) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

        } else if (emoney == "Talangin") {
            const emaillogin = req.body.email;
            const passwordlogin = req.body.password;

            if (!passwordlogin || !emaillogin) {
                return res.status(400).json({
                    status: 400,
                    message: 'Insert "email" and "password" to log in to ECoin'
                });
            }

            const resp = await axios
                .post("https://e-money-kelomok-11.000webhostapp.com/api/login.php", {
                    email: emaillogin,
                    password: passwordlogin,
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Login to Talangin Failed"
                        });
                    }
                });
            try {
                tokentransfer = resp.data.jwt;
            } catch (error) {
                console.log("error");
                return;
            }

            const resp2 = await axios
                .post("https://e-money-kelomok-11.000webhostapp.com/api/validatetoken.php", {
                    jwt: tokentransfer
                })
                .catch((error) => {
                    if (error.response) {
                        return res.status(404).json({
                            status: 404,
                            message: "Error"
                        });
                    }
                });
            try {
                phonepengirim = resp2.data.data.phone;
            } catch (error) {
                console.log("error");
                return;
            }

            await axios
                .post(
                    "https://e-money-kelomok-11.000webhostapp.com/api/transferin.php", {
                    jwt: tokentransfer,
                    pengirim: phonepengirim,
                    penerima: numberpiscokku,
                    emoney: "PeacePay",
                    jumlah: orderinfo.orders_price
                })
                .then((response) => {
                    const hasil = response.data;
                    if (hasil.includes(`{"massage":"Transfer Successfull.","data":[{"nama":"PeacePay"`)) {
                        db.update_status("Paid", idorder);
                        return res.status(200).json({
                            status: 200,
                            message: "Payment Success"
                        });
                    } else {
                        return res.status(400).json({
                            status: 400,
                            message: "Payment Failed"
                        });
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        const err = error.response.data; // => the response payload
                        return res.send(err);
                    }
                });

        } else {
            return res.status(400).json({
                message: "Emoney Tidak tersedia, Coba ulang dengan nama Emoney yang benar (case sensitive)",
                daftarEmoney: [
                    "Buski Coins",
                    "KCN Pay",
                    "Gallecoins",
                    "CuanIND",
                    "Payfresh",
                    "MoneyZ",
                    "PadPay",
                    "PayPhone",
                    "ECoin",
                    "Talangin",
                    "PeacePay",
                ],
            });
        }

    } catch (e) {

    }
};

// TODO 1. buat konfirmasi sudah mengirimkan order (penjual) SUDAH, 2. Buat konfirmasi order telah datang (pembeli), 3. Buat buyer bisa liat ordernya dia, 4. buat seller bisa liat barang yang diorder ke diaD