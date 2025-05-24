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
            
            // Remove any existing winning line
            removeWinningLine();
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
            hideDiscPreview(); // Hide any preview
            
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
                
                // Remove the piece from the board state temporarily for animation
                const originalValue = boardState[gameState.computerMoveRow][gameState.computerMoveCol];
                boardState[gameState.computerMoveRow][gameState.computerMoveCol] = '';
                updateVisualBoard(); // Update the board without the computer's piece
                
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
            tempDisc.className = `temp-disc ${pieceType}`;
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
            
            // Remove any winning line
            removeWinningLine();
            
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
    
    // Highlight winning positions by drawing a line through them
    function highlightWinningPositions(positions, winner) {
        // Remove any existing winning line
        removeWinningLine();
        
        if (!positions || positions.length < 2) return;
        
        // Create a canvas element for drawing the line
        const canvas = document.createElement('canvas');
        canvas.id = 'winning-line';
        canvas.className = 'winning-line';
        
        // Position the canvas over the board
        const boardRect = boardDiv.getBoundingClientRect();
        canvas.width = boardRect.width;
        canvas.height = boardRect.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none'; // So it doesn't interfere with clicks
        
        // Add the canvas to the board container
        const boardContainer = document.getElementById('board-container');
        boardContainer.style.position = 'relative'; // Ensure relative positioning for absolute child
        boardContainer.appendChild(canvas);
        
        // Get the context for drawing
        const ctx = canvas.getContext('2d');
        
        // Sort positions to ensure we draw from one end to the other
        // This is important for diagonal lines
        positions.sort((a, b) => {
            if (a[0] === b[0]) return a[1] - b[1]; // Sort by column if same row
            return a[0] - b[0]; // Otherwise sort by row
        });
        
        // Add winner class to the winning cells to make them pulse
        positions.forEach(pos => {
            const row = pos[0];
            const col = pos[1];
            cells[row][col].classList.add('winner');
        });
        
        // Get the coordinates of the first and last cells in the winning line
        const firstCell = cells[positions[0][0]][positions[0][1]].getBoundingClientRect();
        const lastCell = cells[positions[positions.length-1][0]][positions[positions.length-1][1]].getBoundingClientRect();
        
        // Calculate the center points relative to the canvas
        const startX = firstCell.left + firstCell.width/2 - boardRect.left;
        const startY = firstCell.top + firstCell.height/2 - boardRect.top;
        const endX = lastCell.left + lastCell.width/2 - boardRect.left;
        const endY = lastCell.top + lastCell.height/2 - boardRect.top;
        
        // Set line style based on winner
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        
        if (winner === 'R') {
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.8)'; // Red with opacity
        } else {
            ctx.strokeStyle = 'rgba(255, 212, 59, 0.8)'; // Yellow with opacity
        }
        
        // Draw the line with animation
        animateLine(ctx, startX, startY, endX, endY);
    }
    
    // Animate the drawing of the line
    function animateLine(ctx, startX, startY, endX, endY) {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const duration = 800; // milliseconds
        const speed = distance / duration;
        
        let progress = 0;
        let lastTimestamp = null;
        
        function draw(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const elapsed = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            
            progress += speed * elapsed;
            if (progress > distance) progress = distance;
            
            const ratio = progress / distance;
            const currentX = startX + dx * ratio;
            const currentY = startY + dy * ratio;
            
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            if (progress < distance) {
                requestAnimationFrame(draw);
            }
        }
        
        requestAnimationFrame(draw);
    }
    
    // Remove any existing winning line and winner classes
    function removeWinningLine() {
        // Remove the canvas line
        const existingLine = document.getElementById('winning-line');
        if (existingLine) {
            existingLine.parentNode.removeChild(existingLine);
        }
        
        // Remove winner class from all cells
        document.querySelectorAll('.cell.winner').forEach(cell => {
            cell.classList.remove('winner');
        });
    }
});
