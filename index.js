let products;
let cart;
let intervalStarted;
let initialHeight;
let selectedBtn;
initCart();
renderHeader();
initialHeight = document.querySelector('#showProductsBtn').getBoundingClientRect().height;
showCartInfo();
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
        syncCart();
        clearLoading();
        renderCarousel();
        renderNav();
        renderProducts(products);
        window.addEventListener('scroll', userInteraction);
        checkSearchParams();
    })
    .catch(function (err) {
        console.log(err);
    });

function userInteraction() {
    if (event.type === 'mouseover') {
        let key = this.dataset.key;
        this.src = `./assets/pics/${key}/${products[key].pics.split(/\s+/)[1]}`
    }
    if (event.type === 'mouseout') {
        let key = this.dataset.key;
        this.src = `./assets/pics/${key}/${products[key].pics.split(/\s+/)[0]}`
    }
    if (event.type === 'scroll') {
        let distFromTop = document.querySelector('#nav').getBoundingClientRect().top;
        if (distFromTop <= 0) {
            document.querySelector('#upBtn').classList.remove('d-none');
        } else {
            document.querySelector('#upBtn').classList.add('d-none');
        }
        if (window.pageYOffset > 0) {
            if (!intervalStarted) {
                let interval = setInterval(function () {
                    let height = document.querySelector('#showProductsBtn').getBoundingClientRect().height;
                    if (height > 0) {
                        document.querySelector('#showProductsBtn').style.height = `${height-2}px`;
                    } else if (height === 0) {
                        clearInterval(interval);
                        intervalStarted = false;
                    }
                }, 5);
                intervalStarted = true;
            }
        }
        if (window.pageYOffset === 0) {
            if (!intervalStarted) {
                let interval = setInterval(function () {
                    let height = document.querySelector('#showProductsBtn').getBoundingClientRect().height;
                    if (height < initialHeight) {
                        document.querySelector('#showProductsBtn').style.height = `${height+2}px`;
                    } else if (height === initialHeight) {
                        clearInterval(interval);
                        intervalStarted = false;
                    }
                }, 5);
                intervalStarted = true;
            }
        }
    }
    if (event.type === 'click') {
        if (this.classList.contains('addBtn')) {
            confirm(event);
            quickAddToCart(event);
            showCartInfo();
        }
        if (this.id === 'storeBtn' || this.id === 'logo') {
            location.assign('./index.html');
        }
        if (this.id === 'cartBtn') {
            location.assign('../pages/cart.html');
        }
        if (this.id === 'upBtn') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        if (this.id === 'adminBtn') {
            location.assign('../pages/admin.html');
        }
        if (this.id === 'searchBtn') {
            let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
            if (searchString) {
                let foundProducts = findProducts(searchString);
                if (Object.keys(foundProducts).length > 0) {
                    document.querySelector('#searchInput').setAttribute('placeholder', '');
                    renderProducts(foundProducts);
                    document.querySelector('#searchInput').value = '';
                    scroll();
                } else {
                    document.querySelector('#searchInput').value = '';
                    document.querySelector('#searchInput').setAttribute('placeholder', 'Product not found!');
                }
            }
        }
        if (this.id === 'showProductsBtn') {
            scroll();
        }
        //sorting
        if (this.id === 'arrowBtn') {}
        if (this.id === 'sortNameBtn') {
            let sortPriceBtn = document.querySelector('#sortPriceBtn');
            sortPriceBtn.classList.remove('text-dark', 'font-weight-bold');
            sortPriceBtn.classList.add('text-secondary');

            this.classList.add('text-dark', 'font-weight-bold');
            this.classList.remove('text-secondary');
            if (selectedBtn === 'sortNameBtn') {
                this.querySelector('i').classList.toggle('rotated');
            }
            selectedBtn = 'sortNameBtn';
        }
        if (this.id === 'sortPriceBtn') {
            let sortNameBtn = document.querySelector('#sortNameBtn');
            sortNameBtn.classList.remove('text-dark', 'font-weight-bold');
            sortNameBtn.classList.add('text-secondary');

            this.classList.add('text-dark', 'font-weight-bold');
            this.classList.remove('text-secondary');
            if (selectedBtn === 'sortPriceBtn') {
                this.querySelector('i').classList.toggle('rotated');
            }
            selectedBtn = 'sortPriceBtn';

        }
        //categories
        if (this.id === 'allBtn') {
            deselectNavBtns();
            selectBtn(this);
            scroll();
            renderProducts(products);
        }
        if (this.id === 'clothingBtn' || this.id === 'discounts-3') {
            deselectNavBtns();
            if (this.id === 'clothingBtn') {
                selectBtn(this);
            }
            scroll();
            renderProducts(findProducts('clothing'));
        }
        if (this.id === 'footwearBtn') {
            deselectNavBtns();
            selectBtn(this);
            scroll();
            renderProducts(findProducts('footwear'));
        }
        if (this.id === 'discounts-4' || this.id === 'discounts-2') {
            deselectNavBtns();
            scroll();
            renderProducts(findProducts('footwear'));
        }
        if (this.id === 'accessoriesBtn' || this.id === 'discounts-1') {
            deselectNavBtns();
            if (this.id === 'accessoriesBtn') {
                selectBtn(this);
            }
            scroll();
            renderProducts(findProducts('accessories'));
        }
        if (this.classList.contains('detailsBtn') || this.classList.contains('card-img-top')) {
            location.assign(`./pages/details.html?key=${this.dataset.key}`);
        }
    }
}

