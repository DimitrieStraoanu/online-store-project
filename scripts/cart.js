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

    if (this.id === 'storeBtn' || this.id === 'logo') {
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
        div.className = "my-fullscreen";
        div.innerHTML = `
        <div class="my-fixed-centered bg-white text-center border shadow rounded p-5">
        <p>Shopping cart is empty!</p>
        <button id="storeBtn" class="btn btn-success mt-3 text-nowrap">Continue shopping</button>
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
                            <div class="text-success d-flex align-items-center"><i class="far fa-check-circle fa-2x"></i> <span class="ml-3">Your order was successfully placed.</span></div>
                            <button id="storeBtn" class="btn btn-success mt-3">Continue shopping</button>
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
        <div class="row no-gutters py-3 px-4 px-xl-5 py-xl-4 bg-white border-bottom">
            <div class="col-12 col-sm col-xl-auto order-xl-1 pb-2 pb-sm-0 d-flex align-items-center justify-content-center justify-content-sm-start">
                <h1 id="logo" class="text-dark text-center font-weight-light"><i class="fas fa-tshirt"></i> The<b>Fashion</b>Store</span></h1>
            </div>
            <div class="col-12 col-sm-auto col-xl-auto order-xl-3 d-flex align-items-center justify-content-center justify-content-sm-end">
                <button id="adminBtn" class="btn btn-outline-dark flex-grow-1 flex-sm-grow-0"><i class="fas fa-lock"></i> <span class="d-sm-none d-md-inline">Admin</span></button>
                <button id="cartBtn" class="btn btn-outline-dark flex-grow-1 flex-sm-grow-0 position-relative ml-2">
                <i class="fas fa-shopping-cart"></i> <span class="d-sm-none d-md-inline">Shopping cart</span> <span id="cartItems" class="rounded-pill px-2 border border-dark badge-danger font-weight-bold my-badge"></span>
                </button>
            </div>
            <div class="col-12 col-xl pt-2 pt-xl-0 px-xl-5 order-xl-2 d-flex align-items-center justify-content-center">
                <div class="input-group">
                    <input type="text" id="searchInput" class="form-control border-secondary" aria-label="Recipient's username" aria-describedby="button-addon2">
                    <div class="input-group-append">
                    <button class="btn btn-outline-dark" type="button" id="searchBtn"><i class="fas fa-search"></i> <span class="d-none d-sm-inline">Search</span></button>
                    </div>
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