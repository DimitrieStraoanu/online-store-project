let url = new URL(document.URL);
let key = url.searchParams.get('key');
let product;
let cart;
initCart();
renderHeader();
showCartInfo();
showLoading();
getProductDetails()
    .then(function (response) {
        if (response.status === 200)
            return response.json();
        else
            throw Error(response.status);
    })
    .then(function (data) {
        product = data;
        clearLoading();
        if (product) {
            syncCart();
            renderDetails();
            showCartInfo();
        } else {
            alert();
        }
    })
    .catch(function (err) {
        console.log(err)
    });

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
    if (this.id === 'searchBtn') {
        let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
        if (searchString) {
            location.assign(`../index.html?search=${searchString}`);
        }
    }
    if (this.id === 'addBtn') {
        addToCart();
        showCartInfo();
        renderDetails();
        confirm();
    }
    if (this.id === 'increaseBtn') {
        let qty = Number(document.querySelector('#qtyInput').value);
        let cartQty = (cart[key]) ? cart[key].qty : 0;
        if (product.stock > (cartQty + qty)) {
            qty++;
            document.querySelector('#qtyInput').value = qty;
        }
    }
    if (this.id === 'decreaseBtn') {
        let qty = Number(document.querySelector('#qtyInput').value);
        if (qty > 1) {
            qty--;
            document.querySelector('#qtyInput').value = qty;
        }
    }
}

function alert() {
    let div = document.createElement('div');
    div.className = 'alert alert-danger mt-5 text-center d-table p-4 mx-auto';
    div.innerHTML = `
    <p>Product not available!</p>
    <button id="storeBtn" class="btn btn-dark mx-3">Continue shopping</button>
    </button>
    `;
    div.querySelector('#storeBtn').addEventListener('click', userInteraction);
    document.body.append(div);
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
    let loading = document.querySelector('#loading')
    loading.parentElement.removeChild(loading);
}

function confirm() {
    let div = document.createElement('div');
    div.className = 'alert alert-success text-center m-0';
    div.innerHTML = `Product <b>${product.name}</b> added to your cart!`;
    document.querySelector('#confirm').append(div);
    setTimeout(function () {
        div.parentElement.removeChild(div);
    }, 3000);
}

function getProductDetails() {
    return fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}.json`, {
        method: 'GET'
    });
}

function initCart() {
    cart = localStorage.getItem('cart');
    if (cart)
        cart = JSON.parse(cart);
    else
        cart = {};
}

function syncCart() {
    if (cart[key]) {
        cart[key] = {
            ...cart[key],
            ...product
        };
        localStorage.setItem('cart', JSON.stringify(cart));
    }
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

function addToCart() {
    let qty = Number(document.querySelector('#qtyInput').value);
    if (cart[key])
        cart[key].qty += qty;
    else {
        product.qty = qty;
        cart[key] = product;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderDetails() {
    let div = document.querySelector('#details');
    if (div) {
        div.parentElement.removeChild(div);
    }
    div = document.createElement('div');
    div.id = 'details';
    div.className = 'container p-0 position-relative';
    let html = `
    <div class="row no-gutters justify-content-center">
        <div class="col-12 col-md-6 col-xl-5 p-4 d-flex justify-content-center align-items-center">
            <img class="w-100" src="${product.pic}">
        </div>
        <div class="col-12 col-md-6 col-xl-5 p-4 d-flex justify-content-center align-items-center">
            <div class="d-flex flex-column text-center flex-fill">
                <div id="confirm"></div>
                <h3 class="mb-5">${product.name}</h3>
                <p>${product.desc}</p>
                <p><b>Price: ${product.price} euro</b></p>
                <p>Stock: ${product.stock} pcs | Cart:  ${(cart[key])?cart[key].qty:0} pcs</p>
        `;
    if (cart[key] && product.stock === cart[key].qty)
        html += `
                <div">
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <button id="decreaseBtn" class="btn btn-dark" disabled>-</button>
                        </div>
                        <input id="qtyInput" class="form-control text-center" type="text" value="All stock in cart" disabled>
                        <div class="input-group-append">
                            <button id="increaseBtn" class="btn btn-dark" disabled>+</button>
                        </div>
                    </div>
                    </div">
                    <button id="addBtn" class="btn btn-dark mb-1" disabled>Add to cart</button>
                    <button id="storeBtn" class="btn btn-dark">Continue shopping</button>

            </div>
        </div>
    </div>
        `;
    else if (product.stock > 0)
        html += `
            <div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <button id="decreaseBtn" class="btn btn-dark">-</button>
                    </div>
                    <input id="qtyInput" class="form-control text-center" type="text" value="1" disabled>
                    <div class="input-group-append">
                        <button id="increaseBtn" class="btn btn-dark">+</button>
                    </div>
                </div>
                </div>  
                <button id="addBtn" class="btn btn-dark mb-1">Add to cart</button>
                <button id="storeBtn" class="btn btn-dark">Continue shopping</button>
            </alert>
        </div>
    </div>
        `;
    else if (product.stock <= 0)
        html += `
            <div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <button id="decreaseBtn" class="btn btn-dark" disabled>-</button>
                    </div>
                    <input id="qtyInput" class="form-control text-center" type="text" value="Out of stock" disabled>
                    <div class="input-group-append">
                        <button id="increaseBtn" class="btn btn-dark" disabled>+</button>
                    </div>
                </div>
            </div>  
            <button id="addBtn" class="btn btn-dark mb-1" disabled>Add to cart</button>
            <button id="storeBtn" class="btn btn-dark mb-3">Continue shopping</button>
        </div>
    </div>
</div>
        `;
    div.innerHTML = html;

    div.querySelector('#addBtn').addEventListener('click', userInteraction);
    div.querySelector('#increaseBtn').addEventListener('click', userInteraction);
    div.querySelector('#decreaseBtn').addEventListener('click', userInteraction);
    div.querySelector('#storeBtn').addEventListener('click', userInteraction);

    document.body.appendChild(div);
}

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'd-flex flex-column';
    let html = `
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
    div.innerHTML = html;

    div.querySelector('#logo').addEventListener('click', userInteraction);
    div.querySelector('#searchBtn').addEventListener('click', userInteraction);
    div.querySelector('#cartBtn').addEventListener('click', userInteraction);
    div.querySelector('#adminBtn').addEventListener('click', userInteraction);

    document.body.appendChild(div);
}