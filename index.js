let initialProducts;
let products;
let cart;
let intervalStarted;
let timeout;
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
        initialProducts = Object.entries(data);
        products = [...initialProducts];
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
        let index = this.dataset.index;
        this.src = `./assets/pics/${key}/${products[index][1].pics.split(/\s+/)[1]}`
    }
    if (event.type === 'mouseout') {
        let key = this.dataset.key;
        let index = this.dataset.index;
        this.src = `./assets/pics/${key}/${products[index][1].pics.split(/\s+/)[0]}`
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
            location.assign('./pages/cart.html');
        }
        if (this.id === 'upBtn') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        if (this.id === 'adminBtn') {
            location.assign('./pages/admin.html');
        }
        //search
        if (this.id === 'searchBtn') {
            let searchString = document.querySelector('#searchInput').value.toLowerCase().trim();
            if (searchString) {
                let foundProducts = findProducts(searchString);
                if (foundProducts.length > 0) {
                    document.querySelector('#searchInput').setAttribute('placeholder', '');
                    products = foundProducts;
                    deselectNavBtns();
                    deselectSortBtns();
                    renderProducts();
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
        if (this.id === 'sortNameBtn') {
            let sortPriceBtn = document.querySelector('#sortPriceBtn');
            sortPriceBtn.classList.remove('text-dark', 'font-weight-bold');
            sortPriceBtn.classList.add('text-secondary');

            this.classList.add('text-dark', 'font-weight-bold');
            this.classList.remove('text-secondary');
            if (selectedBtn === 'sortNameBtn') {
                this.querySelector('i').classList.toggle('rotated');
            }
            if (this.querySelector('i').classList.contains('rotated')) {
                direction = -1;
            } else {
                direction = 1;
            }
            sortProducts('name', direction)
            renderProducts();
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
            if (this.querySelector('i').classList.contains('rotated')) {
                direction = -1;
            } else {
                direction = 1;
            }
            sortProducts('price', direction)
            renderProducts();
            selectedBtn = 'sortPriceBtn';

        }
        //categories
        if (this.id === 'allBtn') {
            deselectNavBtns();
            deselectSortBtns();
            selectBtn(this);
            scroll();
            products = [...initialProducts];
            renderProducts();
        }
        if (this.id === 'clothingBtn' || this.id === 'discounts-3') {
            deselectNavBtns();
            deselectSortBtns()
            if (this.id === 'clothingBtn') {
                selectBtn(this);
            }
            scroll();
            products = findProducts('clothing');
            renderProducts();
        }
        if (this.id === 'footwearBtn') {
            deselectNavBtns();
            deselectSortBtns();
            selectBtn(this);
            scroll();
            products = findProducts('footwear');
            renderProducts();
        }
        if (this.id === 'discounts-4' || this.id === 'discounts-2') {
            deselectNavBtns();
            deselectSortBtns();
            scroll();
            products = findProducts('footwear');
            renderProducts();
        }
        if (this.id === 'accessoriesBtn' || this.id === 'discounts-1') {
            deselectNavBtns();
            deselectSortBtns();
            if (this.id === 'accessoriesBtn') {
                selectBtn(this);
            }
            scroll();
            products = findProducts('accessories');
            renderProducts();
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

function deselectSortBtns() {
    let sortPriceBtn = document.querySelector('#sortPriceBtn');
    sortPriceBtn.classList.remove('text-dark', 'font-weight-bold');
    sortPriceBtn.classList.add('text-secondary');
    sortPriceBtn.querySelector('i').classList.remove('rotated');
    let sortNameBtn = document.querySelector('#sortNameBtn');
    sortNameBtn.classList.remove('text-dark', 'font-weight-bold');
    sortNameBtn.classList.add('text-secondary');
    sortNameBtn.querySelector('i').classList.remove('rotated');
    selectedBtn = '';
}

function checkSearchParams() {
    let url = new URL(document.URL);
    let searchString = url.searchParams.get('search');
    if (searchString) {
        let foundProducts = findProducts(searchString);
        if (foundProducts.length > 0) {
            products = foundProducts;
            deselectNavBtns();
            renderProducts();
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
    let index = event.currentTarget.dataset.index;
    if (!cart[key] && products[index][1].stock > 0) {
        cart[key] = products[index][1];
        cart[key].qty = 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
}

function confirm(event) {
    let confirm = document.querySelector('#confirm');
    if (confirm) {
        clearTimeout(timeout);
        confirm.parentElement.removeChild(confirm);
    }
    let key = event.currentTarget.dataset.key;
    let index = event.currentTarget.dataset.index;
    let div = document.createElement('div');
    div.id = 'confirm';
    div.className = 'my-fixed-centered bg-white text-success border shadow rounded d-flex align-items-center text-center p-4';
    let html = '';
    if (cart[key]) {
        html = `<span>Product <b>${products[index][1].name}</b> already in cart. Go to cart to add more.</span>`;
    } else if (!cart[key] && products[index][1].stock > 0) {
        html = `<i class="far fa-check-circle fa-2x"></i> <span class="ml-3">Product <b>${products[index][1].name}</b> added to your cart!</span>`;
    } else {
        html = `<i class="fas fa-ban fa-2x text-danger"></i> <span class="text-danger ml-3">Product <b>${products[index][1].name}</b> out of stock!</span>`;
    }
    div.innerHTML = html;
    document.body.appendChild(div);
    timeout = setTimeout(function () {
        div.parentElement.removeChild(div);
    }, 3000);
}

function renderHeader() {
    let div = document.createElement('div');
    div.id = 'header';
    div.className = 'vh-100 d-flex flex-column overflow-hidden';
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
        <div id="upBtn" class="d-none bg-white rounded shadow">
            <button class="btn btn-outline-dark border-0"><i class="fas fa-chevron-up fa-3x"></i></button>
        </div>    
        <div id="showProductsBtn" class="pointer text-dark d-flex align-items-center justify-content-center"><i class="fas fa-grip-lines"></i></div>
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
    <div class="sticky-top bg-white shadow-sm">
        <ul class="nav py-3">
            <li class="nav-item col-12 col-md-3 text-center">
                <button id="allBtn" class="btn btn-dark nav-btn border-0 text-nowrap">All products</button>
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
        <div id="sortBar" class="border-top border-bottom py-2 d-flex justify-content-center align-items-center justify-content-lg-end pr-lg-4">
            <div id="sortNameBtn" class="pointer text-secondary">Sort by name <i class="fas fa-arrow-up"></i></div>
            <div id="sortPriceBtn" class="ml-3 pointer text-secondary">Sort by price <i class="fas fa-arrow-up"></i></div>
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

function renderProducts() {
    let productsHtml = document.querySelector('#products');
    if (productsHtml) {
        productsHtml.parentElement.removeChild(productsHtml);
    }
    let div = document.createElement('div')
    div.id = 'products';
    div.className = 'container-fluid px-4';
    let html = '<div class="row">';
    for (let product of products) {
        let key = product[0];
        html += `
        <div class="col-sm-12 col-md-6 col-lg-3 col-xl-2 mt-4">
            <div class="card text-center h-100">
                <img class="card-img-top pointer" data-key="${key}" data-index="${products.indexOf(product)}" src="./assets/pics/${key}/${product[1].pics.split(/\s+/)[0]}">
                <div class="card-body d-flex flex-column">
                <h4 class="card-title">${product[1].name}</h4>
                <p class="mt-auto mb-0">Price: ${product[1].price} euro</p>
                </div>
                <div class="card-footer d-flex">
                    <button class="detailsBtn btn btn-dark flex-grow-1" data-key="${key}">Details</button>
                    <button class="addBtn btn btn-success ml-2" data-key="${key}" data-index="${products.indexOf(product)}"><i class="fas fa-shopping-cart"></i></button>
                </div>
            </div>
        </div>    
        `;
    }
    html += `
        </div>
        <hr>
        <div id="footer"></div>
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
    let foundProducts = [];
    string.split(/\s+/).forEach(function (substring) {
        for (let product of initialProducts) {
            if (product[1].cat === substring) {
                foundProducts.push(product);
            } else if (product[1].tags.split(/\s+/).includes(substring)) {
                foundProducts.push(product);
            } else if (product[1].name.toLowerCase().split(/\s+/).includes(substring)) {
                foundProducts.push(product);
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
    div.className = 'flex-grow-1';
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
                        <div class="bg-white-50 p-3 p-md-5 text-center">
                            <h1 class="display-4">30% discount!</h1>
                            <h1 class="font-weight-light">for all accessories</h1>
                            <button id="discounts-1" class="btn btn-outline-dark mt-4">Click to shop</button>
                        </div>
                    </div>
                </div>
                <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img2.jpg'); background-size: cover; background-position: center;">
                    <div class="h-100 d-flex align-items-center justify-content-center">
                        <div class="bg-white-50 p-3 p-md-5 text-center">
                            <h1 class="display-4">25% discount!</h1>
                            <h1 class="font-weight-light">for all office shoes</h1>
                            <button id="discounts-2" class="btn btn-outline-dark mt-4">Click to shop</button>
                        </div>
                    </div>
                </div>
                <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img3.jpg'); background-size: cover; background-position: center;">
                    <div class="h-100 d-flex align-items-center justify-content-center">
                        <div class="bg-white-50 p-3 p-md-5 text-center">
                            <h1 class="display-4">30% discount!</h1>
                            <h1 class="font-weight-light">for last year collection</h1>
                            <button id="discounts-3" class="btn btn-outline-dark mt-4">Click to shop</button>
                        </div>
                    </div>
                </div>
                <div class="carousel-item h-100" style="background-image:url('./assets/pics/discounts/img4.jpg'); background-size: cover; background-position: center;">
                    <div class="h-100 d-flex align-items-center justify-content-center">
                        <div class="bg-white-50 p-3 p-md-5 text-center">
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

function sortProducts(sortParameter, sortDirection) {
    products.sort(function (first, second) {
        if (first[1][sortParameter] > second[1][sortParameter]) return sortDirection;
        else if (first[1][sortParameter] < second[1][sortParameter]) return -sortDirection;
        else return 0;
    });
}
