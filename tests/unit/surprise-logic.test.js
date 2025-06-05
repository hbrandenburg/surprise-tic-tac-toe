/**
 * @jest-environment jsdom
 */

describe('Surprise System Logic', () => {
  // Mock the surprise manager for testing
  class MockSurpriseManager {
    constructor() {
      this.surprises = [];
      this.powerUpTypes = [
        { type: 'extra-turn', emoji: '🎁', name: 'Extra Turn', description: 'You get another turn!' },
        { type: 'skip-turn', emoji: '⏭️', name: 'Skip Turn', description: 'Opponent misses their next turn!' },
        { type: 'switch-places', emoji: '🔄', name: 'Switch Places', description: 'Your piece swaps with a random opponent piece!' },
        { type: 'remove-opponent', emoji: '❌', name: 'Remove Opponent', description: 'Random opponent piece removed!' },
        { type: 'safe-spot', emoji: '🛡️', name: 'Safe Spot', description: 'This piece is protected!' },
        { type: 'speed-boost', emoji: '⚡', name: 'Speed Boost', description: '+10 seconds added to timer!' },
        { type: 'time-freeze', emoji: '❄️', name: 'Time Freeze', description: 'Timer paused for 5 seconds!' },
        { type: 'color-swap', emoji: '🎨', name: 'Color Swap', description: 'Colors swapped for 5 seconds!' }
      ];
    }
    
    generateSurprises() {
      this.surprises = [];
      const positions = new Set();
      
      while (positions.size < 10) {
        positions.add(Math.floor(Math.random() * 25));
      }
      
      positions.forEach(position => {
        const randomType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
        this.surprises.push({
          position: position,
          type: randomType.type,
          emoji: randomType.emoji,
          name: randomType.name,
          description: randomType.description,
          revealed: false
        });
      });
      
      return this.surprises;
    }
    
    hasSurpriseAt(position) {
      return this.surprises.find(s => s.position === position && !s.revealed);
    }
    
    revealSurpriseAt(position) {
      const surprise = this.hasSurpriseAt(position);
      if (surprise) {
        surprise.revealed = true;
        return surprise;
      }
      return null;
    }
    
    executePowerUp(type, gameEngine) {
      switch (type) {
        case 'extra-turn':
          gameEngine.extraTurnActive = true;
          break;
        case 'skip-turn':
          gameEngine.skipNextTurn = true;
          break;
        case 'speed-boost':
          gameEngine.timeLeft += 10;
          break;
        case 'safe-spot':
          if (gameEngine.lastMoveIndex !== undefined) {
            gameEngine.safeSpots.add(gameEngine.lastMoveIndex);
          }
          break;
        case 'remove-opponent':
          this.removeRandomOpponentPiece(gameEngine);
          break;
        case 'switch-places':
          this.switchRandomPieces(gameEngine);
          break;
      }
    }
    
    removeRandomOpponentPiece(gameEngine) {
      const currentPlayer = gameEngine.currentPlayer;
      const opponentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      
      const opponentPieces = [];
      gameEngine.board.forEach((cell, index) => {
        if (cell === opponentPlayer && !gameEngine.safeSpots.has(index)) {
          opponentPieces.push(index);
        }
      });
      
      if (opponentPieces.length > 0) {
        const randomIndex = opponentPieces[Math.floor(Math.random() * opponentPieces.length)];
        gameEngine.board[randomIndex] = null;
      }
    }
    
    switchRandomPieces(gameEngine) {
      const currentPlayer = gameEngine.currentPlayer;
      const opponentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      
      const opponentPieces = [];
      gameEngine.board.forEach((cell, index) => {
        if (cell === opponentPlayer && !gameEngine.safeSpots.has(index)) {
          opponentPieces.push(index);
        }
      });
      
      if (opponentPieces.length > 0 && gameEngine.lastMoveIndex !== undefined) {
        const randomOpponentIndex = opponentPieces[Math.floor(Math.random() * opponentPieces.length)];
        const currentPieceIndex = gameEngine.lastMoveIndex;
        
        gameEngine.board[randomOpponentIndex] = currentPlayer;
        gameEngine.board[currentPieceIndex] = opponentPlayer;
      }
    }
  }

  let surpriseManager;
  let mockGameEngine;

  beforeEach(() => {
    surpriseManager = new MockSurpriseManager();
    
    mockGameEngine = {
      board: new Array(25).fill(null),
      currentPlayer: 'X',
      timeLeft: 60,
      lastMoveIndex: 0,
      safeSpots: new Set(),
      extraTurnActive: false,
      skipNextTurn: false
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
      let emptyPosition = 0;
      while (surpriseManager.hasSurpriseAt(emptyPosition) && emptyPosition < 25) {
        emptyPosition++;
      }
      
      if (emptyPosition < 25) {
        const surprise = surpriseManager.hasSurpriseAt(emptyPosition);
        expect(surprise).toBeUndefined();
      }
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
    });

    test('should execute safe spot power-up', () => {
      mockGameEngine.lastMoveIndex = 5;
      surpriseManager.executePowerUp('safe-spot', mockGameEngine);
      expect(mockGameEngine.safeSpots.has(5)).toBe(true);
    });

    test('should execute remove opponent power-up', () => {
      mockGameEngine.board[1] = 'O';
      mockGameEngine.board[2] = 'O';
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.executePowerUp('remove-opponent', mockGameEngine);
      
      const opponentCount = mockGameEngine.board.filter(cell => cell === 'O').length;
      expect(opponentCount).toBe(1);
    });

    test('should execute switch places power-up', () => {
      mockGameEngine.board[1] = 'O';
      mockGameEngine.board[5] = 'X';
      mockGameEngine.lastMoveIndex = 5;
      mockGameEngine.currentPlayer = 'X';
      
      const originalBoard = [...mockGameEngine.board];
      surpriseManager.executePowerUp('switch-places', mockGameEngine);
      
      // Board should be different after switch
      expect(mockGameEngine.board).not.toEqual(originalBoard);
    });

    test('should not remove safe opponent pieces', () => {
      mockGameEngine.board[1] = 'O';
      mockGameEngine.safeSpots.add(1);
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.executePowerUp('remove-opponent', mockGameEngine);
      
      expect(mockGameEngine.board[1]).toBe('O');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty board for remove opponent', () => {
      mockGameEngine.currentPlayer = 'X';
      
      surpriseManager.executePowerUp('remove-opponent', mockGameEngine);
      
      expect(mockGameEngine.board.every(cell => cell === null)).toBe(true);
    });

    test('should handle switch places with no opponent pieces', () => {
      mockGameEngine.lastMoveIndex = 0;
      mockGameEngine.currentPlayer = 'X';
      
      const originalBoard = [...mockGameEngine.board];
      surpriseManager.executePowerUp('switch-places', mockGameEngine);
      
      expect(mockGameEngine.board).toEqual(originalBoard);
    });
  });

  describe('Randomness Tests', () => {
    test('should generate different surprise layouts', () => {
      const layout1 = surpriseManager.generateSurprises().map(s => s.position).sort();
      
      const surpriseManager2 = new MockSurpriseManager();
      const layout2 = surpriseManager2.generateSurprises().map(s => s.position).sort();
      
      // Very unlikely to be identical if truly random
      const different = layout1.some((pos, i) => pos !== layout2[i]);
      expect(different).toBe(true);
    });

    test('should distribute power-up types', () => {
      const surprises = surpriseManager.generateSurprises();
      const types = surprises.map(s => s.type);
      
      // Should have at least some variety in types
      const uniqueTypes = [...new Set(types)];
      expect(uniqueTypes.length).toBeGreaterThan(1);
    });
  });
});