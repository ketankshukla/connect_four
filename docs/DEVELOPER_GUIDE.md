# Connect Four - Developer Guide

This guide provides detailed information for developers who want to understand, modify, or extend the Connect Four game.

## Project Architecture

The application follows a client-server architecture:

- **Backend**: Python Flask server that handles game logic and AI decision-making
- **Frontend**: HTML, CSS, and vanilla JavaScript for the user interface

### Directory Structure

```
connect_four/
├── docs/                   # Documentation
│   ├── USER_GUIDE.md       # Guide for users
│   ├── DEVELOPER_GUIDE.md  # This file
│   └── REFACTORING_GUIDE.md # Refactoring documentation
├── public/                 # Static files
│   ├── index.html          # Main HTML page
│   ├── style.css           # CSS styles
│   ├── script.js           # Compatibility layer
│   └── js/                 # JavaScript modules
│       ├── api-client.js   # API communication
│       ├── board.js        # Board rendering
│       ├── game-state.js   # Game state management
│       ├── ui-controller.js # UI interactions
│       └── main.js         # Application entry point
├── game_logic.py           # Core game mechanics
├── ai_engine.py            # AI logic and algorithms
├── api_routes.py           # Flask API endpoints
├── app.py                  # Application factory
├── index.py                # Entry point for Vercel
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel configuration
└── README.md               # Project overview
```

## Backend Implementation

The backend is built with Flask and follows a modular architecture with clear separation of concerns:

### Module Structure

- **app.py**: Contains the application factory function `create_app()` that configures and returns the Flask application
- **index.py**: Entry point for Vercel deployment that imports from app.py
- **game_logic.py**: Core game mechanics and state management in the `GameState` class
- **ai_engine.py**: AI logic and minimax algorithm in the `AIEngine` class
- **api_routes.py**: Flask Blueprint with all API endpoints

### API Endpoints

- **GET /api/state**: Retrieves the current game state
  - Response: JSON with board state, dimensions, game status

- **POST /api/move**: Makes a player move and triggers computer move
  - Request: JSON with `column` (0-6) indicating the column to drop a disc
  - Response: JSON with updated game state and computer's move

- **POST /api/reset**: Resets the game to its initial state
  - Response: JSON with fresh game state

### Game Logic (game_logic.py)

The core game logic is implemented in the `GameState` class and includes:

- **Board Representation**: 2D array (6×7) where empty cells are represented by empty strings, player discs by 'R' (Red), and computer discs by 'Y' (Yellow)

- **Game State Management**:
  - `check_winner()`: Determines if there's a winner or a draw
  - `is_valid_move()`: Checks if a move is valid (column not full)
  - `get_next_open_row()`: Finds the next open row in a given column
  - `make_move()`: Places a piece in the specified column
  - `get_state_dict()`: Returns a dictionary representation of the game state

### AI Implementation (ai_engine.py)

The AI logic is implemented in the `AIEngine` class:

- **Minimax Algorithm**:
  - `minimax()`: Implements the Minimax algorithm with Alpha-Beta pruning
  - `evaluate_window()`: Scores a window of 4 positions based on its pieces
  - `score_position()`: Evaluates the entire board position
  - `get_best_move()`: Determines the best move for the computer
  - `set_difficulty()`: Allows adjusting the AI difficulty by changing search depth

### AI Algorithm

The computer uses the Minimax algorithm with Alpha-Beta pruning:

1. It recursively explores possible future game states
2. It assigns scores to these states based on their favorability
3. It chooses the move that leads to the best outcome, assuming optimal play from both sides
4. Alpha-Beta pruning optimizes the search by skipping branches that won't affect the final decision

The evaluation function prioritizes:
- Center control (center column is valued higher)
- Potential connections (2-in-a-row, 3-in-a-row)
- Blocking player's potential connections
- Immediate winning moves

## Frontend Implementation

The frontend is built with vanilla JavaScript using ES6 modules for better organization and maintainability. It communicates with the backend via fetch API calls.

### Module Structure

