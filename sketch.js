var bg,bgImg;
var player, shooterImg, shooter_shooting;
var zombie, zombieImg;

var heart1, heart2, heart3;
var heart1Img, heart2Img, heart3Img;

var zombieGroup, bulletGroup;
var life = 3, score = 0, bullets = 10;
var gameState = "play"; //play,end,won
var bulletImg;
var explosion, lose, win;

var ammoBox, ammoBoxImg;
var ammoTouched = false;
var blink;
var zombieCounter = 0;
var killPercentage = 0;
var bulletVel = 8;



function preload(){
  heart1Img = loadImage("assets/heart_1.png");
  heart2Img = loadImage("assets/heart_2.png");
  heart3Img = loadImage("assets/heart_3.png");

  shooterImg = loadImage("assets/shooter_2.png");
  shooter_shooting = loadImage("assets/shooter_3.png");

  zombieImg = loadImage("assets/zombie.png");

  bulletImg = loadImage("assets/bullet.png");

  bgImg = loadImage("assets/bg.jpeg");

  ammoBoxImg = loadImage("assets/ammo.png");
  restartImg= loadImage("assets/restart.png")
  explosion = loadSound("assets/explosion.mp3");
  lose = loadSound("assets/lose.mp3");
  win = loadSound("assets/win.mp3");
}

function setup() {
createCanvas(windowWidth,windowHeight);

//adding the background image
bg = createSprite(width/2-20,height/2-40,20,20);
bg.addImage(bgImg);
bg.scale = 1.1;

restart= createSprite(width/2,150)
restart.addImage(restartImg)
restart.scale=0.5
restart.visible=false

//creating the player sprite
player = createSprite(120, height/2, 50, 50);
player.addImage(shooterImg);
player.scale = 0.3;
//player.debug = true;
player.setCollider("rectangle",0,0,200,500);

ammoBox = createSprite(width/2, height-100);
ammoBox.addImage(ammoBoxImg);
ammoBox.scale = 0.5;

//creating sprites to depict lives remaining
heart1 = createSprite(displayWidth-70,50,20,20);
heart1.addImage("heart1",heart1Img);
heart1.scale = 0.3;

heart2 = createSprite(displayWidth-40,50,20,20);
heart2.addImage("heart2",heart2Img);
heart2.scale = 0.3;

heart3 = createSprite(displayWidth-10,50,20,20);
heart3.addImage("heart3",heart3Img);
heart3.scale = 0.3;

//creating groups    
zombieGroup = new Group();
bulletGroup =new Group();

}

