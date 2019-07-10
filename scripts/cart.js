let cart;
let database;
initCart();
renderHeader();
addListeners('header');
updateCartBtn();
showLoading();
checkStock()
    .then(function () {
        clearLoading();
        updateCartBtn();
        renderCart();
        if (Object.keys(cart).length > 0) {
            addListeners('cartProducts');
        }
    })
    .catch(function (err) {
        console.log(err)
    });

function initCart() {
    cart = localStorage.getItem('cart');
    if (cart)
        cart = JSON.parse(cart);
    else
        cart = {};
}

function updateCartBtn() {
    if (document.getElementById('cartItems')) {
        let items = 0;
        for (let key in cart) {
            items += cart[key].qty;
        }
        document.getElementById('cartItems').innerHTML = items;
    }
}

function showLoading() {
    let div = document.createElement('div');
    div.className = 'loading d-flex justify-content-center align-items-center';
    div.innerHTML = `
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>`;
    document.body.appendChild(div);
}

function clearLoading() {
    let loading = document.querySelector('.loading')
    loading.parentElement.removeChild(loading);
}

function modifyQty() {
    if (event.target.classList.contains('increaseBtn')) {
        let key = event.target.dataset.key;
        if (database[key].stock > cart[key].qty) {
            cart[key].qty++;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBtn();
            renderCart();
            addListeners('cartProducts');
        }
    }
    if (event.target.classList.contains('decreaseBtn')) {
        let key = event.target.dataset.key;
        if (cart[key].qty > 1) {
            cart[key].qty--;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBtn();
            renderCart();
            addListeners('cartProducts');
        }
    }
    if (event.target.classList.contains('removeBtn')) {
        let key = event.target.dataset.key;
        delete cart[key];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBtn();
        renderCart();
        if (Object.keys(cart).length > 0) {
            addListeners('cartProducts');
        }
    }
}

function renderCart() {
    let cartProducts = document.querySelector('#cartProducts');
    if (cartProducts) {
        cartProducts.parentElement.removeChild(cartProducts);
    }
    if (Object.keys(cart).length > 0) {
        let totalProducts = 0;
        let totalPrice = 0;
        let div = document.createElement('div');
        div.id = 'cartProducts';
        let html = `
        <div class="col-12 col-lg-8 col-xl-6 flex-column mx-auto p-0">
        <table class="table m-0 mt-5 text-center">
        <thead>
            <tr>
                <th class="border-0">Product name</th>
                <th class="border-0">Price</th>
                <th class="border-0">Qty</th>
                <th class="border-0">Subtotal</th>
                <th class="border-0"></th>
            </tr>
        </thead>
        <tbody>
        `;
        for (let key in cart) {
            let subtotal = cart[key].price * cart[key].qty;
            html += `
                <tr>
                    <th><a href="../pages/details.html?key=${key}">${cart[key].name}</a></th>
                    <td>${cart[key].price} euro</td>
                    <td>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button class="decreaseBtn btn btn-dark"  data-key = "${key}">-</button>
                            </div>
                            <input class="qtyInput form-control text-center" type="text" value="${cart[key].qty}" disabled>
                            <div class="input-group-append">
                                <button class="increaseBtn btn btn-dark"  data-key = "${key}">+</button>
                            </div>
                        </div>
                    </td>
                    <td>${subtotal} euro</td>
                    <td><button data-key = "${key}" class ="removeBtn btn btn-danger">Remove</button></td>
                </tr>    
            `;
            totalProducts += cart[key].qty;
            totalPrice += subtotal;
        }
        html += `
        </tbody>
        </table>
        <div class="cartDetails d-flex flex-column text-center my-3">
        <p>Products in cart: ${totalProducts}</p>
        <p>Taxes: 0 %</p>
        <p>Shipping: 0 euro</p>
        <p><b>Total price: ${totalPrice} euro</b></p>
        <button id="checkoutBtn" class="btn btn-dark mx-3 mb-1">Checkout</Button>
        <button id="storeBtn" class="btn btn-dark mx-3">Continue shopping</button>

        </div>
        </div>
        `;
        div.innerHTML = html;
        document.body.appendChild(div);
    } else {
        let div = document.createElement('div');
        div.innerHTML = `
        <div class="alert alert-light text-center p-5">
        <p>Shopping cart is empty!</p>
        <button id="storeBtn" class="btn btn-dark mx-3">Continue shopping</button>
        </div>
        `;
        document.body.appendChild(div);
        document.querySelector('#storeBtn').addEventListener('click', function () {
            location.assign('../index.html');
        });
    }
}

