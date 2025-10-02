// import from src modules folder
import DataList from './datalist.js';

export default class display {
  static getToDoListFromStorage = () => {
    let toDoLists;
    try {
      toDoLists = JSON.parse(localStorage.getItem('LocalDataList')) || [];
    } catch (error) {
      this.handleError(error);
      toDoLists = [];
    }
    return toDoLists;
  };

  // add listed inputs to the local storage
  static addListToStorage = (toDoLists) => {
    const item = JSON.stringify(toDoLists);
    localStorage.setItem('LocalDataList', item);
  };

  // index list inputs by number
  static newIndexNum = (toDoLists) => {
    toDoLists.forEach((item, i) => {
      item.index = i + 1;
    });
  }

  // delete from local storage
    static deleteListData = (id) => {
      let toDoLists = this.getToDoListFromStorage();
      const ListItemToDelete = toDoLists[id];

      toDoLists = toDoLists.filter((item) => item !== ListItemToDelete);

      this.newIndexNum(toDoLists);
      this.addListToStorage(toDoLists);
    };

    static ListInputUpdate = (newDescription, id) => {
      const toDoLists = this.getToDoListFromStorage();
      const updateList = toDoLists[id];

      toDoLists.forEach((item) => {
        if (item === updateList) {
          item.description = newDescription;
        }
      });

      this.addListToStorage(toDoLists);
      const currentFilter = localStorage.getItem('currentFilter') || 'all';
      this.showFilteredLists(currentFilter);
    };

    static removeToDoListBtn = () => {
      document.querySelectorAll('.remove_btn').forEach((button) => button.addEventListener('click', (event) => {
        event.preventDefault();
        let id;
        if (button.id > 0) {
          id = button.id - 1;
        } else {
          id = 0;
        }
        this.deleteListData(id);
        const currentFilter = localStorage.getItem('currentFilter') || 'all';
        this.showFilteredLists(currentFilter);
      }));
    };

    // section created dynamiclly
    static toDoListsHtml = ({ description, index }, statusCheck, statusCompleted) => {
      const ul = document.createElement('ul');
      ul.className = 'to-do';
      ul.innerHTML = `
        <li><input class="checkbox" id="${index}" type="checkbox" ${statusCheck}></li> 
        <li><input id="LIST${index}" type="text" class="text${statusCompleted}" value="${description}" readonly></li>
        <li class="remove-edit">
        <button class="edit_list_btn" id="${index}" title="Edit task"><i class="fa fa-edit icon"></i></button>
        <button class="remove_btn" id="${index}" title="Delete task"><i class="fa fa-trash icon"></i></button>
        </li>
      `;
      return ul;
    }

    // show filtered tasks
  static showFilteredLists = (filter = 'all') => {
    const toDoLists = this.getToDoListFromStorage();
    const container = document.querySelector('.toDoListContainer');
    container.innerHTML = '';
    
    // Filter tasks based on the selected filter
    const filteredLists = filter === 'active' ? 
      toDoLists.filter(item => !item.completed) :
      filter === 'completed' ?
      toDoLists.filter(item => item.completed) :
      toDoLists;

    // Update task counts
    const counts = {
      all: toDoLists.length,
      active: toDoLists.filter(item => !item.completed).length,
      completed: toDoLists.filter(item => item.completed).length
    };
    
    this.updateFilterCounts(counts);

    // Render filtered tasks
    filteredLists.forEach((item) => {
      const statusCheck = item.completed ? 'checked' : '';
      const statusCompleted = item.completed ? 'completed' : '';
      container.appendChild(this.toDoListsHtml(item, statusCheck, statusCompleted));
    });

    this.removeToDoListBtn();
    this.editListBtnEvent();
    this.updateListBtnEvent();

    const event = new Event('listUpdated');
    document.dispatchEvent(event);
    };

    // add a task to a list
    static addLists = (description) => {
      const toDoLists = this.getToDoListFromStorage();
      const index = toDoLists.length + 1;
      const newList = {
        description,
        completed: false,
        index,
        editing: false
      };
      toDoLists.push(newList);
      this.addListToStorage(toDoLists);
      const currentFilter = localStorage.getItem('currentFilter') || 'all';
      this.showFilteredLists(currentFilter);
    };

