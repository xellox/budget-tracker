let currencyList = document.querySelector(".currency-list");
let droplistCurrency = document.querySelector(".droplistCurrency");
let droplistInput = document.querySelector(".currency-input");
let dropdownCurrency = document.querySelector(".dropdown-currency-icon");
let droplist = document.querySelector(".droplist");
let droplistCategory = document.querySelector(".category-input");
let expenseList = document.querySelector(".expense-list");
let expenseInput = document.querySelector(".expense-input");
let dropdownIcon = document.querySelector(".dropdown-icon");
let budgetBtn = document.querySelector(".set-budget-button");
let budgetInput = document.querySelector(".budget-input");
let budgetAmount = document.querySelector(".budget-amount");
let expenseTable = document.querySelector(".expense-table");
let expenseBtn = document.querySelector(".set-expense-button");
let tableData = document.querySelector(".table-data");
let spentBudget = document.querySelector(".budget-spent");
let balance = document.querySelector(".balance");
let setCurrency = "";
let setBudget = "";

// Display lists
function displayCurrencyDroplist() {
  currencyList.classList.toggle("open");
  dropdownCurrency.classList.toggle("open");
}

function displayDroplist() {
  expenseList.classList.toggle("open");
  dropdownIcon.classList.toggle("open");
}

droplist.addEventListener("click", () => {
  displayDroplist();
});

droplistCurrency.addEventListener("click", () => {
  displayCurrencyDroplist();
});

currencyList.addEventListener("click", (item) => {
  const selectedItem = item.target.innerHTML;
  droplistInput.innerHTML = selectedItem;

  localStorage.setItem("selectedCurrency", JSON.stringify(selectedItem));
  setBudget = JSON.parse(localStorage.getItem("budget-amount")) || 0;
  setCurrency = JSON.parse(localStorage.getItem("selectedCurrency"));
  budgetAmount.innerHTML = `${setBudget}${setCurrency.slice(-1)}`;
  displayCurrencyDroplist();
  budgetSpentUpdate();
  updateTable();
  remainingBalance();
});

//keep values updated when page refreshes
function currencyGetLocalStorage() {
  setCurrency = JSON.parse(localStorage.getItem("selectedCurrency"));
  droplistInput.innerHTML = setCurrency || `Currency`;
}
currencyGetLocalStorage();

// display total budget from input value on submit and store it in localStorage
function submitBudget() {
  if (budgetInput.value === "") {
    alert("Input a number");
    return;
  } else if (droplistInput.innerHTML === `Currency`) {
    alert("select a currency");
    return;
  } // if user inputs nothing, return alert

  let totalBudget = budgetInput.value;
  budgetAmount.innerHTML = totalBudget;

  localStorage.setItem("budget-amount", JSON.stringify(totalBudget));
  setCurrency = JSON.parse(localStorage.getItem("selectedCurrency")); // get values from localStorage
  setBudget = JSON.parse(localStorage.getItem("budget-amount"));

  budgetAmount.innerHTML = `${setBudget}${setCurrency.slice(-1)}`; // input values from localStorage
  budgetInput.value = "";
  remainingBalance();
  
}

budgetBtn.addEventListener("click", () => {
  submitBudget();
}); //add submit function on click

budgetInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    submitBudget();
  }
}); // add sumit function on enter

//automatically remove any letters and symbols from the input field / only allow numbers
budgetInput.addEventListener("input", (event) => {
  const enteredValue = event.target.value;
  event.target.value = enteredValue.replace(/[^0-9]/g, "");
});

//keep values updated when page refreshes
function budgetGetLocalStorage() {
  setBudget = JSON.parse(localStorage.getItem("budget-amount"));
  setCurrency = JSON.parse(localStorage.getItem("selectedCurrency"));
  if (setBudget === null || setBudget === undefined) {
    setBudget = 0;
  } else {
    budgetAmount.innerHTML = `${setBudget}${setCurrency.slice(-1)}`;
  }
}
budgetGetLocalStorage();

//make expenses-category list functional
expenseList.addEventListener("click", (expense) => {
  const expenses = expense.target.innerHTML;
  droplistCategory.innerHTML = expenses;
  displayDroplist();
});

