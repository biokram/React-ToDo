// Filter functionality
import display from './methods.js';

export default class Filters {
  static initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const currentFilter = localStorage.getItem('currentFilter') || 'all';

    // Set initial active state
    filterButtons.forEach(button => {
      if (button.getAttribute('data-filter') === currentFilter) {
        button.classList.add('active');
      }
      
      // Add click handlers
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Save filter state
        localStorage.setItem('currentFilter', filter);
        
        // Apply filter
        display.showFilteredLists(filter);
      });
    });
  }

  static getCurrentFilter() {
    return localStorage.getItem('currentFilter') || 'all';
  }

  static updateCounts() {
    // Removed count functionality
  }
}