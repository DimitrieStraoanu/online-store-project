let products = {};
let addMode = false;
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
        clearLoading()
        renderProducts();
    })
    .catch(function (err) {
        console.log(err);
    });

function getProducts() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
    });
}

function renderProducts() {
    let container = document.querySelector('#container');
    if (container) {
        container.parentElement.removeChild(container);
    }
    let div = document.createElement('div');
    div.id = "container";
    div.className = 'col-12 col-lg-9 mx-auto p-0';
    let html = `
    <div class="mb-3 text-center">
    <button id="addBtn" class="btn btn-secondary text-nowarp"><i class="fas fa-plus"></i> Add new product</button>
    <button id="storeBtn" class="btn btn-secondary">Go to Store</button>
    </div>
    <table class="table table-striped text-center">
        <thead>
            <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
    `;
    for (let key in products) {
        html += `
            <tr>
                <td class="align-middle">
                    <div class="picSmall mx-auto overflow-hidden bg-white rounded">
                        <img class="w-100" src="../assets/pics/${key}/${products[key].pics.split(' ')[0]}">
                    </div>
                </td>
                <td class="align-middle"><b>${products[key].name}</b></td>
                <td class="align-middle">${products[key].price} euro</td>
                <td class="align-middle">${products[key].stock} pcs</td>
                <td class="align-middle">
                    <div class="d-flex justify-content-center">
                        <button class="editBtn btn btn-secondary col-6" data-key="${key}">Edit</button>
                        <button class="removeBtn btn btn-danger col-6 ml-2 text-nowarp" data-key="${key}">Remove <i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>    
        `;
    }
    html += `
        </tbody>
    </table>
    `;
    div.innerHTML = html;

    div.querySelector('#storeBtn').addEventListener('click', function () {
        location.assign('../index.html');
    });
    div.querySelector('#addBtn').addEventListener('click', addProduct);
    div.querySelectorAll('.editBtn').forEach(function (element) {
        element.addEventListener('click', editProduct);
    });
    div.querySelectorAll('.removeBtn').forEach(function (element) {
        element.addEventListener('click', removeProduct);
    });

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
    let loading = document.querySelector('#loading');
    loading.parentElement.removeChild(loading);
}


function addProduct() {
    addMode = true;
    editProduct();
}

function editProduct() {
    let key = (addMode) ? '' : this.dataset.key;
    let html = `
        <table class="table text-left">
            <tr>
                <th>Name:</th><td><input class="form-control" type="text" id="name" value="${(addMode)?'':products[key].name}"></td>
            </tr>
            <tr>
                <th>Pics:</th><td><input class="form-control" type="text" id="pics" value="${(addMode)?'':products[key].pics}"></td>
            </tr>
            <tr>
                <th>Price:</th><td><input class="form-control" type="text" id="price" value="${(addMode)?'':products[key].price}"></td>
            </tr>
            <tr>
                <th>Stock:</th><td><input class="form-control" type="text" id="stock" value="${(addMode)?'':products[key].stock}"></td>
            </tr>
            <tr>
                <th>Description:</th><td><textarea id="desc" class="form-control">${(addMode)?'':products[key].desc}</textarea></td>
            </tr>
            <tr>
                <th>Tags:</th><td><textarea id="tags" class="form-control">${(addMode)?'':products[key].tags}</textarea></td>
            </tr>
            <tr>
                <th>Category:</th>
                <td><select id="cat" class="form-control">
                <option value="clothing" ${(!addMode && products[key].cat === 'clothing')?'selected':''}>Clothing</option>
                <option value="footwear" ${(!addMode && products[key].cat === 'footwear')?'selected':''}>Footwear</option>
                <option value="accessories" ${(!addMode && products[key].cat === 'accessories')?'selected':''}>Accessories</option>
                </select></td>
            </tr>
        </table>
        <div class="text-center justify-content-center d-flex m-3">
        <button id="saveBtn" class="btn btn-success col-6">Save</button>
        <button id="cancelBtn" class="btn btn-secondary col-6 ml-2">Cancel</button>
        </div>
    `;
    document.querySelector('#container').innerHTML = html;
    document.querySelector('#saveBtn').addEventListener('click', function () {
        saveProduct(key);
    });
    document.querySelector('#cancelBtn').addEventListener('click', cancel);
}

function cancel() {
    renderProducts();
    if (addMode)
        addMode = false;
}

function saveProduct(key) {
    let newProduct = {
        name: document.querySelector('#name').value,
        pics: document.querySelector('#pics').value,
        price: Number(document.querySelector('#price').value),
        stock: Number(document.querySelector('#stock').value),
        desc: document.querySelector('#desc').value,
        tags: document.querySelector('#tags').value,
        cat: document.querySelector('#cat').value
    };
    showLoading();
    fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${(addMode)?'':key}.json`, {
            method: (addMode) ? 'POST' : 'PUT',
            body: JSON.stringify(newProduct)
        })
        .then(function () {
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
                    renderProducts();
                })
        })
        .catch(function (err) {
            console.log(err);
        });
    if (addMode)
        addMode = false;
}

function removeProduct() {
    let key = this.dataset.key;
    let div = document.createElement('div');
    div.className = "my-fullscreen";
    let html = `
    <div class="bg-white rounded shadow border my-fixed-centered text-center p-5">
        <p>Remove product "${products[key].name}" from database?</p>
        <div class="d-flex">
            <button id="yesBtn" class="btn btn-danger flex-fill">Yes</button>
            <button id="noBtn" class="btn btn-secondary flex-fill ml-2">No</button>
        </div>
    </div>
    `;
    div.innerHTML = html;
    div.querySelector('#yesBtn').addEventListener('click', function () {
        showLoading();
        fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}.json`, {
                method: 'DELETE'
            })
            .then(function () {
                clearLoading();
                div.parentElement.removeChild(div);
                delete products[key];
                renderProducts();
            })
            .catch(function (err) {
                console.log(err);
            });
    });
    div.querySelector('#noBtn').addEventListener('click', function () {
        div.parentElement.removeChild(div);
    });
    document.body.append(div);
}