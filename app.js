const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;

// Helper function for rounded rectangles (for browser compatibility)
function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

let snake = [];
let botSnake = [];
let foods = [];
const MAX_FOOD = 12;
let direction = "";
let botDirection = "";
let score = 0;
let botScore = 0;
let highScore = 0;
let level = 1;
let game = null;
let animationFrame = null;
let foodTimer = null;
let speedBoostTimer = null;
let isPaused = false;
let gameStarted = false;
let botMode = false;
let speed = 150;
let baseSpeed = 150;
let gridCanvas = null;
let gridCtx = null;

// Food types
const FOOD_TYPES = {
    NORMAL: 'normal',
    SPEEDUP: 'speedup',
    MULTIPLIER: 'multiplier',
    MAGNET: 'magnet'
};

const difficulties = {
    easy: 150,
    medium: 100,
    hard: 60
};

// Create off-screen canvas for grid to improve performance
function initGridCanvas() {
    gridCanvas = document.createElement('canvas');
    gridCanvas.width = canvas.width;
    gridCanvas.height = canvas.height;
    gridCtx = gridCanvas.getContext('2d');
    
    // Draw grid once
    gridCtx.fillStyle = "#1e1e1e";
    gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
    
    gridCtx.strokeStyle = "#2a2a2a";
    gridCtx.lineWidth = 1;
    for(let i = 0; i <= gridCanvas.width; i += box) {
        gridCtx.beginPath();
        gridCtx.moveTo(i, 0);
        gridCtx.lineTo(i, gridCanvas.height);
        gridCtx.stroke();
    }
    for(let i = 0; i <= gridCanvas.height; i += box) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, i);
        gridCtx.lineTo(gridCanvas.width, i);
        gridCtx.stroke();
    }
}

function initGame() {
    // Center snake in expanded area (600x600 = 30x30 grid)
    snake = [{ x: 15 * box, y: 15 * box }];
    botSnake = [{ x: 25 * box, y: 15 * box }];
    foods = [];
    direction = "";
    botDirection = "";
    score = 0;
    botScore = 0;
    level = 1;
    isPaused = false;
    gameStarted = false;
    if(foodTimer) clearInterval(foodTimer);
    if(speedBoostTimer) clearTimeout(speedBoostTimer);
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    baseSpeed = difficulties[selectedDifficulty];
    speed = baseSpeed;
    updateScore();
    generateRandomFoods();
    initGridCanvas();
    render();
}

