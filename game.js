/* 6/27/14 v1.5 DEV
added:
-player collisions with enemy
-player lives
-lives decremented on collision
-game restarts when lives < 1
-reward points weighted on speed of enemy
-banana gun!!!
*/
var version = "v1.6 debug";
var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');
var canvasJet = document.getElementById('canvasJet');
var ctxJet = canvasJet.getContext('2d');
var canvasEnemy = document.getElementById('canvasEnemy');
var ctxEnemy = canvasEnemy.getContext('2d');
var canvasHUD = document.getElementById('canvasHUD');
var ctxHUD = canvasHUD.getContext('2d');
ctxHUD.fillStyle = "hsla(90, 100%, 50%, 0.5)";
ctxHUD.font = "bold 20px Arial";
var bgDrawX1 = 0;
var bgDrawX2 = 1600;
var jet1 = new Jet();
var btnPlay = new Button(300, 485, 360, 511);
var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;
var mouseX = 0;
var mouseY = 0;
var isPlaying = false;
var requestAnimFrame = window.requestAnimationFrame || 
					   window.webkitRequestAnimationFrame ||
					   window.mozRequestAnimationFrame ||					   
					   window.msRequestAnimationFrame ||
					   window.oRequestAnimationFrame;
var enemies = [];
var spawnAmount = 7;

var imgSprite = new Image();
imgSprite.src = 'images/spriteSheet4.png'
imgSprite.addEventListener('load',init,false);



// main functions
function init(){	
	spawnEnemy(spawnAmount);
	drawMenu();	
	document.addEventListener('click',mouseClicked,false);
}

function moveBg(){
	bgDrawX1 -= 5;
	bgDrawX2 -= 5;
	if (bgDrawX1 <= -1600) {
		bgDrawX1 = 1600;
	} else if (bgDrawX2 <= -1600) {
		bgDrawX2 = 1600;
	}
	drawBg();
}

function playGame(){
	drawBg();
	startLoop();	
	updateHUD();	
	document.addEventListener('keydown',checkKeyDown,false);
	document.addEventListener('keyup',checkKeyUp,false);
}

function spawnEnemy(number){
	for (var i = 0; i < number; i++){
		enemies[enemies.length] = new Enemy();				
	}
}

function drawAllEnemies(){
	clearCtxEnemy();
	for(var i = 0; i < enemies.length; i++){
		enemies[i].draw();
	}
}

function loop(){
	if (isPlaying){
		moveBg();
		jet1.draw();
		drawAllEnemies();		
		requestAnimFrame(loop);
	}
}

function startLoop(){
	isPlaying = true;
	loop();	
}

function stopLoop(){
	isPlaying = false;	
}

function drawMenu(){	
    var menuHeight = gameHeight - 25;
    ctxBg.drawImage(imgSprite, 0, 590, gameWidth, menuHeight, 0, 0, gameWidth, gameHeight);
}

function drawBg(){	
	var srcX = 0;
	var srcY = 0;
	var gameWidth = 1600;
	var drawY = 0;		

	ctxBg.clearRect(0,0,gameWidth,gameHeight); // clear the entire canvas
	ctxBg.drawImage(imgSprite,srcX,srcY,gameWidth,gameHeight,bgDrawX1,drawY,gameWidth,gameHeight);
	ctxBg.drawImage(imgSprite,srcX,srcY,gameWidth,gameHeight,bgDrawX2,drawY,gameWidth,gameHeight);
}

function updateHUD(){
	ctxHUD.clearRect(0,0,gameWidth,gameHeight); // clear the HUD canvas	
	ctxHUD.fillText("Score: " + jet1.score, 680, 30);
	ctxHUD.fillText("Lives: " + jet1.lives, 680, 50);
	ctxHUD.fillText(version, 0, 30);
}
// end of main functions



// jet functions
function Jet(){
	this.srcX = 105;
	this.srcY = 500;	
	this.width = 90;
	this.height = 40;
	this.speed = 5;
	this.drawX = 220;
	this.drawY = 200;
	this.noseX = this.drawX + 100;
	this.noseY = this.drawY + 30;
	this.leftX = this.drawX;
	this.rightX = this.drawX + this.width;
	this.topY = this.drawY;
	this.bottomY = this.drawY + this.height;
	this.isUpKey = false;
	this.isRightKey = false;
	this.isDownKey = false;
	this.isLeftKey = false;
	this.isSpacebar = false;
	this.isShooting = false;	
	this.bullets = [];
	this.currentBullet = 0;
	this.bulletType = 1; // type 1 is pea shooter, type 2 is laser, type 3 is rayGun1, type 4 is rayGun2
	for (var i = 0; i < 20; i++) {
		this.bullets[this.bullets.length] = new Bullet(this);
	}
	this.score = 0;
	this.lives = 3;
	this.jetExplosion = new Explosion();

}

