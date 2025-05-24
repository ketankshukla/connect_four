document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const boardDiv = document.getElementById('board');
    const statusDiv = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');
    const columnSelectors = document.querySelectorAll('.column-selector');
    
    // Game state variables
    let boardState = [];
    let rows = 6;
    let cols = 7;
    let gameOver = false;
    let isPlayerVsComputer = true;
    let cells = [];
    
    // Initialize the game
    initializeGame();
    
    // Event listeners
    resetButton.addEventListener('click', handleReset);
    columnSelectors.forEach(selector => {
        // Click event for dropping a disc
        selector.addEventListener('click', () => {
            if (!gameOver) {
                const column = parseInt(selector.getAttribute('data-column'));
                handleColumnClick(column);
            }
        });
        
        // Hover events to show preview
        selector.addEventListener('mouseenter', () => {
            if (!gameOver) {
                const column = parseInt(selector.getAttribute('data-column'));
                showDiscPreview(column);
            }
        });
        
        selector.addEventListener('mouseleave', () => {
            hideDiscPreview();
        });
    });
    
    // Initialize the game board and fetch initial state
    async function initializeGame() {
        await fetchGameState();
    }
    
    // Create the board cells in the DOM
    function createBoard() {
        boardDiv.innerHTML = '';
        cells = [];
        
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
    
    // Fetch the current game state from the server
    async function fetchGameState() {
        try {
            setBoardEnabled(false);
            const response = await fetch('/api/state');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const gameState = await response.json();
            
            // Update local variables
            rows = gameState.rows;
            cols = gameState.cols;
            gameOver = gameState.gameOver;
            isPlayerVsComputer = gameState.playerVsComputer;
            
            // Create board if it doesn't exist
            if (boardDiv.children.length === 0) {
                createBoard();
            }
            
            // Update the board with the current state
            updateBoardFromState(gameState.board);
            
            // Update game status
            updateGameStatus(gameState);
            
            setBoardEnabled(true);
        } catch (error) {
            console.error("Failed to fetch game state:", error);
            statusDiv.textContent = 'Error connecting to server.';
        }
    }
    
    // Update the board display based on the game state
    function updateBoardFromState(flatBoard) {
        boardState = [];
        
        // Convert flat array to 2D array
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const index = r * cols + c;
                row.push(flatBoard[index]);
            }
            boardState.push(row);
        }
        
        // Update the visual board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = cells[r][c];
                cell.className = 'cell';
                
                if (boardState[r][c] === 'R') {
                    cell.classList.add('R');
                } else if (boardState[r][c] === 'Y') {
                    cell.classList.add('Y');
                }
            }
        }
        
        // Update column selectors (disable full columns)
        updateColumnSelectors();
    }
    
    // Update the column selectors (disable full columns)
    function updateColumnSelectors() {
        for (let c = 0; c < cols; c++) {
            const isColumnFull = boardState[0][c] !== '';
            columnSelectors[c].classList.toggle('disabled', isColumnFull || gameOver);
        }
    }
    
    // Update the game status message
    function updateGameStatus(gameState) {
        if (gameState.gameOver) {
            if (gameState.winner === 'Draw') {
                statusDiv.textContent = "It's a draw!";
            } else if (gameState.winner === 'R') {
                statusDiv.textContent = 'You win!';
            } else if (gameState.winner === 'Y') {
                statusDiv.textContent = 'Computer wins!';
            }
        } else {
            statusDiv.textContent = 'Your turn';
        }
    }
    
    // Handle a column click (player move)
    async function handleColumnClick(column) {
        if (gameOver) return;
        
        // Check if column is full
        if (boardState[0][column] !== '') {
            return;
        }
        
        try {
            setBoardEnabled(false);
            
            const response = await fetch('/api/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ column: column }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const gameState = await response.json();
            
            // Update the board with player's move
            updateBoardFromState(gameState.board);
            
            // Highlight player's move
            if (gameState.playerMoveRow !== undefined && gameState.playerMoveCol !== undefined) {
                highlightCell(gameState.playerMoveRow, gameState.playerMoveCol, 'R');
            }
            
            // Update game status
            gameOver = gameState.gameOver;
            updateGameStatus(gameState);
            
            // If computer made a move, highlight it
            if (gameState.computerMoved && 
                gameState.computerMoveRow !== undefined && 
                gameState.computerMoveCol !== undefined) {
                
                // Add a small delay to make the computer move more visible
                setTimeout(() => {
                    highlightCell(gameState.computerMoveRow, gameState.computerMoveCol, 'Y');
                    
                    // Update game status again after computer's move
                    gameOver = gameState.gameOver;
                    updateGameStatus(gameState);
                    updateColumnSelectors();
                }, 500);
            }
            
            setBoardEnabled(true);
        } catch (error) {
            console.error("Failed to make move:", error);
            statusDiv.textContent = `Error: ${error.message}`;
            setBoardEnabled(true);
        }
    }
    
    // Highlight a cell (for recent moves)
    function highlightCell(row, col, pieceType) {
        const cell = cells[row][col];
        cell.classList.add('highlight');
        
        // Add dropping animation
        cell.classList.add('dropping');
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            cell.classList.remove('highlight');
            cell.classList.remove('dropping');
        }, 1000);
    }
    
    // Handle game reset
    async function handleReset() {
        try {
            setBoardEnabled(false);
            
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const gameState = await response.json();
            
            // Update the board with the reset state
            gameOver = gameState.gameOver;
            updateBoardFromState(gameState.board);
            updateGameStatus(gameState);
            
            setBoardEnabled(true);
        } catch (error) {
            console.error("Failed to reset game:", error);
            statusDiv.textContent = `Error: ${error.message}`;
            setBoardEnabled(true);
        }
    }
    
    // Show a preview of where the disc would be dropped
    function showDiscPreview(column) {
        if (boardState[0][column] !== '') return; // Column is full
        
        // Find the lowest empty cell in the column
        let row = -1;
        for (let r = rows-1; r >= 0; r--) {
            if (boardState[r][column] === '') {
                row = r;
                break;
            }
        }
        
        if (row !== -1) {
            const cell = cells[row][column];
            cell.classList.add('preview-red');
        }
    }
    
    // Hide the disc preview
    function hideDiscPreview() {
        document.querySelectorAll('.preview-red').forEach(cell => {
            cell.classList.remove('preview-red');
        });
    }
    
    // Enable or disable the board
    function setBoardEnabled(enabled) {
        // Visual indicator that the board is disabled
        boardDiv.style.opacity = enabled ? '1' : '0.7';
        
        // Disable/enable column selectors
        columnSelectors.forEach(selector => {
            selector.style.pointerEvents = enabled ? 'auto' : 'none';
        });
        
        // Disable/enable reset button
        resetButton.disabled = !enabled;
        
        // Hide any preview when disabled
        if (!enabled) {
            hideDiscPreview();
        }
    }
});