function generateRandomFoods() {
    // Generate random number of food items (0 to MAX_FOOD)
    const targetCount = Math.floor(Math.random() * (MAX_FOOD + 1));
    
    // Clear existing foods
    foods = [];
    
    // Generate food items up to target count
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    while(foods.length < targetCount && attempts < maxAttempts) {
        attempts++;
        let newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
        
        // Check if food position conflicts with snake
        let validPosition = true;
        for(let segment of snake) {
            if(newFood.x === segment.x && newFood.y === segment.y) {
                validPosition = false;
                break;
            }
        }
        
        // Check if food position conflicts with existing foods
        if(validPosition) {
            for(let existingFood of foods) {
                if(newFood.x === existingFood.x && newFood.y === existingFood.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if(validPosition) {
            // Randomly assign food type (70% normal, 10% each special)
            const rand = Math.random();
            let foodType = FOOD_TYPES.NORMAL;
            if(rand < 0.1) {
                foodType = FOOD_TYPES.SPEEDUP;
            } else if(rand < 0.2) {
                foodType = FOOD_TYPES.MULTIPLIER;
            } else if(rand < 0.3) {
                foodType = FOOD_TYPES.MAGNET;
            }
            
            newFood.type = foodType;
            foods.push(newFood);
        }
    }
}

function addRandomFood() {
    if(foods.length >= MAX_FOOD) return;
    if(!gameStarted || isPaused) return;
    
    let attempts = 0;
    const maxAttempts = 50;
    
    while(attempts < maxAttempts) {
        attempts++;
        let newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
        
        // Check if food position conflicts with snake
        let validPosition = true;
        for(let segment of snake) {
            if(newFood.x === segment.x && newFood.y === segment.y) {
                validPosition = false;
                break;
            }
        }
        
        // Check if food position conflicts with existing foods
        if(validPosition) {
            for(let existingFood of foods) {
                if(newFood.x === existingFood.x && newFood.y === existingFood.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if(validPosition) {
            // Randomly assign food type (70% normal, 10% each special)
            const rand = Math.random();
            let foodType = FOOD_TYPES.NORMAL;
            if(rand < 0.1) {
                foodType = FOOD_TYPES.SPEEDUP;
            } else if(rand < 0.2) {
                foodType = FOOD_TYPES.MULTIPLIER;
            } else if(rand < 0.3) {
                foodType = FOOD_TYPES.MAGNET;
            }
            
            newFood.type = foodType;
            foods.push(newFood);
            break;
        }
    }
}

function removeRandomFood() {
    if(foods.length === 0) return;
    if(!gameStarted || isPaused) return;
    
    // Randomly remove one food item
    const index = Math.floor(Math.random() * foods.length);
    foods.splice(index, 1);
}

function updateFoods() {
    if(!gameStarted || isPaused) return;
    
    // Only add food, never remove displayed food
    const action = Math.random();
    
    if(action < 0.5 && foods.length < MAX_FOOD) {
        // 50% chance to add food if under max
        addRandomFood();
    }
    // 50% chance to do nothing
}

function drawSnake() {
    // Draw player snake (green)
    for(let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const padding = 2;
        
        // Simple solid color - darker green for body, lighter for head
        if(i === 0) {
            ctx.fillStyle = '#4a9b6a';
        } else {
            ctx.fillStyle = '#3d7a56';
        }
        
        // Draw simple rectangle
        ctx.fillRect(segment.x + padding, segment.y + padding, box - padding * 2, box - padding * 2);
        
        // Draw simple eyes on head
        if(i === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(segment.x + 6, segment.y + 6, 3, 3);
            ctx.fillRect(segment.x + 11, segment.y + 6, 3, 3);
        }
    }
    
    // Draw bot snake (blue) if bot mode is enabled
    if(botMode && botSnake.length > 0) {
        for(let i = 0; i < botSnake.length; i++) {
            const segment = botSnake[i];
            const padding = 2;
            
            // Different color for bot - blue/cyan
            if(i === 0) {
                ctx.fillStyle = '#2196f3';
            } else {
                ctx.fillStyle = '#1976d2';
            }
            
            // Draw simple rectangle
            ctx.fillRect(segment.x + padding, segment.y + padding, box - padding * 2, box - padding * 2);
            
            // Draw simple eyes on head
            if(i === 0) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(segment.x + 6, segment.y + 6, 3, 3);
                ctx.fillRect(segment.x + 11, segment.y + 6, 3, 3);
            }
        }
    }
}

function drawFood() {
    // Draw all food items
    for(let food of foods) {
        const centerX = food.x + box/2;
        const centerY = food.y + box/2;
        const radius = box/2 - 2;
        
        // Ensure food has a type (default to normal)
        if(!food.type) {
            food.type = FOOD_TYPES.NORMAL;
        }
        
        // Different colors and styles for different food types
        switch(food.type) {
            case FOOD_TYPES.SPEEDUP:
                // Yellow/Orange for speedup
                ctx.fillStyle = '#ffa500';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                // Draw lightning bolt indicator
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(centerX - 2, centerY - 4, 4, 8);
                break;
                
            case FOOD_TYPES.MULTIPLIER:
                // Purple for multiplier (5x points)
                ctx.fillStyle = '#9c27b0';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                // Draw "5x" indicator
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('5x', centerX, centerY);
                break;
                
            case FOOD_TYPES.MAGNET:
                // Blue for magnet
                ctx.fillStyle = '#2196f3';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                // Draw magnet indicator (circle with line)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(centerX - 3, centerY);
                ctx.lineTo(centerX + 3, centerY);
                ctx.stroke();
                break;
                
            default:
                // Normal red food
                ctx.fillStyle = '#d32f2f';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
}

// Render function - runs at 60fps for smooth animation
function render() {
    // Draw grid from cached canvas
    ctx.drawImage(gridCanvas, 0, 0);

    drawSnake();
    drawFood();

    if(!gameStarted) {
        ctx.fillStyle = "#b0b0b0";
        ctx.font = "24px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Press SPACE or Arrow Keys to start", canvas.width/2, canvas.height/2);
        animationFrame = requestAnimationFrame(render);
        return;
    }

    if(isPaused) {
        // Draw semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e0e0e0";
        ctx.font = "28px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
        animationFrame = requestAnimationFrame(render);
        return;
    }

    // Continue animation loop
    animationFrame = requestAnimationFrame(render);
}

// Bot AI - finds best direction for bot snake to move
function botSnakeMove() {
    if(botSnake.length === 0 || foods.length === 0) return;
    
    const head = botSnake[0];
    let bestFood = null;
    let minDistance = Infinity;
    
    // Find nearest food
    for(let food of foods) {
        const dx = food.x - head.x;
        const dy = food.y - head.y;
        const distance = Math.abs(dx) + Math.abs(dy); // Manhattan distance
        
        if(distance < minDistance) {
            minDistance = distance;
            bestFood = food;
        }
    }
    
    if(!bestFood) {
        // If no food, move in a safe direction
        if(botDirection === "") {
            botDirection = "RIGHT";
        }
        return;
    }
    
    // Try to move towards food, avoiding walls, self, and player snake
    const possibleMoves = [];
    
    // Check each direction
    const directions = [
        { name: 'UP', dx: 0, dy: -box, check: () => head.y > 0 },
        { name: 'DOWN', dx: 0, dy: box, check: () => head.y < canvas.height - box },
        { name: 'LEFT', dx: -box, dy: 0, check: () => head.x > 0 },
        { name: 'RIGHT', dx: box, dy: 0, check: () => head.x < canvas.width - box }
    ];
    
    for(let dir of directions) {
        if(!dir.check()) continue;
        
        const newX = head.x + dir.dx;
        const newY = head.y + dir.dy;
        
        // Check if would hit bot snake body
        let wouldHit = false;
        for(let segment of botSnake) {
            if(newX === segment.x && newY === segment.y) {
                wouldHit = true;
                break;
            }
        }
        
        // Check if would hit player snake
        if(!wouldHit) {
            for(let segment of snake) {
                if(newX === segment.x && newY === segment.y) {
                    wouldHit = true;
                    break;
                }
            }
        }
        
        if(!wouldHit) {
            // Calculate distance to food from this position
            const newDx = bestFood.x - newX;
            const newDy = bestFood.y - newY;
            const newDistance = Math.abs(newDx) + Math.abs(newDy);
            
            // Prefer direction that gets closer to food
            const preference = minDistance - newDistance;
            
            possibleMoves.push({
                direction: dir.name,
                distance: newDistance,
                preference: preference
            });
        }
    }
    
    // Sort by preference (higher is better)
    possibleMoves.sort((a, b) => b.preference - a.preference);
    
    if(possibleMoves.length > 0) {
        // Pick best move, but avoid reversing
        for(let move of possibleMoves) {
            const canMove = 
                (move.direction === 'LEFT' && botDirection !== 'RIGHT') ||
                (move.direction === 'RIGHT' && botDirection !== 'LEFT') ||
                (move.direction === 'UP' && botDirection !== 'DOWN') ||
                (move.direction === 'DOWN' && botDirection !== 'UP') ||
                botDirection === '';
            
            if(canMove) {
                botDirection = move.direction;
                return;
            }
        }
        
        // If no ideal move, take first available
        if(possibleMoves.length > 0) {
            botDirection = possibleMoves[0].direction;
        }
    }
}

// Game logic update - runs at the set speed interval
function updateGame() {
    if(!gameStarted || isPaused) return;

    // Bot AI moves bot snake
    if(botMode && botSnake.length > 0) {
        botSnakeMove();
    }

    // Update player snake
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(direction === "LEFT") snakeX -= box;
    if(direction === "UP") snakeY -= box;
    if(direction === "RIGHT") snakeX += box;
    if(direction === "DOWN") snakeY += box;

    // Check collision with any food item (player snake)
    let foodEaten = false;
    let eatenFoodType = null;
    for(let i = foods.length - 1; i >= 0; i--) {
        if(snakeX === foods[i].x && snakeY === foods[i].y) {
            eatenFoodType = foods[i].type;
            
            // Handle different food types
            switch(eatenFoodType) {
                case FOOD_TYPES.SPEEDUP:
                    // Speed up for 5 seconds
                    activateSpeedBoost();
                    score++;
                    break;
                    
                case FOOD_TYPES.MULTIPLIER:
                    // 5x points
                    score += 5;
                    break;
                    
                case FOOD_TYPES.MAGNET:
                    // Pull other food items closer (within 3 cells)
                    pullFoodCloser(snakeX, snakeY);
                    score++;
                    break;
                    
                default:
                    // Normal food - 1 point
                    score++;
                    break;
            }
            
            level = Math.floor(score / 5) + 1;
            updateScore();
            foods.splice(i, 1); // Remove eaten food
            foodEaten = true;
            break;
        }
    }
    
    if(foodEaten) {
        // Don't immediately generate new food - let the timer handle it
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    // Check collision with walls or self
    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        gameOver();
        return;
    }
    
    // Check collision with bot snake
    if(botMode && botSnake.length > 0 && collision(newHead, botSnake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    // Update bot snake
    if(botMode && botSnake.length > 0) {
        let botSnakeX = botSnake[0].x;
        let botSnakeY = botSnake[0].y;

        if(botDirection === "LEFT") botSnakeX -= box;
        if(botDirection === "UP") botSnakeY -= box;
        if(botDirection === "RIGHT") botSnakeX += box;
        if(botDirection === "DOWN") botSnakeY += box;

        // Check collision with food (bot snake)
        let botFoodEaten = false;
        for(let i = foods.length - 1; i >= 0; i--) {
            if(botSnakeX === foods[i].x && botSnakeY === foods[i].y) {
                botScore++;
                foods.splice(i, 1); // Remove eaten food
                botFoodEaten = true;
                break;
            }
        }
        
        if(!botFoodEaten) {
            botSnake.pop();
        }

        let botNewHead = { x: botSnakeX, y: botSnakeY };

        // Check collision with walls or self
        if(botSnakeX < 0 || botSnakeX >= canvas.width || botSnakeY < 0 || botSnakeY >= canvas.height || collision(botNewHead, botSnake)) {
            // Bot snake dies - remove it
            botSnake = [];
            botDirection = "";
            botScore = 0;
            updateScore();
            return;
        }
        
        // Check collision with player snake
        if(collision(botNewHead, snake)) {
            // Bot snake dies - remove it
            botSnake = [];
            botDirection = "";
            botScore = 0;
            updateScore();
            return;
        }

        botSnake.unshift(botNewHead);
    }
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}

function activateSpeedBoost() {
    // Clear existing speed boost timer
    if(speedBoostTimer) {
        clearTimeout(speedBoostTimer);
    }
    
    // Speed up the game (reduce interval by 50%)
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    baseSpeed = difficulties[selectedDifficulty];
    speed = Math.floor(baseSpeed * 0.5);
    
    // Restart game interval with new speed
    if(game) clearInterval(game);
    game = setInterval(updateGame, speed);
    
    // Reset speed after 5 seconds
    speedBoostTimer = setTimeout(() => {
        speed = baseSpeed;
        if(game) clearInterval(game);
        game = setInterval(updateGame, speed);
        speedBoostTimer = null;
    }, 5000);
}

function pullFoodCloser(snakeHeadX, snakeHeadY) {
    // Pull all other food items within 3 cells closer to snake head
    for(let food of foods) {
        const dx = food.x - snakeHeadX;
        const dy = food.y - snakeHeadY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only affect food within 3 cells (60 pixels = 3 * 20)
        if(distance <= 60 && distance > 0) {
            // Calculate direction towards snake head
            const angle = Math.atan2(dy, dx);
            
            // Determine which direction to move (up, down, left, right)
            let moveX = 0;
            let moveY = 0;
            
            if(Math.abs(dx) > Math.abs(dy)) {
                // Move horizontally
                moveX = dx > 0 ? -box : box;
            } else {
                // Move vertically
                moveY = dy > 0 ? -box : box;
            }
            
            // Align to grid
            const newX = food.x + moveX;
            const newY = food.y + moveY;
            
            // Check if new position is valid (within bounds and not on snake)
            if(newX >= 0 && newX < canvas.width && 
               newY >= 0 && newY < canvas.height) {
                let validPosition = true;
                for(let segment of snake) {
                    if(newX === segment.x && newY === segment.y) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check if new position conflicts with other foods
                if(validPosition) {
                    for(let otherFood of foods) {
                        if(otherFood !== food && newX === otherFood.x && newY === otherFood.y) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
                if(validPosition) {
                    food.x = newX;
                    food.y = newY;
                }
            }
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    if(botMode) {
        document.getElementById('botScore').textContent = botScore;
        document.getElementById('botScoreBox').style.display = 'block';
    } else {
        document.getElementById('botScoreBox').style.display = 'none';
    }
    
    if(score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function gameOver() {
    clearInterval(game);
    if(foodTimer) clearInterval(foodTimer);
    if(speedBoostTimer) clearTimeout(speedBoostTimer);
    if(animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

function restartGame() {
    document.getElementById('gameOverOverlay').style.display = 'none';
    initGame();
    // Don't auto-start - wait for user input
}

function startGame() {
    if(gameStarted) return;
    
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    baseSpeed = difficulties[selectedDifficulty];
    speed = baseSpeed;
    
    gameStarted = true;
    isPaused = false;
    
    if(direction === "") {
        direction = "RIGHT";
    }
    
    if(game) clearInterval(game);
    if(foodTimer) clearInterval(foodTimer);
    if(speedBoostTimer) clearTimeout(speedBoostTimer);
    // Start continuous rendering
    render();
    // Start game logic updates at set intervals
    game = setInterval(updateGame, speed);
    // Start food timer to randomly add/remove food (every 1-1.5 seconds)
    foodTimer = setInterval(updateFoods, 1200);
}

function pauseGame() {
    if(!gameStarted) return;
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    
    if(isPaused) {
        if(animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    } else {
        render();
    }
}

function resetGame() {
    if(game) clearInterval(game);
    if(foodTimer) clearInterval(foodTimer);
    if(speedBoostTimer) clearTimeout(speedBoostTimer);
    if(animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    initGame();
    document.getElementById('pauseBtn').textContent = 'Pause';
}

document.addEventListener("keydown", (event) => {
    // Space bar to start game if not started, or pause if game is running
    if(event.key === " ") {
        event.preventDefault();
        if(!gameStarted) {
            startGame();
        } else {
            pauseGame();
        }
        return;
    }

    // Start game with arrow keys or WASD if not started
    if(!gameStarted && (event.key.startsWith("Arrow") || "wasd".includes(event.key.toLowerCase()))) {
        startGame();
    }

    // Only process direction changes if game is started and not paused
    if(!gameStarted || isPaused) return;

    if((event.key === "ArrowLeft" || event.key === "a") && direction !== "RIGHT") direction = "LEFT";
    if((event.key === "ArrowUp" || event.key === "w") && direction !== "DOWN") direction = "UP";
    if((event.key === "ArrowRight" || event.key === "d") && direction !== "LEFT") direction = "RIGHT";
    if((event.key === "ArrowDown" || event.key === "s") && direction !== "UP") direction = "DOWN";
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

document.getElementById('botBtn').addEventListener('click', () => {
    botMode = !botMode;
    document.getElementById('botBtn').textContent = botMode ? 'Bot Mode: ON' : 'Bot Mode: OFF';
    
    if(botMode && gameStarted && !isPaused) {
        // Start bot moving if game is already running
        if(direction === "") {
            direction = "RIGHT";
        }
    }
});

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if(gameStarted) {
            resetGame();
        }
    });
});

initGame();
