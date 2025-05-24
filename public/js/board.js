/**
 * Connect Four Board Module
 * Handles the rendering and visual aspects of the game board
 */

import { getState, getCellValue } from './game-state.js';

// DOM elements
let boardDiv;
let cells = [];
let columnSelectors = [];

/**
 * Initialize the board module
 * @param {HTMLElement} boardElement - The board container element
 * @param {NodeList} selectors - The column selector elements
 */
export function initializeBoard(boardElement, selectors) {
    boardDiv = boardElement;
    columnSelectors = selectors;
    createBoard();
}

/**
 * Create the board cells in the DOM
 */
function createBoard() {
    boardDiv.innerHTML = '';
    cells = [];
    
    const { rows, cols } = getState();
    
    // Create cells in reverse order (bottom to top) to match the backend representation
    for (let r = 0; r < rows; r++) {
        const rowCells = [];
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-row', r);
            cell.setAttribute('data-col', c);
            boardDiv.appendChild(cell);
            rowCells.push(cell);
        }
        cells.push(rowCells);
    }
}

/**
 * Update the visual board based on the current game state
 * @param {boolean} isReset - Whether this is a full reset
 */
export function updateVisualBoard(isReset = false) {
    const { rows, cols } = getState();
    
    // During reset, we need to completely clear the board
    if (isReset) {
        // Complete reset - clear all cells including winning highlights
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = cells[r][c];
                
                // Reset all properties and classes
                cell.className = 'cell';
                cell.style.backgroundColor = '#3c3c3c'; // Reset to default background
                
                // Remove any data attributes
                if (cell.dataset.originalColor) {
                    delete cell.dataset.originalColor;
                }
                
                // Remove winner class
                cell.classList.remove('winner');
            }
        }
    } else {
        // Normal update - preserve winning cells
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = cells[r][c];
                
                // Skip cells that are already marked as winners
                if (cell.classList.contains('winner')) {
                    continue;
                }
                
                // Reset non-winning cells
                cell.className = 'cell';
                cell.style.backgroundColor = '#3c3c3c'; // Reset to default background
                
                // Add appropriate class based on board state
                const cellValue = getCellValue(r, c);
                if (cellValue === 'R') {
                    cell.classList.add('R');
                    cell.style.backgroundColor = '#FF6B6B'; // Red
                } else if (cellValue === 'Y') {
                    cell.classList.add('Y');
                    cell.style.backgroundColor = '#FFD43B'; // Yellow
                }
            }
        }
    }
}

/**
 * Update the column selectors (disable full columns)
 */
export function updateColumnSelectors() {
    const { cols, gameOver } = getState();
    
    for (let c = 0; c < cols; c++) {
        const isColumnFull = getCellValue(0, c) !== '';
        columnSelectors[c].classList.toggle('disabled', isColumnFull || gameOver);
    }
}

/**
 * Highlight winning positions by changing their color to green
 * @param {Array} positions - Array of [row, col] positions to highlight
 */
export function highlightWinningPositions(positions) {
    // Remove any previous winning highlights
    removeWinningHighlights();
    
    if (!positions || positions.length < 1) return;
    
    // Add winner class to the winning cells to make them pulse and appear green
    positions.forEach(pos => {
        const row = pos[0];
        const col = pos[1];
        const cell = cells[row][col];
        
        // Add winner class for pulsing effect
        cell.classList.add('winner');
        
        // Change the cell background color to green directly
        cell.style.backgroundColor = '#32CD32'; // Lime green
        
        // Store the original color for reset
        if (cell.classList.contains('R')) {
            cell.dataset.originalColor = '#FF6B6B'; // Red
        } else if (cell.classList.contains('Y')) {
            cell.dataset.originalColor = '#FFD43B'; // Yellow
        }
    });
}

/**
 * Remove any existing winning highlights
 */
export function removeWinningHighlights() {
    const { rows, cols } = getState();
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = cells[r][c];
            if (cell.classList.contains('winner')) {
                cell.classList.remove('winner');
                
                // Restore original color if available
                if (cell.dataset.originalColor) {
                    cell.style.backgroundColor = cell.dataset.originalColor;
                    delete cell.dataset.originalColor;
                } else {
                    cell.style.backgroundColor = '#3c3c3c'; // Default color
                }
            }
        }
    }
}

/**
 * Enable or disable the board
 * @param {boolean} enabled - Whether the board should be enabled
 */
export function setBoardEnabled(enabled) {
    // Disable/enable column selectors
    columnSelectors.forEach(selector => {
        selector.style.pointerEvents = enabled ? 'auto' : 'none';
    });
}

/**
 * Update a specific cell to show a player or computer move
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @param {string} player - 'R' for player, 'Y' for computer
 */
export function updateCell(row, col, player) {
    const cell = cells[row][col];
    cell.classList.add(player);
    
    if (player === 'R') {
        cell.style.backgroundColor = '#FF6B6B'; // Red
    } else if (player === 'Y') {
        cell.style.backgroundColor = '#FFD43B'; // Yellow
    }
}