function draw() {
  background(0); 
  drawSprites();
  textSize(25);
  fill("blue");
  text("Score: "+score, 10,25);
  killPercentage = round((score/zombieCounter)*100);
  text("Kill: "+killPercentage+" %", 10, 55)
  displayHearts();

  if(bullets<5){
    fill("red");
    textSize(25);
    text("Bullets: "+bullets, 10,85);
    text("Refill",ammoBox.x-25,ammoBox.y+ammoBox.height/2-65);
  }else if(bullets>=5){
    fill("blue");
    textSize(25);
    text("Bullets: "+bullets, 10,85);
}


  if(gameState=="play"){
      //moving the player up and down and making the game mobile compatible using touches

      if(keyDown("UP_ARROW") && player.y>150){
        player.y -= 30;
      }
      if(keyDown("DOWN_ARROW") && player.y<height-100){
        player.y += 30;
      }
      if(keyDown("right") && player.x<ammoBox.x-90){
        player.mirrorX(1);
        bulletVel = bulletVel<0? -bulletVel:bulletVel ;
        player.x += 10;
      }
      if(keyDown("left") && player.x>80){
        bulletVel = bulletVel<0? bulletVel:-bulletVel ;
        player.mirrorX(-1)
        player.x -= 10;
      }

      //release bullets and change the image of shooter to shooting position when space is pressed
      if(keyWentDown("space")){
        player.addImage(shooter_shooting);
        shoot();
        bullets -= 1;
      }

      //player goes back to original standing image once we stop pressing the space bar
      else if(keyWentUp("space")){
        player.addImage(shooterImg);
      }

      //calling the function to spawn zombies
      enemy();

      player.overlap(zombieGroup, (p,z)=>{
        life -= 1;
        z.destroy();
      })
    
      zombieGroup.overlap(bulletGroup, (z,b)=>{
        score += 1;
        z.remove();
        b.destroy();
        explosion.play();
      })

      if(player.isTouching(ammoBox) && ammoTouched == false){
        ammoTouched = true;
        bullets += 20;
      }
      
      if(!player.isTouching(ammoBox)){
        ammoTouched = false;
      }

      if(life==0 ){
        lose.play();
        gameState = "end";
        //life = -1
      }
    
      if(score==10 ){
        win.play();
        gameState = "won";
      }

      if(bullets==0 ){
        //win.play();
        gameState = "noBullets";
      }
     

  }//end of "play"
  else if(gameState=="end"){
    restart.visible=true
    restart.onMousePressed=reset
  
    // if (mousePressedOver(restart)){
    //   restart()
    // }
    textAlign(CENTER);
    textSize(35);
    fill("red");
    text("Out of life. You have lost the game!", width/2, height/2);
    player.visible=false

    zombieGroup.setVelocityXEach(0);
  }
  else if(gameState=="won"){
    restart.visible=true
    if (mousePressedOver(restart)){
      restart()
    }
    
    zombieGroup.destroyEach();
    textAlign(CENTER);
    textSize(35);
    text("Yo! You have killed "+score+" zombies!", width/2, height/2);
  }
  else if(gameState=="noBullets"){
    restart.visible=true
    if (mousePressedOver(restart)){
      restart()
    }
    
    textAlign(CENTER);
    textSize(35);
    text("Oh no! You are out of bullets", width/2, height/2);
    text("You have killed "+score+" zombies.",width/2, height/2+50);
    zombieGroup.setVelocityXEach(0);
    zombieGroup.setLifetimeEach(-1);
    bulletGroup.destroyEach();
  }
}

function reset(){
  reset.visible=false
  gameState="play"
  score=0
   zombieCounter = 0;
  killPercentage = 0;
  bullets=10
  life=3
  score=0
  zombieGroup.destroyEach()
  player.visible=true
}

//creating function to spawn zombies
function enemy(){
  if(frameCount%50===0){
    //giving random x and y positions for zombie to appear
    zombie = createSprite(random(500,1100),random(100,500),40,40);
    zombie.addImage(zombieImg);
    zombie.scale = 0.15;
    zombie.velocityX = -3;
    //zombie.debug= true;
    zombie.setCollider("rectangle",0,0,350,900);
    zombie.lifetime = 400;
    zombieGroup.add(zombie);
    zombieCounter++ ;
  }

}

function shoot(){
    //giving random x and y positions for zombie to appear
    bullet = createSprite(player.x,player.y-25 ,20,20)

    bullet.addImage(bulletImg);
    bullet.mirrorX(-1);
    
    bullet.depth = 1;
    bullet.scale = 0.01;
    bullet.velocityX = bulletVel;
    //bullet.debug= true;
    bullet.setCollider("rectangle",0,0,100,100);
    bullet.lifetime = 400;
    bulletGroup.add(bullet);
}

function displayHearts(){
    switch(life){
      case 1: heart1.visible = true;
              heart2.visible = false;
              heart3.visible = false;
              break;
      case 2: heart1.visible = false;
              heart2.visible = true;
              heart3.visible = false;
              break;  
      case 3: heart1.visible = false;
              heart2.visible = false;
              heart3.visible = true;
              break; 
      default:heart1.visible = false;
              heart2.visible = false;
              heart3.visible = false;   
              break;                   
    }
}