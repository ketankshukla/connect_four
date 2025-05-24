"""
Connect Four Game Logic Module
Contains the core game mechanics and state management
"""

# Game constants
ROWS = 6
COLS = 7
EMPTY = ""
PLAYER = "R"  # Red
COMPUTER = "Y"  # Yellow

class GameState:
    """Class to manage the game state"""
    def __init__(self):
        self.reset()
    
    def reset(self):
        """Reset the game to its initial state"""
        self.board = [[EMPTY for _ in range(COLS)] for _ in range(ROWS)]
        self.game_over = False
        self.winner = None
        self.winning_positions = []  # To store the positions of the winning discs
        self.player_vs_computer = True
    
    def is_valid_move(self, col):
        """Check if a move is valid (column not full)"""
        return self.board[0][col] == EMPTY
    
    def get_next_open_row(self, col):
        """Find the next open row in the given column"""
        for r in range(ROWS-1, -1, -1):
            if self.board[r][col] == EMPTY:
                return r
        return -1
    
    def make_move(self, col, piece):
        """Place a piece in the specified column"""
        row = self.get_next_open_row(col)
        if row != -1:
            self.board[row][col] = piece
            return row
        return -1
    
    def check_winner(self):
        """Check if there's a winner or a draw"""
        # Reset winning positions
        self.winning_positions = []
        
        # Check horizontal locations
        for r in range(ROWS):
            for c in range(COLS-3):
                if self.board[r][c] != EMPTY and self.board[r][c] == self.board[r][c+1] == self.board[r][c+2] == self.board[r][c+3]:
                    self.winner = self.board[r][c]
                    self.game_over = True
                    self.winning_positions = [(r, c), (r, c+1), (r, c+2), (r, c+3)]
                    return
        
        # Check vertical locations
        for c in range(COLS):
            for r in range(ROWS-3):
                if self.board[r][c] != EMPTY and self.board[r][c] == self.board[r+1][c] == self.board[r+2][c] == self.board[r+3][c]:
                    self.winner = self.board[r][c]
                    self.game_over = True
                    self.winning_positions = [(r, c), (r+1, c), (r+2, c), (r+3, c)]
                    return
        
        # Check positively sloped diagonals
        for r in range(ROWS-3):
            for c in range(COLS-3):
                if self.board[r][c] != EMPTY and self.board[r][c] == self.board[r+1][c+1] == self.board[r+2][c+2] == self.board[r+3][c+3]:
                    self.winner = self.board[r][c]
                    self.game_over = True
                    self.winning_positions = [(r, c), (r+1, c+1), (r+2, c+2), (r+3, c+3)]
                    return
        
        # Check negatively sloped diagonals
        for r in range(3, ROWS):
            for c in range(COLS-3):
                if self.board[r][c] != EMPTY and self.board[r][c] == self.board[r-1][c+1] == self.board[r-2][c+2] == self.board[r-3][c+3]:
                    self.winner = self.board[r][c]
                    self.game_over = True
                    self.winning_positions = [(r, c), (r-1, c+1), (r-2, c+2), (r-3, c+3)]
                    return
        
        # Check for draw (board full)
        is_full = True
        for c in range(COLS):
            if self.board[0][c] == EMPTY:
                is_full = False
                break
        
        if is_full:
            self.winner = "Draw"
            self.game_over = True
    
    def is_terminal_node(self):
        """Check if the game is over"""
        return self.game_over or all(self.board[0][c] != EMPTY for c in range(COLS))
    
    def get_state_dict(self):
        """Get a dictionary representation of the game state"""
        flat_board = []
        for row in self.board:
            flat_board.extend(row)
        
        return {
            "board": flat_board,
            "rows": ROWS,
            "cols": COLS,
            "gameOver": self.game_over,
            "winner": self.winner,
            "winningPositions": self.winning_positions,
            "playerVsComputer": self.player_vs_computer
        }
