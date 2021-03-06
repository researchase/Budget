var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;
      //create new ID
      if (data.allItems[type].length === 0) {
        ID = 0;
      } else {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      //create new item based on inc or exp type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //pus it ino our daa srucure
      data.allItems[type].push(newItem);
      //reurn he new Iem
      return newItem;
    },
    deleteItem: function(typ, id) {
      var ids, index;
      //id = 3 we need an array , we need to loop over all value
      // map returns a brand new array
      var ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income taht we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalinc: data.totals.inc,
        totalexp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

var UIControllar = (function() {
  var DOMstrings = {
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
    container: ".container"
  };

  return {
    getinput: function() {
      return {
        //lets create some property of object and return
        type: document.querySelector(DOMstrings.inputType).value,
        // will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace the placeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);

      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);
      //insert the html into the dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + "," + DOMstrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalinc;
      document.querySelector(DOMstrings.expensesLabel).textContent =
        obj.totalexp;
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();
//global app controller
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = () => {
    // 4. calculate the budget
    budgetCtrl.calculateBudget();

    // 4a. Return the budget
    var budget = budgetCtrl.getBudget();
    // 5. display the budget on the UI
    UICtrl.displayBudget(budget);
  };
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. get the field input data
    input = UICtrl.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4a. clear the fields
      UICtrl.clearFields();

      // 5 calculate and update budget
      updateBudget();
    }

    console.log("you clicked or pressed enter");
  };

  var ctrlDeleteItem = event => {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = splitID[1];
      //1. delete the item from the data structure

      //2. delete the item the UI

      //3. update new budget
    }
  };

  return {
    init: function() {
      console.log("Application has started ");
      UICtrl.displayBudget({
        budget: 0,
        totalinc: 0,
        totalexp: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  };
})(budgetController, UIControllar);

controller.init();
