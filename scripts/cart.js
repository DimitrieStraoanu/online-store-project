let cart;
let products;
initCart();
renderHeader();
if (Object.keys(cart).length > 0) {
    showLoading();
    getProducts()
        .then(function (response) {
            if (response.status === 200)
                return response.json();
            else
                throw Error(response.status);
        })
        .then(function (data) {
            products = data;
            clearLoading();
            syncCart();
            showCartInfo();
            if (!updateCart()) {
                renderCart();
            }
        })
        .catch(function (err) {
            console.log(err)
        });
} else {
    showCartInfo();
    renderCart();
}

function userInteraction(event) {

    if (this.id === 'storeBtn' || event.target.id === 'logo') {
        location.assign('../index.html');
    }
    if (this.id === 'cartBtn') {
        location.assign('./cart.html');
    }
    if (this.id === 'adminBtn') {
        location.assign('./admin.html');
    }
    if (this.id === 'closeBtn') {
        renderCart();
        let cartUpdateInfo = document.querySelector('#cartUpdateInfo');
        cartUpdateInfo.parentElement.removeChild(cartUpdateInfo);
    }
    if (this.id === 'searchBtn') {
        let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
        if (searchString) {
            location.assign(`../index.html?search=${searchString}`);
        }
    }
    if (this.id === 'orderBtn') {
        placeOrder();
    }
    if (this.classList.contains('increaseBtn')) {
        let key = this.dataset.key;
        if (products[key].stock > cart[key].qty) {
            cart[key].qty++;
            localStorage.setItem('cart', JSON.stringify(cart));
            showCartInfo();
            renderCart();
        }
    }
    if (this.classList.contains('decreaseBtn')) {
        let key = this.dataset.key;
        if (cart[key].qty > 1) {
            cart[key].qty--;
            localStorage.setItem('cart', JSON.stringify(cart));
            showCartInfo();
            renderCart();
        }
    }
    if (this.classList.contains('removeBtn')) {
        let key = this.dataset.key;
        delete cart[key];
        localStorage.setItem('cart', JSON.stringify(cart));
        showCartInfo();
        renderCart();
    }
}

function initCart() {
    cart = localStorage.getItem('cart');
    if (cart)
        cart = JSON.parse(cart);
    else
        cart = {};
}

function syncCart() {
    for (let key in products) {
        if (cart[key]) {
            cart[key] = {
                ...cart[key],
                ...products[key]
            };
        }
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showCartInfo() {
    if (document.getElementById('cartItems')) {
        let items = 0;
        for (let key in cart) {
            items += cart[key].qty;
        }
        document.getElementById('cartItems').innerHTML = items;
    }
}

function getProducts() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
    });
}

function showLoading() {
    let div = document.createElement('div');
    div.id = 'loading';
    div.className = 'my-fullscreen d-flex justify-content-center align-items-center';
    div.innerHTML = `
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>`;
    document.body.appendChild(div);
}

