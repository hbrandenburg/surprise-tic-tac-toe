/**
 * @jest-environment jsdom
 */

describe('Game Engine Core Logic', () => {
  // Mock the basic game logic for testing
  class MockGameEngine {
    constructor() {
      this.board = new Array(25).fill(null);
      this.currentPlayer = 'X';
      this.gameActive = true;
      this.timeLeft = 60;
    }

    checkWin() {
      const size = 5;
      const winLength = 4;
      
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const index = row * size + col;
          const player = this.board[index];
          
          if (!player) continue;
          
          // Check horizontal
          if (col <= size - winLength) {
            let count = 0;
            for (let i = 0; i < winLength; i++) {
              if (this.board[row * size + col + i] === player) {
                count++;
              }
            }
            if (count === winLength) return player;
          }
          
          // Check vertical
          if (row <= size - winLength) {
            let count = 0;
            for (let i = 0; i < winLength; i++) {
              if (this.board[(row + i) * size + col] === player) {
                count++;
              }
            }
            if (count === winLength) return player;
          }
          
          // Check diagonal (down-right)
          if (row <= size - winLength && col <= size - winLength) {
            let count = 0;
            for (let i = 0; i < winLength; i++) {
              if (this.board[(row + i) * size + col + i] === player) {
                count++;
              }
            }
            if (count === winLength) return player;
          }
          
          // Check diagonal (down-left)
          if (row <= size - winLength && col >= winLength - 1) {
            let count = 0;
            for (let i = 0; i < winLength; i++) {
              if (this.board[(row + i) * size + col - i] === player) {
                count++;
              }
            }
            if (count === winLength) return player;
          }
        }
      }
      return null;
    }

    isBoardFull() {
      return this.board.every(cell => cell !== null);
    }

    countPieces() {
      const counts = { X: 0, O: 0 };
      this.board.forEach(cell => {
        if (cell) counts[cell]++;
      });
      return counts;
    }

    getTimeoutWinner() {
      const counts = this.countPieces();
      if (counts.X > counts.O) return 'X';
      if (counts.O > counts.X) return 'O';
      return 'tie';
    }

    makeMove(index) {
      if (!this.gameActive || this.board[index] !== null) {
        return false;
      }
      
      this.board[index] = this.currentPlayer;
      
      const winner = this.checkWin();
      if (winner) {
        this.gameActive = false;
        return true;
      }
      
      if (this.isBoardFull()) {
        this.gameActive = false;
        return true;
      }
      
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      return true;
    }
  }

  let game;

  beforeEach(() => {
    game = new MockGameEngine();
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(game.board).toHaveLength(25);
      expect(game.board.every(cell => cell === null)).toBe(true);
      expect(game.currentPlayer).toBe('X');
      expect(game.gameActive).toBe(true);
      expect(game.timeLeft).toBe(60);
    });
  });

  describe('Win Detection', () => {
    test('should detect horizontal win', () => {
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'X';
      game.board[3] = 'X';
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect vertical win', () => {
      game.board[0] = 'X';  // (0,0)
      game.board[5] = 'X';  // (1,0)
      game.board[10] = 'X'; // (2,0)
      game.board[15] = 'X'; // (3,0)
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect diagonal win (down-right)', () => {
      game.board[0] = 'X';  // (0,0)
      game.board[6] = 'X';  // (1,1)
      game.board[12] = 'X'; // (2,2)
      game.board[18] = 'X'; // (3,3)
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect diagonal win (down-left)', () => {
      game.board[3] = 'X';  // (0,3)
      game.board[7] = 'X';  // (1,2)
      game.board[11] = 'X'; // (2,1)
      game.board[15] = 'X'; // (3,0)
      
      expect(game.checkWin()).toBe('X');
    });

    test('should not detect win with only 3 in a row', () => {
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'X';
      
      expect(game.checkWin()).toBe(null);
    });

    test('should detect win for player O', () => {
      game.board[0] = 'O';
      game.board[1] = 'O';
      game.board[2] = 'O';
      game.board[3] = 'O';
      
      expect(game.checkWin()).toBe('O');
    });
  });

  describe('Board State', () => {
    test('should detect full board', () => {
      for (let i = 0; i < 25; i++) {
        game.board[i] = i % 2 === 0 ? 'X' : 'O';
      }
      
      expect(game.isBoardFull()).toBe(true);
    });

    test('should detect non-full board', () => {
      game.board[0] = 'X';
      game.board[1] = 'O';
      
      expect(game.isBoardFull()).toBe(false);
    });

    test('should count pieces correctly', () => {
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'O';
      
      const counts = game.countPieces();
      expect(counts).toEqual({ X: 2, O: 1 });
    });
  });

  describe('Game Logic', () => {
    test('should place piece and switch players', () => {
      const result = game.makeMove(0);
      
      expect(result).toBe(true);
      expect(game.board[0]).toBe('X');
      expect(game.currentPlayer).toBe('O');
    });

    test('should not allow move on occupied cell', () => {
      game.makeMove(0);
      const result = game.makeMove(0);
      
      expect(result).toBe(false);
      expect(game.board[0]).toBe('X');
    });

    test('should not allow moves when game is inactive', () => {
      game.gameActive = false;
      const result = game.makeMove(0);
      
      expect(result).toBe(false);
      expect(game.board[0]).toBe(null);
    });
  });

  describe('Timeout Logic', () => {
    test('should determine timeout winner correctly', () => {
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'O';
      
      const winner = game.getTimeoutWinner();
      expect(winner).toBe('X');
    });

    test('should handle timeout tie', () => {
      game.board[0] = 'X';
      game.board[1] = 'O';
      
      const winner = game.getTimeoutWinner();
      expect(winner).toBe('tie');
    });
  });

  describe('Edge Cases', () => {
    test('should handle winning on last move', () => {
      // Set up a winning condition
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'X';
      
      const result = game.makeMove(3);
      
      expect(result).toBe(true);
      expect(game.gameActive).toBe(false);
    });

    test('should handle board full condition', () => {
      // Fill board almost completely
      for (let i = 0; i < 24; i++) {
        game.board[i] = i % 2 === 0 ? 'X' : 'O';
      }
      
      const result = game.makeMove(24);
      
      expect(result).toBe(true);
      expect(game.gameActive).toBe(false);
    });
  });
});