Jet.prototype.draw = function () {
	clearCtxJet();	
	this.updateCoors();	
	this.checkDirection();	
	this.checkShooting();
	this.drawAllBullets();
	ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
	this.checkCollisionEnemy();
	if (this.jetExplosion.hasHit) {
	    this.jetExplosion.draw();
	}
};

Jet.prototype.updateCoors = function(){
	this.noseX = this.drawX + 92;
	this.noseY = this.drawY + 20;
	this.leftX = this.drawX;
	this.rightX = this.drawX + this.width;
	this.topY = this.drawY;
	this.bottomY = this.drawY + this.height;
}

Jet.prototype.checkDirection = function () {
	if (this.isUpKey && this.topY > 0){
		this.drawY -= this.speed;
	}
	if (this.isRightKey && this.rightX < gameWidth){
		this.drawX += this.speed;
	}
	if (this.isDownKey && this.bottomY < gameHeight){
		this.drawY += this.speed;
	}
	if (this.isLeftKey && this.leftX > 0){
		this.drawX -= this.speed;
	}
}

Jet.prototype.drawAllBullets = function(){
	for(var i = 0; i < this.bullets.length; i++){
		if(this.bullets[i].drawX >= 0) this.bullets[i].draw();
		if(this.bullets[i].explosion.hasHit) this.bullets[i].explosion.draw();		
	}	
}

Jet.prototype.checkShooting = function(){	
		if (this.isSpacebar && !this.isShooting){
			this.isShooting = true;			
			this.bullets[this.currentBullet].fire(this.noseX, this.noseY);
			this.currentBullet++;
			if(this.currentBullet >= this.bullets.length) this.currentBullet = 0;
		} else if (!this.isSpacebar){
				this.isShooting = false;
			}
}

Jet.prototype.checkCollisionEnemy = function () {
    for (var i = 0; i < enemies.length; i++) {
        if (this.drawX + 90 >= enemies[i].drawX &&
			this.drawX <= enemies[i].drawX + enemies[i].width &&
			this.drawY + 30 >= enemies[i].drawY &&
			this.drawY <= enemies[i].drawY + enemies[i].height) {
            this.jetExplosion.drawX = this.drawX;
            this.jetExplosion.drawY = this.drawY - 25;
            this.jetExplosion.hasHit = true;
            enemies[i].recycleEnemy();
            this.updateLives(-1);
            if (this.lives < 1) {
                isPlaying = false;                
                location.reload(); // refresh the page and start over
            }
        }
    }
}

function gameOver() {

}

Jet.prototype.updateScore = function(points){	
	this.score += points;
	updateHUD();		
}

function clearCtxJet(){
	ctxJet.clearRect(0,0,gameWidth,gameHeight); // clear the player jet canvas
}

Jet.prototype.updateLives = function (lives) {
    this.lives += lives;
    updateHUD();
}
// end of jet functions




// bullet functions
function Bullet(j){
	this.jet = j;	
	this.srcX = 100;
	this.srcY = 500;
	this.width = 5;		
	this.height = 5;
	this.drawX = -20;		
	this.drawY = 0;
	this.explosion = new Explosion();
}

Bullet.prototype.draw = function () {    
    this.drawX += 9;
	ctxJet.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
	this.checkHitEnemy();
	if (this.drawX > gameWidth) this.recycle();
}

Bullet.prototype.recycle = function () {
	this.drawX = -20;
}

Bullet.prototype.fire = function (startX, startY) {
    // NEW adding call to checkWeaponType at fire time
    this.checkWeaponType();
    this.drawX = startX;
	this.drawY = startY;
}