function clearLoading() {
    let loading = document.querySelector('#loading');
    loading.parentElement.removeChild(loading);
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
        <div class="col-12 col-lg-8 flex-column mx-auto p-0">
        <table class="table m-0 mt-5 text-center">
        <thead>
            <tr>
                <th class="border-0">Product</th>
                <th class="border-0">Price</th>
                <th class="border-0 d-none d-lg-table-cell">Stock</th>
                <th class="border-0">Qty</th>
                <th class="border-0 d-none d-md-table-cell">Subtotal</th>
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
                    <td class="d-none d-lg-table-cell">${cart[key].stock} pcs</td>
                    <td>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <button class="decreaseBtn btn btn-dark font-weight-bold"  data-key = "${key}">-</button>
                            </div>
                            <input class="qtyInput form-control text-center" type="text" value="${cart[key].qty}" disabled>
                            <div class="input-group-append">
                                <button class="increaseBtn btn btn-dark font-weight-bold"  data-key = "${key}">+</button>
                            </div>
                        </div>
                    </td>
                    <td class="d-none d-md-table-cell">${subtotal} euro</td>
                    <td>
                        <button data-key = "${key}" class ="removeBtn btn btn-danger text-nowrap">
                            <span class="d-none d-md-inline">Remove</span>
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
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
        <button id="storeBtn" class="btn btn-success mx-3 mb-1">Continue shopping</button>
        <button id="orderBtn" class="btn btn-dark mx-3">Place order <i class="fas fa-credit-card ml-2"></i></button>

        </div>
        </div>
        `;
        div.innerHTML = html;

        div.querySelector('#storeBtn').addEventListener('click', userInteraction);
        div.querySelector('#orderBtn').addEventListener('click', userInteraction);
        div.querySelectorAll('.increaseBtn').forEach(element => {
           element.addEventListener('click', userInteraction); 
        });
        div.querySelectorAll('.decreaseBtn').forEach(element => {
           element.addEventListener('click', userInteraction); 
        });
        div.querySelectorAll('.removeBtn').forEach(element => {
           element.addEventListener('click', userInteraction); 
        });

        document.body.appendChild(div);
    } else {
        let div = document.createElement('div');
        div.className = "d-flex align-items-center justify-content-center my-fullscreen";
        div.innerHTML = `
        <div class="alert alert-light text-center border shadow p-5">
        <h4>Shopping cart is empty!</h4>
        <button id="storeBtn" class="btn btn-success mt-3">Continue shopping</button>
        </div>
        `;

        div.querySelector('#storeBtn').addEventListener('click', userInteraction);

        document.body.appendChild(div);
    }
}

function updateCart() {
    let modified = false;
    let div = document.createElement('div');
    div.id = 'alert';
    div.className = 'my-fullscreen d-flex align-items-center justify-content-center';
    let html = `
    <div class="alert alert-light border shadow p-5 text-center">
    <h4 class="mb-3">Some products changed!</h4>
    <hr>
    `;
    for (let key in cart) {
        if (!products[key]) {
            html += `<p class="m-2"><b>${cart[key].name}</b> - Not available! Product removed from cart!</p>`;
            delete cart[key];
            modified = true;
        } else if (products[key].stock === 0) {
            html += `<p class="m-2"><b>${cart[key].name}</b> - Out of stock! Product removed from cart!</p>`;
            delete cart[key];
            modified = true;
        } else if (cart[key].qty > products[key].stock) {
            html += `<p class="m-2"><b>${cart[key].name}</b> - Not enough stock! Cart quantity adjusted!</p>`;
            cart[key].qty = products[key].stock;
            modified = true;
        }
    }
    html += `
    <hr>
    <h6 class="text-danger">Please review your cart items.<h6>
    <button id="closeBtn" class="btn btn-dark mt-3 w-50">Close</button>
    </div>`;
    div.innerHTML = html;
    div.id = 'cartUpdateInfo';
    div.querySelector('#closeBtn').addEventListener('click', userInteraction);
    if (modified) {
        document.body.append(div);
        localStorage.setItem('cart', JSON.stringify(cart));
        return true;
    }
    return false;
}

function placeOrder() {
    showLoading();
    getProducts()
        .then(function (response) {
            if (response.status === 200)
                return response.json();
            else
                throw Error(response.status);
        })
        .then(function (data) {
            products = data;
            syncCart();
            if (!updateCart()) {
                let orders = [];
                for (let key in cart) {
                    let order = fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}/stock.json`, {
                        method: 'PUT',
                        body: products[key].stock - cart[key].qty
                    });
                    orders.push(order);
                }
                Promise.all(orders)
                    .then(function () {
                        localStorage.removeItem('cart');
                        clearLoading();

                        let div = document.createElement('div');
                        div.className = 'my-fullscreen d-flex align-items-center justify-content-center';
                        let html = `
                        <div class="alert alert-light p-5 border text-center shadow">
                            <h4 class="mb-3">Thank you!</h4>
                            <hr>
                            <h6 class="text-success">Your order was successfully placed.</h6>
                            <button id="storeBtn" class="btn btn-dark mt-3">Continue shopping</button>
                        </div>
                        `;
                        div.innerHTML = html;
                        div.querySelector('#storeBtn').addEventListener('click', userInteraction);
                        document.body.appendChild(div);
                    })
                    .catch(function (err) {
                        console.log(err);
                    })

            } else {
                clearLoading();
                showCartInfo();
                renderCart();
                if (Object.keys(cart).length > 0) {
                    addListeners('cartProducts');
                } else {
                    addListeners('alert');
                }
            }
        })
        .catch(function (err) {
            console.log(err)
        });
}

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'd-flex flex-column';
    let html = `
        <div class="container-fluid p-0">
        	<div class="row no-gutters py-3 px-4 px-lg-5 bg-white border-bottom">
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
        	    <div class="col-12 col-lg-12 col-xl-auto pl-xl-5 d-flex align-items-center justify-content-center justify-content-lg-end">
                    <button id="cartBtn" class="btn btn-outline-dark flex-grow-1 flex-lg-grow-0">
                    <i class="fas fa-shopping-cart"></i> Shopping cart <span id="cartItems" class="badge badge-pill badge-danger font-weight-bolder"></span>
                    </button>
                    <button id="adminBtn" class="btn btn-outline-dark ml-2"><i class="fas fa-lock"></i> Admin</button>
        	    </div>
            </div>
        </div>
        `;
    div.innerHTML = html;

    div.querySelector('#logo').addEventListener('click', userInteraction);
    div.querySelector('#searchBtn').addEventListener('click', userInteraction);
    div.querySelector('#cartBtn').addEventListener('click', userInteraction);
    div.querySelector('#adminBtn').addEventListener('click', userInteraction);

    document.body.appendChild(div);
}