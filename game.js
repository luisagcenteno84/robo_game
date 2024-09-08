const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    jumping: false,
    jumpHeight: 100,
    jumpSpeed: 5,
    maxJumpHeight: 200  // New property for maximum jump height
};

let obstacles = [];
let coins = [];
let score = 0;
let gameOver = false;
let spacePressed = false;  // New variable to track space bar state

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawCoins() {
    ctx.fillStyle = 'gold';
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    drawPlayer();
    drawObstacles();
    drawCoins();
    drawScore();

    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= 5;
    });

    // Move coins
    coins.forEach(coin => {
        coin.x -= 5;
    });

    // Remove off-screen obstacles and coins
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    coins = coins.filter(coin => coin.x + coin.radius > 0);

    // Add new obstacles
    if (Math.random() < 0.02) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 30,
            height: 50
        });
    }

    // Add new coins
    if (Math.random() < 0.01) {
        coins.push({
            x: canvas.width,
            y: Math.random() * (canvas.height - 100) + 50,
            radius: 10
        });
    }

    // Handle jumping
    if (player.jumping) {
        player.y -= player.jumpSpeed;
        if (player.y <= canvas.height - player.height - player.jumpHeight) {
            player.jumping = false;
        }
    } else if (player.y < canvas.height - player.height) {
        player.y += player.jumpSpeed;
    }

    // Check for collisions
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameOver = true;
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

    requestAnimationFrame(updateGame);
}

function jump() {
    if (!player.jumping && player.y === canvas.height - player.height) {
        player.jumping = true;
    }
}

function restartGame() {
    player.y = canvas.height - player.height;
    player.jumping = false;
    obstacles = [];
    coins = [];
    score = 0;
    gameOver = false;
    updateGame();
    
    // Remove focus from the restart button
    restartButton.blur();
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

restartButton.addEventListener('click', restartGame);

updateGame();
