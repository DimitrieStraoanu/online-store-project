let cart;
initCart();
renderHeader();
showCartInfo();
renderContactForm();
renderFooter();

function userInteraction() {
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
}

function renderContactForm() {
    let div = document.createElement('div');
    div.className = 'row no-gutters justify-content-center'
    let html = /*html*/ `
    <div class="col-12 col-md-9 col-lg-6 pt-5 px-4">
    <h5 class="text-secondary font-weight-light mb-3">We want to help you.</h5>
        <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" class="form-control" id="name" placeholder="Enter name">
        </div>
        <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" class="form-control" id="email" placeholder="Enter email">
        </div>
        <div class="form-group">
            <label for="text">Message</label>
            <textarea  rows="5" class="form-control" id="text" placeholder="Enter message"></textarea>
        </div>    
        <div class="text-center d-flex">
            <button class="btn btn-success flex-grow-1">Send message</button>
        </div>
    </div>
    `;
    div.innerHTML = html;
    document.body.appendChild(div);
}
function renderFooter() {
    let div = document.createElement('div');
    div.className = 'px-4';
    let html = /*html*/ `
        <hr>
        <div id="footer" class="d-flex flex-column flex-md-row pb-5">
        <div class="d-flex flex-column flex-grow-1 align-items-md-start align-items-center justify-content-center text-secondary pb-2 pb-md-3">
            <span class="mb-2"><b>CUSTOMER SERVICE</b></span>
            <span class="mb-2"><i class="fas fa-phone-alt" aria-hidden="true"></i> <b>0754 700 700</b></span>
            <span>Monday-Friday: 10:00 - 17:00</span>
        </div>
        <div class="d-flex flex-column flex-grow-1 align-items-center align-items-md-end text-secondary pb-5 pb-md-3">
            <div>
                <a class="mr-3" href="#1">Find a store</a>
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

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'd-flex flex-column overflow-hidden';
    let html = /*html*/ `
        <div class="row no-gutters py-3 px-4 px-xl-5 py-xl-4 bg-white border-bottom">
            <div class="col-12 col-sm col-xl-auto order-xl-1 pb-2 pb-sm-0 d-flex align-items-center justify-content-center justify-content-sm-start">
                <h1 id="logo" class="text-dark text-center font-weight-light"><i class="fas fa-tshirt"></i> The<b>Fashion</b>Store</span></h1>
            </div>
            <div class="col-12 col-sm-auto col-xl-auto order-xl-3 d-flex align-items-center justify-content-center justify-content-sm-end">
                <button id="adminBtn" class="btn btn-outline-dark flex-grow-1 flex-sm-grow-0"><i class="fas fa-lock"></i> <span class="d-sm-none d-md-inline">Admin</span></button>
                <button id="cartBtn" class="btn btn-outline-dark flex-grow-1 flex-sm-grow-0 position-relative ml-2">
                <i class="fas fa-shopping-cart"></i> <span class="d-sm-none d-md-inline">Shopping cart</span> <span id="cartItems" class="rounded-pill border border-dark badge-danger font-weight-bold my-badge"></span>
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

function initCart() {
    cart = localStorage.getItem('cart');
    if (cart)
        cart = JSON.parse(cart);
    else
        cart = {};
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