let products = {};
renderHeader();
initCart();
showLoading();
getProducts()
    .then(function (response) {
        if (response.status === 200)
            return response.json();
        else
            console.log(response.statusText);
    })
    .then(function (data) {
        products = data;
        clearLoading();
        renderCarousel();
        renderProducts(products);
        renderNav();
        addListeners('header', 'nav', 'products', 'window');
        checkSearchParams();
    })
    .catch(function (err) {
        console.log(err);
    });

function getProducts() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
    });
}

function checkSearchParams() {
    let url = new URL(document.URL);
    let searchString = url.searchParams.get('search');
    if (searchString) {
        renderProducts(findProducts(searchString));
        addListeners('products');
        scroll();
        window.history.pushState(null, null, 'index.html');
    }
}

function initCart() {
    if (localStorage.getItem('cart'))
        cart = JSON.parse(localStorage.getItem('cart'));
    else
        cart = {};
    if (document.getElementById('cartItems')) {
        let items = 0;
        for (let key in cart) {
            items += cart[key].qty;
        }
        document.getElementById('cartItems').innerHTML = items;
    }
}

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'vh-100 d-flex flex-column';
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
            <div id="upBtn" class="d-none">
                <button class="btn btn-light text-dark border"><i class="fas fa-chevron-up fa-3x"></i></button>
            </div>    
        </div>
        `;
    document.body.appendChild(div);
}

function renderNav() {
    let div = document.createElement('div');
    div.id = 'nav';
    div.className = 'p-3 bg-white border-bottom';
    div.innerHTML = `
    <ul class="nav nav-justified">
    <li class="nav-item">
        <button id="allBtn" class="btn btn-outline-dark border-0 text-nowrap">All products</button>
    </li>
    <li class="nav-item">
        <button id="clothingBtn" class="btn btn-outline-dark border-0">Clothing</button>
    </li>
    <li class="nav-item">
        <button id="footwearBtn" class="btn btn-outline-dark border-0">Footwear</button>
    </li>
    <li class="nav-item">
        <button id="accessoriesBtn" class="btn btn-outline-dark border-0">Accessories</button>
    </li>
    </ul>
    `;
    document.querySelector('#header').appendChild(div);
}

function renderProducts(products) {
    if (document.querySelector('#products')) {
        document.body.removeChild(document.querySelector('#products'));
    }
    let div = document.createElement('div')
    div.id = 'products';
    div.className = 'container-fluid px-4';
    let html = '<div class="row">';
    for (let key in products) {
        html += `
            <div class="col-sm-12 col-md-6 col-lg-3 col-xl-2 mt-4">
            <div class="card text-center h-100">
                <div class="h-100 d-flex align-items-center justify-content-center p-2">
                    <img src="${products[key].pic}" class="img-fluid">
                </div>
                <div class="card-body">
                <h4 class="card-title">${products[key].name}</h4>
                <p>Price: ${products[key].price} euro</p>
                </div>
                <div class="card-footer">
                    <button class="detailsBtn btn btn-dark" data-key="${key}">Details</button>
                </div>
                </div>
            </div>    
        `;
    }
    html += `
    </div>
    <div class="p-5"></div>
    `;
    div.innerHTML = html
    document.body.appendChild(div);
}

function addListeners(...parameters) {
    if (parameters.includes('window')) {
        window.addEventListener('scroll', sticky);
    }

    if (parameters.includes('products')) {
        let buttons = document.querySelectorAll('.detailsBtn');
        for (let element of buttons) {
            element.addEventListener('click', function () {
                location.assign(`./pages/details.html?key=${element.dataset.key}`);
            });
        }
    }
    if (parameters.includes('header')) {

        document.querySelector('#logo').addEventListener('click', function () {
            location.assign('./index.html');
        });

        document.querySelector('#searchBtn').addEventListener('click', searchClicked);

        document.querySelector('#cartBtn').addEventListener('click', function () {
            location.assign('./pages/cart.html');
        });

        document.querySelector('#adminBtn').addEventListener('click', function () {
            location.assign('./pages/admin.html');
        });

        document.querySelector('#upBtn').addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

    }
    if (parameters.includes('nav')) {
        document.querySelector('#allBtn').addEventListener('click', function () {
            navClicked('all');
        });
        document.querySelector('#clothingBtn').addEventListener('click', function () {
            navClicked('clothing');
        });
        document.querySelector('#footwearBtn').addEventListener('click', function () {
            navClicked('footwear');
        });
        document.querySelector('#accessoriesBtn').addEventListener('click', function () {
            navClicked('accessories');
        });
    }
}

function findProducts(parameter) {
    let foundProducts = {};
    for (let key in products) {
        if (products[key].cat === parameter) {
            foundProducts[key] = products[key]
        }
        if (products[key].tags.split(',').includes(parameter)) {
            foundProducts[key] = products[key]
        }
        if (products[key].name.toLowerCase().split(' ').includes(parameter)) {
            foundProducts[key] = products[key]
        }
    }
    return foundProducts;
}

function navClicked(parameter) {
    if (parameter === 'all') {
        renderProducts(products);
    }
    if (parameter === 'clothing') {
        renderProducts(findProducts(parameter));
    }
    if (parameter === 'footwear') {
        renderProducts(findProducts(parameter));
    }
    if (parameter === 'accessories') {
        renderProducts(findProducts(parameter));
    }
    scroll();
    addListeners('products');
}

function scroll() {
    let height = document.querySelector('#header').getBoundingClientRect().height - document.querySelector('#nav').getBoundingClientRect().height;
    window.scrollTo({
        top: height,
        behavior: 'smooth'
    });
}

function sticky() {
    let distFromTop = document.querySelector('#products').getBoundingClientRect().top - document.querySelector('#nav').getBoundingClientRect().height;
    if (distFromTop < 0) {
        document.querySelector('#nav').classList.add('fixed-top');
        document.querySelector('#upBtn').classList.remove('d-none');
    } else if (distFromTop > 0) {
        document.querySelector('#nav').classList.remove('fixed-top');
        document.querySelector('#upBtn').classList.add('d-none');
    }
}

function searchClicked() {
    let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
    if (searchString) {
        renderProducts(findProducts(searchString));
        addListeners('products');
        document.querySelector('#searchInput').value = '';
        scroll();
    }
}

function showLoading() {
    let div = document.createElement('div');
    div.className = 'loading d-flex justify-content-center align-items-center flex-fill';
    div.innerHTML = `
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>`;
    document.querySelector('body #header').appendChild(div);
}

function clearLoading() {
    let el = document.querySelector('.loading')
    el.parentElement.removeChild(el);
}

function renderCarousel() {
    let div = document.createElement('div');
    div.className = 'flex-fill';
    div.innerHTML = `
    <div id="discounts" class="carousel slide h-100" data-ride="carousel" data-interval="5000">
    <ol class="carousel-indicators">
        <li data-target="#discounts" data-slide-to="0" class="active"></li>
        <li data-target="#discounts" data-slide-to="1"></li>
        <li data-target="#discounts" data-slide-to="2"></li>
        <li data-target="#discounts" data-slide-to="3"></li>
    </ol>
    <div class="carousel-inner h-100">
        <div class="carousel-item h-100 active" style="background-image:url('https://images.unsplash.com/photo-1506091618538-5c362f734eab?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1952&q=80'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">30% discount!</h1>
                    <h1 class="font-weight-light">for all accessories</h1>
                    <button class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('https://images.unsplash.com/photo-1491897554428-130a60dd4757?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">25% discount!</h1>
                    <h1 class="font-weight-light">for all office shoes</h1>
                    <button class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('https://images.unsplash.com/photo-1484327973588-c31f829103fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1952&q=80'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">30% discount!</h1>
                    <h1 class="font-weight-light">for last year collection</h1>
                    <button class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('https://images.unsplash.com/photo-1517466121016-3f7e7107c756?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">50% discount!</h1>
                    <h1 class="font-weight-light">for all sport shoes</h1>
                    <button class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
    </div>
    <a class="carousel-control-prev" href="#discounts" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#discounts" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
    </a>
    </div>
    `;
    document.querySelector('#header').appendChild(div);
    $('.carousel').carousel();
}