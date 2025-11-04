## 🐍 Enhanced Snake Game!

## 🚀 Live Demo

Play the game online: [https://snake-game-three-gray.vercel.app/](https://snake-game-three-gray.vercel.app/)

## 🎮 About The Game

An enhanced Snake Game built with vanilla JavaScript featuring special food types, lives system, bot competitor, and smooth 60fps gameplay. The goal is to grow your snake by eating food and score as many points as possible without touching the walls, your own body, or the bot snake (if enabled).

## 🕹️ How To Play

### Controls

- **Arrow Keys** or **WASD** - Move the snake
- **Space Bar** - Start game or Pause/Resume
- **Start Game** button - Begin playing
- **Pause** button - Pause/Resume the game
- **Reset** button - Reset the game
- **Bot Mode** button - Toggle computer-controlled competitor

### Gameplay

1. Start the game by pressing **Space**, **Arrow Keys**, **WASD**, or clicking **Start Game**
2. Control your snake (green) to eat food items
3. Avoid hitting walls, your own body, or the bot snake (if bot mode is enabled)
4. You have **3 lives** - the game continues automatically when you die with lives remaining
5. Game over modal appears only when all lives are lost

### Food Types

- 🔴 **Red Food** - Normal food worth 1 point
- 🟠 **Orange Food** - Speed boost for 5 seconds (doubles game speed)
- 🟣 **Purple Food** - Multiplier food worth 5x points (5 points)
- 🔵 **Blue Food** - Magnet food that pulls nearby food items closer to you

### Difficulty Levels

- **Easy** - Slower speed (150ms interval)
- **Medium** - Medium speed (100ms interval)
- **Hard** - Fast speed (60ms interval)

## ⚡ Features

### Core Features

- **Smooth 60fps Animation** - Uses `requestAnimationFrame` for fluid gameplay
- **Lives System** - Start with 3 lives, auto-continue when lives remain
- **Dynamic Food System** - Up to 12 food items spawn randomly (0-12 items)
- **Level System** - Level increases every 5 points
- **High Score Tracking** - Tracks your best score

### Special Features

- **Bot Competitor** - Enable computer-controlled bot snake (blue) to compete against
- **Special Food Types** - 4 different food types with unique effects
- **Difficulty Levels** - Choose from Easy, Medium, or Hard
- **Pause/Resume** - Pause the game anytime with Space bar or Pause button
- **Expanded Game Area** - 600x600 pixel canvas (30x30 grid)

### Visual Features

- **Minimal Dark Theme** - Clean, modern dark color scheme
- **Grid Pattern** - Subtle grid for better visual reference
- **Smooth Rendering** - Optimized canvas rendering with cached grid
- **Visual Indicators** - Different colors and indicators for each food type

## 📈 Technologies Used

- **HTML5** - Structure and canvas element
- **CSS3** - Styling with modern design principles
- **JavaScript (Vanilla)** - No frameworks, pure JavaScript
- **Canvas API** - 2D game rendering

## 🎯 Game Mechanics

- **Food Spawning** - Food items randomly spawn over time (up to 12 items maximum)
- **Collision Detection** - Precise collision detection for walls, self, and other snakes
- **Auto-Continue** - Game automatically restarts at random position when you die with lives remaining
- **Bot AI** - Intelligent bot that finds nearest food and avoids collisions
- **Score Multiplier** - Purple food gives 5x points instead of 1
- **Speed Boost** - Orange food temporarily doubles game speed for 5 seconds
- **Food Magnet** - Blue food pulls other food items within 3 cells closer to you
- **Level Progression** - Level increases every 5 points, affecting gameplay difficulty

## 👤 Author

- rstar327 – Full-Stack Developer & JavaScript Enthusiast
GitHub Profile

- TheM1ddleM1n - for adding improvements!

## 🤝 Contributing

Feel free to contribute to this project! Contributions are welcome and appreciated. Whether you want to:

- Fix bugs
- Add new features
- Improve the UI/UX
- Enhance game mechanics
- Optimize performance
- Update documentation

Your contributions help make this project better for everyone. Thank you for your interest in contributing!