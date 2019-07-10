let database = {};
let addMode = false;
showLoading();

getDatabase()
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        database = data;
        draw();
        addListeners();
    });

function getDatabase() {
    return fetch('https://my-online-store-2bdc4.firebaseio.com/my_products/.json', {
        method: 'GET',
    });
}

function draw() {
    document.querySelector('#mainContainer').innerHTML = '';
    let html = `
    <div>
    <button id="addBtn">Add new product</button>
    <button id="storeBtn">Store</button>
    </div>
    <table>
        <thead><tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    `;
    document.querySelector('#mainContainer').innerHTML = html;
    html = '';
    for (let key in database) {
        html += `
            <tr>
                <td>
                    <img class = "picSmall" src="${database[key].pic}">
                </td>
                <td><b>${database[key].name}</b></td>
                <td>${database[key].price} euro</td>
                <td>${database[key].stock} pcs</td>
                <td>
                    <button class="editBtn" data-key="${key}">Edit</button>
                    <button class="removeBtn" data-key="${key}">Remove</button>
                </td>
            </tr>    
        `;
    }
    document.querySelector('table tbody').innerHTML = html;
}

function addListeners() {
    document.querySelectorAll('.editBtn').forEach(function (element) {
        element.addEventListener('click', editProduct);
    });
    document.querySelectorAll('.removeBtn').forEach(function (element) {
        element.addEventListener('click', removeProduct);
    });
    document.querySelector('#addBtn').addEventListener('click', addProduct);
    document.querySelector('#storeBtn').addEventListener('click', function () {
        location.assign('../index.html');
    });

}

function addProduct() {
    addMode = true;
    editProduct();
}

function editProduct() {
    let key = (addMode) ? '' : this.dataset.key;
    let html = `
    <div class="centered">
        <table class="left">
            <tr>
                <td>Name:</td><td><input type="text" id="name" value="${(addMode)?'':database[key].name}"></td>
            </tr>
            <tr>
                <td>Pic:</td><td><input type="text" id="pic" value="${(addMode)?'':database[key].pic}"></td>
            </tr>
            <tr>
                <td>Price:</td><td><input type="text" id="price" value="${(addMode)?'':database[key].price}"></td>
            </tr>
            <tr>
                <td>Stock:</td><td><input type="text" id="stock" value="${(addMode)?'':database[key].stock}"></td>
            </tr>
            <tr>
                <td>Description:</td><td><textarea id="desc">${(addMode)?'':database[key].desc}</textarea></td>
            </tr>
            <tr>
                <td>Tags:</td><td><textarea id="tags">${(addMode)?'':database[key].tags}</textarea></td>
            </tr>
            <tr>
                <td>Category:</td>
                <td><select id="cat">
                <option value="clothing" ${(!addMode && database[key].cat === 'clothing')?'selected':''}>Clothing</option>
                <option value="footwear" ${(!addMode && database[key].cat === 'footwear')?'selected':''}>Footwear</option>
                <option value="accessories" ${(!addMode && database[key].cat === 'accessories')?'selected':''}>Accessories</option>
                </select></td>
            </tr>
        </table>
        <button id="saveBtn">Save</button>
        <button id="cancelBtn">Cancel</button>
    </div>
    `;
    document.querySelector('#mainContainer').innerHTML = html;
    document.querySelector('#saveBtn').addEventListener('click', function () {
        let newProduct = {
            name: document.querySelector('#name').value,
            pic: document.querySelector('#pic').value,
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
                database[key] = newProduct;
                draw();
                addListeners();
            })
            .catch();
        if (addMode)
            addMode = false;
    });
    document.querySelector('#cancelBtn').addEventListener('click', function () {
        draw();
        addListeners();
        if (addMode)
            addMode = false;
    });


}

function removeProduct() {
    let key = this.dataset.key;
    let html = `
    <div class="centered">
        <p>Remove product "${database[key].name}" from database?</p>
        <button id="yesBtn">Yes</button>
        <button id="noBtn">No</button>
    </div>
    `;
    document.querySelector('#mainContainer').innerHTML = html;
    document.querySelector('#yesBtn').addEventListener('click', function () {
        showLoading();
        fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${key}.json`, {
                method: 'DELETE'
            })
            .then(function () {
                delete database[key];
                draw();
                addListeners();
            })
            .catch();
    });
    document.querySelector('#noBtn').addEventListener('click', function () {
        draw();
        addListeners();
    });
}

function showLoading() {
    document.querySelector('#mainContainer').innerHTML = '<img src="../assets/loading.gif">';
}