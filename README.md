# 5x5 Surprise Tic-Tac-Toe! 🎮

A mobile-first tic-tac-toe game with hidden surprises! Race against a 60-second timer to get 4-in-a-row while discovering power-ups that can change the game.

## Game Features

- **5x5 Grid**: More strategic gameplay than traditional 3x3
- **4-in-a-Row**: Win condition for horizontal, vertical, or diagonal lines
- **60-Second Timer**: Fast-paced games perfect for restaurant entertainment
- **10 Hidden Surprises**: 40% of the board contains power-ups that activate when clicked
- **Mobile-First**: Optimized for touch devices with 44px+ touch targets

## Power-ups

- 🎁 **Extra Turn**: Skip opponent's next turn
- ⏭️ **Skip Turn**: Force opponent to miss turn  
- 🔄 **Switch Places**: Swap current piece with random existing piece
- ❌ **Remove Opponent**: Remove random opponent piece
- 🛡️ **Safe Spot**: Mark piece as protected from removal/switching
- ⚡ **Speed Boost**: Add 10 seconds to timer permanently
- ❄️ **Time Freeze**: Pause timer for 5 seconds
- 🎨 **Color Swap**: Swap X/O colors temporarily for 5 seconds

## Development

### Quick Start
```bash
# Start local server
python3 -m http.server 3000

# Install dependencies
npm install

# Run tests
npm run test:unit    # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run lighthouse   # Performance audit
```

### Architecture
- Single HTML file with embedded CSS/JS
- No external dependencies
- Mobile-first responsive design
- GitHub Pages deployment

## Live Demo

Visit the game at: `https://[username].github.io/surprise-tic-tac-toe`

## Game Rules

### Objective
Get 4 pieces in a row (horizontal, vertical, or diagonal) within 60 seconds!

### How to Play
1. **Take Turns**: Players alternate placing X and O pieces on the 5×5 grid
2. **Timer**: You have 60 seconds to complete the game
3. **Surprises**: 40% of cells contain hidden power-ups that activate when clicked
4. **Winning**: First to get 4 in a row wins, or player with most pieces when time expires

### Power-ups
- 🎁 **Extra Turn**: Play again immediately
- ⏭️ **Skip Turn**: Opponent misses their next turn
- 🔄 **Switch Places**: Swap your piece with a random opponent piece
- ❌ **Remove Opponent**: Delete a random opponent piece
- 🛡️ **Safe Spot**: Protect this piece from removal/switching
- ⚡ **Speed Boost**: Add 10 seconds to the timer
- ❄️ **Time Freeze**: Pause timer for 5 seconds
- 🎨 **Color Swap**: Temporarily swap piece colors for 5 seconds

## Accessibility Features

- **Screen Reader Support**: Full ARIA labels and live regions
- **Keyboard Navigation**: Arrow keys to move, Enter/Space to select
- **High Contrast**: Optimized for various lighting conditions
- **Touch Friendly**: 44px+ touch targets for mobile devices
- **Responsive Design**: Works on all screen sizes and orientations

### Keyboard Controls
- **Arrow Keys**: Navigate between cells
- **Enter/Space**: Place piece or activate button
- **Home**: Jump to first cell
- **End**: Jump to last cell
- **Tab**: Navigate between game elements

## Technical Details

### Performance
- **Loading**: <3 seconds on 3G networks
- **Animations**: 60fps smooth animations
- **File Size**: <500KB total for mobile optimization
- **Offline**: Service worker enables offline play

### Browser Support
- Chrome/Safari Mobile (iOS 12+)
- Chrome Android (Android 8+)
- Desktop browsers (recent versions)
- Progressive enhancement for older browsers

### Architecture
- Single HTML file with embedded CSS/JS
- No external dependencies
- Service Worker for offline capability
- PWA manifest for mobile installation

## Development

### Testing
```bash
# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# Mobile-specific tests
npm run test:mobile

# Performance audit
npm run lighthouse
```

### Deployment
The game is automatically deployed to GitHub Pages when changes are pushed to the main branch. The CI/CD pipeline includes:

1. **Unit Tests**: Jest tests for game logic
2. **E2E Tests**: Playwright tests for user interactions
3. **Performance Tests**: Lighthouse CI for mobile optimization
4. **Build Optimization**: HTML/CSS/JS minification
5. **Deployment**: Automatic GitHub Pages deployment

### Development Server
```bash
npm run dev
# Opens server at http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass: `npm run test:unit && npm run test:e2e`
5. Submit a pull request

All contributions must pass automated testing including:
- Unit tests (Jest)
- E2E tests (Playwright)
- Performance tests (Lighthouse CI)
- Accessibility compliance

## License

MIT License - feel free to use this code for your own projects!