function addListeners(...parameters) {
    if (parameters.includes('header')) {

        document.querySelector('#logo').addEventListener('click', function () {
            location.assign('../index.html');
        });

        document.querySelector('#searchBtn').addEventListener('click', searchClicked);

        document.querySelector('#cartBtn').addEventListener('click', function () {
            location.assign('./cart.html');
        });

        document.querySelector('#adminBtn').addEventListener('click', function () {
            location.assign('./admin.html');
        });
    }
    if (parameters.includes('cartProducts')) {
        document.querySelector('#storeBtn').addEventListener('click', function () {
            location.assign('../index.html');
        });
        document.querySelector('table').addEventListener('click', modifyQty);
    }
}

function searchClicked() {
    let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
    if (searchString) {
        location.assign(`../index.html?search=${searchString}`);
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
                    let helper = document.createElement('div');
                    helper.id = 'helper';
                    let html = '';
                    for (let key in cart) {
                        if (!database[key]) {
                            html += `<p>${cart[key].name} - Not available! Product removed from cart!</p>`;
                            delete cart[key];
                        } else if (database[key].stock < 1) {
                            html += `<p>${cart[key].name} - Out of stock! Product removed from cart!</p>`;
                            delete cart[key];
                        } else if (cart[key].qty > database[key].stock) {
                            html += `<p>${cart[key].name} - Not enough stock! Cart quantity adjusted!</p>`;
                            cart[key].qty = database[key].stock;
                        }
                        if (cart[key])
                            cart[key] = {
                                ...cart[key],
                                ...database[key]
                            };
                    }
                    if (html) {
                        helper.innerHTML = html;
                        document.body.appendChild(helper);
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
    renderCart();
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

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'd-flex flex-column';
    div.innerHTML = `
        <div class="container-fluid p-0">
        	<div class="row no-gutters py-3 px-5 bg-white border-bottom">
        	    <div class="col-12 col-lg-auto col-xl-auto pr-lg-5 d-flex align-items-center justify-content-center justify-content-lg-start">
        	        <h1 id="logo" class="text-dark text-center font-weight-light">The Fashion Store</h1>
        	    </div>
        	    <div class="col-12 col-md col-xl px-xl-5 py-3 d-flex align-items-center justify-content-center">
                    <div class="input-group">
                        <input type="text" id="searchInput" class="form-control" aria-label="Recipient's username" aria-describedby="button-addon2">
                        <div class="input-group-append">
                        <button class="btn btn-outline-dark" type="button" id="searchBtn">Search</button>
                        </div>
        	        </div>
        	    </div>
        	    <div class="col-12 col-lg-12 col-xl-auto pl-md-3 pl-xl-5 d-flex align-items-center justify-content-center justify-content-lg-end">
        	        <div>
                        <button id="cartBtn" class="btn btn-outline-dark">
                        <i class="fas fa-shopping-cart"></i> Shopping cart <span id="cartItems" class="badge badge-pill badge-danger font-weight-bolder"></span>
                        </button>
        	            <button id="adminBtn" class="btn btn-outline-dark ml-2"><i class="fas fa-lock"></i> Admin</button>
        	        </div>
        	    </div>
            </div>
        </div>
        `;
    document.body.appendChild(div);
}