- **main.js**: Entry point that initializes all modules and sets up event listeners
- **api-client.js**: Handles all communication with the backend API
- **game-state.js**: Manages the client-side game state
- **board.js**: Handles the rendering and visual aspects of the game board
- **ui-controller.js**: Manages user interactions and game flow
- **script.js**: Compatibility layer for backward compatibility

### Key Components

- **Board Representation**: 6×7 grid of cells with column selectors for input
- **Game State Management**: Tracks the current state locally and updates via API calls
- **UI Updates**: Reflects the current game state and provides visual feedback
- **Animations**: Includes visual feedback for moves and highlighting for winning positions

### Key Module Functions

#### api-client.js
- `fetchGameState()`: Gets the current game state from the server
- `makePlayerMove()`: Sends a player move to the server
- `resetGame()`: Requests a game reset from the server

#### game-state.js
- `initializeState()`: Sets up the initial game state
- `updateBoardFromFlatArray()`: Converts the flat board array to a 2D array
- `updateGameState()`: Updates the game state with server data
- `getState()`: Returns the current game state

#### board.js
- `initializeBoard()`: Sets up the game board
- `updateVisualBoard()`: Updates the visual representation of the board
- `updateColumnSelectors()`: Updates the column selectors based on game state
- `highlightWinningPositions()`: Highlights winning positions
- `setBoardEnabled()`: Enables or disables user interaction

#### ui-controller.js
- `initialize()`: Sets up the UI controller
- `handleColumnClick()`: Processes player moves
- `handleReset()`: Handles game reset
- `updateGameStatus()`: Updates the game status message

## Local Development Setup

### Prerequisites

- Python 3.9 or higher
- Git (optional)

### Setup Steps

1. Clone or download the repository
2. Create a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run the application:
   ```powershell
   python index.py
   ```
   This runs the Vercel-compatible entry point. Alternatively, you can run:
   ```powershell
   python app.py
   ```
5. Open your browser and navigate to:
   ```
   http://127.0.0.1:8080/
   ```

### Development Workflow

1. **Backend Changes**: Modify the appropriate module based on what you're changing:
   - Game mechanics: `game_logic.py`
   - AI algorithm: `ai_engine.py`
   - API endpoints: `api_routes.py`
   - Application configuration: `app.py`

2. **Frontend Changes**: Modify the appropriate module in the `public/js` directory:
   - API communication: `api-client.js`
   - Game state management: `game-state.js`
   - Board rendering: `board.js`
   - User interactions: `ui-controller.js`
   - Application initialization: `main.js`

## Deployment to Vercel

This application is configured for deployment on Vercel's serverless platform.

### Deployment Steps

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy from the project directory:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

### Vercel Configuration

The `vercel.json` file configures the deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.py"
    }
  ]
}
```

## Extending the Game

Here are some ideas for extending the game:

### Difficulty Levels

Add multiple difficulty levels by modifying the Minimax depth:
- Easy: Depth of 1-2
- Medium: Depth of 3
- Hard: Depth of 4-5

Example implementation:
```python
def computer_move():
    # Adjust this value to change difficulty
    depth = 4  # Hard: 4-5, Medium: 3, Easy: 1-2
    col, _ = minimax(depth, float('-inf'), float('inf'), True)
    # ...
```

### Two-Player Mode

Add an option to play against another human instead of the computer:
1. Add a toggle in the UI
2. Modify the backend to handle two human players
3. Update the frontend to not expect automatic computer moves

### Game Statistics

Track and display statistics:
1. Add a database or local storage for game results
2. Track wins, losses, and draws
3. Display statistics in the UI

## Troubleshooting

### Common Issues

- **Module not found errors**: Ensure you've activated the virtual environment
- **Port already in use**: Change the port in `index.py` if 8080 is already taken
- **CORS issues**: These shouldn't occur in local development but may need configuration for certain deployment scenarios

## Performance Considerations

- **Minimax Depth**: Increasing the depth makes the AI stronger but significantly increases computation time
- **Board Evaluation**: The evaluation function is critical for AI performance
- **Caching**: Consider implementing transposition tables to cache previously evaluated positions

## Contributing

When contributing to this project:

1. Follow the existing code style
2. Test thoroughly before submitting changes
3. Document any new features or API changes
4. Update this guide if necessary
