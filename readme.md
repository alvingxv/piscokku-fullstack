 # API Piscokku
Anggota Kelompok:
- Hafizh Abid Wibowo - 502701011
- Alvian Ghifari - 5027201035
- Axellino Anggoro A - 5027201040

## **Register**

### **Method**
`POST`

### **Endpoint**
`api/register`

### **Auth**
Tidak menggunakan autentikasi

### **Parameter**
`{number, name, password}`
### Contoh *Payload*
```json
{
    "number": "12345",
    "name": "user",
    "password": "user"
}
```

### **Response**
```json
{
    "status": 201,
    "message": "User Created"
}
```

<br>

## **Login**

### **Method**
`POST`

### **Endpoint**
`/api/login`

### **Auth**
Tidak menggunakan Autentikasi

### **Parameter**
`{number, password}`

### **Contoh *Payload***
```json
{
    "number": "test",
    "password": "test"
}
```

### **Response**
```json
{
    "status": 200,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6......"
}
```

<br>

## **Search Product**

### **Method**
`POST`

### **Endpoint**
`/api/searchproduct`

### **Auth**
Tidak menggunakan Autentikasi

### **Parameter**
`{search}`

### **Contoh *Payload***
```json
{
    "search": "Vanilla"
}
```

### **Response**
```json
{
    "Product": [
        {
            "product_name": "Piscok Vanilla",
            "product_price": 50000,
            "product_qty": 497,
            "product_seller": "PISCOK LUMER"
        },
        {
            "product_name": "Piscok Vanillaasdasdsa",
            "product_price": 10000,
            "product_qty": 47,
            "product_seller": "Mafia gedhang"
        }
    ]
}
```

<br>

## **Get All User**

### **Method**
`GET`

### **Endpoint**
`/admin`

### **Auth**
Menggunakan autentikasi Admin

### **Parameter**
Tidak ada parameter

### **Response**
```json
{
    "users": [
        {
            "users_number": "085648175777",
            "users_name": "admin",
            "users_password": "$2b$10$mfkk2dToUjjG.sVK7S8XYuFOKlT1PldI/gintdXLrS2l1klhAbKzC",
            "users_role": "admin",
            "users_datecreated": "2022-05-28T23:08:58.000Z",
            "users_balance": 0
        },
        {
            "users_number": "08312321548",
            "users_name": "PISCOK LUMER",
            "users_password": "$2b$10$xd86Svwly10ovOlGdv5wMu2606ZPwutpcSrP/jXGp1ioziIZg6LH6",
            "users_role": "user",
            "users_datecreated": "2022-06-01T00:45:49.000Z",
            "users_balance": 0
        }
    ]
}
```

<br>

## **Profile**

### **Method**
`GET`

### **Endpoint**
`/user/profile`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
Tidak ada parameter

### **Response**
```json
{
    "User": {
        "users_number": "081234567",
        "users_name": "Mafia gedhang",
        "users_password": "$2b$10$tvYbb9tUs1jCFqkWvZwYMOiUNs.03NdTomObEoaMWhbxDJLrhfBhq",
        "users_role": "user",
        "users_datecreated": "2022-06-01T00:44:15.000Z",
        "users_balance": 2000
    }
}
```
<br>

## **Add Product**

### **Method**
`POST`

### **Endpoint**
`/user/addproduct`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{product_name, product_qty, product_price}`

### **Contoh *Payload***
```json
{
    "product_name": "Piscok demo",
    "product_qty": "50",
    "product_price": "10000"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Product Added"
}
```
<br>

## **Update Product**

### **Method**
`POST`

### **Endpoint**
`/user/updateproduct`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{product_name, product_qty, product_price}`

### **Contoh *Payload***
```json
{
    "product_name": "Piscok demo",
    //dapat diisi salah satu dan dua2nya
    "product_qty": "50", 
    "product_price": "10000"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Product Updated"
}
```
<br>

## **Get All Product**

### **Method**
`GET`

### **Endpoint**
`/user/getallproduct`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
Tidak ada parameter

### **Response**
```json
{
    "Product": [
        {
            "product_id": 1,
            "product_name": "Piscok Keju",
            "product_price": 10000,
            "product_qty": 92,
            "product_seller": "PISCOK LUMER"
        },
        {
            "product_id": 2,
            "product_name": "Piscok Cappucino",
            "product_price": 10000,
            "product_qty": 97,
            "product_seller": "Boss Gedhang"
        }
    ]
}
```

<br>

## **Buy**

### **Method**
`POST`

### **Endpoint**
`/user/buy`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{product_name, product_qty}`

### **Contoh *Payload***
```json
{
    "product_name": "Piscok Keju",
    "product_qty": "5"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Product Ordered, Waiting for Payment"
}
```
<br>

## **My Order**

### **Method**
`GET`

### **Endpoint**
`/user/myorder`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
Tidak ada parameter

### **Response**
```json
{
    "Order": [
        {
            "orders_id": 1,
            "orders_status": "Paid",
            "product_id": 9,
            "orders_qty": 5,
            "orders_price": 35000,
            "buyer_name": "afrida",
            "seller_name": "Mafia gedhang"
        },
        {
            "orders_id": 4,
            "orders_status": "Waiting for Payment",
            "product_id": 1,
            "orders_qty": 10,
            "orders_price": 100000,
            "buyer_name": "afrida",
            "seller_name": "PISCOK LUMER"
        }
    ]
}
```
<br>

## **Pay**

### **Method**
`POST`

### **Endpoint**
`/user/pay`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{orders_id, emoney, username, number, password, email}`

### **Contoh *Payload***
```json
{
    "orders_id": "2",
    "emoney": "Payfresh",
    //optional, tergantung dari emoney yang digunakan
    "username": "PadPay",
    "number": "082169420720",
    "password": "PeacePay",
    "email": "peace@pay.com"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Payment Success"
}
```
<br>

## **Seller Confirm**

### **Method**
`POST`

### **Endpoint**
`/user/sellerconfirm`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{orders_id}`

### **Contoh *Payload***
```json
{
    "orders_id": "2"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Confirmation successful (product sent)"
}
```
<br>

## **Buyer Confirm**

### **Method**
`POST`

### **Endpoint**
`/user/buyerconfirm`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{orders_id}`

### **Contoh *Payload***
```json
{
    "orders_id": "2"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Confirmation successful (product received)"
}
```
<br>

## **Withdraw Funds**

### **Method**
`POST`

### **Endpoint**
`/user/withdraw`

### **Auth**
Menggunakan autentikasi User

### **Parameter**
`{amount, emoney, tujuan}`

### **Contoh *Payload***
```json
{
    "amount": "1000",
    "emoney": "PeacePay",
    "tujuan": "123"
}
```

### **Response**
```json
{
    "status": 200,
    "message": "Withdraw Success"
}
```
<br>