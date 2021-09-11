//Followed examples from class to create indexedDb file
//Varibale to hold connection
let db;

//Requesting a database instance
const request = indexedDB.open('budgetTracker' || 1);

//Creating object store
request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    //if there is no object store called 'budgetTrackerStore' create one
    if (!db.objectStoreNames.contains('budgetTrackerStore')) {
        db.createObjectStore('budgetTrackerStore', {autoIncrement: true });
    }
};

//Create the onsuccess

request.onsuccess = ({ target }) => {
    console.log(request.result.name);
    const db = request.result;
    //Check to see if app is online before reading from database
    if(navigator.onLine) {
        checkDatabase();
    }
};

//If an error occurs, log the error
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//Checkdatabase function

const checkDatabase = () => {
    //Opens a transaction of budgettracker database
    let transaction = db.transaction(['budgetTrackerStore'], 'readwrite');
    //Access the budgetstore
    const store = transaction.objectStore('budgetTrackerStore');
    //Get all records from store and set to a variable
    const getAll = store.getAll();

    //If the request is successful 
    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((res) => {
    //If returned response is not empty open another transaction to budgetTrackerStore that can read and write 
                if (res.length !== 0) {
                    transaction = db.transaction(['budgetTrackerStore'], 'readwrite');
            //Create variable for the current store
                    const currentStore = transaction.objectStore('budgetTrackerStore');
            //Clear exisiting entries when bulk add is successful
                    currentStore.clear();
                    console.log('clearing store');
                }
            });
        }
    };
}

//Function for when user submits new transaction offline to save their input
const saveRecord = (record) => {
    console.log('saving record invoked');
    //creating transaction that can read and write on database
    const transaction = db.transaction(['budgetTrackerStore'], 'readwrite');
    //Access object store
    const store = transaction.objectStore('budgetTrackerStore');
    //Add record to store
    store.add(record);
}

//Listen for app to get back online
window.addEventListener('online', checkDatabase);