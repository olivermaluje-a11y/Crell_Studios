// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startGameBtn');
const stopBtn = document.getElementById('stopGameBtn');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = Math.min(600, container.clientWidth - 20);
    canvas.height = 400;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let gameRunning = false;
let score = 0;
let shapes = [];
let gameSpeed = 1;

// Shape object
class Shape {
    constructor() {
        this.x = Math.random() * (canvas.width - 40) + 20;
        this.y = Math.random() * (canvas.height - 40) + 20;
        this.radius = Math.random() * 15 + 10;
        this.color = this.getRandomColor();
        this.vx = (Math.random() - 0.5) * 2 * gameSpeed;
        this.vy = (Math.random() - 0.5) * 2 * gameSpeed;
        this.life = 3; // seconds
        this.createdAt = Date.now();
    }

    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    isAlive() {
        const age = (Date.now() - this.createdAt) / 1000;
        return age < this.life;
    }

    contains(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance < this.radius;
    }
}

// Game functions
function startGame() {
    gameRunning = true;
    score = 0;
    shapes = [];
    scoreDisplay.textContent = score;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    gameSpeed = 1;

    // Create initial shapes
    for (let i = 0; i < 3; i++) {
        shapes.push(new Shape());
    }

    gameLoop();
}

function stopGame() {
    gameRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw game over message
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 30px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Segoe UI';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw shapes
    shapes = shapes.filter(shape => shape.isAlive());

    shapes.forEach(shape => {
        shape.update();
        shape.draw();
    });

    // Add new shapes based on score
    if (shapes.length < Math.min(3 + Math.floor(score / 50), 8)) {
        shapes.push(new Shape());
    }

    // Increase difficulty
    gameSpeed = 1 + score / 200;

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Mouse click handler
canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on any shape
    for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapes[i].contains(x, y)) {
            score += 10;
            scoreDisplay.textContent = score;
            shapes.splice(i, 1);
            break;
        }
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touched any shape
    for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapes[i].contains(x, y)) {
            score += 10;
            scoreDisplay.textContent = score;
            shapes.splice(i, 1);
            break;
        }
    }
});

// Button event listeners
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);