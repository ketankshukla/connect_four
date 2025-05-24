/**
 * Connect Four Main Module
 * Entry point for the application
 */

import * as UiController from './ui-controller.js';
import * as Board from './board.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const boardDiv = document.getElementById('board');
    const statusDiv = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');
    const columnSelectors = document.querySelectorAll('.column-selector');
    
    // Initialize the board
    Board.initializeBoard(boardDiv, columnSelectors);
    
    // Initialize the UI controller
    UiController.initialize(statusDiv, resetButton, columnSelectors);
});
