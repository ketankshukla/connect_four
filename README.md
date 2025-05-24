# Python Connect Four

A web-based Connect Four game where you play against a computer opponent with strategic AI. Built with Flask and vanilla JavaScript, and optimized for deployment on Vercel.

![Python Game](https://img.shields.io/badge/Python-Game-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)

## Features

- Player vs Computer gameplay with advanced AI using minimax algorithm
- Python-themed design with blue, red, and yellow color scheme
- Interactive gameplay with visual feedback and animations
- Computer player with strategic move selection and difficulty levels
- Responsive design that works on mobile and desktop
- Serverless architecture for easy deployment

## Project Structure

```
connect_four/
├── docs/                   # Documentation
│   ├── USER_GUIDE.md       # Guide for users
│   └── DEVELOPER_GUIDE.md  # Guide for developers
├── public/                 # Static files
│   ├── index.html          # Main HTML page
│   ├── script.js           # Client-side JavaScript
│   └── style.css           # CSS styles
├── index.py                # Flask application
├── requirements.txt        # Python dependencies
├── vercel.json             # Vercel configuration
└── README.md               # This file
```

## Documentation

- [User Guide](docs/USER_GUIDE.md) - Instructions for playing the game
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Guide for setting up and deploying the game

## Quick Start

### Prerequisites

- Python 3.9 or higher
- Git (optional)

### Local Development

1. Clone or download the repository:
   ```
   git clone <repository-url>
   cd connect_four
   ```

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

## Game Rules

- You play as Red, the computer plays as Yellow
- Players take turns dropping colored discs into a 7-column, 6-row grid
- The discs fall to the lowest available position in the selected column
- The first player to connect four discs of their color (horizontally, vertically, or diagonally) wins
- If the grid fills up without a winner, the game is a draw

## Deployment

This application is configured for easy deployment to Vercel. See the [Developer Guide](docs/DEVELOPER_GUIDE.md) for detailed deployment instructions.

## Customization

To modify the computer's AI difficulty:
1. Open `index.py`
2. Modify the `minimax` function's depth parameter in the `computer_move` function
   - Lower depth (1-2) for easier gameplay
   - Higher depth (4-5) for more challenging gameplay
3. Restart the server to apply changes

## License

MIT

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/) - The web framework used
- [Vercel](https://vercel.com/) - Deployment platform