    // update to do list
    static updateListBtnEvent = () => {
      document.querySelectorAll('.text').forEach((input) => input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const inputListId = 'LIST';
          const ListIdSelected = event.currentTarget.id;
          let listID;

          if (!ListIdSelected.includes('LIST')) {
            listID = inputListId.concat(ListIdSelected);
          } else {
            listID = ListIdSelected;
          }

          document.getElementById(listID).setAttribute('readonly', 'readonly');
          this.ListInputUpdate(document.getElementById(listID).value, (Number(listID.replace('LIST', '')) - 1));
        }
      }));
    }

  // edit list
  static editListBtnEvent = () => {
    let previousList = null;
    let currentEditingId = null;
    
    document.querySelectorAll('.edit_list_btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const editButton = event.currentTarget;
        const taskId = editButton.id;
        currentEditingId = taskId;
        
        const listID = `LIST${taskId}`;
        const input = document.getElementById(listID);
        const listItem = editButton.closest('li');
        const ulItem = editButton.closest('ul');

        // Reset previous edit state if exists
        if (previousList) {
          const prevInput = previousList.querySelector('input[type="text"]');
          if (prevInput) {
            prevInput.setAttribute('readonly', 'readonly');
            prevInput.style.background = '';
          }
          previousList.style.background = '';
        }

        // Set new edit state
        previousList = ulItem;
        listItem.style.background = 'rgb(230, 230, 184)';
        ulItem.style.background = 'rgb(230, 230, 184)';
        
        if (input) {
          input.removeAttribute('readonly');
          input.focus();
          input.style.background = 'rgb(230, 230, 184)';
          
          // Remove any existing event listeners
          const newInput = input.cloneNode(true);
          input.parentNode.replaceChild(newInput, input);
          
          // Add keyboard event listeners with stored ID
          newInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newInput.value.trim()) {
                this.ListInputUpdate(newInput.value.trim(), currentEditingId - 1);
                newInput.setAttribute('readonly', 'readonly');
                newInput.style.background = '';
                listItem.querySelector('.edit_list_btn').style.display = 'block';
                listItem.querySelector('.remove_btn').style.display = 'none';
              }
            } else if (e.key === 'Escape') {
              newInput.value = newInput.defaultValue;
              newInput.setAttribute('readonly', 'readonly');
              newInput.style.background = '';
              listItem.style.background = '';
              ulItem.style.background = '';
              listItem.querySelector('.edit_list_btn').style.display = 'block';
              listItem.querySelector('.remove_btn').style.display = 'none';
            }
          });
        }
        
        listItem.querySelector('.edit_list_btn').style.display = 'none';
        listItem.querySelector('.remove_btn').style.display = 'block';
      });
    });
  };

  static toggleEdit = (id) => {
    const toDoLists = this.getToDoListFromStorage();
    toDoLists[id].editing = !toDoLists[id].editing;
    this.addListToStorage(toDoLists);
    const currentFilter = localStorage.getItem('currentFilter') || 'all';
    this.showFilteredLists(currentFilter);
  };

  // Improved filter implementation with persistence and counts
  static filterTasks = (filter) => {
    try {
      const toDoLists = this.getToDoListFromStorage();
      localStorage.setItem('currentFilter', filter);
      
      const filteredTasks = filter === 'active' ? 
        toDoLists.filter(item => !item.completed) :
        filter === 'completed' ?
        toDoLists.filter(item => item.completed) :
        toDoLists;
      
      const counts = {
        all: toDoLists.length,
        active: toDoLists.filter(item => !item.completed).length,
        completed: toDoLists.filter(item => item.completed).length
      };
      
      this.updateFilterCounts(counts);
      return filteredTasks;
    } catch (error) {
      this.handleError(error);
      return [];
    }
  };

  static updateFilterCounts = (counts) => {
    Object.entries(counts).forEach(([filter, count]) => {
      const btn = document.querySelector(`[data-filter="${filter}"]`);
      if (btn) {
        btn.dataset.count = count;
        btn.setAttribute('aria-label', `${filter} tasks (${count})`);
      }
    });
  };

  // Performance optimization
  static debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };
}