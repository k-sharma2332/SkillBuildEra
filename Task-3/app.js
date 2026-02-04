const playBoard = document.querySelector(".play-board");
const scoreEl = document.querySelector(".score");
const highScoreEl = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let snakeBody = [];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;

highScoreEl.innerText = `High-score: ${highScore}`;
scoreEl.innerText = `Score : ${score}`;

const changeFoodPosition = () => {
    // pass a random value between 1 and 30 as food position
    let valid = false;
    while (!valid) {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
        // ensure food doesn't spawn on the snake
        valid = true;
        if (snakeX === foodX && snakeY === foodY) valid = false;
        for (let seg of snakeBody) {
            if (seg[0] === foodX && seg[1] === foodY) {
                valid = false;
                break;
            }
        }
    }
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert("Game Over! Press OK to restart.");
    location.reload();
}

const changeDirection = (e) => {
    // prevent reversing direction directly
    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0; velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0; velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1; velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1; velocityY = 0;
    }
}

const initGame = () => {
    if (gameOver) return handleGameOver();

    let htmlMarkup = `<div class="food" style="grid-area: ${foodY}/${foodX}"></div>`;

    // store previous head position
    const prevX = snakeX, prevY = snakeY;

    // update head position
    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
    }

    // move body- shift each segment to the position of the previous segment
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length > 0) {
        snakeBody[0] = [prevX, prevY];
    }

    // check self-collision
    for (let seg of snakeBody) {
        if (seg[0] === snakeX && seg[1] === snakeY) {
            gameOver = true;
            break;
        }
    }

    // check food eaten AFTER movement
    if (snakeX === foodX && snakeY === foodY) {
        // add previous head 
        snakeBody.unshift([prevX, prevY]);
        score += 5;
        scoreEl.innerText = `Score : ${score}`;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("high-score", highScore);
            highScoreEl.innerText = `High-score: ${highScore}`;
        }
        changeFoodPosition();
    }

    // add snake head
    htmlMarkup += `<div class="head" style="grid-area: ${snakeY}/${snakeX}"></div>`;

    // add body parts
    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="body" style="grid-area: ${snakeBody[i][1]}/${snakeBody[i][0]}"></div>`;
    }

    playBoard.innerHTML = htmlMarkup;
}

changeFoodPosition();
setIntervalId = setInterval(initGame, 125);
document.addEventListener("keydown", changeDirection);


