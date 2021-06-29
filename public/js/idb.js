const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB

const request = indexedDB.open("Budget-Tracker", 1)
let database;

request.onupgradeneeded = function (event) {
  let database = event.target.result;
  database.createObjectStore("updatedBudget", { autoIncrement: true })
};

request.onsuccess = function (event) {
  database = event.target.result;
  if (navigator.online) {
    upload()
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode)
};

function save(list) {
  const transaction = database.transaction(["updateBudget"], 'readWrite');
  const StoreUpdate = transaction.objectStore('updateBudget')

  StoreUpdate.add(list)
};

function upload () {
  const transaction = database.transaction(['updateBudget'], 'readWrite')
  const StoreUpdate = transaction.objectStore('updateBudget')

  const retrieve = StoreUpdate.retrieve()

  retrieve.onsuccess = function () {
    if (retrieve.result.length > 0) {
      fetch('/api/transaction', {
        method: "POST",
        body: JSON.stringify(retrieve.result),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(result => result.json(result))
      .then(response => {
        if (response.message) {
          console.log(console.error())
        }
        const transaction = database.transaction(['updateBudget'], 'readWrite')
        const StoreUpdate = transaction.objectStore("updateBudget")
        StoreUpdate.clear()
      })
      .catch(error => res.json(error))
    }
  }
};

window.addEventListener("online", upload)