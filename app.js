const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');

let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addTodo();
});

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false,
            deadline: null
        };
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
        showCalendarModal(allTodos.length - 1); // Show the calendar for the new todo item
    }
}

function updateTodoList() {
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex) => {
        const todoItem = createTodoItem(todo, todoIndex);

        // Apply the 'completed' class based on the 'completed' property of each todo
        const deadlineElement = todoItem.querySelector('.todo-deadline');
        if (todo.completed) {
            deadlineElement.classList.add("completed");
            deadlineElement.innerText = "Completed";  // Set text to "Completed"
        } else {
            deadlineElement.classList.remove("completed");
            deadlineElement.innerText = todo.deadline ? "Deadline: " + todo.deadline : 'No deadline set';
        }

        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex) {
    const todoId = "todo-" + todoIndex;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todo.text}
        </label>
        <span class="todo-deadline">${todo.completed ? "Completed" : (todo.deadline ? "Deadline: " + todo.deadline : 'No deadline set')}</span>
        <button class="delete-button">
            <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;

    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    });

    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;

        // Update the deadline text to "Completed" when the task is marked as done
        const deadlineElement = todoLI.querySelector('.todo-deadline');
        if (checkbox.checked) {
            deadlineElement.innerText = "Completed";
            deadlineElement.classList.add("completed"); // NEW!!!!!!!!!
        } else {
            // Reset to deadline text if task is unchecked
            deadlineElement.innerText = todo.deadline ? "Deadline: " + todo.deadline : "No deadline set";
            deadlineElement.classList.remove("completed"); //NEWWWW!!!!!
        }

        saveTodos();
    });
    checkbox.checked = todo.completed;

    return todoLI;
}


function deleteTodoItem(todoIndex) {
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
}

function saveTodos() {
    const todosJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todosJson);
}

function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}

// Calendar Modal handling
const calendarModal = document.getElementById('calendar-modal');
const confirmDateBtn = document.getElementById('confirm-date');
let selectedDate = null;
let currentTodoIndex = null;  // Use this to track the selected todo item's index

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Function to generate days of the current month in the calendar
function generateCalendar(month, year) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    const calendarDaysContainer = document.querySelector('.calendar-days');
    calendarDaysContainer.innerHTML = '';

    // Generate the calendar
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('date');
        dayElement.setAttribute('data-date', `${day}-${month + 1}-${year}`);
        dayElement.innerText = day;
        calendarDaysContainer.appendChild(dayElement);
    }

    // Update the month name
    document.getElementById('current-month').innerText = `${monthNames[month]} ${year}`;
}

function showCalendarModal(todoIndex) {
    currentTodoIndex = todoIndex;  // Store the current todo's index
    calendarModal.style.display = "flex";
    generateCalendar(currentMonth, currentYear); // Show current month calendar
}

function hideCalendarModal() {
    calendarModal.style.display = "none";
}

function updateCalendar(date) {
    selectedDate = date;

    // Make sure the todoIndex is valid
    if (currentTodoIndex !== null && allTodos[currentTodoIndex]) {
        allTodos[currentTodoIndex].deadline = selectedDate;  // Update the deadline for the correct todo item
        
        // Find the corresponding .todo-deadline span and update it with the new deadline
        const todoItem = document.querySelectorAll('.todo')[currentTodoIndex];
        const deadlineElement = todoItem.querySelector('.todo-deadline');

        if (deadlineElement) {
            // Update the deadline text immediately
            deadlineElement.innerText = "Deadline: " + selectedDate;
        }

        saveTodos();
        hideCalendarModal();
    }
}


document.querySelector('.calendar-days').addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('date')) {
        const selected = e.target;
        const selectedDate = selected.getAttribute('data-date');
        updateCalendar(selectedDate);
    }
});

document.querySelector('#confirm-date').addEventListener('click', function () {
    if (selectedDate) {
        updateCalendar(selectedDate);
    }
});

document.querySelector('#close-calendar').addEventListener('click', hideCalendarModal);

// Handle Month Navigation
document.getElementById('prev-month').addEventListener('click', function () {
    if (currentMonth > 0) {
        currentMonth--;
    } else {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', function () {
    if (currentMonth < 11) {
        currentMonth++;
    } else {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
});
