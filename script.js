// فتح أو إنشاء قاعدة بيانات
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
  console.log("خطأ في فتح قاعدة البيانات");
};

// إضافة مستخدم جديد
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

// عرض جميع المستخدمين
function displayUsers() {
  let transaction = db.transaction("users", "readonly");
  let store = transaction.objectStore("users");

  let request = store.getAll();
  request.onsuccess = function () {
    let userList = document.getElementById("userList");
    userList.innerHTML = "";

    request.result.forEach((user) => {
      let li = document.createElement("li");
      li.innerHTML = `${user.name} <button class="delete-btn" data-id="${user.id}">حذف</button>`;
      userList.appendChild(li);
    });

    // إضافة حدث الحذف بعد إنشاء القائمة
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function (event) {
        let userId = Number(event.target.getAttribute("data-id"));
        deleteUser(userId);
      });
    });
  };
}

// حذف مستخدم
function deleteUser(id) {
  let transaction = db.transaction("users", "readwrite");
  let store = transaction.objectStore("users");

  store.delete(id);

  transaction.oncomplete = function () {
    displayUsers(); // تحديث القائمة بعد الحذف مباشرة
  };
}
