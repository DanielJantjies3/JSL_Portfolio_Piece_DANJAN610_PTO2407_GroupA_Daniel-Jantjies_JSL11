import { getTasks, createNewTask, patchTask, deleteTask } from './utils/taskFunctions.js';// TASK: import helper functions from utils
import { initialData } from './initialData.js'; // TASK : import initial data


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true')
  } 
  if (!localStorage.getItem('activeBoard')) {
    localStorage.setItem('activeBoard', JSON.stringify(activeBoard));
  }
}

// TASK: Get elements from the DOM
const elements = {

  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  createNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.getElementsByClassName('.edit-task-modal-window'),
  filterDiv: document.getElementById('filter-div'),
};

let activeBoard = "Agile Board";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ==null ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      elements.headerBoardName.textContent = board;

      
      //filterAndDisplayTasksByBoard(board);
      refreshTasksUI();

      
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    // column.innerHTML = `<div class="column-head-div">
    //                       <span class="dot" id="${status}-dot"></span>
    //                       <h4 class="columnHeader">${status.toUpperCase()}</h4>
    //                     </div>`;

    //Refactoring header lines above
    const header = column.querySelector(".column-head-div");
    column.innerHTML = '';
    column.appendChild(header); // Keep original header

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add('tasks-container');
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => openEditTaskModal(task));
      tasksContainer.appendChild(taskElement);

    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => {

    btn.classList.toggle('active', btn.textContent === boardName);

    // if (btn.textContent === boardName) {
    //   btn.classList.add('active');
    // }
    // else {
    //   btn.classList.remove('active');
    // }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]');
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  taskElement.addEventListener('click', () => openEditTaskModal(task));

  tasksContainer.appendChild();
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('click', () => toggleTheme());

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modalElement = element.modalWindow) {
  modalElement.style.display = show ? 'block' : 'none';

  //filter div added
  elements.filterDiv.style.display = show ? 'block' : 'none';
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object
  const task = {
    title: document.getElementById('title-input').value,// removed prefix "task"
    description: document.getElementById('desc-input').value,
    status: document.getElementById('select-status').value,
    board: activeBoard,
    id: new Date().getTime(),

  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  sidebar.style.display = show ? 'block' : 'none';
  localStorage.setItem('showSideBar', show ? 'true' : 'false');
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}



function openEditTaskModal(task) {
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-status-select').value = task.status;

  // Set task details in modal inputs
  document.getElementById('edit-task-desc-input').value = task.description;


  // Get button elements from the task modal


  // Call saveTaskChanges upon click of Save Changes button

  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  saveChangesBtn.onclick = () => saveTaskChanges(task.id);


  // Delete task using a helper function and close the task modal

  const deleteTaskbtn = document.getElementById('delete-task-btn');
  deleteTaskbtn.onclick = () => deleteTaskFromModal(task.id);


  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTask = {
    title: document.getElementById('edit-task-title-input').value,
    status: document.getElementById('edit-task-status-select').value,
    description: document.getElementById('edit-task-desc-input').value
  };

  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes

  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  

  //test code
  document.body.classList.toggle('light-theme', isLightTheme);

  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  
  document.body.classList.toggle('light-theme', isLightTheme);
  
}