//add the data to the table on submit and set it to local storage
function expenseData() {
  if (droplistCategory.innerHTML === `Category`) {
    alert("Select a category");
    return;
  } else if (setCurrency === null || setCurrency === undefined) {
    alert("Select a currency");
    return;
  }
  setCurrency = JSON.parse(localStorage.getItem("selectedCurrency"));
  let date = new Date().toLocaleDateString();

  const expenseRow = document.createElement("tr");
  //add classes for each category so i can retrieve the sum for category for the piechart
  expenseRow.innerHTML = `
    <td>${droplistCategory.innerHTML}</td>
    <td class="expense-items ${droplistCategory.innerHTML}">${expenseInput.value}${setCurrency.slice(-1)}</td>
    <td>${date}</td>
  `;
  // Append the row to the table body
  expenseTable.appendChild(expenseRow);
  // Save the updated table HTML back to local storage
  localStorage.setItem("table", expenseTable.innerHTML);

  budgetSpentUpdate();
  updateTable();
  remainingBalance();
  
}

expenseBtn.addEventListener("click", () => {
  expenseData();
});

expenseInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    expenseData();
  }
});

//in the table, replace all the currency symbols set to local storage to the selectedCurrency
function updateCurrencyInTable() {
  let setCurrency = JSON.parse(localStorage.getItem("selectedCurrency"));
  let expenseItems = expenseTable.querySelectorAll(".expense-items");
  for (let i = 0; i < expenseItems.length; i++) {
    let expenseItem = expenseItems[i];
    expenseItem.innerHTML = `${expenseItem.innerHTML.replace(/\D/g,"")}${setCurrency.slice(-1)}`;
  }
}
//save table on refresh, call updateCurrency
function updateTable() {
  let updateTable = localStorage.getItem("table");
  expenseTable.innerHTML = updateTable;
  updateCurrencyInTable();
  if (updateTable === null || updateTable === "") {
    // Set default HTML code for the table when local storage is empty
    expenseTable.innerHTML = `
      <thead>
        <tr>
          <th>Category</th>
          <th>Expense</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    return;
  }
}
updateTable();

//total spent function, sum upp all the expense data from the table
function budgetSpentUpdate() {
  const expenseItems = document.querySelectorAll(".expense-items");
  let sum = 0;

  expenseItems.forEach((item) => {
    const expenseValue = parseFloat(item.textContent);
    if (!isNaN(expenseValue)) {
      sum += expenseValue;
    }
  });
  spentBudget.innerHTML = sum + setCurrency.slice(-1);
}
budgetSpentUpdate();

//get the amount of money for each category spent in the table
// helper function 
function calculateCategorySum(categoryName, selector) {
  let sum = 0;
  const elements = document.querySelectorAll(selector);

  elements.forEach((item) => {
    const expense = parseFloat(item.textContent);
    if (!isNaN(expense)) {
      sum += expense;
    }
  });
  return sum;
  
}
//declare constants globally so i can use them in the pie chart
let foodSum = 0;
let utilitiesSum = 0;
let transportationSum = 0;
let billsSum = 0;
let housingSum = 0;

// make use of helper function for cleaner code
function test() {
  foodSum = calculateCategorySum('food', '.food');
  utilitiesSum = calculateCategorySum('utilities', '.utilities');
  transportationSum = calculateCategorySum('transportation', '.transportation');
  billsSum = calculateCategorySum('bills', '.bills');
  housingSum = calculateCategorySum('housing', '.housing');
  
}test()

//remining balance display
function remainingBalance() {
  balance.innerHTML =
    parseFloat(budgetAmount.textContent) -
    parseFloat(spentBudget.textContent) +
    setCurrency.slice(-1);
}
remainingBalance();


//pie chart for each category of expense using chartJS

const pieChart = new Chart(document.getElementById('myChart'), {
  type: 'pie',
  data: {
    labels: ['food', 'utilities', 'transportation', 'bills', 'housing'],
    datasets: [{
      backgroundColor: ['red', 'blue', 'green', 'yellow', 'pink'],
      data: [foodSum, utilitiesSum, transportationSum, billsSum, housingSum]
    }]
  },
  options : {
    title: {
      display: true,
      text: 'test nu stiu lung'
    },
    responsive: true,
  }
});

