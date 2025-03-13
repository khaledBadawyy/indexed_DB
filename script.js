let db;
let request = indexedDB.open("UserDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  let store = db.createObjectStore("users", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("name", "name", { unique: false });
};

request.onsuccess = function (event) {
  db = event.target.result;
  displayUsers();
};

request.onerror = function () {
  console.log("Error opening database");
};

let selectedUserId = null;

function addUser() {
  let name = document.getElementById("username").value;
  if (name.trim() === "") return;

  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  store.add({ name });

  transaction.oncomplete = function () {
    document.getElementById("username").value = "";
    displayUsers();
  };
}

function displayUsers() {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");

  let request = store.getAll();
  request.onsuccess = function () {
    renderUserList(request.result);
  };
}

function renderUserList(users) {
  let searchValue = document.getElementById("search").value.toLowerCase();
  let userList = document.getElementById("userList");
  userList.innerHTML = "";

  users.forEach((user) => {
    if (user.name.toLowerCase().includes(searchValue)) {
      let li = document.createElement("li");
      li.innerHTML = `
        <div>${user.name}</div>
        <div>
          <button class="update-btn" data-id="${user.id}" data-name="${user.name}">Update</button>
          <button class="delete-btn" data-id="${user.id}">Delete</button>
        </div>
      `;
      userList.appendChild(li);
    }
  });

  addEventListeners();
}

function deleteUser(id) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  store.delete(id);

  transaction.oncomplete = function () {
    displayUsers();
  };
}

function updateUser() {
  let newName = document.getElementById("username").value;
  if (newName.trim() === "" || selectedUserId === null) return;

  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  let request = store.get(selectedUserId);
  request.onsuccess = function () {
    let user = request.result;
    user.name = newName;
    store.put(user);

    transaction.oncomplete = function () {
      document.getElementById("username").value = "";
      document.getElementById("updateBtn").style.display = "none";
      selectedUserId = null;
      displayUsers();
    };
  };
}

function searchUsers() {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");

  let request = store.getAll();
  request.onsuccess = function () {
    renderUserList(request.result);
  };
}
