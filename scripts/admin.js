let database = {};

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
        element.addEventListener('click', edit);
    });
    document.querySelectorAll('.removeBtn').forEach(function (element) {
        element.addEventListener('click', remove);
    });

}

function edit() {
    console.log('edit', this.dataset.key);
}

function remove() {
    console.log('remove', this.dataset.key);
    if (confirm('Delete product?'))
        fetch(`https://my-online-store-2bdc4.firebaseio.com/my_products/${this.dataset.key}.json`, {
            method: 'DELETE'
        })

}

