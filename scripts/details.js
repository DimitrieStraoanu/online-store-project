let url = new URL(document.URL);
let key = url.searchParams.get('key');
let sufficientStock;
let product;
let cart;
initCart();
showLoading();
getProductData()
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        product = data;
        if (product) {
            if (cart[key]) {
                cart[key] = {
                    ...cart[key],
                    ...product
                };
            }
            draw();
            addListeners();
        } else {
            document.querySelector('#mainContainer').innerHTML = 'Product not available!';
        }
    })
    .catch(function (err) {
        console.log(err)
    });

document.querySelector('#cartBtn').addEventListener('click', function () {
    location.assign('./cart.html');
});

document.querySelector('#backBtn').addEventListener('click', function () {
    location.assign('../index.html');
});

function showLoading() {
    document.querySelector('#mainContainer').innerHTML = '<img src="../assets/loading.gif">';
}

function addListeners() {
    document.querySelector('#addBtn').addEventListener('click', function () {
        addToCart();
        popup();
        document.querySelector('.qtyInput').value = 1;
        draw();
        addListeners();
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

}

function popup() {
    let popup = document.createElement('div');
    popup.classList.add('popup');

    if (sufficientStock)
        popup.innerHTML = `<p>Product <b>${product.name}</b> added to your cart!</p>`;
    else
        popup.innerHTML = '<p>Max quantity available already in cart!</p>';

    document.querySelector('body').appendChild(popup);
    setTimeout(function () {
        document.body.removeChild(popup);
    }, 2000);
}

function getProductData() {
    return fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}.json`, {
        method: 'GET'
    });
}

function initCart() {
    if (localStorage.getItem('cart'))
        cart = JSON.parse(localStorage.getItem('cart'));
    else
        cart = {};
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

function draw() {
    let html = `
            <div class="picDetails">
                <img src="${product.pic}">
            </div>
            <div class="content">
                <p><b>${product.name}</b></p>
                <p>${product.desc}</p>
                <p>Price: ${product.price} euro</p>
                <p>Stock: ${product.stock} pcs</p>
        `;
    if (cart[key] && product.stock === cart[key].qty)
        html += `
            <button class ="decreaseBtn" disabled>-</button>
            <input class ="qtyInput" type="text" disabled>
            <button class ="increaseBtn" disabled>+</button>
            <button id="addBtn" disabled>Add to cart</button>
            <h3>Max quantity available already in cart!</h3>
        </div>
        `;
    else if (cart[key] && product.stock > cart[key].qty)
        html += `
            <button class ="decreaseBtn">-</button>
            <input class ="qtyInput" type="text" value="1" disabled>
            <button class ="increaseBtn">+</button>
            <button id="addBtn">Add to cart</button>
            <h3>${cart[key].qty} pcs in cart!</h3>
        </div>
        `;
    else if (product.stock > 0) {
        html += `
            <button class ="decreaseBtn">-</button>
            <input class ="qtyInput" type="text" value="1" disabled>
            <button class ="increaseBtn">+</button>
            <button id="addBtn">Add to cart</button>
        </div>    
        `;
    } else if (product.stock <= 0)
        html += `
            <h3>Product out of stock!</h3>
            <button class ="decreaseBtn" disabled>-</button>
            <input class ="qtyInput" type="text" disabled>
            <button class ="increaseBtn" disabled>+</button>
            <button id="addBtn" disabled>Add to cart</button>
        </div>
        `;
    document.querySelector('#mainContainer').innerHTML = html;
}