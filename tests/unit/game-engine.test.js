/**
 * @jest-environment jsdom
 */

// Import the classes by executing the code
let GameEngine, SurpriseManager;

beforeAll(() => {
  // Mock DOM methods before evaluating the code
  global.document = {
    querySelector: jest.fn(() => ({ 
      classList: { add: jest.fn(), remove: jest.fn() },
      style: {},
      textContent: '',
      innerHTML: '',
      remove: jest.fn(),
      setAttribute: jest.fn()
    })),
    querySelectorAll: jest.fn(() => []),
    createElement: jest.fn(() => ({
      className: '',
      innerHTML: '',
      style: {},
      classList: { add: jest.fn(), remove: jest.fn() },
      remove: jest.fn()
    })),
    body: { appendChild: jest.fn() },
    addEventListener: jest.fn()
  };

  global.navigator = {
    serviceWorker: {
      register: jest.fn(() => Promise.resolve())
    }
  };

  global.window = {
    addEventListener: jest.fn()
  };

  global.setInterval = jest.fn((callback, delay) => 123); // Return a mock timer ID
  global.setTimeout = jest.fn((callback, delay) => 456); // Return a mock timer ID
  global.clearInterval = jest.fn();
  global.console = { log: jest.fn() };

  // Execute the main script to get the classes
  const fs = require('fs');
  const path = require('path');
  const scriptContent = fs.readFileSync(
    path.join(__dirname, '../../index.html'), 
    'utf8'
  );
  
  // Extract JavaScript from the HTML
  const scriptMatch = scriptContent.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    // More targeted replacements to avoid syntax errors
    let jsCode = scriptMatch[1];
    
    // Remove service worker registration block (complete if statement)
    jsCode = jsCode.replace(/\/\/\s*Register Service Worker for offline capability\s*\n\s*if\s*\(\s*['"]serviceWorker['"]\s*in\s*navigator\s*\)\s*{[\s\S]*?}\s*}/g, '');
    
    // Remove game initialization at the end
    jsCode = jsCode.replace(/const\s+game\s*=\s*new\s+GameEngine\(\)\s*;[\s\S]*$/g, '');
    
    // Remove console.log statements
    jsCode = jsCode.replace(/console\.log\([^)]*\);?/g, '');
    
    // Add explicit global assignments at the end
    jsCode += '\n\nglobal.GameEngine = GameEngine;\nglobal.SurpriseManager = SurpriseManager;';
    
    eval(jsCode);
    GameEngine = global.GameEngine;
    SurpriseManager = global.SurpriseManager;
  }
});

describe('GameEngine', () => {
  let game;

  beforeEach(() => {
    // Mock DOM methods for individual test
    const mockElement = {
      classList: { add: jest.fn(), remove: jest.fn() },
      style: {},
      textContent: '',
      innerHTML: '',
      remove: jest.fn(),
      setAttribute: jest.fn(),
      addEventListener: jest.fn(),
      focus: jest.fn()
    };
    
    global.document.querySelector = jest.fn(() => mockElement);
    global.document.querySelectorAll = jest.fn(() => [mockElement, mockElement, mockElement]);
    
    game = new GameEngine();
    jest.clearAllTimers();
  });

  afterEach(() => {
    if (game.timer) {
      clearInterval(game.timer);
    }
  });

  describe('Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(game.board).toHaveLength(25);
      expect(game.board.every(cell => cell === null)).toBe(true);
      expect(game.currentPlayer).toBe('X');
      expect(game.gameActive).toBe(true);
      expect(game.timeLeft).toBe(60);
      expect(game.gameStarted).toBe(false);
    });

    test('should have surprise manager with 10 surprises', () => {
      expect(game.surpriseManager).toBeDefined();
      expect(game.surpriseManager.surprises).toHaveLength(10);
    });
  });

  describe('Game Logic', () => {
    test('should place piece and switch players', () => {
      game.makeMove(0);
      
      expect(game.board[0]).toBe('X');
      expect(game.currentPlayer).toBe('O');
    });

    test('should not allow move on occupied cell', () => {
      game.makeMove(0);
      game.makeMove(0); // Try to place on same cell
      
      expect(game.board[0]).toBe('X');
      expect(game.currentPlayer).toBe('O'); // Should still be O's turn
    });

    test('should not allow moves when game is inactive', () => {
      game.gameActive = false;
      game.makeMove(0);
      
      expect(game.board[0]).toBe(null);
    });
  });

  describe('Win Detection', () => {
    test('should detect horizontal win', () => {
      // Place 4 X's in first row
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'X';
      game.board[3] = 'X';
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect vertical win', () => {
      // Place 4 X's in first column
      game.board[0] = 'X';  // (0,0)
      game.board[5] = 'X';  // (1,0)
      game.board[10] = 'X'; // (2,0)
      game.board[15] = 'X'; // (3,0)
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect diagonal win (down-right)', () => {
      // Place 4 X's diagonally
      game.board[0] = 'X';  // (0,0)
      game.board[6] = 'X';  // (1,1)
      game.board[12] = 'X'; // (2,2)
      game.board[18] = 'X'; // (3,3)
      
      expect(game.checkWin()).toBe('X');
    });

    test('should detect diagonal win (down-left)', () => {
      // Place 4 X's diagonally
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
      // Fill entire board
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

  describe('Timer Management', () => {
    test('should start timer on first move', () => {
      expect(game.gameStarted).toBe(false);
      
      game.makeMove(0);
      
      expect(game.gameStarted).toBe(true);
      expect(game.timer).toBeDefined();
    });

    test('should handle timeout correctly', () => {
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

  describe('Game End Conditions', () => {
    test('should end game on win', () => {
      // Setup winning condition
      game.board[0] = 'X';
      game.board[1] = 'X';
      game.board[2] = 'X';
      
      game.makeMove(3); // This should trigger win
      
      expect(game.gameActive).toBe(false);
    });

    test('should end game on timeout', () => {
      game.timeLeft = 0;
      game.handleTimeout();
      
      expect(game.gameActive).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset game state', () => {
      // Modify game state
      game.board[0] = 'X';
      game.currentPlayer = 'O';
      game.gameActive = false;
      game.timeLeft = 30;
      game.gameStarted = true;
      
      game.resetGame();
      
      expect(game.board.every(cell => cell === null)).toBe(true);
      expect(game.currentPlayer).toBe('X');
      expect(game.gameActive).toBe(true);
      expect(game.timeLeft).toBe(60);
      expect(game.gameStarted).toBe(false);
    });
  });

  describe('Special Game States', () => {
    test('should handle extra turn power-up', () => {
      game.extraTurnActive = true;
      const originalPlayer = game.currentPlayer;
      
      game.makeMove(0);
      
      // Should not switch players
      expect(game.currentPlayer).toBe(originalPlayer);
      expect(game.extraTurnActive).toBe(false);
    });

    test('should handle skip turn power-up', () => {
      game.skipNextTurn = true;
      
      game.makeMove(0);
      
      // Move should be skipped
      expect(game.board[0]).toBe(null);
      expect(game.skipNextTurn).toBe(false);
    });

    test('should track safe spots', () => {
      game.safeSpots.add(5);
      
      expect(game.safeSpots.has(5)).toBe(true);
      expect(game.safeSpots.has(10)).toBe(false);
    });
  });
});