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
        updateVisualBoard();
        
        // Update column selectors (disable full columns)
        updateColumnSelectors();
    }
    
    // Update just the visual representation of the board
    function updateVisualBoard() {
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
    }
    
    // Update the column selectors (disable full columns)
    function updateColumnSelectors() {
        for (let c = 0; c < cols; c++) {
            const isColumnFull = boardState[0][c] !== '';
            columnSelectors[c].classList.toggle('disabled', isColumnFull || gameOver);
        }
    }
    
    // Update the game status message and highlight winning positions if any
    function updateGameStatus(gameState) {
        if (gameState.gameOver) {
            if (gameState.winner === 'Draw') {
                statusDiv.textContent = "It's a draw!";
            } else if (isPlayerVsComputer) {
                statusDiv.textContent = gameState.winner === 'R' ? 'You win!' : 'Computer wins!';
                
                // Highlight winning positions if available
                if (gameState.winningPositions && gameState.winningPositions.length > 0) {
                    highlightWinningPositions(gameState.winningPositions, gameState.winner);
                }
            } else {
                statusDiv.textContent = `Player ${gameState.winner} wins!`;
                
                // Highlight winning positions if available
                if (gameState.winningPositions && gameState.winningPositions.length > 0) {
                    highlightWinningPositions(gameState.winningPositions, gameState.winner);
                }
            }
        } else {
            if (isPlayerVsComputer) {
                statusDiv.textContent = 'Your turn'; // Player is always X
            } else {
                statusDiv.textContent = `Player ${localCurrentPlayer}'s turn`;
            }
            
            // Remove any existing winning highlights
            removeWinningHighlights();
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
            
            // Store the board state but don't update the visual board yet
            // We'll update it after animations
            boardState = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    const index = r * cols + c;
                    row.push(gameState.board[index]);
                }
                boardState.push(row);
            }
            
            // Update game status
            gameOver = gameState.gameOver;
            
            // Animate player's move
            if (gameState.playerMoveRow !== undefined && gameState.playerMoveCol !== undefined) {
                // Remove the piece from the board state temporarily for animation
                const originalValue = boardState[gameState.playerMoveRow][gameState.playerMoveCol];
                boardState[gameState.playerMoveRow][gameState.playerMoveCol] = '';
                updateVisualBoard(); // Update the board without the player's piece
                
                // Animate the player's disc dropping
                await animateDiscDrop(gameState.playerMoveRow, gameState.playerMoveCol, 'R');
                
                // Restore the board state
                boardState[gameState.playerMoveRow][gameState.playerMoveCol] = originalValue;
            }
            
            // Update game status after player's move
            updateGameStatus(gameState);
            
            // If computer made a move, animate it after a small delay
            if (gameState.computerMoved && 
                gameState.computerMoveRow !== undefined && 
                gameState.computerMoveCol !== undefined) {
                
                // Add a small delay before computer's move
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Don't show any preview - skip directly to animation
                // We'll keep the original value in the board state
                const originalValue = boardState[gameState.computerMoveRow][gameState.computerMoveCol];
                
                // Animate the computer's disc dropping
                await animateDiscDrop(gameState.computerMoveRow, gameState.computerMoveCol, 'Y');
                
                // Restore the board state
                boardState[gameState.computerMoveRow][gameState.computerMoveCol] = originalValue;
                
                // Update game status again after computer's move
                gameOver = gameState.gameOver;
                updateGameStatus(gameState);
            }
            
            // Final update of the board and column selectors
            updateVisualBoard();
            updateColumnSelectors();
            setBoardEnabled(true);
        } catch (error) {
            console.error("Failed to make move:", error);
            statusDiv.textContent = `Error: ${error.message}`;
            setBoardEnabled(true);
        }
    }
    
    // Animate a disc dropping from the top to its position
    function animateDiscDrop(row, col, pieceType) {
        return new Promise(resolve => {
            // Create a temporary disc element for the animation
            const tempDisc = document.createElement('div');
            tempDisc.className = `temp-disc`;
            
            // Set the proper color based on piece type
            if (pieceType === 'R') {
                tempDisc.style.backgroundColor = '#FF6B6B'; // Red
            } else if (pieceType === 'Y') {
                tempDisc.style.backgroundColor = '#FFD43B'; // Yellow
            }
            
            document.body.appendChild(tempDisc);
            
            // Get positions for animation
            const boardRect = boardDiv.getBoundingClientRect();
            const cellRect = cells[row][col].getBoundingClientRect();
            const selectorRect = columnSelectors[col].getBoundingClientRect();
            
            // Position the temp disc at the top of the column
            tempDisc.style.left = `${selectorRect.left + selectorRect.width/2 - 30}px`;
            tempDisc.style.top = `${selectorRect.top + selectorRect.height}px`;
            
            // Start the dropping animation
            setTimeout(() => {
                // Animate to final position
                tempDisc.style.top = `${cellRect.top + cellRect.height/2 - 30}px`;
                tempDisc.style.left = `${cellRect.left + cellRect.width/2 - 30}px`;
                
                // When animation completes, update the actual cell and remove temp disc
                setTimeout(() => {
                    // Update the actual cell
                    cells[row][col].classList.add(pieceType);
                    cells[row][col].classList.add('highlight');
                    
                    // Set the cell background color directly
                    if (pieceType === 'R') {
                        cells[row][col].style.backgroundColor = '#FF6B6B'; // Red
                    } else if (pieceType === 'Y') {
                        cells[row][col].style.backgroundColor = '#FFD43B'; // Yellow
                    }
                    
                    // Remove the temporary disc
                    document.body.removeChild(tempDisc);
                    
                    // Remove highlight after a delay
                    setTimeout(() => {
                        cells[row][col].classList.remove('highlight');
                        resolve(); // Resolve the promise when animation is complete
                    }, 500);
                }, 500); // Match this to the CSS animation duration
            }, 50);
        });
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
            
            // Remove any winning highlights
            removeWinningHighlights();
            
            setBoardEnabled(true);
        } catch (error) {
            console.error("Failed to reset game:", error);
            statusDiv.textContent = `Error: ${error.message}`;
            setBoardEnabled(true);
        }
    }
    
    // Preview functionality has been completely removed
    
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
        
        // Preview functionality has been completely removed
    }
    
    // Highlight winning positions by changing their color to green
    function highlightWinningPositions(positions, winner) {
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
    
    // Transition the winning discs to green with animation
    function animateWinningDiscs() {
        // This function is no longer needed as we're changing colors directly
        // The CSS animation will handle the visual effect
    }
    
    // Remove any existing winning highlights
    function removeWinningHighlights() {
        // Remove winner class from all cells
        document.querySelectorAll('.cell.winner').forEach(cell => {
            cell.classList.remove('winner');
            
            // Restore original cell color if it exists
            if (cell.dataset.originalColor) {
                cell.style.backgroundColor = cell.dataset.originalColor;
                delete cell.dataset.originalColor;
            } else if (cell.classList.contains('R')) {
                cell.style.backgroundColor = '#FF6B6B'; // Red
            } else if (cell.classList.contains('Y')) {
                cell.style.backgroundColor = '#FFD43B'; // Yellow
            } else {
                cell.style.backgroundColor = '#3c3c3c'; // Default background
            }
        });
    }
});
