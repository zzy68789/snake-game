// 游戏配置
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const INITIAL_SNAKE = [{x: 10, y: 10}];
const INITIAL_FOOD = {x: 15, y: 15};
const INITIAL_DIRECTION = {x: 0, y: 0};
const GAME_SPEED = 150;

// 颜色配置
const COLORS = {
    snake: '#48bb78',
    snakeHead: '#38a169',
    food: '#e53e3e',
    background: '#2d3748',
    grid: '#4a5568'
};

// 游戏状态
let canvas, ctx;
let snake, food, direction, nextDirection;
let score, highScore;
let gameRunning, gamePaused, gameLoop;

// DOM 元素
let scoreElement, highScoreElement, startBtn, pauseBtn, resetBtn;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    startBtn = document.getElementById('start-btn');
    pauseBtn = document.getElementById('pause-btn');
    resetBtn = document.getElementById('reset-btn');

    // 加载最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;

    // 绑定事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);

    resetGame();
}

// 重置游戏
function resetGame() {
    snake = [...INITIAL_SNAKE];
    food = {...INITIAL_FOOD};
    direction = {...INITIAL_DIRECTION};
    nextDirection = {...INITIAL_DIRECTION};
    score = 0;
    scoreElement.textContent = score;
    gameRunning = false;
    gamePaused = false;

    updateButtons();
    draw();
}

// 开始游戏
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    updateButtons();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, GAME_SPEED);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    updateButtons();

    if (gamePaused) {
        clearInterval(gameLoop);
    } else {
        gameLoop = setInterval(gameStep, GAME_SPEED);
    }
}

// 更新按钮状态
function updateButtons() {
    startBtn.disabled = gameRunning && !gamePaused;
    pauseBtn.disabled = !gameRunning || gamePaused;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
    resetBtn.disabled = false;
}

// 游戏主循环
function gameStep() {
    if (gamePaused) return;

    moveSnake();
    checkCollision();
    checkFood();
    draw();
}

// 移动蛇
function moveSnake() {
    direction = {...nextDirection};

    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);

    // 如果没吃到食物，移除尾部
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

// 检查食物碰撞
function checkFoodCollision() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

// 检查食物并生成新食物
function checkFood() {
    if (checkFoodCollision()) {
        score += 10;
        scoreElement.textContent = score;

        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        generateFood();
    }
}

// 生成新食物
function generateFood() {
    do {
        food.x = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
        food.y = Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE));
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];

    // 撞墙
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        gameOver();
        return;
    }

    // 撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    updateButtons();

    setTimeout(() => {
        alert(`游戏结束！\n最终得分: ${score}\n最高分: ${highScore}`);
    }, 100);
}

// 处理键盘事件
function handleKeyPress(event) {
    if (!gameRunning || gamePaused) return;

    const key = event.key.toLowerCase();

    // 防止反向移动
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) nextDirection = {x: 0, y: -1};
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) nextDirection = {x: 0, y: 1};
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) nextDirection = {x: -1, y: 0};
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) nextDirection = {x: 1, y: 0};
            break;
    }

    event.preventDefault();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 绘制网格
    drawGrid();

    // 绘制蛇
    drawSnake();

    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );

        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 3;
            const eyeOffset = 4;

            // 根据方向绘制眼睛
            if (direction.x === 1) { // 向右
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.x === -1) { // 向左
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            } else if (direction.y === -1) { // 向上
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
            } else if (direction.y === 1) { // 向下
                ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
            }
        }
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();

    // 添加食物的光泽效果
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 3,
        food.y * GRID_SIZE + GRID_SIZE / 3,
        GRID_SIZE / 6,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);
