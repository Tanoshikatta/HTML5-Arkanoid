// =========================== GAME LOGIC ===================================== 
// Get the canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Get the animation frame
var requestAnimFrame = 
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback)
		{
			window.setTimeout(callback, 1000/60);
	    };

// Add mousemove and mousedown events to the canvas
canvas.addEventListener("mousemove", trackMouse, true);

// Declare game objects
mouse = {};
const MAXBOUNCEANGLE = Math.PI / 12;
var playerPaddle = new Paddle();
var mainBall = new Ball();
var leftWall = new Wall(0,0,8, canvas.height - 2, "left");
var rightWall = new Wall(canvas.width - 8, 0, 8, canvas.height - 2, "right");
var topWall = new Wall(0,0, canvas.width, 8, "top");
var walls = [leftWall, rightWall, topWall];


// Start the game!
init();

// =========================== DECLARATIONS ===================================

// Declare events ==========================
function trackMouse(e)
{
    var rect = canvas.getBoundingClientRect();
    mouse.x = Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width);
    mouse.y = Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height);
}
// =========================================

// Declare classes =========================
function Paddle()
{
    this.h = 8;
    this.w = canvas.width / 8;
    this.c = "white";
    this.x = canvas.width / 2 - this.w/2;
    this.y = canvas.height - this.h - 2;
    
    this.move = function()
    {
        if(mouse.x && mouse.y)
        {
            this.x = mouse.x - this.w/2;
        }
    };
    
    this.draw = function()
    {
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    };
    
    this.collide = function(ball)
    {
        // Ball is too high to collide
        if(ball.bottom() < this.y)
            return;
        
        // Ball is too low to collide
        if(ball.top() > this.y)
            return;
        
        // Ball is too far to the left to collide
        if(ball.right() < this.x)
            return;
        
        // Ball is too far to the right to collide
        if(ball.left() > (this.x + this.w))
            return;
            
        this.rebound(ball);
    };
    
    this.rebound = function(ball)
    {   
        var relativeIntersectX = ball.x - (this.x + (this.w/2));
        var normalizedRelativeIntersectionX = (relativeIntersectX/(this.w/2));
        var bounceAngle = normalizedRelativeIntersectionX + (Math.PI / 2);
        var ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        
        ball.dx = ballSpeed * -Math.cos(bounceAngle);
        ball.dy = ballSpeed * -Math.sin(bounceAngle);
        
        ball.y = this.y - ball.r - 1;
    };
};

function Wall(x, y, width, height, orientation)
{
    this.w = width;
    this.h = height;
    this.x = x;
    this.y = y;
    this.c = "white";
    this.orientation = orientation;
    
    this.draw = function()
    {
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    };
    
    this.collide = function(ball)
    {
        switch(this.orientation)
        {
            case "left":
            if(ball.left() <= this.x + this.w)
                this.rebound(ball);
            break;
            
            case "right":
            if(ball.right() >= this.x)
                this.rebound(ball);
            break;
            
            case "top":
            if(ball.top() <= this.y + this.h)
                this.rebound(ball);
            break;
        }
    };
    
    this.rebound = function(ball)
    {
        switch(this.orientation)
        {
            // Invert ball.dx
            case "left":
            ball.dx = ball.dx * -1;
            ball.x = this.x + this.w + ball.r;
            break;
            
            case "right":
            ball.dx = ball.dx * -1;
            ball.x = this.x - ball.r;
            break;
            
            // Invert ball.dy
            case "top":
            ball.dy = ball.dy * -1;
            
            // Move the ball out of the wall
            ball.y = this.y + this.h + ball.r;
            break;
        }
    };
}

function Ball()
{
    this.r = 5;
    this.c = "white";
    this.x = canvas.width / 2 - this.r;
    this.y = canvas.height / 2 - this.r;
    this.dx = 0;
    this.dy = 4;
    
    this.bottom = function()
    {
        return this.y + this.r;  
    };
    
    this.top = function()
    {
        return this.y - this.r;  
    };
    
    this.left = function()
    {
        return this.x - this.r;  
    };
    
    this.right = function()
    {
        return this.x + this.r;  
    };
    
    this.move = function()
    {
      // Apply dx
      this.x += this.dx;
      
      // Apply dy
      this.y += this.dy;
    };
    
    this.draw = function()
    {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fill();
    };
};
// =========================================

// Declare functions ========================
function init()
{  
    // Start frame loop
	requestAnimFrame(update);
}

function update()
{  
    // Keep canvas size up to date - todo scaling
    //ctx.canvas.width = window.innerWidth;
    //ctx.canvas.height = window.innerHeight;
    
    // Draw the static objects
    drawStatic();
    
    // Move the paddle and ball
    moveObjects();
    
    // Check for and handle collisions
    collideObjects();
    
    // Draw the paddle and ball
    drawNonStatic();
    	
	// Recursive Step
	requestAnimFrame(update);
}

// Drawing
function drawStatic()
{
    drawCanvas();
    drawWalls();
}

function drawNonStatic()
{
    playerPaddle.draw();
    mainBall.draw();
}

function drawCanvas()
{
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, window.innerWidth, window.innerHeight);
}

function drawWalls()
{
    for(i = 0; i < walls.length; i++)
    {
        walls[i].draw();
    }
}

// Movement
function moveObjects()
{
    // Move the paddle
    playerPaddle.move();
    
    // Move the ball
    mainBall.move();
}

// Collision
function collideObjects()
{
    // Try to collide with the paddle
    playerPaddle.collide(mainBall);
    
    // Try to collide with the walls
    for(i = 0; i < walls.length; i++)
    {
        walls[i].collide(mainBall);
    } 
}
// =========================================
		