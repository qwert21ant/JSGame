const SpriteStorage = {
	Block: new Array(),
	Item: new Array(),
	Weapon: new Array(),
	Entity: new Array()
};

var debug = 0;

var K = 3; //Scale K

var szWindow = {x: 0, y: 0};
var mousePos = {x: 0, y: 0};
var ctx = null; //Context2D

var map = null; //Map
var cam = null; //Camera
var ply = null; //Player
var inter = null; //Interface

var keyState = {w: 0, a: 0, s: 0, d: 0, f: 0};

function random(a, b){
	return Math.random() * (b - a) + a;
}

class Point {
	x;
	y;

	constructor(x = 0, y = 0){
		this.x = x;
		this.y = y;
	}

	dist(pt){
		let dx = this.x - pt.x;
		let dy = this.y - pt.y;
		return Math.sqrt(dx*dx + dy*dy);
	}

	len(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}

	norm(){
		let l = this.len();
		this.x /= l;
		this.y /= l;
	}
}

class Rect {
	l;
	t;
	r;
	b;

	//sz;
	//cntr;

	constructor(l = 0, t = 0, r = 0, b = 0){
		this.l = l;
		this.t = t;
		this.r = r;
		this.b = b;
	}

	size(){
		return new Point(this.r - this.l, this.b - this.t);
	}

	center(){
		return new Point((this.r + this.l) / 2, (this.b + this.t) / 2);
	}

	shift(x, y){
		this.l += x;
		this.r += x;
		this.t += y;
		this.b += y;
	}

	pt_in_rect(pt){
		return this.l <= pt.x && pt.x <= this.r &&
				this.t <= pt.y && pt.y <= this.b;
	}

	bounds(pos, sz){
		this.l = pos.x;
		this.t = pos.y;
		this.r = pos.x + sz.x;
		this.b = pos.y + sz.y;
		return this;
	}

	bounds_center(pos, sz){
		this.l = pos.x - sz.x / 2;
		this.t = pos.y - sz.y / 2;
		this.r = pos.x + sz.x / 2;
		this.b = pos.y + sz.y / 2;
		return this;
	}
}

class Timer {
	timer;
	time;

	isWork;

	prevStep;

	constructor(time){
		this.timer = 0;
		this.time = time;
		this.isWork = 0;
		this.prevStep = 0;
	}

	start(){
		this.isWork = 1;
	}

	restart(){
		this.reset();
		this.start();
	}

	reset(){
		this.timer = 0;
		this.prevStep = 0;
	}

	step(){
		if(!this.isWork) return;
		this.timer += 1;
		if(this.timer >= this.time)
			this.isWork = 0;
		this.prevStep = 1;
	}

	get_percent(){
		return this.timer / this.time;
	}
}

class SquareTimer extends Timer {
	constructor(time){
		super(time);
	}

	step(){
		if(!this.isWork) return;
		this.prevStep += 1;
		this.timer += this.prevStep;
		if(this.timer >= this.time)
			this.isWork = 0;
	}
}

class Animation {
	timer;

	iSprite;
	nSprite;

	sprSize;
	image;

	imgOffset;

	constructor(speed, image, imgOffset, sprSize, nSprite){
		this.timer = 0;
		this.speed = speed;
		this.sprSize = sprSize;
		this.image = image;
		this.imgOffset = imgOffset;
		this.nSprite = nSprite;
		this.iSprite = 0;
	}

	reset(){
		this.timer = 0;
		this.iSprite = 0;
	}

	step(){
		if((this.timer += this.speed) >= 1){
			this.timer -= 1;
			this.iSprite += 1;
			if(this.iSprite >= this.nSprite)
				this.iSprite = 0;
		}
	}

	draw(ctx, x, y, scale = new Point(1, 1)){
		ctx.translate(x + this.sprSize.x * K * (scale.x < 0 ? 1 : 0), y + this.sprSize.y * K * (scale.y < 0 ? 1 : 0));
		ctx.scale(scale.x * K, scale.y * K);

		ctx.drawImage(this.image,
			this.imgOffset.x + this.iSprite * this.sprSize.x, this.imgOffset.y, this.sprSize.x, this.sprSize.y,
			0, 0, this.sprSize.x, this.sprSize.y);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}
}