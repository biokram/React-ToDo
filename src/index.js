// import _ from 'lodash';
import './style.css';

// import from src modules
import display from './methods.js';
import Interactive from './interactive.js';
import Filters from './filters.js';

const inputList = document.getElementById('inputList');
const addList = document.getElementById('addList');

// Initialize filters
Filters.initializeFilters();

// Handle form submission
inputList.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addList.value.trim()) {
    display.addLists(addList.value);
    addList.value = '';
  }
});

// Handle clear completed tasks
document.querySelector('#btnClear').addEventListener('click', Interactive.clearCompletedToDoLists);

// Setup event listeners
window.addEventListener('load', () => {
  document.addEventListener('listUpdated', () => {
    Interactive.checkStatusEvent();
    Filters.updateCounts();
  }, false);
  Interactive.checkStatusEvent();
});

// Initialize with current filter
display.showFilteredLists(Filters.getCurrentFilter());