const pool = require('../config/db_config')

let db = {};

db.get_all_user = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users ', (error, users) => {
            if (error) {
                return reject(error);
            }
            return resolve(users);
        });
    });
};


db.get_user_by_name = (name) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users WHERE users_name = ?', [name], (error, users) => {
            if (error) {
                return reject(error);
            }
            return resolve(users[0]);
        });
    });
};

db.get_user_by_number = (number) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM users WHERE users_number = ?', [number], (error, users) => {
            if (error) {
                return reject(error);
            }
            return resolve(users[0]);
        });
    });
};


db.insert_user = (name, password, number, datetime) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO users (users_name, users_password, users_number, users_datecreated) VALUES (?, ?, ?, ?)', [name, password, number, datetime], (error, result) => {
            if (error) {
                return reject(error);
            }

            return resolve(result.insertId);
        });
    });
};

db.add_product = (productname, productprice, productqty, productseller) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO product (product_name, product_price, product_qty, product_seller) VALUES (?, ?, ?, ?)', [productname, productprice, productqty, productseller], (error, result) => {
            if (error) {
                return reject(error);
            }

            return resolve();
        });
    });
};

db.update_qty = (productname, productqty, productseller) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE product SET product_qty = ? WHERE product_name = ? AND product_seller = ?', [productqty, productname, productseller], (error, result) => {
            if (result.affectedRows == 0) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.update_price = (productname, productprice, productseller) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE product SET product_price = ? WHERE product_name = ? AND product_seller = ?', [productprice, productname, productseller], (error, result) => {
            if (result.affectedRows == 0) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.check_productname = (productname) => {
    return new Promise((resolve, reject) => {
        let replacement = `'%${productname}%'`;
        let sqlStatement = `SELECT * from  product where product_name LIKE ${replacement}`;
        pool.query(sqlStatement, (error, product) => {
            if (error) {
                return reject(error);
            }
            return resolve(product[0]);
        });
    });
};

db.check_productavail = (productname) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * from product where product_name = ? ', [productname], (error, product) => {
            if (error) {
                return reject(error);
            }
            return resolve(product);
        });
    });
};


db.delete_user = (number) => {
    return new Promise((resolve, reject) => {
        pool.query('DELETE FROM users WHERE users_number = ?', [number], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.search_product = (searchterm) => {
    return new Promise((resolve, reject) => {
        let replacement = `'%${searchterm}%'`;
        let sqlStatement = `SELECT product_name, product_price, product_qty, product_seller from  product where product_name LIKE ${replacement}`;
        pool.query(sqlStatement, (error, product) => {
            if (product.length == 0) {
                return reject(error);
            }
            return resolve(product);
        });
    });
};

db.get_all_product = () => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM product', (error, users) => {
            if (error) {
                return reject(error);
            }
            return resolve(users);
        });
    });
};

db.add_orders = (productid, buyqty, totalprice, buyer, productseller) => {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO orders (product_id, orders_qty, orders_price, buyer_name, seller_name) VALUES (?, ?, ?, ?, ?)', [productid, buyqty, totalprice, buyer, productseller], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.deduct_product_qty = (buyqty, buyname) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE product SET product_qty = product_qty - ? WHERE product_name = ?', [buyqty, buyname], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.check_order = (idorder) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM orders WHERE orders_id = ?', [(idorder)], (error, orders) => {
            if (error) {
                return reject(error);
            }
            return resolve(orders[0]);
        });
    });
};

db.update_status = (status, idorder) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE orders SET orders_status = ? WHERE orders_id = ?', [status, idorder], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.add_balance = (balance, idorder) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE users SET users_balance = users_balance + ? WHERE users_name = ?', [balance, idorder], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

db.get_my_order = (ordername) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM orders WHERE buyer_name = ? OR seller_name = ?', [ordername,ordername], (error, order) => {
            if (error) {
                return reject(error);
            }
            return resolve(order);
        });
    });
};

db.deduct_funds = (balance, name) => {
    return new Promise((resolve, reject) => {
        pool.query('UPDATE users SET users_balance = users_balance - ? WHERE users_name = ?', [balance, name], (error) => {
            if (error) {
                return reject(error);
            }
            return resolve();
        });
    });
};

module.exports = db