//BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id, description, value){
            this.id = id,
            this.description = description,
            this.value = value,
            this.percentage = -1
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);        
        }
        else{
            this.percentage = -1;
        }
    };
    

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value){
            this.id = id,
            this.description = description,
            this.value = value
    }

    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    } 
    
    var data = {
      allItems: {
          exp: [],
          inc: []
      },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        addData: function(type, des, val){
            var newItem, ID;
            
            //[1 2 3 4] = 5
            //[1 2 4 6 8] = 9
            //ID = lastitem +1;
            
            //create new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            }
            else{
                ID = 0;
            }
            //create new id based on 'inc' or 'exp' type;
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //pust it into our data structure
            data.allItems[type].push(newItem);
            
            //return the new element
            return newItem;
        },
        calculateBudget: function(){
            var totalBudget;
            
            //calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate budget = inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the exp percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });       
        },
        
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function(){
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }  
        },
        
        deleteItem: function(type, id){
            ids = data.allItems[type].map(function(current){
                return current.id;    
            });
            index = ids.indexOf(id);
            if(index !==  -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        testing: function(){
            return data;
        }
    };
})();




//UI CONTROLLER
var UIController = (function(){
    var DOMstrings = {
          inputType: '.add__type',  
          inputDescription: '.add__description',  
          inputValue: '.add__value', 
          inputBtn: '.add__btn',
          htmlExp: '.expenses__list',
          htmlInc: '.income__list',
          budgetLabel: '.budget__value',
          incomeLabel: '.budget__income--value',
          expenseLabel: '.budget__expenses--value',
          expensePercentage: '.budget__expenses--percentage',
          container: '.container',
          expensesPercLabel: '.item__percentage',
          dateLabel: '.budget__title--month'
        };
    
    //2310.4632 = 2,310.46
    var formatNumber = function(num,type){
        var int,numSplit;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    };
        var nodeListForEach = function(list,callback){
        for(var i =0; i<list.length; i++){
            callback(list[i],i);
        }
    };
    
    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,  //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,    //add description
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)    //add value
            };
        },
        addListItem: function(obj,type){
            var html, newHtml, element;
            // create HTML string with placeholder text
            
            if(type === 'inc'){
                element = DOMstrings.htmlInc;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMstrings.htmlExp;                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //  replacing placeholder text with actual values
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Inserting HTML into DOM

                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields: function(){
            
            var fields;
            //using querySeletorAll
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            //Using Slice method converting list to array
            fieldsArr = Array.prototype.slice.call(fields);
            //Using forEach 
            fieldsArr.forEach(function(current, index, array){
                current.value = ""; 
            });
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0 ){
                document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.expensePercentage).textContent = '---';
            }
        },
        
        deleteListItem: function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);      //nodeList
                
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';            
                }
                else{
                    current.textContent = '---'
                }
            });
        },
        
        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue 
            ); 
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');            
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();




//GLOBAL APP CONTROLLER
var Controller = (function(budgetCtrl,UICtrl){
    var DOM = UICtrl.getDOMstrings();
    
    var updateBudget = function(){
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2. return the budget 
        var budget = budgetCtrl.getBudget();

        //3. display the budget in UI
        UICtrl.displayBudget(budget);
    };
    
        
    var updatePercentages = function() {
        
        //1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2. Read the percentages from the budget Controller
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function(){
        var input, newItem;
            //1. get the field i/p data

            input = UICtrl.getInput();
            
            if(input.description !== "" && !isNaN(input.value) && input.value>0){
            //2. add the item to the budget Controller
            newItem = budgetCtrl.addData(input.type, input.description, input.value);
            
            //3. add new item in UI 
            UICtrl.addListItem(newItem,input.type);
        
            //4. clear the input fields
            UICtrl.clearFields();
            
            //5. calculate and update Budget
            updateBudget();
            
            //6. calculate and update percentages    
            updatePercentages();    
            }
    };
         
    var ctrlDeleteItem = function(event){
        var itemID, splitID, ID, type;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Delete the item from Data Structure
            budgetCtrl.deleteItem(type,ID);
           
            //2. Delete data from UI 
            UICtrl.deleteListItem(itemID);   
            
            //3. Update the new Budget
            updateBudget();
        }
        
    };
       
    
    function setupEventListeners(){
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode == 13 || event.which == 13){   //which for old browser
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }
    
    
    return {
        init: function(){
            console.log('init function started');
            UICtrl.displayBudget({budget: 0,
                                 totalInc: 0,
                                 totalExp: 0,
                                 percentage: -1});
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }
        
})(budgetController,UIController);


Controller.init();