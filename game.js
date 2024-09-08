const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const playerImg = new Image();
playerImg.src = './player.png';
const obstacleImg = new Image();
obstacleImg.src = './obstacle.png';
const coinImg = new Image();
coinImg.src = './coin.png';

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 50,  // Adjust based on your new image size
    height: 50, // Adjust based on your new image size
    jumping: false,
    jumpForce: 0,
    maxJumpForce: 25,
    minJumpForce: 15,
    jumpChargeRate: 1.5,
    gravity: 0.5
};

let obstacles = [];
let coins = [];
let score = 0;
let gameOver = false;
let spacePressed = false;
let spaceHeldTime = 0;
let gameSpeed = 5;
let frameCount = 0;
let lastObstacleTime = 0;
const minObstacleInterval = 1500; // Minimum time between obstacles in milliseconds

let gameState = 'start'; // Add this line to track game state: 'start', 'playing', or 'gameOver'

function drawPlayer() {
    if (playerImg.complete) {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        console.log('Player image not loaded');
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacleImg.complete) {
            ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            console.log('Obstacle image not loaded');
        }
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (coinImg.complete) {
            ctx.drawImage(coinImg, coin.x - coin.radius, coin.y - coin.radius, coin.radius * 2, coin.radius * 2);
        } else {
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            ctx.fill();
            console.log('Coin image not loaded');
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        // Display start screen
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Runner Game', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '20px Arial';
        ctx.fillText('Press Space Bar to Start', canvas.width / 2, canvas.height / 2 + 20);
        
        requestAnimationFrame(updateGame);
        return;
    }

    if (gameState === 'gameOver') {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = '30px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 60);
        
        requestAnimationFrame(updateGame);
        return;
    }

    // Game playing state
    drawPlayer();
    drawObstacles();
    drawCoins();
    drawScore();

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });

    // Move coins
    coins.forEach(coin => {
        coin.x -= gameSpeed;
    });

    // Remove off-screen obstacles and coins
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    coins = coins.filter(coin => coin.x + coin.radius > 0);

    // Add new obstacles
    const currentTime = Date.now();
    if (currentTime - lastObstacleTime > minObstacleInterval && Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50 - Math.random() * 50,
            width: 30 + Math.random() * 50,
            height: 50 + Math.random() * 50
        });
        lastObstacleTime = currentTime;
    }

    // Add new coins
    if (Math.random() < 0.05) {
        coins.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 100) + 50,
            radius: 10
        });
    }

    // Handle jumping
    if (player.jumping) {
        player.y -= player.jumpForce;
        player.jumpForce -= player.gravity;
        
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.jumping = false;
            player.jumpForce = 0;
        }
    } else if (spacePressed && player.y === canvas.height - player.height) {
        spaceHeldTime += 1/60; // Assuming 60 FPS
        let chargedForce = player.minJumpForce + (player.jumpChargeRate * spaceHeldTime);
        player.jumpForce = Math.min(chargedForce, player.maxJumpForce);
    } else {
        player.y = canvas.height - player.height;
        player.jumpForce = 0;
        spaceHeldTime = 0;
    }

    // Check for collisions
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameState = 'gameOver';
        }
    });

    coins.forEach((coin, index) => {
        if (
            player.x < coin.x + coin.radius &&
            player.x + player.width > coin.x - coin.radius &&
            player.y < coin.y + coin.radius &&
            player.y + player.height > coin.y - coin.radius
        ) {
            coins.splice(index, 1);
            score += 10;
        }
    });

    // Increase game speed over time
    frameCount++;
    if (frameCount % 600 === 0) { // Increase speed every 10 seconds (assuming 60 FPS)
        gameSpeed += 0.5;
    }

    requestAnimationFrame(updateGame);
}

function startGame() {
    gameState = 'playing';
    player.y = canvas.height - player.height;
    player.jumping = false;
    obstacles = [];
    coins = [];
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    lastObstacleTime = 0;
}

// Modify the keydown event listener
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameState === 'start' || gameState === 'gameOver') {
            startGame();
        } else if (gameState === 'playing') {
            if (!spacePressed && player.y === canvas.height - player.height) {
                spacePressed = true;
                spaceHeldTime = 0;
            }
        }
        event.preventDefault(); // Prevent spacebar from scrolling the page
    }
});

// Modify the keyup event listener
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        spacePressed = false;
        if (gameState === 'playing' && !player.jumping && player.y === canvas.height - player.height) {
            player.jumping = true;
        }
        event.preventDefault(); // Prevent spacebar from scrolling the page
    }
});

// Remove the restart button event listener
// restartButton.addEventListener('click', restartGame);

// Start the game loop
updateGame();
