let database;
showLoading();
getDatabase()
    .then(function (response) {
        if (response.status === 200)
            return response.json();
        else
            console.log(response.statusText);
    })
    .then(function (data) {
        database = data;
        draw();
        addListeners();
    })
    .catch();

document.querySelector('#cartBtn').addEventListener('click', function () {
    location.assign('./pages/cart.html');
});

document.querySelector('#adminBtn').addEventListener('click', function () {
    location.assign('./pages/admin.html');
});

function getDatabase() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
    });
}

function draw() {
    document.querySelector('#mainContainer').innerHTML = '';
    let html = '';
    for (let key in database) {
        html += `
            <div class="product">
                <div class="pic">
                    <img src="${database[key].pic}">
                </div>
                <p><b>${database[key].name}</b></p>
                <span>${database[key].price} euro</span>
                <button class="detailsBtn" data-key="${key}">Details</button>
            </div>    
        `;
    }
    document.querySelector('#mainContainer').innerHTML = html;
}

function addListeners() {
    let buttons = document.querySelectorAll('.detailsBtn');
    for (let element of buttons) {
        element.addEventListener('click', function(){
            location.assign(`./pages/details.html?key=${element.dataset.key}`);
        });
    }
}

function showLoading() {
    document.querySelector('#mainContainer').innerHTML = '<img src="../assets/loading.gif">';
}

class Product {
    constructor(name, pic, desc, price, stock) {
        this.name = name;
        this.pic = pic;
        this.desc = desc;
        this.price = price;
        this.stock = stock;
    }
}