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
let food = {};
let direction = "";
let score = 0;
let highScore = 0;
let level = 1;
let game = null;
let isPaused = false;
let gameStarted = false;
let speed = 150;

const difficulties = {
    easy: 150,
    medium: 100,
    hard: 60
};

function initGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = "";
    score = 0;
    level = 1;
    isPaused = false;
    gameStarted = false;
    updateScore();
    generateFood();
    draw();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    
    for(let segment of snake) {
        if(food.x === segment.x && food.y === segment.y) {
            generateFood();
            return;
        }
    }
}

function drawSnake() {
    for(let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const padding = 2;
        
        // Create gradient for snake segment
        const gradient = ctx.createLinearGradient(
            segment.x, segment.y, 
            segment.x + box, segment.y + box
        );
        
        if(i === 0) {
            // Head with brighter gradient
            gradient.addColorStop(0, '#00ffaa');
            gradient.addColorStop(0.5, '#00ff88');
            gradient.addColorStop(1, '#00cc66');
        } else {
            // Body with softer gradient
            gradient.addColorStop(0, '#44ff99');
            gradient.addColorStop(0.5, '#33ee88');
            gradient.addColorStop(1, '#22dd77');
        }
        
        // Draw shadow
        ctx.shadowColor = i === 0 ? 'rgba(0, 255, 170, 0.5)' : 'rgba(68, 255, 153, 0.3)';
        ctx.shadowBlur = i === 0 ? 8 : 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw rounded rectangle
        ctx.fillStyle = gradient;
        const radius = 4;
        roundRect(segment.x + padding, segment.y + padding, box - padding * 2, box - padding * 2, radius);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw eyes on head
        if(i === 0) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(segment.x + 7, segment.y + 8, 2.5, 0, Math.PI * 2);
            ctx.arc(segment.x + 13, segment.y + 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(segment.x + 7, segment.y + 8, 1, 0, Math.PI * 2);
            ctx.arc(segment.x + 13, segment.y + 8, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add highlight
        const highlight = ctx.createLinearGradient(
            segment.x, segment.y,
            segment.x, segment.y + box / 2
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlight.addColorStop(1, 'transparent');
        ctx.fillStyle = highlight;
        roundRect(segment.x + padding, segment.y + padding, box - padding * 2, (box - padding * 2) / 2, radius);
        ctx.fill();
    }
}

function drawFood() {
    const centerX = food.x + box/2;
    const centerY = food.y + box/2;
    const radius = box/2 - 2;
    
    // Draw glow/shadow
    ctx.shadowColor = 'rgba(255, 68, 68, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Create radial gradient for apple
    const gradient = ctx.createRadialGradient(
        centerX - 2, centerY - 2, 2,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.3, '#ff4444');
    gradient.addColorStop(0.7, '#ee2222');
    gradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw highlight
    const highlight = ctx.createRadialGradient(
        centerX - 3, centerY - 3, 0,
        centerX - 3, centerY - 3, 5
    );
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlight.addColorStop(1, 'transparent');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(centerX - 3, centerY - 3, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw stem
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(centerX - 1.5, food.y + 2, 3, 5);
    
    // Draw leaf
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.ellipse(centerX + 4, food.y + 3, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, "#0f0c29");
    bgGradient.addColorStop(0.5, "#1a1a2e");
    bgGradient.addColorStop(1, "#16213e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern for depth
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for(let i = 0; i <= canvas.width; i += box) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for(let i = 0; i <= canvas.height; i += box) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    drawSnake();
    drawFood();

    if(!gameStarted) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.fillText("Press START to begin", canvas.width/2, canvas.height/2);
        ctx.shadowBlur = 0;
        return;
    }

    if(isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(102, 126, 234, 0.8)";
        ctx.shadowBlur = 15;
        ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
        ctx.shadowBlur = 0;
        return;
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if(direction === "LEFT") snakeX -= box;
    if(direction === "UP") snakeY -= box;
    if(direction === "RIGHT") snakeX += box;
    if(direction === "DOWN") snakeY += box;

    if(snakeX === food.x && snakeY === food.y) {
        score++;
        level = Math.floor(score / 5) + 1;
        updateScore();
        generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}

function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    
    if(score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
    }
}

function gameOver() {
    clearInterval(game);
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalHighScore').textContent = highScore;
    document.getElementById('gameOverOverlay').style.display = 'flex';
}

function restartGame() {
    document.getElementById('gameOverOverlay').style.display = 'none';
    initGame();
    startGame();
}

function startGame() {
    if(gameStarted) return;
    
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    speed = difficulties[selectedDifficulty];
    
    gameStarted = true;
    isPaused = false;
    
    if(direction === "") {
        direction = "RIGHT";
    }
    
    if(game) clearInterval(game);
    game = setInterval(draw, speed);
}

function pauseGame() {
    if(!gameStarted) return;
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function resetGame() {
    if(game) clearInterval(game);
    initGame();
    document.getElementById('pauseBtn').textContent = 'Pause';
}

document.addEventListener("keydown", (event) => {
    if(!gameStarted && (event.key.startsWith("Arrow") || "wasd".includes(event.key.toLowerCase()))) {
        startGame();
    }

    if(event.key === " ") {
        event.preventDefault();
        pauseGame();
        return;
    }

    if((event.key === "ArrowLeft" || event.key === "a") && direction !== "RIGHT") direction = "LEFT";
    if((event.key === "ArrowUp" || event.key === "w") && direction !== "DOWN") direction = "UP";
    if((event.key === "ArrowRight" || event.key === "d") && direction !== "LEFT") direction = "RIGHT";
    if((event.key === "ArrowDown" || event.key === "s") && direction !== "UP") direction = "DOWN";
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', () => {
        if(gameStarted) {
            resetGame();
        }
    });
});

initGame();
