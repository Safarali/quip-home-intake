/* =============== Data Controller ================*/

var DATAController = (function () {
    /* HTTP Requests */
    return {

        // Gets all initial Data from end point
        getData: function(cb) {
            var getRequest = new XMLHttpRequest();
            getRequest.onreadystatechange = function() {
                if (getRequest.readyState == 4 && getRequest.status == 200) {
                    var data = JSON.parse(getRequest.responseText);
                    cb(data);
                }
            };
            getRequest.open("GET", "http://quip-todos.herokuapp.com/get_todos?email=example@gmail.com");
            getRequest.send();
        },
        // Posts Data
        postData: function(cb){
            var todoVal;
            todoVal = document.querySelector('.add_todo');
            var postRequest = new XMLHttpRequest();

            postRequest.onreadystatechange = function() {
                if (postRequest.readyState == 4 && postRequest.status == 200) {
                    var data = JSON.parse(postRequest.responseText);
                    cb(data, todoVal);
                }
            };
            postRequest.open("POST", "http://quip-todos.herokuapp.com/add_todo", true);
            postRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            postRequest.send(`email=example@gmail.com&text=${todoVal.value}`);
        },

        // Marks Todo
        markData: function(id, isCompleted, cb) {
            var markRequest = new XMLHttpRequest();

            markRequest.onreadystatechange = function() {
                if(markRequest.readyState == 4 && markRequest.status == 200){
                    var data = JSON.parse(markRequest.responseText);
                    cb(data)
                }
            };
            markRequest.open("POST", 'http://quip-todos.herokuapp.com/mark_completed');
            markRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            markRequest.send(`email=example@gmail.com&id=${id}&completed=${isCompleted}`);
        }

        // resetData: function () {
        //     var resetRequest = new XMLHttpRequest();
        //     resetRequest.open("POST", 'http://quip-todos.herokuapp.com/reset');
        //     resetRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //
        //     resetRequest.send('email=example@gmail.com');
        // }
    }

})();


/* =============== UI Controller ===============*/

var UIController = (function () {

    // Returns Dynamic DOM String(li)
    function dynamicDOMStr(todo) {
        var html, newHTML;
        html = '<li class="todo_li" id="list-%id%"><input type="checkbox" id="mark-%id%">%note%</li>'

        newHTML = html.split('%id%').join(todo.id);
        newHTML = newHTML.replace('%note%', todo.text);
        return newHTML;
    }

    return {
        // Displays all initial ToDo/added ones(incase page refreshes)
        displayAll: function(data) {
            data.forEach(function (todo) {
                var newHTML;
                newHTML = dynamicDOMStr(todo)

                if (todo.completed === true) {
                    newHTML = newHTML.replace('todo_li', 'todo_li marked_todo_li');
                    newHTML = newHTML.replace('input', 'input checked');
                }

                document.querySelector('.todo_list_box').insertAdjacentHTML('afterbegin', newHTML);
            });
        },

        // Displays Single Todo
        displaySingle: function(todo, field) {
            var newHTML;
            newHTML = dynamicDOMStr(todo);

            document.querySelector('.todo_list_box').insertAdjacentHTML('afterbegin', newHTML);
            field.value = '';

        },

        // Mark and Unmark
        markSingle: function (data) {
            var listId, li;
            listId = `list-${data.id}`;
            li = document.getElementById(listId);
            li.classList.toggle('marked_todo_li');
        }
    }

})();



/* ================== App Controller =========== */

var controller = (function (DATACtrl, UICtrl) {

    /* Events Listeners */
    var setUpEventListeners = function() {
        // Displays Single ToDo
        document.querySelector('.add_btn').addEventListener('click', displaySingleCtrl);

        // Gets Id and Completed status and forward to DATA Controller through UI Controller
        document.querySelector('.todo_list_box').addEventListener('click', function(event) {
            var target = event.target;
            var splitTarget = target.id.split("-");

            if (splitTarget[0] === 'mark') {
                var id, isCompleted;
                id = parseInt(splitTarget[1]);
                isCompleted = document.getElementById(event.target.id).checked;
                markCtrl(id, isCompleted);
            }
        });
    }


    function displayAllCtrl() {
        DATACtrl.getData(UICtrl.displayAll);
    }

    function displaySingleCtrl() {
        DATACtrl.postData(UICtrl.displaySingle);
    }

    function markCtrl(id, isCompleted) {
        DATACtrl.markData(id, isCompleted, UICtrl.markSingle);
    }


    return {
        // This returns method to Initilize current controller
        init: function () {
            displayAllCtrl();
            setUpEventListeners();
            DATACtrl.resetData();
        }
    }
})(DATAController, UIController);

controller.init();