function selectBtn(that) {
    that.classList.add('btn-dark');
    that.classList.remove('btn-outline-dark');
}

function deselectNavBtns() {
    document.querySelectorAll('.nav-btn').forEach(element => {
        element.classList.remove('btn-dark');
        element.classList.add('btn-outline-dark');
    });
}

function checkSearchParams() {
    let url = new URL(document.URL);
    let searchString = url.searchParams.get('search');
    if (searchString) {
        let foundProducts = findProducts(searchString);
        if (Object.keys(foundProducts).length > 0) {
            renderProducts(foundProducts);
            document.querySelector('#searchInput').value = '';
            scroll();
        } else {
            document.querySelector('#searchInput').value = '';
            document.querySelector('#searchInput').setAttribute('placeholder', 'Product not found!');
        }
        window.history.pushState(null, null, 'index.html');
    }
}

function getProducts() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
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

function quickAddToCart(event) {
    let key = event.currentTarget.dataset.key;
    if (!cart[key] && products[key].stock > 0) {
        cart[key] = products[key];
        cart[key].qty = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

function confirm(event) {
    let confirm = document.querySelector('#confirm');
    if (confirm) {
        confirm.parentElement.removeChild(confirm);
    }
    let key = event.currentTarget.dataset.key;
    let div = document.createElement('div');
    div.id = 'confirm';
    div.className = 'my-fixed-centered bg-white text-success border shadow rounded d-flex align-items-center text-center p-4';
    let html = '';
    if (cart[key]) {
        html = `<span>Product <b>${products[key].name}</b> already in cart. Go to cart to add more.</span>`;
    } else if (!cart[key] && products[key].stock > 0) {
        html = `<i class="far fa-check-circle fa-2x"></i> <span class="ml-3">Product <b>${products[key].name}</b> added to your cart!</span>`;
    } else {
        html = `<i class="fas fa-ban fa-2x text-danger"></i> <span class="text-danger ml-3">Product <b>${products[key].name}</b> out of stock!</span>`;
    }
    div.innerHTML = html;
    document.body.appendChild(div);
    setTimeout(function () {
        div.parentElement.removeChild(div);
    }, 3000);
}

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'vh-100 d-flex flex-column overflow-hidden';
    let html = `
        <div class="container-fluid p-0">
        	<div class="row no-gutters py-3 px-4 px-lg-5 bg-white border-bottom">
        	    <div class="col-12 col-lg-auto col-xl-auto pr-lg-5 d-flex align-items-center justify-content-center justify-content-lg-start">
        	        <h1 id="logo" class="text-dark text-center font-weight-light"><i class="fas fa-tshirt"></i> The<b>Fashion</b>Store</span></h1>
        	    </div>
        	    <div class="col-12 col-md col-xl px-xl-5 py-3 d-flex align-items-center justify-content-center">
                    <div class="input-group">
                        <input type="text" id="searchInput" class="form-control border-secondary" aria-label="Recipient's username" aria-describedby="button-addon2">
                        <div class="input-group-append">
                        <button class="btn btn-outline-dark" type="button" id="searchBtn"><i class="fas fa-search"></i> <span>Search</span></button>
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
            <div id="upBtn" class="d-none bg-white rounded shadow">
                <button class="btn btn-outline-dark border-0"><i class="fas fa-chevron-up fa-3x"></i></button>
            </div>    
        </div>
        <div id="showProductsBtn" class="pointer text-secondary d-flex align-items-center justify-content-center"><i class="fas fa-ellipsis-h"></i></div>
        `;
    div.innerHTML = html;

    div.querySelector('#logo').addEventListener('click', userInteraction);
    div.querySelector('#searchBtn').addEventListener('click', userInteraction);
    div.querySelector('#cartBtn').addEventListener('click', userInteraction);
    div.querySelector('#adminBtn').addEventListener('click', userInteraction);
    div.querySelector('#upBtn').addEventListener('click', userInteraction);
    div.querySelector('#showProductsBtn').addEventListener('click', userInteraction);

    document.body.appendChild(div);
}

function renderNav() {
    let div = document.createElement('div');
    div.id = 'nav';
    div.className = 'bg-white';
    let html = `
    <div class="sticky-top bg-white border-bottom pt-3">
        <ul class="nav">
            <li class="nav-item col-12 col-md-3 text-center">
                <button id="allBtn" class="btn btn-dark nav-btn border-0 text-nowrap">All products</button>
                <hr class="d-md-none">
            </li>    
            <li class="nav-item col-4 col-md-3 text-center">
                <button id="clothingBtn" class="btn btn-outline-dark nav-btn border-0">Clothing</button>
            </li>
            <li class="nav-item col-4 col-md-3 text-center">
                <button id="footwearBtn" class="btn btn-outline-dark nav-btn border-0">Footwear</button>
            </li>
            <li class="nav-item col-4 col-md-3 text-center">
                <button id="accessoriesBtn" class="btn btn-outline-dark nav-btn border-0">Accessories</button>
            </li>
        </ul>
        <div id="sortBar">
            <hr class="mb-0">    
            <div class="px-3">
                <div class="d-flex justify-content-end align-items-center">
                <div id="sortNameBtn" class="pointer text-secondary">Sort by name <i class="fas fa-chevron-circle-up"></i></div>
                <div id="sortPriceBtn" class="ml-3 pointer text-secondary">Sort by price <i class="fas fa-chevron-circle-up"></i></div>
                </div> 
            </div>   
        </div>
    </div>
    `;
    div.innerHTML = html;

    div.querySelector('#allBtn').addEventListener('click', userInteraction);
    div.querySelector('#clothingBtn').addEventListener('click', userInteraction);
    div.querySelector('#footwearBtn').addEventListener('click', userInteraction);
    div.querySelector('#accessoriesBtn').addEventListener('click', userInteraction);
    div.querySelector('#sortNameBtn').addEventListener('click', userInteraction);
    div.querySelector('#sortPriceBtn').addEventListener('click', userInteraction);


    document.body.appendChild(div);
}

function renderProducts(productsObj) {
    let products = document.querySelector('#products');
    if (products) {
        products.parentElement.removeChild(products);
    }
    let div = document.createElement('div')
    div.id = 'products';
    div.className = 'container-fluid px-4';
    let html = '<div class="row">';
    for (let key in productsObj) {
        html += `
            <div class="col-sm-12 col-md-6 col-lg-3 col-xl-2 mt-5">
            <div class="card text-center h-100">
                <img class="card-img-top pointer" data-key="${key}" src="./assets/pics/${key}/${productsObj[key].pics.split(/\s+/)[0]}">
                <div class="card-body d-flex flex-column">
                <h4 class="card-title">${productsObj[key].name}</h4>
                <p class="mt-auto mb-0">Price: ${productsObj[key].price} euro</p>
                </div>
                <div class="card-footer d-flex">
                    <button class="detailsBtn btn btn-dark flex-grow-1" data-key="${key}">Details</button>
                    <button class="addBtn btn btn-success ml-2" data-key="${key}"><i class="fas fa-shopping-cart"></i></button>
                </div>
                </div>
            </div>    
        `;
    }
    html += `
        </div>
        <div id="footer" class="p-5"></div>
        `;
    div.innerHTML = html

    let buttons = div.querySelectorAll('.detailsBtn');
    for (let element of buttons) {
        element.addEventListener('click', userInteraction);
    }
    buttons = div.querySelectorAll('.addBtn');
    for (let element of buttons) {
        element.addEventListener('click', userInteraction);
    }
    let previews = div.querySelectorAll('.card-img-top');
    for (let element of previews) {
        element.addEventListener('mouseover', userInteraction);
        element.addEventListener('mouseout', userInteraction);
        element.addEventListener('click', userInteraction);
    }

    document.querySelector('#nav').appendChild(div);
}

function findProducts(string) {
    let foundProducts = {};
    string.split(/\s+/).forEach(function (item) {
        for (let key in products) {
            if (products[key].cat === item) {
                foundProducts[key] = products[key]
            }
            if (products[key].tags.split(/\s+/).includes(item)) {
                foundProducts[key] = products[key]
            }
            if (products[key].name.toLowerCase().split(/\s+/).includes(item)) {
                foundProducts[key] = products[key]
            }
        }
    });
    return foundProducts;
}

function scroll() {
    let height = document.querySelector('#header').getBoundingClientRect().height;
    window.scrollTo({
        top: height,
        behavior: 'smooth'
    });
}

function showLoading() {
    let div = document.createElement('div');
    div.id = 'loading'
    div.className = 'my-fullscreen d-flex justify-content-center align-items-center';
    div.innerHTML = `
    <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
    </div>`;
    document.body.appendChild(div);
}

function clearLoading() {
    let div = document.querySelector('#loading')
    div.parentElement.removeChild(div);
}

function renderCarousel() {
    let div = document.createElement('div');
    div.className = 'flex-fill';
    let html = `
    <div id="discounts" class="carousel slide h-100" data-ride="carousel" data-interval="3000">
    <ol class="carousel-indicators">
        <li data-target="#discounts" data-slide-to="0" class="active"></li>
        <li data-target="#discounts" data-slide-to="1"></li>
        <li data-target="#discounts" data-slide-to="2"></li>
        <li data-target="#discounts" data-slide-to="3"></li>
    </ol>
    <div class="carousel-inner h-100">
        <div class="carousel-item h-100 active" style="background-image:url('./assets/pics/discounts/img1.jpg'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">30% discount!</h1>
                    <h1 class="font-weight-light">for all accessories</h1>
                    <button id="discounts-1" class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img2.jpg'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">25% discount!</h1>
                    <h1 class="font-weight-light">for all office shoes</h1>
                    <button id="discounts-2" class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img3.jpg'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">30% discount!</h1>
                    <h1 class="font-weight-light">for last year collection</h1>
                    <button id="discounts-3" class="btn btn-outline-dark mt-4">Click to shop</button>
                </div>
            </div>
        </div>
        <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img4.jpg'); background-size: cover; background-position: center;">
            <div class="h-100 d-flex align-items-center justify-content-center">
                <div class="bg-white-50 p-3 p-lg-5 text-center">
                    <h1 class="display-4">50% discount!</h1>
                    <h1 class="font-weight-light">for all sport shoes</h1>
                    <button id="discounts-4" class="btn btn-outline-dark mt-4">Click to shop</button>
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
    div.innerHTML = html;
    div.querySelector('#discounts-1').addEventListener('click', userInteraction);
    div.querySelector('#discounts-2').addEventListener('click', userInteraction);
    div.querySelector('#discounts-3').addEventListener('click', userInteraction);
    div.querySelector('#discounts-4').addEventListener('click', userInteraction);

    document.querySelector('#header').insertBefore(div, document.querySelector('#showProductsBtn'));
    $('.carousel').carousel();
}

function sortProducts(arr, sortParameter, sortDirection) {
    return arr.sort(function (first, second) {
        if (first[1][sortParameter] > second[1][sortParameter]) return sortDirection;
        else if (first[1][sortParameter] < second[1][sortParameter]) return -sortDirection;
        else return 0;
    });
}