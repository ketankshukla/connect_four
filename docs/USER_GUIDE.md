# Connect Four - User Guide

Welcome to Connect Four! This guide will help you understand how to play the game and make the most of its features.

## Game Overview

Connect Four is a classic two-player connection game where you play against a computer opponent. The game features:

- You play as Red, the computer plays as Yellow
- A 7-column by 6-row grid
- Strategic AI opponent that uses advanced algorithms to challenge you
- Animated disc dropping and visual feedback
- Python-themed interface with responsive design

## How to Play

1. **Starting the Game**
   - When you open the game, you'll see a 7×6 grid
   - You always play as Red and go first
   - The computer plays as Yellow

2. **Making a Move**
   - Click on any column to drop your disc
   - The disc will fall to the lowest available position in that column
   - The computer will automatically make its move after yours
   - The computer's move will be highlighted with an animation

3. **Winning the Game**
   - Connect four of your discs (Red) in a row - horizontally, vertically, or diagonally - to win
   - If the computer connects four Yellow discs in a row, you lose
   - If all 42 positions are filled without a winner, the game is a draw

4. **Resetting the Game**
   - Click the "Reset Game" button at any time to start a new game
   - You can reset even if the current game isn't finished

## Game Strategy Tips

- **Control the Center**: The center column is strategically valuable as it provides more ways to connect four
- **Block the Opponent**: Watch for situations where the computer has three in a row and block the fourth position
- **Plan Ahead**: Try to create multiple threats where you have more than one way to connect four
- **Watch for Diagonal Wins**: Diagonal connections can be harder to spot, so pay special attention to them
- **Forced Moves**: If you can force the computer to play in a specific column, you can set up winning sequences

## Understanding the Computer AI

The computer opponent uses a strategic algorithm called Minimax with Alpha-Beta pruning to make decisions. This means:

- It can look several moves ahead
- It will always block your winning moves if possible
- It will take winning moves when available
- It evaluates the board position to make the best strategic choice

## Troubleshooting

If you encounter any issues:

- Make sure your browser is up to date
- Try refreshing the page if the game becomes unresponsive
- Check your internet connection if playing the deployed version
- Clear your browser cache if you experience unusual behavior

Enjoy playing Connect Four!

## Technical Note

This game has been refactored to use a modular architecture for better performance and maintainability. The refactoring doesn't change any gameplay features but makes the code more organized and easier to maintain. For more details, see the `REFACTORING_GUIDE.md` in the docs folder.
