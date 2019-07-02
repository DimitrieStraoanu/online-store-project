let cart;
let database;
initCart();
showLoading();
checkStock()
    .then(function () {
        drawCart();
    })
    .catch(function (err) {
        console.log(err)
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

function modifyQty() {
    if (event.target.classList.contains('increaseBtn')) {
        let key = event.target.dataset.key;
        if (database[key].stock > cart[key].qty) {
            cart[key].qty++;
            localStorage.setItem('cart', JSON.stringify(cart));
            drawCart();
        }
    }
    if (event.target.classList.contains('decreaseBtn')) {
        let key = event.target.dataset.key;
        if (cart[key].qty > 1) {
            cart[key].qty--;
            localStorage.setItem('cart', JSON.stringify(cart));
            drawCart();
        }
    }
    if (event.target.classList.contains('removeBtn')) {
        let key = event.target.dataset.key;
        delete cart[key];
        localStorage.setItem('cart', JSON.stringify(cart));
        drawCart();
    }
}

function drawCart() {
    if (Object.keys(cart).length > 0) {
        let html = `
        <button id="backBtn">Back to store</button>
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
                    <td><a href="../pages/details.html?key=${key}">${cart[key].name}</a></td>
                    <td>${cart[key].price} euro</td>
                    <td>
                        <button class ="decreaseBtn"  data-key = "${key}">-</button>
                        <input class ="qtyInput" type="text" value="${cart[key].qty}" disabled>
                        <button class ="increaseBtn"  data-key = "${key}">+</button>
                    </td>
                    <td>${subtotal} euro</td>
                    <td><button data-key = "${key}" class ="removeBtn">Remove</button></td>
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
            <button id="checkoutBtn">Checkout</Button>
        `;
        document.querySelector('.cartDetails').innerHTML = html;
        document.querySelector('#checkoutBtn').addEventListener('click', checkout);
        document.querySelector('table').addEventListener('click', modifyQty);
        document.querySelector('#backBtn').addEventListener('click', backToStore);

    } else {
        document.querySelector('#mainContainer').innerHTML = `
        <div class="centered">
        <p>Shopping cart is empty!</p>
        <button id="backBtn">Back to store</button>
        </div>
        `;
        document.querySelector('#backBtn').addEventListener('click', backToStore);
    }
}

function checkStock() {
    if (Object.keys(cart).length > 0) {
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
                    let helper = document.querySelector('#helper');
                    helper.innerHTML = '';
                    for (let key in cart) {
                        if (!database[key]) {
                            helper.innerHTML += `<p>${cart[key].name} - Not available! Product removed from cart!</p>`;
                            delete cart[key];
                        } else if (database[key].stock < 1) {
                            helper.innerHTML += `<p>${cart[key].name} - Out of stock! Product removed from cart!</p>`;
                            delete cart[key];
                        } else if (cart[key].qty > database[key].stock) {
                            helper.innerHTML += `<p>${cart[key].name} - Not enough stock! Cart quantity adjusted!</p>`;
                            cart[key].qty = database[key].stock;
                        }
                        if (cart[key])
                            cart[key] = {
                                ...cart[key],
                                ...database[key]
                            };
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    resolve();
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    } else {
        return Promise.resolve();
    }
}

function checkout() {
    document.querySelector('.header h1').innerHTML = 'Confirm order';
    showLoading();
    checkStock()
        .then(function () {
            drawOrder();
        })

}

function drawOrder() {
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
                    <td>${cart[key].qty} pcs</td>
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
            <button id="cancelBtn">Cancel</Button>
        `;
    document.querySelector('.cartDetails').innerHTML = html;
    document.querySelector('#confirmBtn').addEventListener('click', confirm);
    document.querySelector('#cancelBtn').addEventListener('click', cancel);
}

function cancel() {
    document.querySelector('.header h1').innerHTML = 'My Online Store';
    drawCart();
}

function confirm() {
    showLoading();
    let orders = [];
    for (let key in cart) {
        let order = fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}/stock.json`, {
            method: 'PUT',
            body: database[key].stock - cart[key].qty
        });
        orders.push(order);
    }
    Promise.all(orders)
        .then(function () {
            localStorage.removeItem('cart');
            document.querySelector('.header h1').innerHTML = 'Thank you!';
            document.querySelector('#mainContainer').innerHTML = '<button id="backBtn">Back to store</button>';
            document.querySelector('#backBtn').addEventListener('click', backToStore);

        })
        .catch(function (err) {
            console.log(err);
        })

}

function backToStore() {
    location.assign('../index.html');
}