// NEW adding function to check gun type
Bullet.prototype.checkWeaponType = function () {        
    

    if (jet1.bulletType === 1) {
        this.srcX = 100;
        this.srcY = 500;
        this.width = 5;
        this.height = 5;
    }
    if (jet1.bulletType === 2) {
        this.srcX = 108;
        this.srcY = 543;
        this.width = 20;
        this.height = 3;
    }
    if (jet1.bulletType === 3) {
        this.srcX = 108;
        this.srcY = 550;
        this.width = 40;
        this.height = 10;
    }
    if (jet1.bulletType === 4) {
        this.srcX = 108;
        this.srcY = 561;
        this.width = 40;
        this.height = 10;
    }
    if (jet1.bulletType === 5) {
        this.srcX = 158;
        this.srcY = 538;
        this.width = 35;
        this.height = 25;
    }
}

Bullet.prototype.checkHitEnemy = function(){
	for(var i = 0; i < enemies.length; i++){
		if( this.drawX >= enemies[i].drawX &&
			this.drawX <= enemies[i].drawX + enemies[i].width &&
			this.drawY >= enemies[i].drawY &&
			this.drawY <= enemies[i].drawY + enemies[i].height){
				this.explosion.drawX = enemies[i].drawX - (this.explosion.width / 2);
				this.explosion.drawY = enemies[i].drawY;
				this.explosion.hasHit = true;
				this.recycle();
				enemies[i].recycleEnemy();
				this.jet.updateScore(enemies[i].rewardPoints);
		}
	}
}
// end of bullet functions




// explosion functions
function Explosion(){
	this.srcX = 705;
	this.srcY = 500;
	this.drawX = -20;
	this.drawY = 0;
	this.width = 95;
	this.height =79;
	this.hasHit = false;
	this.currentFrame = 0;
	this.totalFrames = 10;
}

Explosion.prototype.draw = function () {
	if (this.currentFrame <= this.totalFrames){
		ctxJet.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
		this.currentFrame++;
	}
	else{
		this.hasHit = false;
		this.currentFrame = 0;
	}
}
// end of explosion functions




// enemy functions
function Enemy(){
	//this.srcX = 0;
    //this.srcY = 540;	
    this.srcX = 200;
    this.srcY = 500;	
	//this.width = 100;
    //this.height = 40;
    this.width = 60;
    this.height = 20;
	this.speed = Math.floor(Math.random() * 8);    
	this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
	this.drawY = Math.floor(Math.random() * gameHeight);
	this.rewardPoints = 5 + this.speed;
}

Enemy.prototype.draw = function () {		
    this.drawX -= this.speed;        
	ctxEnemy.drawImage(imgSprite,this.srcX,this.srcY,this.width,this.height,this.drawX,this.drawY,this.width,this.height);
	this.checkEscaped();
}

Enemy.prototype.checkEscaped = function () {		
	if(this.drawX + this.width <= 0){
		this.recycleEnemy();
	}
}

Enemy.prototype.recycleEnemy = function () {
	this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
	this.drawY = Math.floor(Math.random() * gameHeight);
}

function clearCtxEnemy(){
	ctxEnemy.clearRect(0,0,gameWidth,gameHeight); // clear the player jet canvas
}
// end enemy functions


// button object
function Button(xL, xR, yT, yB){
	this.xLeft = xL;
	this.xRight = xR;
	this.yTop = yT;
	this.yBottom = yB;
}

Button.prototype.checkClicked = function () {
	if(this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) return true;
}
// end of button object



// event functions
function mouseClicked(e){
	mouseX = e.pageX - canvasBg.offsetLeft;
	mouseY = e.pageY - canvasBg.offsetTop;
	if (!isPlaying){
		if (btnPlay.checkClicked()) playGame();	
	}
}

function checkKeyDown(e){
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87){ // up arrow or W		
		jet1.isUpKey = true;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68){ // right arrow or D
		jet1.isRightKey = true;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83){ // down arrow or S
		jet1.isDownKey = true;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65){ // left arrow or A
		jet1.isLeftKey = true;
		e.preventDefault();
	}
	if (keyID === 32) { // spacebar
		jet1.isSpacebar = true;
		e.preventDefault();
	}
	if (keyID === 16) { // shift key
	    if (jet1.bulletType < 5) {
	        jet1.bulletType++;
	    }
	    else {
	        jet1.bulletType = 1;
	    }
	}
}

function checkKeyUp(e){
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87){ // up arrow or W		
		jet1.isUpKey = false;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68){ // right arrow or D
		jet1.isRightKey = false;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83){ // down arrow or S
		jet1.isDownKey = false;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65){ // left arrow or A
		jet1.isLeftKey = false;
		e.preventDefault();
	}
	if (keyID === 32) { //spacebar
		jet1.isSpacebar = false;
		e.preventDefault();
	}
}
// end of event functions