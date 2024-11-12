// Select the canvas element
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player1Score = 0;
let player2Score = 0;
const winningScore = 10;
let isGameOver = false;

// Paddle settings
const paddleWidth = 10;
const paddleHeight = 75;
const paddleSpeed = 6;
let upPressed = false;
let downPressed = false;

// Load images for paddles, ball, and background
const paddleLeftImage = new Image();
paddleLeftImage.src = "./images/PongPaddleV_Left_02.png";

const paddleRightImage = new Image();
paddleRightImage.src = "./images/PongPaddleV_Right_02.png";

const ballImage = new Image();
ballImage.src = "./images/PongBall_16_16_02.png";

const backgroundImage = new Image();
backgroundImage.src = "./images/PongBackground_02.png";

// Load sound effects
const paddleHitSound = [new Audio(), new Audio()];
for (let sound of paddleHitSound) sound.src = "./sounds/BallBounce_01.wav";

const wallHitSound = [new Audio(), new Audio()];
for (let sound of wallHitSound) sound.src = "./sounds/MetalHit_01.wav";

const scoreSound = new Audio();
scoreSound.src = "./sounds/Enemy_Laser.WAV";

const gameStartSound = new Audio();
gameStartSound.src = "./sounds/AlienWierdness_01.wav";

const gameEndSound = new Audio();
gameEndSound.src = "./sounds/GAMEOVER.WAV";

// Player paddles
const player1 = {
    x: 2 * paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const player2 = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

// Ball settings
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    speed: 2,
    dx: 4,
    dy: -4
};

// Start button functionality
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', startGame);

// Event listeners for arrow key presses
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Arrow key press handler
function keyDownHandler(e) {
    if (e.key === 'ArrowUp') {
        upPressed = true;
    } else if (e.key === 'ArrowDown') {
        downPressed = true;
    }
}

// Arrow key release handler
function keyUpHandler(e) {
    if (e.key === 'ArrowUp') {
        upPressed = false;
    } else if (e.key === 'ArrowDown') {
        downPressed = false;
    }
}

// Start the game
function startGame() {
    isGameOver = false;
    player1Score = 0;
    player2Score = 0;
    ballReset();

    // Play game start sound
    gameStartSound.play();

    startBtn.style.display = 'none'; // Hide the start button
    gameLoop();
}

// Function to reset the ball position
function ballReset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Game over function
function checkGameOver() {
    if (player1Score >= winningScore || player2Score >= winningScore) {
        isGameOver = true;

        // Play game end sound
        gameEndSound.play();

        startBtn.style.display = 'block'; // Show the start button again
    }
}

// Draw everything on the canvas, now with graphics
function draw() {
    // Draw the background image
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw the paddles with images
    ctx.drawImage(paddleLeftImage, player1.x, player1.y, player1.width, player1.height);
    ctx.drawImage(paddleRightImage, player2.x, player2.y, player2.width, player2.height);

    // Draw the ball with image
    ctx.drawImage(ballImage, ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);

    // Draw the score
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Player: ${player1Score}`, 20, 30);
    ctx.fillText(`AI: ${player2Score}`, canvas.width - 100, 30);
}

// Move the ball and paddles
function update() {
    // Move player 1 paddle based on arrow key input
    if (upPressed) {
        player1.y -= paddleSpeed;
    }
    if (downPressed) {
        player1.y += paddleSpeed;
    }

    // Prevent player 1 paddle from going out of bounds
    if (player1.y < 0) player1.y = 0;
    if (player1.y + paddleHeight > canvas.height) player1.y = canvas.height - paddleHeight;

    // Move AI paddle (simple AI logic: track ball)
    if (player2.y + paddleHeight / 2 < ball.y) player2.y += player2.speed;
    if (player2.y + paddleHeight / 2 > ball.y) player2.y -= player2.speed;

    // Prevent AI paddle from going out of bounds
    if (player2.y < 0) player2.y = 0;
    if (player2.y + paddleHeight > canvas.height) player2.y = canvas.height - paddleHeight;

    // Move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size / 2 < 0 || ball.y + ball.size / 2 > canvas.height) {
        ball.dy *= -1;

        // Play wall hit sound
        for (let sound of wallHitSound) {
            if (sound.ended || sound.currentTime === 0) {
                sound.play();
                break;
            }
        }
    }

    // Ball collision with paddles
    if (ball.x - ball.size / 2 < player1.x + paddleWidth &&
        ball.y > player1.y && ball.y < player1.y + paddleHeight) {
        ball.dx *= -1;

        // Play paddle hit sound
        for (let sound of paddleHitSound) {
            if (sound.ended || sound.currentTime === 0) {
                sound.play();
                break;
            }
        }
    }

    if (ball.x + ball.size / 2 > player2.x &&
        ball.y > player2.y && ball.y < player2.y + paddleHeight) {
        ball.dx *= -1;

        // Play paddle hit sound
        for (let sound of paddleHitSound) {
            if (sound.ended || sound.currentTime === 0) {
                sound.play();
                break;
            }
        }
    }

    // Ball goes out of bounds (scoring)
    if (ball.x - ball.size / 2 < 0) {
        player2Score += 1;
        scoreSound.play();
        ballReset();
    }

    if (ball.x + ball.size / 2 > canvas.width) {
        player1Score += 1;
        scoreSound.play();
        ballReset();
    }

    // Check if the game is over
    checkGameOver();
}

// Game loop
function gameLoop() {
    draw();
    update();

    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}
