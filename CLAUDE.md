# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile-first 5x5 tic-tac-toe game with surprise power-ups designed for restaurant entertainment. Single HTML file architecture with vanilla JavaScript, deployed to GitHub Pages.

## Development Commands

### Testing
```bash
npm run test:unit          # Jest unit tests for game logic
npm run test:e2e           # Playwright E2E tests (all browsers)
npm run test:mobile        # Playwright mobile-specific tests
npm run lighthouse         # Performance and accessibility audits
```

### Development Server
```bash
python3 -m http.server 3000    # Local development server
```

## Architecture

**Single-Page Application**: One HTML file with embedded CSS and JavaScript, no external dependencies.

### Core Classes
- `GameEngine`: 5x5 board state, turn logic, 4-in-a-row win detection, 60-second timer
- `SurpriseManager`: Random placement of 10 power-ups (40% board coverage), power-up execution
- `UIController`: DOM manipulation, mobile touch events, responsive layout
- `AnimationController`: Confetti celebrations, popup notifications, timer warnings

### Mobile Optimization
- Touch-first interface with 44px minimum touch targets
- Responsive breakpoints: 320px-480px (portrait), 480px-768px (landscape)
- High contrast colors for restaurant lighting conditions
- No zoom on double-tap, optimized viewport settings

## Testing Strategy

### Unit Tests (Jest)
- Game logic validation (win detection, turn management)
- Power-up behavior and timer functionality
- Target: >90% code coverage

### E2E Tests (Playwright)
- Touch interactions on mobile devices (iPhone 13 simulation)
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Portrait/landscape orientation testing
- Complete game flow with surprise power-ups

### Performance Tests (Lighthouse CI)
- Performance >80, Accessibility >90
- Loading speed <3s on 3G simulation
- Mobile optimization scores

## Power-up System

8 surprise types with immediate effects:
- Extra Turn, Skip Turn, Switch Places, Remove Opponent
- Safe Spot, Speed Boost, Time Freeze, Color Swap

Surprises are pre-placed randomly at game start (10 per board) and revealed on cell click.

## Deployment

GitHub Actions CI/CD pipeline:
1. Tests must pass (unit + E2E + Lighthouse)
2. Automatic deployment to GitHub Pages on main branch
3. Live at: `https://[username].github.io/surprise-tic-tac-toe`

## File Structure

```
/
├── index.html              # Single-file game (entry point)
├── TODO.md                 # Implementation checklist
├── system_description.md   # Detailed architecture
├── test_config.json       # Test configurations
├── test_examples.js        # Test implementations
└── .github/workflows/      # CI/CD automation
```

## Development Notes

- Use browser dev tools mobile simulation during development
- Test touch responsiveness after UI changes
- Ensure all animations run at 60fps
- Maintain <500KB total file size for mobile performance