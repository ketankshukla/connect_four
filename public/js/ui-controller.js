/**
 * Connect Four UI Controller Module
 * Handles user interactions and game flow
 */

import * as ApiClient from './api-client.js';
import * as GameState from './game-state.js';
import * as Board from './board.js';

// DOM elements
let statusDiv;
let resetButton;

/**
 * Initialize the UI controller
 * @param {HTMLElement} statusElement - The status display element
 * @param {HTMLElement} resetButtonElement - The reset button element
 * @param {NodeList} columnSelectors - The column selector elements
 */
export function initialize(statusElement, resetButtonElement, columnSelectors) {
    statusDiv = statusElement;
    resetButton = resetButtonElement;
    
    // Set up event listeners
    setupEventListeners(columnSelectors);
    
    // Initialize the game
    initializeGame();
}

/**
 * Set up event listeners for user interactions
 * @param {NodeList} columnSelectors - The column selector elements
 */
function setupEventListeners(columnSelectors) {
    // Reset button event listener
    resetButton.addEventListener('click', handleReset);
    
    // Column selectors event listeners
    columnSelectors.forEach(selector => {
        selector.addEventListener('click', () => {
            const state = GameState.getState();
            if (!state.gameOver) {
                const column = parseInt(selector.getAttribute('data-column'));
                handleColumnClick(column);
            }
        });
    });
}

/**
 * Initialize the game by fetching the initial state
 */
async function initializeGame() {
    try {
        Board.setBoardEnabled(false);
        const gameState = await ApiClient.fetchGameState();
        
        // Initialize the game state
        GameState.initializeState(gameState);
        
        // Update the board
        Board.updateVisualBoard();
        Board.updateColumnSelectors();
        
        // Update game status
        updateGameStatus(gameState);
        
        Board.setBoardEnabled(true);
    } catch (error) {
        console.error("Failed to initialize game:", error);
        statusDiv.textContent = 'Error connecting to server.';
    }
}

/**
 * Handle a column click (player move)
 * @param {number} column - The column index
 */
async function handleColumnClick(column) {
    const state = GameState.getState();
    if (state.gameOver) return;
    
    // Check if column is full
    if (GameState.isColumnFull(column)) {
        return;
    }
    
    try {
        Board.setBoardEnabled(false);
        
        const gameState = await ApiClient.makePlayerMove(column);
        
        // Update the game state
        GameState.updateBoardFromFlatArray(gameState.board);
        GameState.updateGameState(gameState);
        
        // Player's move - update the cell directly
        if (gameState.playerMoveRow !== undefined && gameState.playerMoveCol !== undefined) {
            Board.updateCell(gameState.playerMoveRow, gameState.playerMoveCol, 'R');
        }
        
        // Update game status after player's move
        updateGameStatus(gameState);
        
        // Computer's move - update the cell directly after a short delay
        if (gameState.computerMoved && 
            gameState.computerMoveRow !== undefined && 
            gameState.computerMoveCol !== undefined) {
            
            // Add a small delay between player and computer moves
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Update the cell directly
            Board.updateCell(gameState.computerMoveRow, gameState.computerMoveCol, 'Y');
            
            // Update game status after computer's move
            GameState.updateGameState(gameState);
            updateGameStatus(gameState);
        }
        
        // Final update of the board and column selectors
        Board.updateVisualBoard();
        Board.updateColumnSelectors();
        Board.setBoardEnabled(true);
    } catch (error) {
        console.error("Failed to make move:", error);
        statusDiv.textContent = `Error: ${error.message}`;
        Board.setBoardEnabled(true);
    }
}

/**
 * Handle game reset
 */
async function handleReset() {
    try {
        Board.setBoardEnabled(false);
        
        const gameState = await ApiClient.resetGame();
        
        // Update the game state
        GameState.initializeState(gameState);
        
        // Update the board with the reset state
        Board.updateVisualBoard(true);
        Board.updateColumnSelectors();
        
        // Update game status
        updateGameStatus(gameState);
        
        Board.setBoardEnabled(true);
    } catch (error) {
        console.error("Failed to reset game:", error);
        statusDiv.textContent = `Error: ${error.message}`;
        Board.setBoardEnabled(true);
    }
}

/**
 * Update the game status message and highlight winning positions if any
 * @param {Object} gameState - The current game state
 */
function updateGameStatus(gameState) {
    const state = GameState.getState();
    
    if (gameState.gameOver) {
        if (gameState.winner === 'Draw') {
            statusDiv.textContent = "It's a draw!";
        } else if (state.isPlayerVsComputer) {
            statusDiv.textContent = gameState.winner === 'R' ? 'You win!' : 'Computer wins!';
            
            // Highlight winning positions if available
            if (gameState.winningPositions && gameState.winningPositions.length > 0) {
                Board.highlightWinningPositions(gameState.winningPositions);
            }
        } else {
            statusDiv.textContent = `Player ${gameState.winner} wins!`;
            
            // Highlight winning positions if available
            if (gameState.winningPositions && gameState.winningPositions.length > 0) {
                Board.highlightWinningPositions(gameState.winningPositions);
            }
        }
    } else {
        if (state.isPlayerVsComputer) {
            statusDiv.textContent = 'Your turn'; // Player is always Red
        } else {
            statusDiv.textContent = `Player ${state.currentPlayer}'s turn`;
        }
    }
}
