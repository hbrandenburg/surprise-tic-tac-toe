// Jest setup file for DOM testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM environment
document.body.innerHTML = `
  <div class="game-container">
    <h1>5x5 Surprise Tic-Tac-Toe!</h1>
    <div class="timer">60</div>
    <div class="game-info">
      <div class="current-player">Player X's turn</div>
      <div class="game-status"></div>
    </div>
    <div class="game-board">
      ${Array(25).fill(0).map((_, i) => `<button class="cell" data-index="${i}"></button>`).join('')}
    </div>
    <button class="reset-btn">Play Again</button>
  </div>
`;

// Mock timers
jest.useFakeTimers();