"""
Connect Four API Routes Module
Contains the Flask API endpoints for the game
"""

import time
from flask import Blueprint, jsonify, request, send_from_directory
from game_logic import PLAYER, COMPUTER
from ai_engine import AIEngine

# Create a Blueprint for the API routes
api = Blueprint('api', __name__)

# Game state instance will be injected from app.py
game_state = None
ai_engine = None

def init_routes(game_state_instance):
    """Initialize the routes with the game state instance"""
    global game_state, ai_engine
    game_state = game_state_instance
    ai_engine = AIEngine(game_state)

@api.route('/state', methods=['GET'])
def get_state():
    """Get the current game state"""
    return jsonify(game_state.get_state_dict())

@api.route('/move', methods=['POST'])
def make_player_move():
    """Handle player move and computer response"""
    if game_state.game_over:
        return jsonify({"error": "Game is over"}), 400
    
    data = request.get_json()
    col = data.get('column')
    
    if col is None or not (0 <= col < 7):  # 7 is COLS from game_logic
        return jsonify({"error": "Invalid column"}), 400
    
    if not game_state.is_valid_move(col):
        return jsonify({"error": "Column is full"}), 400
    
    # Player's move
    player_row = game_state.make_move(col, PLAYER)
    game_state.check_winner()
    
    response = {
        "playerMoveRow": player_row,
        "playerMoveCol": col,
        "gameOver": game_state.game_over,
        "winner": game_state.winner,
        "computerMoved": False,
        "message": "Your move successful."
    }
    
    # If game is not over, make computer's move
    if not game_state.game_over and game_state.player_vs_computer:
        # Small delay to make it feel like the computer is "thinking"
        time.sleep(0.5)
        
        comp_col, comp_row = ai_engine.get_best_move()
        game_state.make_move(comp_col, COMPUTER)
        game_state.check_winner()
        
        response.update({
            "computerMoved": True,
            "computerMoveCol": comp_col,
            "computerMoveRow": comp_row
        })
    
    # Update response with final game state
    game_state_dict = game_state.get_state_dict()
    
    response.update({
        "board": game_state_dict["board"],
        "gameOver": game_state.game_over,
        "winner": game_state.winner,
        "winningPositions": game_state.winning_positions,
        "message": "Your turn." if not game_state.game_over else 
                  ("You win!" if game_state.winner == PLAYER else 
                   ("Computer wins!" if game_state.winner == COMPUTER else "It's a draw!"))
    })
    
    return jsonify(response)

@api.route('/reset', methods=['POST'])
def reset_game_endpoint():
    """Reset the game to its initial state"""
    game_state.reset()
    
    return jsonify(game_state.get_state_dict() | {
        "message": "Game reset. Your turn."
    })
