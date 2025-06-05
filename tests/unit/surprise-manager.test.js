/**
 * @jest-environment jsdom
 */

let SurpriseManager, GameEngine;

beforeAll(() => {
  // Mock DOM methods before evaluating the code
  global.document = {
    querySelector: jest.fn(() => ({ 
      classList: { add: jest.fn(), remove: jest.fn() },
      style: {},
      textContent: '',
      innerHTML: '',
      remove: jest.fn()
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

  const fs = require('fs');
  const path = require('path');
  const scriptContent = fs.readFileSync(
    path.join(__dirname, '../../index.html'), 
    'utf8'
  );
  
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
    SurpriseManager = global.SurpriseManager;
    GameEngine = global.GameEngine;
  }
});

describe('SurpriseManager', () => {
  let surpriseManager;
  let mockGameEngine;

  beforeEach(() => {
    surpriseManager = new SurpriseManager();
    
    // Create mock game engine
    mockGameEngine = {
      board: new Array(25).fill(null),
      currentPlayer: 'X',
      timeLeft: 60,
      timer: null,
      gameActive: true,
      lastMoveIndex: 0,
      safeSpots: new Set(),
      extraTurnActive: false,
      skipNextTurn: false,
      updateCell: jest.fn(),
      updateTimerDisplay: jest.fn(),
      startTimer: jest.fn(),
      handleTimeout: jest.fn()
    };
  });

  describe('Surprise Generation', () => {
    test('should generate exactly 10 surprises', () => {
      const surprises = surpriseManager.generateSurprises();
      expect(surprises).toHaveLength(10);
    });

    test('should generate unique positions', () => {
      const surprises = surpriseManager.generateSurprises();
      const positions = surprises.map(s => s.position);
      const uniquePositions = [...new Set(positions)];
      
      expect(positions).toHaveLength(uniquePositions.length);
    });

    test('should generate positions within valid range', () => {
      const surprises = surpriseManager.generateSurprises();
      
      surprises.forEach(surprise => {
        expect(surprise.position).toBeGreaterThanOrEqual(0);
        expect(surprise.position).toBeLessThan(25);
      });
    });

    test('should assign valid power-up types', () => {
      const surprises = surpriseManager.generateSurprises();
      const validTypes = [
        'extra-turn', 'skip-turn', 'switch-places', 'remove-opponent',
        'safe-spot', 'speed-boost', 'time-freeze', 'color-swap'
      ];
      
      surprises.forEach(surprise => {
        expect(validTypes).toContain(surprise.type);
        expect(surprise.emoji).toBeDefined();
        expect(surprise.name).toBeDefined();
        expect(surprise.description).toBeDefined();
      });
    });
  });

  describe('Surprise Detection', () => {
    beforeEach(() => {
      surpriseManager.generateSurprises();
    });

    test('should detect surprise at position', () => {
      const firstSurprise = surpriseManager.surprises[0];
      const surprise = surpriseManager.hasSurpriseAt(firstSurprise.position);
      
      expect(surprise).toBeDefined();
      expect(surprise.position).toBe(firstSurprise.position);
    });

    test('should not detect surprise at empty position', () => {
      // Find a position without surprise
      let emptyPosition = 0;
      while (surpriseManager.hasSurpriseAt(emptyPosition)) {
        emptyPosition++;
      }
      
      const surprise = surpriseManager.hasSurpriseAt(emptyPosition);
      expect(surprise).toBeUndefined();
    });

    test('should reveal surprise and mark as revealed', () => {
      const firstSurprise = surpriseManager.surprises[0];
      const position = firstSurprise.position;
      
      const revealed = surpriseManager.revealSurpriseAt(position);
      
      expect(revealed).toBeDefined();
      expect(revealed.revealed).toBe(true);
      expect(surpriseManager.hasSurpriseAt(position)).toBeUndefined();
    });
  });

  describe('Power-up Execution', () => {
    test('should execute extra turn power-up', () => {
      surpriseManager.executePowerUp('extra-turn', mockGameEngine);
      
      expect(mockGameEngine.extraTurnActive).toBe(true);
    });

    test('should execute skip turn power-up', () => {
      surpriseManager.executePowerUp('skip-turn', mockGameEngine);
      
      expect(mockGameEngine.skipNextTurn).toBe(true);
    });

    test('should execute speed boost power-up', () => {
      mockGameEngine.timeLeft = 45;
      
      surpriseManager.executePowerUp('speed-boost', mockGameEngine);
      
      expect(mockGameEngine.timeLeft).toBe(55);
      expect(mockGameEngine.updateTimerDisplay).toHaveBeenCalled();
    });

    test('should execute safe spot power-up', () => {
      mockGameEngine.lastMoveIndex = 5;
      
      surpriseManager.executePowerUp('safe-spot', mockGameEngine);
      
      expect(mockGameEngine.safeSpots.has(5)).toBe(true);
    });

    test('should execute remove opponent power-up', () => {
      // Setup board with opponent pieces
      mockGameEngine.board[1] = 'O';
      mockGameEngine.board[2] = 'O';
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.removeRandomOpponentPiece(mockGameEngine);
      
      const opponentCount = mockGameEngine.board.filter(cell => cell === 'O').length;
      expect(opponentCount).toBe(1); // One should be removed
    });

    test('should execute switch places power-up', () => {
      // Setup board
      mockGameEngine.board[1] = 'O';
      mockGameEngine.board[5] = 'X';
      mockGameEngine.lastMoveIndex = 5;
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.switchRandomPieces(mockGameEngine);
      
      // Verify switch occurred
      expect(mockGameEngine.updateCell).toHaveBeenCalledTimes(2);
    });

    test('should not remove safe opponent pieces', () => {
      mockGameEngine.board[1] = 'O';
      mockGameEngine.safeSpots.add(1);
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.removeRandomOpponentPiece(mockGameEngine);
      
      expect(mockGameEngine.board[1]).toBe('O'); // Should still be there
    });
  });

  describe('Timer Effects', () => {
    beforeEach(() => {
      // Mock DOM element
      document.querySelector = jest.fn().mockReturnValue({
        classList: { add: jest.fn(), remove: jest.fn() },
        style: {}
      });
    });

    test('should freeze timer', () => {
      mockGameEngine.timer = 123; // Mock timer ID
      
      surpriseManager.freezeTimer(mockGameEngine);
      
      expect(mockGameEngine.timer).toBeNull();
    });

    test('should apply color swap effect', () => {
      document.querySelectorAll = jest.fn().mockReturnValue([
        { 
          classList: { add: jest.fn(), remove: jest.fn() }, 
          style: { color: 'rgb(255, 20, 147)' } 
        }
      ]);
      
      surpriseManager.swapColors(mockGameEngine);
      
      // Verify DOM manipulation was called
      expect(document.querySelectorAll).toHaveBeenCalled();
    });
  });

  describe('UI Interactions', () => {
    test('should show surprise popup', () => {
      const mockSurprise = {
        emoji: '🎁',
        name: 'Extra Turn',
        description: 'You get another turn!'
      };
      
      // Mock document methods
      const mockElement = {
        className: '',
        innerHTML: '',
        remove: jest.fn()
      };
      
      document.createElement = jest.fn().mockReturnValue(mockElement);
      document.body.appendChild = jest.fn();
      
      surpriseManager.showSurprisePopup(mockSurprise);
      
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(document.body.appendChild).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty board for remove opponent', () => {
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.removeRandomOpponentPiece(mockGameEngine);
      
      // Should not crash with empty board
      expect(mockGameEngine.board.every(cell => cell === null)).toBe(true);
    });

    test('should handle switch places with no opponent pieces', () => {
      mockGameEngine.lastMoveIndex = 0;
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.switchRandomPieces(mockGameEngine);
      
      // Should not crash
      expect(mockGameEngine.updateCell).not.toHaveBeenCalled();
    });

    test('should handle time freeze when no timer exists', () => {
      mockGameEngine.timer = null;
      
      surpriseManager.freezeTimer(mockGameEngine);
      
      // Should not crash
      expect(mockGameEngine.timer).toBe(null);
    });
  });
});