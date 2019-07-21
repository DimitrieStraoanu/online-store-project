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
            renderImgCarousel();
            renderThumbnails();
            showCartInfo();
        } else {
            alert();
        }
    })
    .catch(function (err) {
        console.log(err)
    });

function userInteraction(event) {
    if (this.classList.contains('thumbnail')) {
        let div = document.createElement('div');
        let pic = this.dataset.pic;
        let pics = product.pics.split(/\s/);
        let picIndex = pics.indexOf(pic)+1;
        div.className = 'my-fullscreen d-flex align-items-center justify-content-center';
        let html = `
        <div class="my-h-95 border rounded position-relative">
        <div id="xBtn" class="my-absolute-top-right pointer px-2">
            <i class="fas fa-times"></i>
        </div>
        <img class="pointer d-block h-100" src="${this.src}">
        </div>
        `;
        div.innerHTML = html;
        div.querySelector('#xBtn').addEventListener('click', function(){
            div.parentElement.removeChild(div);
        });
        div.querySelector('div').addEventListener('click', function () {
            let img = this.querySelector('img');
            if (picIndex === pics.length) {
                picIndex = 0;
            }
            img.src = `../assets/pics/${key}/${pics[picIndex]}`;
            picIndex++;
        });
        document.body.appendChild(div);
    }
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
        renderImgCarousel();
        renderThumbnails();
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
    div.className = 'my-fullscreen';
    div.innerHTML = `
    <div class="my-fixed-centered border shadow p-5 text-center rounded">
    <p>Product not available!</p>
    <button id="storeBtn" class="btn btn-success mx-3">Continue shopping</button>
    </div>
    `;
    div.querySelector('#storeBtn').addEventListener('click', userInteraction);
    document.body.appendChild(div);
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
    let confirm = document.querySelector('#confirm');
    if (confirm) {
        confirm.parentElement.removeChild(confirm);
    }
    let div = document.createElement('div');
    div.id = 'confirm';
    div.className = 'my-fixed-centered bg-white text-success border shadow rounded d-flex flex-column justify-content-center align-items-center text-center p-4';
    div.innerHTML = `<i class="far fa-check-circle fa-2x mb-2 text-success"></i><span class="text-success">Product <b class="text-nowrap">${product.name}</b> added to your cart!</span>`;
    document.body.appendChild(div);
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
        cart[key] = product;
        cart[key].qty = qty;
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
    div.className = 'container p-0 pt-4 pt-lg-5 position-relative';
    let html = /*html*/`
    <div class="row no-gutters justify-content-center align-items-stretch">
        <div class="col-12 col-md-6 col-xl-5 d-flex">
            <div id="thumbnails" class="d-none d-lg-block"></div>    
            <div id="imgCarousel" class="height-fixed flex-grow-1 d-flex justify-content-center align-items-center mx-4 overflow-hidden border rounded">
            </div>
        </div>
        <div class="col-12 col-md-6 col-xl-5 d-flex justify-content-center align-items-center">
            <div class="d-flex flex-column m-4 text-center flex-grow-1">
                <h3 class="mb-5">${product.name}</h3>
                <p>${product.desc}</p>
                <p><b>Price: ${product.price} euro</b></p>
                <p>Stock: ${product.stock} pcs | Cart:  ${(cart[key])?cart[key].qty:0} pcs</p>
        `;
    if ((cart[key] && product.stock === cart[key].qty) || product.stock <= 0)
        html += `
                <div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <button id="decreaseBtn" class="btn btn-dark font-weight-bold" disabled>-</button>
                        </div>
                        <input id="qtyInput" class="form-control text-center font-weight-bold ${(product.stock <= 0)?'text-danger':''}" type="text" value="${(product.stock <= 0)?'Out of stock':'All stock in cart'}" disabled>
                        <div class="input-group-append">
                            <button id="increaseBtn" class="btn btn-dark font-weight-bold" disabled>+</button>
                        </div>
                    </div>
                </div>
                <button id="addBtn" class="btn btn-dark mb-1" disabled>Add to cart <i class="fas fa-shopping-cart"></i></button>
                <button id="storeBtn" class="btn btn-success">Continue shopping</button>
            </div>
        </div>
    </div>
        `;
    else if (product.stock > 0)
        html += `
                <div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <button id="decreaseBtn" class="btn btn-dark font-weight-bold">-</button>
                        </div>
                        <input id="qtyInput" class="form-control text-center" type="text" value="1" disabled>
                        <div class="input-group-append">
                            <button id="increaseBtn" class="btn btn-dark font-weight-bold">+</button>
                        </div>
                    </div>
                </div>  
                <button id="addBtn" class="btn btn-success mb-1">Add to cart <i class="fas fa-shopping-cart"></i></button>
                <button id="storeBtn" class="btn btn-dark">Continue shopping</button>
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

function renderImgCarousel() {
    let counter = 0;
    let firstTime = true;
    let html = `
    <div id="carousel" class="carousel slide h-100 w-100" data-ride="carousel" data-interval="2000">
    <ol class="carousel-indicators">
        ${product.pics.split(/\s+/).map(() => {
            let html = `
            <li data-target="#carousel" data-slide-to="${counter}" class="${(counter===0)?'active':''}"></li>
            `;
            counter++;
            return html;
        }).join('')}
    </ol>
        <div class="carousel-inner h-100">
        ${product.pics.split(/\s+/).map(pic => {
            let html = `
            <div class="carousel-item ${(firstTime)?'active':''} h-100" style="background: url('../assets/pics/${key}/${pic}') center no-repeat; background-size: cover;">
            </div>`;
            firstTime = false;
            return html;
        }).join('')}
        </div>
        <a class="carousel-control-prev" href="#carousel" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only bg-danger">Previous</span>
        </a>
        <a class="carousel-control-next" href="#carousel" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>
    `;
    document.querySelector('#imgCarousel').innerHTML = html;
    $('.carousel').carousel();
}

function renderThumbnails() {
    let div = document.createElement('div');
    div.className = 'd-flex flex-column';
    let html = `
    ${product.pics.split(/\s+/).map(function(pic){
        return `<div class="border rounded mb-4"><img data-pic="${pic}" class="thumbnail d-block pointer" src="../assets/pics/${key}/${pic}"></div>`;
    }).join('')}
    `;
    div.innerHTML = html;
    div.querySelectorAll('.thumbnail').forEach(function (element) {
        element.addEventListener('click', userInteraction);
    });
    document.querySelector('#thumbnails').appendChild(div);
}