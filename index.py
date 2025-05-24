from flask import Flask, jsonify, request, send_from_directory
import os
import random
import time
import json

# Flask app configuration
app = Flask(__name__, static_folder='public', static_url_path='')

# Game constants
ROWS = 6
COLS = 7
EMPTY = ""
PLAYER = "R"  # Red
COMPUTER = "Y"  # Yellow

# Game state
board = [[EMPTY for _ in range(COLS)] for _ in range(ROWS)]
game_over = False
winner = None
winning_positions = []  # To store the positions of the winning discs
player_vs_computer = True

def reset_game_state():
    """Reset the game to its initial state"""
    global board, game_over, winner, winning_positions
    board = [[EMPTY for _ in range(COLS)] for _ in range(ROWS)]
    game_over = False
    winner = None
    winning_positions = []

def is_valid_move(col):
    """Check if a move is valid (column not full)"""
    return board[0][col] == EMPTY

def get_next_open_row(col):
    """Find the next open row in the given column"""
    for r in range(ROWS-1, -1, -1):
        if board[r][col] == EMPTY:
            return r
    return -1

def make_move(col, piece):
    """Place a piece in the specified column"""
    row = get_next_open_row(col)
    if row != -1:
        board[row][col] = piece
        return row
    return -1

def check_winner():
    """Check if there's a winner or a draw"""
    global game_over, winner, winning_positions
    
    # Reset winning positions
    winning_positions = []
    
    # Check horizontal locations
    for r in range(ROWS):
        for c in range(COLS-3):
            if board[r][c] != EMPTY and board[r][c] == board[r][c+1] == board[r][c+2] == board[r][c+3]:
                winner = board[r][c]
                game_over = True
                winning_positions = [(r, c), (r, c+1), (r, c+2), (r, c+3)]
                return

    # Check vertical locations
    for c in range(COLS):
        for r in range(ROWS-3):
            if board[r][c] != EMPTY and board[r][c] == board[r+1][c] == board[r+2][c] == board[r+3][c]:
                winner = board[r][c]
                game_over = True
                winning_positions = [(r, c), (r+1, c), (r+2, c), (r+3, c)]
                return

    # Check positively sloped diagonals
    for r in range(ROWS-3):
        for c in range(COLS-3):
            if board[r][c] != EMPTY and board[r][c] == board[r+1][c+1] == board[r+2][c+2] == board[r+3][c+3]:
                winner = board[r][c]
                game_over = True
                winning_positions = [(r, c), (r+1, c+1), (r+2, c+2), (r+3, c+3)]
                return

    # Check negatively sloped diagonals
    for r in range(3, ROWS):
        for c in range(COLS-3):
            if board[r][c] != EMPTY and board[r][c] == board[r-1][c+1] == board[r-2][c+2] == board[r-3][c+3]:
                winner = board[r][c]
                game_over = True
                winning_positions = [(r, c), (r-1, c+1), (r-2, c+2), (r-3, c+3)]
                return
    
    # Check for draw (board full)
    is_full = True
    for c in range(COLS):
        if board[0][c] == EMPTY:
            is_full = False
            break
    
    if is_full:
        winner = "Draw"
        game_over = True

def evaluate_window(window, piece):
    """Score a window of 4 positions based on its pieces"""
    opponent_piece = PLAYER if piece == COMPUTER else COMPUTER
    
    if window.count(piece) == 4:
        return 100
    elif window.count(piece) == 3 and window.count(EMPTY) == 1:
        return 5
    elif window.count(piece) == 2 and window.count(EMPTY) == 2:
        return 2
    elif window.count(opponent_piece) == 3 and window.count(EMPTY) == 1:
        return -4  # Block opponent
    
    return 0

