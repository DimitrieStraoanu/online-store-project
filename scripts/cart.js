let cart;
let database;
initCart();
showLoading();
document.querySelector('#backBtn').addEventListener('click', function () {
    location.assign('../index.html');
});
checkStock()
    .then(function () {
        drawCart();
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
        let id = event.target.dataset.id;
        if (database[id].stock > cart[id].qty) {
            cart[id].qty++;
            localStorage.setItem('cart', JSON.stringify(cart));
            drawCart();
        }
    }
    if (event.target.classList.contains('decreaseBtn')) {
        let id = event.target.dataset.id;
        if (cart[id].qty > 1) {
            cart[id].qty--;
            localStorage.setItem('cart', JSON.stringify(cart));
            drawCart();
        }
    }
    if (event.target.classList.contains('removeBtn')) {
        let id = event.target.dataset.id;
        delete cart[id];
        localStorage.setItem('cart', JSON.stringify(cart));
        drawCart();
    }
}

function drawCart() {
    if (Object.keys(cart).length > 0) {
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
                    <td><a href="../pages/details.html?id=${key}">${cart[key].name}</a></td>
                    <td>${cart[key].price} euro</td>
                    <td>
                        <button class ="decreaseBtn"  data-id = "${key}">-</button>
                        <input class ="qtyInput" type="text" value="${cart[key].qty}" disabled>
                        <button class ="increaseBtn"  data-id = "${key}">+</button>
                    </td>
                    <td>${subtotal} euro</td>
                    <td><button data-id = "${key}" class ="removeBtn">Remove</button></td>
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

    } else {
        document.querySelector('#mainContainer').innerHTML = 'Shopping cart is empty!';
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
    } else {
        return Promise.resolve();
    }
}

function checkout() {
    location.assign('./checkout.html');
}