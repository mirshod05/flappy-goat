const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameState = "start";
const startImg = new Image();
startImg.src = 'start_bg.jpeg';

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(startImg, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "20px 'Baloo 2'";
  ctx.fillText("Tap to Start", canvas.width / 2, 400);
  

  ctx.textAlign = "left"; // reset so other text isn't affected
}

const headImg = new Image();
headImg.src = 'messi_head.png'; 

let birdY = 300;
let velocity = 0;
const gravity = 0.5;
const jumpStrength = -8;
let score = 0;
let gameOverTime = 0;
const restartDelay = 800;
let highScore = sessionStorage.getItem('flappyGoatHighScore');
highScore = highScore ? parseInt(highScore) : 0;

let countdownValue = 3;
let countdownStart = 0;
const countdownStepMs = 500;

function startCountdown() {
    resetGame();
    countdownValue = 3;
    countdownStart = Date.now();
}

function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles(); // static preview behind countdown, obstacles array is empty right after reset, so this just shows background
    ctx.drawImage(headImg, headX - headSize / 2, birdY - headSize / 2, headSize, headSize);

    ctx.fillStyle = "black";
    ctx.font = "60px 'Baloo 2'";
    ctx.textAlign = "center";
    ctx.fillText(countdownValue > 0 ? countdownValue : "Go!", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
    
}

function jump() {
    if (gameState === "start") {
        gameState = "countdown";
        startCountdown();
        return;
    }
    if(gameState=="gameover") {
        if (Date.now() - gameOverTime < restartDelay) return;
        gameState = "countdown";
        startCountdown();
        update();
        return;
    }
    velocity = jumpStrength;
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

canvas.addEventListener("click",jump);
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
});

const obstacles = [];
const obstacleWidth = 60;
const gapHeight = 150;
const obstacleSpeed = 3;
let frameSinceLastSpawn = 0;
const spawnFrameInterval = 120;

function updateScore() {
    for (const obs of obstacles) {
        if (!obs.scored && obs.x + obstacleWidth < headX) {
            obs.scored = true;
            score++;

            if (score > highScore) {
                highScore = score;
                sessionStorage.setItem('flappyGoatHighScore', highScore);
            }
        }
    }
}

function drawScore() {
    ctx.fillStyle = "rgb(248, 234, 111)";
    ctx.fillRect(5, 5, 150, 65);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 150, 65);

    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.font = "18px sans-serif";
    ctx.fillText(`Best: ${highScore}`, 10, 55);
}

function spawnObstacle() {
    const gapY = Math.random() * (canvas.height - gapHeight -100) + 50;
    obstacles.push({
        x: canvas.width,
        gapY: gapY
    });  
}
  
function updateObstacles() {
    framesSinceLastSpawn++;
    if (framesSinceLastSpawn >= spawnFrameInterval) {
        spawnObstacle();
        framesSinceLastSpawn = 0;
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;

        if (obstacles[i].x + obstacleWidth < 0) {
        obstacles.splice(i, 1);
        }
    }
} 

function drawObstacles() {
    ctx.fillStyle = "rgb(184, 176, 112)";
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.gapY);
        ctx.fillRect(obstacle.x, obstacle.gapY + gapHeight, obstacleWidth, canvas.height - obstacle.gapY - gapHeight);
    }
}

let gameOver = false;
const headSize = 50;
const headX = 100;

function checkCollision() {
    if(birdY + headSize/2 > canvas.height || birdY - headSize/2<0) {
        return true;
    }

    //obstacles
    for (const obs of obstacles) {
        const withinX = headX + headSize/2 > obs.x && headX-headSize/2 < obs.x + obstacleWidth;

        if (withinX) {
            const hitsTop = birdY - headSize/2 < obs.gapY;
            const hitsBottom = birdY + headSize/2 > obs.gapY + gapHeight;

            if (hitsTop || hitsBottom) {
                return true;
            }
        }
    }
    return false;
}

function update() {

    if (gameState === "start") {
        drawStartScreen();
        requestAnimationFrame(update);
        return;
    }

    if (gameState === "countdown") {
        const elapsed = Date.now() - countdownStart;
        countdownValue = 3 - Math.floor(elapsed / countdownStepMs);

        drawCountdown();

        if (elapsed >= countdownStepMs * 4) { // 3, 2, 1, Go! then start
        gameState = "playing";
        }

        requestAnimationFrame(update);
        return;
    }

    if (gameState === "gameover") {
        return;
    }    

    velocity += gravity;
    birdY += velocity;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateObstacles();
    drawObstacles();
    updateScore();
    drawScore();
    
    const size = headSize;
    ctx.drawImage(headImg, 100-size/2, birdY-size/2, size, size);

    if (checkCollision()) {
        gameState = "gameover";
        gameOverTime = Date.now();
        ctx.fillStyle = "black";
        ctx.font = "30px 'Baloo 2'";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, 300);
        ctx.font = "18px 'Baloo 2'";
        ctx.fillText("Tap to Restart", canvas.width / 2, 340);
        ctx.textAlign = "left";
        return;
    }

    requestAnimationFrame(update);
}

function resetGame() {
    birdY = 300;
    velocity = 0;
    obstacles.length = 0;
    score = 0;
    framesSinceLastSpawn = 0;
}

update();
