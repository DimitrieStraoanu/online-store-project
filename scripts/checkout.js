let expiration;
let cart;
let database;
initCart();
showLoading();
checkStock()
    .then(function () {
        drawCart();
        expiration = setTimeout(function () {
            document.querySelector('body').innerHTML = `
            <div class="expired">
                <h1>Session expired!</h1>
                <button id="backBtn">Back to cart</button>
            </div>
            `;
            document.querySelector('#backBtn').addEventListener('click', back);
        }, 10000)
    })
    .catch(function () {
        document.querySelector('body').innerHTML = `
        <div class="expired">
            <h1>Ooops!</h1>
            <button id="backBtn">Back to cart</button>
        </div>
        `;
        document.querySelector('#backBtn').addEventListener('click', back);

    });


function initCart() {
    if (localStorage.getItem('cart'))
        cart = JSON.parse(localStorage.getItem('cart'));
    else
        cart = {};
}

function showLoading() {
    document.querySelector('#mainContainer').innerHTML = '<img src="../assets/loading.gif">';
}

function checkStock() {
    return new Promise(function (resolve, reject) {
        fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/.json`)
            .then(function (response) {
                if (response.status !== 200) {
                    reject();
                } else
                    return response.json();
            })
            .then(function (data) {
                database = data;
                for (let key in cart) {
                    if (database[key].stock < 1) {
                        console.log(`${cart[key].name} - Out of stock! - Product deleted!`);
                        delete cart[key];
                    } else if (cart[key].qty > database[key].stock) {
                        console.log(`${cart[key].name} - Not enough stock! - Qty adjusted!`);
                        cart[key].qty = database[key].stock;
                    } else {
                        console.log(`${cart[key].name} - Stock ok!`);
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                }
                resolve();
            })
            .catch(function () {
                reject();
            });
    });
}

function drawCart() {
    let html = `
        <table>
        <thead>
            <tr>
                <th>Product name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
            </tr>
        </thead>
        <tbody></tbody>
        </table>
        <div class="cartDetails"></div>
        `;
    document.querySelector('#mainContainer').innerHTML = html;
    html = '';
    let totalProducts = 0;
    let totalPrice = 0;
    for (let key in cart) {
        let subtotal = cart[key].price * cart[key].qty;
        html += `
                <tr>
                    <td>${cart[key].name}</td>
                    <td>${cart[key].price} euro</td>
                    <td>${cart[key].qty}</td>
                    <td>${subtotal} euro</td>
                </tr>    
            `;
        totalProducts += cart[key].qty;
        totalPrice += subtotal;
    }
    document.querySelector('table tbody').innerHTML = html;
    html = `
        <p>Products in cart: ${totalProducts}</p>
        <p>Taxes: 0 %</p>
        <p>Shipping: 0 euro</p>
        <p><b>Total price: ${totalPrice} euro</b></p>
        <button id="confirmBtn">Confirm</Button>
        <button id="backBtn">Back</button>
        `;
    document.querySelector('.cartDetails').innerHTML = html;
    document.querySelector('#confirmBtn').addEventListener('click', confirm);
    document.querySelector('#backBtn').addEventListener('click', back);
}

function confirm() {
    clearTimeout(expiration);
    showLoading();
    let orders = [];
    for (let key in cart) {
        let order = fetch(`https://my-online-store-2bdc4.firebaseio.com/my_orders/${[key]}/.json`, {
            method: 'POST',
            body: cart[key].qty
        });
        orders.push(order);
    }
    Promise.all(orders)
        .then(function (responses) {
            for (let response of responses) {
                console.log(response);
                if (response.status !== 200)
                    return Promise.reject();
            }
            document.querySelector('body').innerHTML = `
            <div class="expired">
                <h1>Thank you!</h1>
                <button id="okBtn">Ok</button>
            </div>
            `;
            document.querySelector('#okBtn').addEventListener('click', function () {
                location.assign('../index.html');

            });
            localStorage.removeItem('cart');

        })
        .catch(function (err) {
            console.log(err);
            document.querySelector('body').innerHTML = `
            <div class="expired">
                <h1>Ooops!</h1>
                <button id="backBtn">Back to cart</button>
            </div>
            `;
            document.querySelector('#backBtn').addEventListener('click', back);
        });
}

function back() {
    location.assign('./cart.html');
}