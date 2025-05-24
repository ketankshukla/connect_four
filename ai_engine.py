"""
Connect Four AI Engine Module
Contains the AI logic and minimax algorithm for the computer player
"""

import random
from game_logic import ROWS, COLS, EMPTY, PLAYER, COMPUTER

class AIEngine:
    """Class to handle AI decision making"""
    def __init__(self, game_state):
        self.game_state = game_state
        self.depth = 4  # Default difficulty level
    
    def set_difficulty(self, depth):
        """Set the AI difficulty by adjusting search depth"""
        self.depth = depth
    
    def evaluate_window(self, window, piece):
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
    
    def score_position(self, board, piece):
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
                score += self.evaluate_window(window, piece)
        
        # Score vertical windows
        for c in range(COLS):
            for r in range(ROWS-3):
                window = [board[r+i][c] for i in range(4)]
                score += self.evaluate_window(window, piece)
        
        # Score positively sloped diagonal windows
        for r in range(ROWS-3):
            for c in range(COLS-3):
                window = [board[r+i][c+i] for i in range(4)]
                score += self.evaluate_window(window, piece)
        
        # Score negatively sloped diagonal windows
        for r in range(3, ROWS):
            for c in range(COLS-3):
                window = [board[r-i][c+i] for i in range(4)]
                score += self.evaluate_window(window, piece)
        
        return score
    
    def minimax(self, board, depth, alpha, beta, maximizing_player, game_over, winner):
        """Minimax algorithm with alpha-beta pruning for computer's move"""
        # Check if terminal node or max depth reached
        if depth == 0 or game_over or all(board[0][c] != EMPTY for c in range(COLS)):
            if game_over:
                if winner == COMPUTER:
                    return (None, 1000000)
                elif winner == PLAYER:
                    return (None, -1000000)
                else:  # Draw
                    return (None, 0)
            else:  # Depth is zero
                return (None, self.score_position(board, COMPUTER))
        
        if maximizing_player:
            value = float('-inf')
            valid_columns = [c for c in range(COLS) if board[0][c] == EMPTY]
            column = random.choice(valid_columns) if valid_columns else 0
            
            for col in range(COLS):
                if board[0][col] == EMPTY:  # Is valid move
                    # Create a copy of the board and game state
                    temp_board = [row[:] for row in board]
                    
                    # Find the next open row
                    row = -1
                    for r in range(ROWS-1, -1, -1):
                        if temp_board[r][col] == EMPTY:
                            row = r
                            break
                    
                    if row == -1:
                        continue
                    
                    # Make the move
                    temp_board[row][col] = COMPUTER
                    
                    # Check if this move results in a win
                    temp_game_over, temp_winner = self._check_winner_for_minimax(temp_board, row, col)
                    
                    # Recursive minimax call
                    new_score = self.minimax(temp_board, depth-1, alpha, beta, False, temp_game_over, temp_winner)[1]
                    
                    if new_score > value:
                        value = new_score
                        column = col
                    
                    alpha = max(alpha, value)
                    if alpha >= beta:
                        break
            
            return column, value
        
        else:  # Minimizing player
            value = float('inf')
            valid_columns = [c for c in range(COLS) if board[0][c] == EMPTY]
            column = random.choice(valid_columns) if valid_columns else 0
            
            for col in range(COLS):
                if board[0][col] == EMPTY:  # Is valid move
                    # Create a copy of the board and game state
                    temp_board = [row[:] for row in board]
                    
                    # Find the next open row
                    row = -1
                    for r in range(ROWS-1, -1, -1):
                        if temp_board[r][col] == EMPTY:
                            row = r
                            break
                    
                    if row == -1:
                        continue
                    
                    # Make the move
                    temp_board[row][col] = PLAYER
                    
                    # Check if this move results in a win
                    temp_game_over, temp_winner = self._check_winner_for_minimax(temp_board, row, col)
                    
                    # Recursive minimax call
                    new_score = self.minimax(temp_board, depth-1, alpha, beta, True, temp_game_over, temp_winner)[1]
                    
                    if new_score < value:
                        value = new_score
                        column = col
                    
                    beta = min(beta, value)
                    if alpha >= beta:
                        break
            
            return column, value
    
    def _check_winner_for_minimax(self, board, row, col):
        """Check if the last move at (row, col) resulted in a win"""
        # Get the piece at the position
        piece = board[row][col]
        if piece == EMPTY:
            return False, None
        
        # Check horizontal
        for c in range(max(0, col-3), min(col+1, COLS-3)):
            if board[row][c] == piece and board[row][c+1] == piece and board[row][c+2] == piece and board[row][c+3] == piece:
                return True, piece
        
        # Check vertical
        if row <= ROWS-4:
            if board[row][col] == piece and board[row+1][col] == piece and board[row+2][col] == piece and board[row+3][col] == piece:
                return True, piece
        
        # Check positive diagonal
        for i in range(-3, 1):
            r, c = row+i, col+i
            if 0 <= r < ROWS-3 and 0 <= c < COLS-3:
                if (board[r][c] == piece and board[r+1][c+1] == piece and 
                    board[r+2][c+2] == piece and board[r+3][c+3] == piece):
                    return True, piece
        
        # Check negative diagonal
        for i in range(-3, 1):
            r, c = row+i, col-i
            if 0 <= r < ROWS-3 and 3 <= c < COLS:
                if (board[r][c] == piece and board[r+1][c-1] == piece and 
                    board[r+2][c-2] == piece and board[r+3][c-3] == piece):
                    return True, piece
        
        # Check for draw
        is_full = True
        for c in range(COLS):
            if board[0][c] == EMPTY:
                is_full = False
                break
        
        if is_full:
            return True, "Draw"
        
        return False, None
    
    def get_best_move(self):
        """Determine the best move for the computer"""
        board = self.game_state.board
        
        # If there's a winning move, take it
        for col in range(COLS):
            if self.game_state.is_valid_move(col):
                row = self.game_state.get_next_open_row(col)
                
                # Create a temporary board copy
                temp_board = [row[:] for row in board]
                temp_board[row][col] = COMPUTER
                
                # Check if this is a winning move
                game_over, winner = self._check_winner_for_minimax(temp_board, row, col)
                if game_over and winner == COMPUTER:
                    return col, row
        
        # If player can win next move, block it
        for col in range(COLS):
            if self.game_state.is_valid_move(col):
                row = self.game_state.get_next_open_row(col)
                
                # Create a temporary board copy
                temp_board = [row[:] for row in board]
                temp_board[row][col] = PLAYER
                
                # Check if player would win with this move
                game_over, winner = self._check_winner_for_minimax(temp_board, row, col)
                if game_over and winner == PLAYER:
                    return col, row
        
        # Use minimax for best move
        col, _ = self.minimax(
            board, 
            self.depth, 
            float('-inf'), 
            float('inf'), 
            True, 
            self.game_state.game_over, 
            self.game_state.winner
        )
        
        row = self.game_state.get_next_open_row(col)
        return col, row
