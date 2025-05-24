/**
 * Connect Four Game State Module
 * Manages the game state and provides methods to update it
 */

// Default game state
const defaultState = {
    boardState: [],
    rows: 6,
    cols: 7,
    gameOver: false,
    isPlayerVsComputer: true,
    winner: null,
    winningPositions: []
};

// Current game state
let state = { ...defaultState };

/**
 * Initialize the game state with data from the server
 * @param {Object} gameState - The game state from the server
 */
export function initializeState(gameState) {
    state.rows = gameState.rows;
    state.cols = gameState.cols;
    state.gameOver = gameState.gameOver;
    state.isPlayerVsComputer = gameState.playerVsComputer;
    state.winner = gameState.winner;
    state.winningPositions = gameState.winningPositions || [];
    
    // Convert flat board to 2D array
    updateBoardFromFlatArray(gameState.board);
}

/**
 * Update the board state from a flat array
 * @param {Array} flatBoard - The flat board array from the server
 */
export function updateBoardFromFlatArray(flatBoard) {
    state.boardState = [];
    
    // Convert flat array to 2D array
    for (let r = 0; r < state.rows; r++) {
        const row = [];
        for (let c = 0; c < state.cols; c++) {
            const index = r * state.cols + c;
            row.push(flatBoard[index]);
        }
        state.boardState.push(row);
    }
}

/**
 * Update the game state with data from the server
 * @param {Object} gameState - The game state from the server
 */
export function updateGameState(gameState) {
    state.gameOver = gameState.gameOver;
    state.winner = gameState.winner;
    state.winningPositions = gameState.winningPositions || [];
    
    // Update board if provided
    if (gameState.board) {
        updateBoardFromFlatArray(gameState.board);
    }
}

/**
 * Check if a column is full
 * @param {number} column - The column index to check
 * @returns {boolean} True if the column is full
 */
export function isColumnFull(column) {
    return state.boardState[0][column] !== '';
}

/**
 * Get the current game state
 * @returns {Object} The current game state
 */
export function getState() {
    return { ...state };
}

/**
 * Get the cell value at the specified position
 * @param {number} row - The row index
 * @param {number} col - The column index
 * @returns {string} The cell value
 */
export function getCellValue(row, col) {
    return state.boardState[row][col];
}

/**
 * Reset the game state to default values
 */
export function resetState() {
    state = { ...defaultState };
    state.boardState = Array(state.rows).fill().map(() => Array(state.cols).fill(''));
}
