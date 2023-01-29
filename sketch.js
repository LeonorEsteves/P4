const PlayerBottomMargin = 10;
const PlayerAccelation = 1;
const PlayerMoveResist = 0.1;

const BulletSpeed = 20;
const PlayerBuleltInterval = 50;

let GameMode = "InGame";

const pallet = ["#FF9F1C", "#FFBF69", "#FFFFFF", "#CBF3F0", "#2EC4B6"];
let palletIndex = 0;
setInterval(()=>{
	palletIndex = (palletIndex + 1) % pallet.length;
},1000);
function bulletColor(){
	return pallet[palletIndex];
}

let player;

const Bullets = {
  bullets: [],
  add(charactor) {
    const bullet = new Bullet(charactor.pos);
    this.bullets.push(bullet);
  },
  update() {
    this.bullets.forEach((bullet) => bullet.update());
    this.bullets = this.bullets.filter((bullet) => bullet.alive());
  },
  draw() {
    this.bullets.forEach((bullet) => bullet.draw());
  },
};

const Enemies = {
  enemies: [],
  schedule: [],
  add(enemy) {
    this.enemies.push(enemy);
  },
  setScheudle(fromMillis, enemy) {
    this.schedule.push([fromMillis, enemy]);
  },
  update() {
    const now = millis();
    this.schedule.forEach(([fromMillis, enemy]) => {
      if (fromMillis < now) {
        this.add(enemy);
      }
    });
    this.schedule = this.schedule.filter((s) => s[0] > now);

    this.enemies.forEach((enemy) => enemy.update());
    this.enemies = this.enemies.filter((enemy) => enemy.alive());
  },
  gameEnd() {
    this.enemies = this.enemies.filter((enemy) => enemy.hitted);
  },
  draw() {
    this.enemies.forEach((enemy) => enemy.draw());
  },
};

const Input = {
  horizontal() {
    if (keyIsPressed) {
      if (key == "a" || keyCode == LEFT_ARROW) {
        return -1;
      } else if (key == "d" || keyCode == RIGHT_ARROW) {
        return 1;
      }
    }
    return 0;
  },
};

class Player {
  constructor() {
    this.pos = createVector(width / 2, height);
    this.velocity = createVector(0, 0);
    this.acceleaction = createVector(0, 0);
    this.size = 20;

    setInterval(() => {
      Bullets.add(this);
    }, PlayerBuleltInterval);
  }

  update() {
    /*
    this.acceleaction.x = 
      Input.horizontal() * PlayerAccelation
    this.acceleaction.sub(this.velocity.copy().mult(PlayerMoveResist));
  
    this.velocity.add(this.acceleaction);
    this.pos.add(this.velocity);

    if(this.pos.x < 0){
      this.pos.x = width + this.pos.x;
    }else if(this.pos.x > width){
      this.pos.x = this.pos.x - width;
    }*/
    this.pos.x = mouseX;
  }

  draw() {
    fill(100);
    stroke(255);
    rectMode(CENTER);
    square(this.pos.x, this.pos.y, this.size);
  }
}

class Bullet {
  constructor(pos) {
    this.pos = pos.copy();
    this.velocity = createVector(0, -BulletSpeed);
    this.size = 5;
    this.color = bulletColor();
  }

  alive() {
    if (
      abs(this.pos.x - width / 2) > width / 2 ||
      abs(this.pos.y - height / 2) > height / 2
    ) {
      return false;
    }
    if (this.checkHittingEnemy()) {
      return false;
    }
    return true;
  }

  checkHittingEnemy() {
    for (let enemy of Enemies.enemies) {
      const dx = abs(this.pos.x - enemy.pos.x);
      const dy = abs(this.pos.y - enemy.pos.y);
      const l = (this.size + enemy.size) / 2;
      if (dx < l && dy < l) {
        enemy.hit(this);
        return true;
      }
    }
    return false;
  }

  update() {
    this.pos.add(this.velocity);
  }

  draw() {
    ellipseMode(CENTER);
    fill(this.color);
    stroke(this.color);
    square(this.pos.x, this.pos.y, this.size);
  }
}

class Enemy {
  constructor() {
    this.pos = createVector(0, 0);
  }

  hit() {}

  alive() {
    if (
      abs(this.pos.x - width / 2) > width / 2 ||
      abs(this.pos.y - height / 2) > height / 2
    ) {
      return false;
    }
    return true;
  }
  update() {
    this.velocity.add(this.acceleaction);
    this.pos.add(this.velocity);
    if (this.pos.y > height) {
      GameMode = "GameOver";
    }
  }
  draw() {}
}

class DropEnemy extends Enemy {
  constructor(x, speed) {
    super();
    this.color = color(255);
    this.pos = createVector(x, 0);
    this.velocity = createVector(0, speed);
    this.acceleaction = createVector(0, 0);
    this.size = random(10,width/12);
    this.hitted = false;
  }

  hit(bullet) {
    if (!this.hitted) {
      this.color = bullet.color;
      this.hitted = true;
    }
  }

  update() {
    super.update();
    if (this.hitted) {
      this.velocity = createVector(0, 0);
    }
  }

  draw() {
    fill(this.color);
    stroke(this.color);
    rectMode(CENTER);
    square(this.pos.x, this.pos.y, this.size);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  blendMode(SCREEN);
  player = new Player();
	setInterval(()=>{
		if (GameMode === "InGame") {
      Enemies.setScheudle(
        1000 + millis(),
        new DropEnemy(random(width), random(0.5, 2))
      );
    }
	}, 500);
}

function draw() {
  if (GameMode === "InGame") {
    clear();
    background(25, 70, 30);

    player.update();
    Bullets.update();
    Enemies.update();

    player.draw();
    Bullets.draw();
    Enemies.draw();
  } else if (GameMode === "GameOver") {
    clear();
    background(05, 40, 10);
    Enemies.gameEnd();
    Enemies.draw();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(72);
    text("JáFoste", width / 2, height / 2);
    noLoop();
  }
}

