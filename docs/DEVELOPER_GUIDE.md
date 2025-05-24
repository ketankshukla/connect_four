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
│   └── DEVELOPER_GUIDE.md  # This file
├── public/                 # Static files
│   ├── index.html          # Main HTML page
│   ├── script.js           # Client-side JavaScript
│   └── style.css           # CSS styles
├── index.py                # Flask application
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel configuration
└── README.md               # Project overview
```

## Backend Implementation

The backend is built with Flask and provides the following API endpoints:

### API Endpoints

- **GET /api/state**: Retrieves the current game state
  - Response: JSON with board state, dimensions, game status

- **POST /api/move**: Makes a player move and triggers computer move
  - Request: JSON with `column` (0-6) indicating the column to drop a disc
  - Response: JSON with updated game state and computer's move

- **POST /api/reset**: Resets the game to its initial state
  - Response: JSON with fresh game state

### Game Logic

The core game logic is implemented in `index.py` and includes:

- **Board Representation**: 2D array (6×7) where empty cells are represented by empty strings, player discs by 'R' (Red), and computer discs by 'Y' (Yellow)

- **Game State Management**:
  - `check_winner()`: Determines if there's a winner or a draw
  - `is_valid_move()`: Checks if a move is valid (column not full)
  - `get_next_open_row()`: Finds the next open row in a given column
  - `make_move()`: Places a piece in the specified column

- **AI Implementation**:
  - `minimax()`: Implements the Minimax algorithm with Alpha-Beta pruning
  - `evaluate_window()`: Scores a window of 4 positions based on its pieces
  - `score_position()`: Evaluates the entire board position
  - `computer_move()`: Determines the best move for the computer

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

The frontend is built with vanilla JavaScript and communicates with the backend via fetch API calls.

### Key Components

- **Board Representation**: 6×7 grid of cells with column selectors for input
- **Game State Management**: Tracks the current state locally and updates via API calls
- **UI Updates**: Reflects the current game state and provides visual feedback
- **Animations**: Includes dropping animations and highlighting for recent moves

### JavaScript Functions

- `initializeGame()`: Sets up the game board and fetches initial state
- `createBoard()`: Creates the DOM elements for the game board
- `fetchGameState()`: Gets the current game state from the server
- `handleColumnClick()`: Processes player moves and updates the UI
- `handleReset()`: Resets the game
- `updateBoardFromState()`: Updates the visual board based on game state
- `highlightCell()`: Provides visual feedback for recent moves

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
5. Open your browser and navigate to:
   ```
   http://127.0.0.1:8080/
   ```

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
