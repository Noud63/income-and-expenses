//--------------------------------- BudgetController ------------------------------------------//

const budgetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  // Calculate percentage
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  //Getter, get percentage
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach((current) => {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
    localStorage.setItem("DATA", JSON.stringify(data));
  };

  let data;
  if (localStorage.getItem("DATA")) {
    data = JSON.parse(localStorage.getItem("DATA"));
  } else {
    data = {
      allItems: {
        exp: [],
        inc: [],
      },
      totals: {
        exp: 0,
        inc: 0,
      },
      budget: 0,
      percentage: -1,
    };
  }

  //Public functions stored in an object
  return {
    addItem: function (type, des, val) {
      let newItem, ID;
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // last id + 1
      } else {
        ID = 0;
      }

      //Create newItem based on inc or exp type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
        // data.allItems.exp.push(newItem);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
        // data.allItems.inc.push(newItem);
      }
      //Push it into the data structure
      data.allItems[type].push(newItem);
      // return the new element
      localStorage.setItem("DATA", JSON.stringify(data));
      return newItem;
    },

    deleteItem: function (type, ID) {
      let ids, index;
      ids = data.allItems[type].map((current, index, array) => {
        return current.id;
      });

      index = ids.indexOf(ID);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
      localStorage.setItem("DATA", JSON.stringify(data));
    },

    calculateBudget: function () {
      // calculate total income and expenses

      or: calculateTotal("inc");
      calculateTotal("exp");

      // claculate budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // claculate percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }

      localStorage.setItem("DATA", JSON.stringify(data));
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach((cur) => {
        cur.calcPercentage(data.totals.inc);
      });
      
    },

    getPercentages: function () {
      const allPerc = data.allItems.exp.map((cur) => {
        return cur.getPercentage();
      });
      localStorage.setItem("DATA", JSON.stringify(data));
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//----------------------------------------- UIController --------------------------------------//

const UIController = (function () {
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  let formatNumber = function (num, type) {
    let numSplit, int, dec;

    // + or - before number
    // 2 decimal points
    // comma separating thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    // if (type === "exp") {
    //   sign = "-";
    // } else if (type === "inc") {
    //   sign = "+";
    // }
    // return sign + " " + int + "." + dec;

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      let html, newHtml, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>   
            <div class="right clearfix">              
                <div class="item__value">${"\u20ac"} ${formatNumber(
          obj.value,
          type
        )}</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
                <div class="item__value">${"\u20ac"} ${formatNumber(
          obj.value,
          type
        )}</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      }

      //Insert html into theDOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },

    deletelistItem: function (selectorID) {
      let element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function () {
      let fields;
      fields = [
        ...document.querySelectorAll(
          DOMstrings.inputDescription + ", " + DOMstrings.inputValue
        ),
      ];
      fields.forEach((current, index, array) => {
        current.value = "";
      });

      fields[0].focus();
    },

    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      if (obj.budget === 0) {
        // Remove the - sign  if budget is 0.00
        document.querySelector(DOMstrings.budgetLabel).textContent =
          "\u20ac " + "0.00";
      } else {
        document.querySelector(DOMstrings.budgetLabel).textContent =
          "\u20ac " + formatNumber(obj.budget, type);
      }

      document.querySelector(DOMstrings.incomeLabel).textContent =
        "\u20ac " + formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMstrings.expensesLabel).textContent =
        "\u20ac " + formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      const fields = [
        ...document.querySelectorAll(DOMstrings.expensesPercentageLabel),
      ];
      fields.forEach((el, index) => {
        if (percentages[index] > 0) {
          el.textContent = percentages[index] + "%";
        } else {
          el.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function (e) {
      const fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      fields.forEach((el) => {
        el.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

//----------------------------------------- Global app controller ------------------------------------------//

const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = function () {
    const DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  const updateBudget = function (type) {
    // 1. Calculate budget
    budgetCtrl.calculateBudget(type);

    // 2. Return the budget
    const budget = budgetCtrl.getBudget();

    // 3. Display budget in the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function () {
    // 1. calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the update controller
    let percentages = budgetCtrl.getPercentages();

    // 3. Updat UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function () {
    let input, newItem;
    // 1. Get field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add new item to UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear fields
      UICtrl.clearFields();

      // 5. Calculate and Update budget
      updateBudget(input.type);

      // 6. calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. delete item from UI
      UICtrl.deletelistItem(itemID);

      // 3. Update and show the new budget
      updateBudget(type);

      // 4. calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("app has started");
      UICtrl.displayMonth();
      let DATA = JSON.parse(localStorage.getItem("DATA"));
      console.log(DATA);
      if (!DATA) {
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: "---",
        });
      } else {
        UICtrl.displayBudget({
          budget: DATA.budget,
          totalInc: DATA.totals.inc,
          totalExp: DATA.totals.exp,
          percentage: DATA.percentage,
        });
      }

      setupEventListeners();
    },
  };
})(budgetController, UIController);

//Only line of code outside of modules
controller.init();


