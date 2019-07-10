let url = new URL(document.URL);
let key = url.searchParams.get('key');
let product;
let cart;
initCart();
renderHeader();
addListeners('header');
updateCartBtn();
showLoading();
getProductDetails()
    .then(function (response) {
        if (response.status === 200)
            return response.json();
        else
            console.log(response.statusText);
    })
    .then(function (data) {
        product = data;
        clearLoading();
        if (product) {
            if (cart[key]) {
                cart[key] = {
                    ...cart[key],
                    ...product
                };
            }
            renderDetails();
            addListeners('details');
            updateCartBtn();
        } else {
            document.querySelector('#mainContainer').innerHTML = 'Product not available!';
        }
    })
    .catch(function (err) {
        console.log(err)
    });


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
    if (parameters.includes('details')) {
        document.querySelector('#addBtn').addEventListener('click', function () {
            addToCart();
            updateCartBtn();
            popup();
            document.querySelector('.qtyInput').value = 1;
            renderDetails();
            addListeners('details');
        });
        document.querySelector('.increaseBtn').addEventListener('click', function () {
            let qty = Number(document.querySelector('.qtyInput').value);
            let cartQty = (cart[key]) ? cart[key].qty : 0;
            if (product.stock > (cartQty + qty)) {
                qty++;
                document.querySelector('.qtyInput').value = qty;
            }
        });
        document.querySelector('.decreaseBtn').addEventListener('click', function () {
            let qty = Number(document.querySelector('.qtyInput').value);
            if (qty > 1) {
                qty--;
                document.querySelector('.qtyInput').value = qty;
            }
        });
        document.querySelector('#storeBtn').addEventListener('click', function () {
            location.assign('../index.html');
        })
    }
}

function searchClicked() {
    let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
    if (searchString) {
        location.assign(`../index.html?search=${searchString}`);
    }
}

function popup() {
    let popup = document.createElement('div');
    popup.className = 'popup alert alert-success';
    popup.innerHTML = `Product <b>${product.name}</b> added to your cart!`;
    document.body.appendChild(popup);
    setTimeout(function () {
        document.body.removeChild(popup);
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

function updateCartBtn() {
    if (document.getElementById('cartItems')) {
        let items = 0;
        for (let key in cart) {
            items += cart[key].qty;
        }
        document.getElementById('cartItems').innerHTML = items;
    }
}

function addToCart() {
    let qty = Number(document.querySelector('.qtyInput').value);
    let cartQty = (cart[key]) ? cart[key].qty : 0;
    if (product.stock >= (cartQty + qty)) {
        sufficientStock = true;
        if (cart[key])
            cart[key].qty += qty;
        else {
            product.qty = qty;
            cart[key] = product;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    } else {
        sufficientStock = false;
    }
}

function renderDetails() {
    let div = document.querySelector('#details');
    if (div) {
        div.parentElement.removeChild(div);
    }
    div = document.createElement('div');
    div.id = 'details';
    div.className = 'container p-0';
    let html = `
    <div class="row no-gutters justify-content-center">
        <div class="col-12 col-md-6 col-xl-5 p-4 d-flex justify-content-center align-items-center">
            <img class="w-100" src="${product.pic}">
        </div>
        <div class="col-12 col-md-6 col-xl-5 p-4 d-flex justify-content-center align-items-center">
            <div class="d-flex flex-column text-center flex-fill">
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
                            <button class="decreaseBtn btn btn-dark" disabled>-</button>
                        </div>
                        <input class="qtyInput form-control text-center" type="text" value="All stock in cart" disabled>
                        <div class="input-group-append">
                            <button class="increaseBtn btn btn-dark" disabled>+</button>
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
                        <button class="decreaseBtn btn btn-dark">-</button>
                    </div>
                    <input class="qtyInput form-control text-center" type="text" value="1" disabled>
                    <div class="input-group-append">
                        <button class="increaseBtn btn btn-dark">+</button>
                    </div>
                </div>
                </div>  
                <button id="addBtn" class="btn btn-dark mb-1">Add to cart</button>
                <button id="storeBtn" class="btn btn-dark">Continue shopping</button>
            </div>
        </div>
    </div>
        `;
    else if (product.stock <= 0)
        html += `
            <div>
                <div class="input-group mb-3">
                    <div class="input-group-prepend">
                        <button class="decreaseBtn btn btn-dark" disabled>-</button>
                    </div>
                    <input class="qtyInput form-control text-center" type="text" value="Out of stock" disabled>
                    <div class="input-group-append">
                        <button class="increaseBtn btn btn-dark" disabled>+</button>
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
    document.body.appendChild(div);
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