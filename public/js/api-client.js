/**
 * Connect Four API Client Module
 * Handles all communication with the backend API
 */

/**
 * Fetch the current game state from the server
 * @returns {Promise<Object>} The game state object
 */
export async function fetchGameState() {
    try {
        const response = await fetch('/api/state');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch game state:", error);
        throw error;
    }
}

/**
 * Make a player move at the specified column
 * @param {number} column - The column index (0-based)
 * @returns {Promise<Object>} The updated game state
 */
export async function makePlayerMove(column) {
    try {
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
        
        return await response.json();
    } catch (error) {
        console.error("Failed to make move:", error);
        throw error;
    }
}

/**
 * Reset the game to its initial state
 * @returns {Promise<Object>} The reset game state
 */
export async function resetGame() {
    try {
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
        
        return await response.json();
    } catch (error) {
        console.error("Failed to reset game:", error);
        throw error;
    }
}
