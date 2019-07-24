let cart;
let products;
initCart();
renderHeader();
renderFooter();

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
            updateCart();
            renderCart();
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
        showCartInfo();
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
        let html = /*html*/ `
        <div class="col-12 col-lg-8 flex-column mx-auto p-0 mt-5">
        `;
        for (let key in cart) {
            let subtotal = cart[key].price * cart[key].qty;
            html += /*html*/ `
                <div class="d-flex p-3 align-items-end align-items-md-center border-bottom">
                    <div class="rounded border align-self-center">
                        <img class="lg-thumbnail" src="../assets/pics/${key}/${products[key].pics.split(/\s+/)[0]}">
                    </div>
                    <div class="row no-gutters flex-grow-1 ml-3">
                        <div class="col-12 col-md-6 d-flex flex-column text-center">
                            <a class="font-weight-bold" href="../pages/details.html?key=${key}">${cart[key].name}</a>
                            <span>Price: ${cart[key].price} euro</span>
                            <span class="d-none d-md-inline">Stock: ${cart[key].stock} pcs</span>
                            <span class="font-weight-bold">Subtotal: ${subtotal} euro</span>
                        </div>
                        <div class="col-12 col-md-6 d-flex align-items-center pt-2 pt-md-0">
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <button class="decreaseBtn btn btn-dark font-weight-bold"  data-key = "${key}">-</button>
                                </div>
                                <input class="qtyInput form-control text-center" type="text" value="${cart[key].qty}" disabled>
                                <div class="input-group-append">
                                    <button class="increaseBtn btn btn-dark font-weight-bold"  data-key = "${key}">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button data-key = "${key}" class ="removeBtn btn btn-danger text-nowrap ml-2">
                    <span class="d-none d-md-inline">Remove</span>
                    <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                `;
            totalProducts += cart[key].qty;
            totalPrice += subtotal;
        }
        html += /*html*/ `
        <div class="cartDetails d-flex flex-column text-center my-3">
        <span>Products in cart: ${totalProducts}</span>
        <span>Taxes: 0 %</span>
        <span>Shipping: 0 euro</span>
        <span><b>Total price: ${totalPrice} euro</b></span>
        <button id="storeBtn" class="btn btn-success mx-3 mt-3">Continue shopping</button>
        <button id="orderBtn" class="btn btn-dark mx-3 mt-1">Place order <i class="fas fa-credit-card ml-2"></i></button>

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

        document.body.insertBefore(div, document.querySelector('#footer'));
    } else {
        let div = document.createElement('div');
        div.className = "d-flex";
        div.innerHTML = `
        <div class="bg-white text-center border shadow rounded p-5 mx-auto my-5">
        <p>Shopping cart is empty!</p>
        <button id="storeBtn" class="btn btn-success mt-3 text-nowrap">Continue shopping</button>
        </div>
        `;

        div.querySelector('#storeBtn').addEventListener('click', userInteraction);

        document.body.insertBefore(div, document.querySelector('#footer'));
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
                            <div class="text-success d-flex flex-column align-items-center">
                                <i class="far fa-check-circle fa-2x"></i>
                                <span class="mt-2">Your order was successfully placed.</span>
                            </div>
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

function renderFooter() {
    let div = document.createElement('div');
    div.id = 'footer';
    div.className = 'px-4 pt-5 pb-2';
    let html = /*html*/ `
        <hr>
        <div class="d-flex flex-column flex-md-row">
        <div class="d-flex flex-column flex-grow-1 align-items-md-start align-items-center justify-content-center text-secondary pb-2 pb-md-3">
            <span class="mb-2"><b>CUSTOMER SERVICE</b></span>
            <span class="mb-2"><i class="fas fa-phone-alt" aria-hidden="true"></i> <b>0754 700 700</b></span>
            <span>Monday-Friday: 10:00 - 17:00</span>
        </div>
        <div class="d-flex flex-column flex-grow-1 align-items-center align-items-md-end text-secondary pb-5 pb-md-3">
            <div>
                <a href="./contact.html">Contact form</a>
            </div>
            <div class="text-center text-md-right mt-2">
                <span><b>NEWSLETTER</b></span><br>
                <small>Do you want to know more about current trends<br> and our latest offers? <b>Subscribe!</b></small><br>
                <div class="input-group mt-2">
                    <input class="form-control border-secondary" type="text">
                    <div class="input-group-append">
                        <button class="btn btn-secondary"><i class="far fa-envelope" aria-hidden="true"></i></button>
                    </div>
                </div>
            </div>
        </div>
        `;
    div.innerHTML = html;
    document.body.appendChild(div);
}