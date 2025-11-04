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
}

function drawFood() {
    const centerX = food.x + box/2;
    const centerY = food.y + box/2;
    const radius = box/2 - 2;
    
    // Simple solid red circle
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    // Simple solid background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Simple grid pattern
    ctx.strokeStyle = "#2a2a2a";
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
        ctx.fillStyle = "#b0b0b0";
        ctx.font = "24px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Press START to begin", canvas.width/2, canvas.height/2);
        return;
    }

    if(isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e0e0e0";
        ctx.font = "28px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
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