def score_position(piece):
    """Score the entire board position for the given piece"""
    score = 0
    
    # Score center column (preferred position)
    center_col = COLS // 2
    center_count = sum(1 for r in range(ROWS) if board[r][center_col] == piece)
    score += center_count * 3
    
    # Score horizontal windows
    for r in range(ROWS):
        for c in range(COLS-3):
            window = [board[r][c+i] for i in range(4)]
            score += evaluate_window(window, piece)
    
    # Score vertical windows
    for c in range(COLS):
        for r in range(ROWS-3):
            window = [board[r+i][c] for i in range(4)]
            score += evaluate_window(window, piece)
    
    # Score positively sloped diagonal windows
    for r in range(ROWS-3):
        for c in range(COLS-3):
            window = [board[r+i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)
    
    # Score negatively sloped diagonal windows
    for r in range(3, ROWS):
        for c in range(COLS-3):
            window = [board[r-i][c+i] for i in range(4)]
            score += evaluate_window(window, piece)
    
    return score

def is_terminal_node():
    """Check if the game is over"""
    return game_over or all(board[0][c] != EMPTY for c in range(COLS))

def minimax(depth, alpha, beta, maximizing_player):
    """Minimax algorithm with alpha-beta pruning for computer's move"""
    global winner, game_over
    
    if depth == 0 or is_terminal_node():
        if is_terminal_node():
            if winner == COMPUTER:
                return (None, 1000000)
            elif winner == PLAYER:
                return (None, -1000000)
            else:  # Draw
                return (None, 0)
        else:  # Depth is zero
            return (None, score_position(COMPUTER))
    
    if maximizing_player:
        value = float('-inf')
        column = random.choice([c for c in range(COLS) if is_valid_move(c)])
        
        for col in range(COLS):
            if is_valid_move(col):
                row = get_next_open_row(col)
                board[row][col] = COMPUTER
                
                old_winner, old_game_over = winner, game_over
                check_winner()
                
                new_score = minimax(depth-1, alpha, beta, False)[1]
                board[row][col] = EMPTY  # Undo move
                
                # Restore game state
                winner, game_over = old_winner, old_game_over
                
                if new_score > value:
                    value = new_score
                    column = col
                
                alpha = max(alpha, value)
                if alpha >= beta:
                    break
        
        return column, value
    
    else:  # Minimizing player
        value = float('inf')
        column = random.choice([c for c in range(COLS) if is_valid_move(c)])
        
        for col in range(COLS):
            if is_valid_move(col):
                row = get_next_open_row(col)
                board[row][col] = PLAYER
                
                old_winner, old_game_over = winner, game_over
                check_winner()
                
                new_score = minimax(depth-1, alpha, beta, True)[1]
                board[row][col] = EMPTY  # Undo move
                
                # Restore game state
                winner, game_over = old_winner, old_game_over
                
                if new_score < value:
                    value = new_score
                    column = col
                
                beta = min(beta, value)
                if alpha >= beta:
                    break
        
        return column, value

def computer_move():
    """Determine the best move for the computer"""
    global game_over, winner
    
    # For easier difficulty, use a lower depth
    # For harder difficulty, use a higher depth (3-5)
    depth = 4
    
    # If there's a winning move, take it
    for col in range(COLS):
        if is_valid_move(col):
            row = get_next_open_row(col)
            board[row][col] = COMPUTER
            check_winner()
            if game_over and winner == COMPUTER:
                # Undo the check but keep the move
                game_over, winner = False, None
                return col, row
            # Undo move
            board[row][col] = EMPTY
    
    # If player can win next move, block it
    for col in range(COLS):
        if is_valid_move(col):
            row = get_next_open_row(col)
            board[row][col] = PLAYER
            check_winner()
            if game_over and winner == PLAYER:
                # Undo the check and the move
                game_over, winner = False, None
                board[row][col] = EMPTY
                # Make the blocking move
                row = get_next_open_row(col)
                board[row][col] = COMPUTER
                return col, row
            # Undo move
            board[row][col] = EMPTY
    
    # Use minimax for best move
    col, _ = minimax(depth, float('-inf'), float('inf'), True)
    row = get_next_open_row(col)
    board[row][col] = COMPUTER
    return col, row

# Flask routes
@app.route('/')
def serve_index():
    """Serve the main HTML page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    """Serve static files from the public folder"""
    return send_from_directory(app.static_folder, filename)

@app.route('/api/state', methods=['GET'])
def get_state():
    """Get the current game state"""
    flat_board = []
    for row in board:
        flat_board.extend(row)
    
    return jsonify({
        "board": flat_board,
        "rows": ROWS,
        "cols": COLS,
        "gameOver": game_over,
        "winner": winner,
        "winningPositions": winning_positions,
        "playerVsComputer": player_vs_computer
    })

@app.route('/api/move', methods=['POST'])
def make_player_move():
    """Handle player move and computer response"""
    global game_over, winner
    
    if game_over:
        return jsonify({"error": "Game is over"}), 400
    
    data = request.get_json()
    col = data.get('column')
    
    if col is None or not (0 <= col < COLS):
        return jsonify({"error": "Invalid column"}), 400
    
    if not is_valid_move(col):
        return jsonify({"error": "Column is full"}), 400
    
    # Player's move
    player_row = make_move(col, PLAYER)
    check_winner()
    
    response = {
        "playerMoveRow": player_row,
        "playerMoveCol": col,
        "gameOver": game_over,
        "winner": winner,
        "computerMoved": False,
        "message": "Your move successful."
    }
    
    # If game is not over, make computer's move
    if not game_over and player_vs_computer:
        # Small delay to make it feel like the computer is "thinking"
        time.sleep(0.5)
        
        comp_col, comp_row = computer_move()
        check_winner()
        
        response.update({
            "computerMoved": True,
            "computerMoveCol": comp_col,
            "computerMoveRow": comp_row
        })
    
    # Update response with final game state
    flat_board = []
    for row in board:
        flat_board.extend(row)
    
    response.update({
        "board": flat_board,
        "gameOver": game_over,
        "winner": winner,
        "winningPositions": winning_positions,
        "message": "Your turn." if not game_over else 
                  ("You win!" if winner == PLAYER else 
                   ("Computer wins!" if winner == COMPUTER else "It's a draw!"))
    })
    
    return jsonify(response)

@app.route('/api/reset', methods=['POST'])
def reset_game_endpoint():
    """Reset the game to its initial state"""
    reset_game_state()
    
    flat_board = []
    for row in board:
        flat_board.extend(row)
    
    return jsonify({
        "board": flat_board,
        "rows": ROWS,
        "cols": COLS,
        "gameOver": game_over,
        "winner": winner,
        "winningPositions": winning_positions,
        "playerVsComputer": player_vs_computer,
        "message": "Game reset. Your turn."
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
