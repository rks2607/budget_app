var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage= -1;
    };

    Expense.prototype.calcPer= function(inc){
        if(inc>0) this.percentage=Math.round(this.value/inc*100);
        else this.percentage=-1;
    };

    Expense.prototype.getPer = function() {
        return this.percentage;
    };

    function Income(id, description, value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    
    var total= function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+=cur.value;
        });
        data.totals[type]=sum;


        // console.log("this program ran"+ type+" "+ sum );
    }

    var data= {
        allItems: {
            inc:[],
            exp: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    }

    return {
        addItem:function(type,des,val){
            var newItem,ID;
            if(data.allItems[type].length>0){
                ID= data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID=0;
            }
            
            if(type=="exp"){
                 newItem= new Expense(ID,des,val);
            }
            else newItem= new Income(ID,des,val);

            data.allItems[type].push(newItem);
            return newItem; 
            
        },

        delItem: function(type,id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){
            total('inc');
            total('exp');
            
            data.budget=data.totals.inc-data.totals.exp;

            data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);


        },

        calculatePercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPer(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPer=data.allItems.exp.map(function(cur){
                return cur.getPer();
            });
            return allPer;
        },
        
        getBudget: function(){
            return{
                budget: data.budget,
                income:data.totals.inc,
                expense:data.totals.exp,
                percentage:data.percentage
            }
        },

        testing : function(){
            return data;
        }
    }

})();

var UIcontroller = (function(){
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(".add__type").value,
                description: document.querySelector(".add__description").value,
                value:parseFloat(document.querySelector(".add__value").value) 
            }
        },

        addtoList: function(obj,type){
            var html,newHtml,element;
            if(type==='inc'){
                element= '.income__list';
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else {
                element= '.expenses__list';
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'            
            }

            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',obj.value);
            // console.log(newHtml);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);  

              
        },

        delFromList: function(mainId){
            var el = document.getElementById(mainId);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields= document.querySelectorAll(".add__description" + "," + ".add__value");

            var fieldArr=Array.prototype.slice.call(fields);
            
            for(var i=0;i<fieldArr.length;i++){
                fieldArr[i].value="";
            }
            fieldArr[0].focus();

        },

        displayPercents: function(percentages){
            var fields = document.querySelectorAll(".item__percentage");
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayBudget: function(obj){
            document.querySelector(".budget__value").textContent=obj.budget;
            document.querySelector(".budget__income--value").textContent=obj.income;
            document.querySelector(".budget__expenses--value").textContent=obj.expense;
            

            if(obj.budget>0){
                document.querySelector(".budget__expenses--percentage").textContent=obj.percentage+"%";
            }
            else{
                document.querySelector(".budget__expenses--percentage").textContent="---";
            }
        }
    }


})();

var controller = function(budgetctrl , UIctrl){

    var updateBudget= function(){
        budgetctrl.calculateBudget();

        var budget=budgetctrl.getBudget();

        UIctrl.displayBudget(budget);
        // console.log(budget); 


    };

    var updatePer = function(){
        budgetctrl.calculatePercentage();

        var percents= budgetctrl.getPercentages();

        UIctrl.displayPercents(percents);
    }

    var ctrlAddItem = function(){
        var input = UIctrl.getInput();
        // console.log(input);
        if(input.description!="" && !isNaN(input.value)  && input.value>0){
            var newItem = budgetctrl.addItem(input.type,input.description,input.value);
            // console.log(newItem);
            UIctrl.addtoList(newItem,input.type);

            UIctrl.clearFields();

            updateBudget();

            updatePer();

        }

        

    };

    var ctrlDelItem= function(event){
        var st,type,ID;

        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // console.log(itemID);
        if(itemID){
            st=itemID.split("-");
            type=st[0];
            ID=parseInt(st[1]);

            if(ID !== -1){
                budgetctrl.delItem(type,ID);

                UIctrl.delFromList(itemID);

                updateBudget();

                updatePer();

            }

            // console.log(t,ID);
        }


    };

    document.querySelector(".add__btn").addEventListener('click',ctrlAddItem);

    document.addEventListener("keypress",function(event){
        if(event.keyCode===13){
            ctrlAddItem();
        }
    });

    document.querySelector(".container").addEventListener('click',ctrlDelItem);



}(budgetController, UIcontroller);












