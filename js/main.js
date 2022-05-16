function onResize(){
	szWindow.x = window.innerWidth;
	szWindow.y = window.innerHeight;

	let cvs = document.getElementById("main");
	cvs.setAttribute('width', szWindow.x);
	cvs.setAttribute('height', szWindow.y);

	if(cam)
		cam.size = szWindow;
}

function onKeydown(e){
	if(e.code == 'KeyW') keyState.w = 1;
	if(e.code == 'KeyS') keyState.s = 1;
	if(e.code == 'KeyA') keyState.a = 1;
	if(e.code == 'KeyD') keyState.d = 1;
	if(e.code == 'KeyF') keyState.f = 1;
	if(e.code == 'KeyX') ply.swap_inventory();
	if(e.code == 'KeyR') ply.reload_weapon();
	if(e.code == 'KeyQ') ply.drop_weapon();
}

function onKeyup(e){
	if(e.code == 'KeyW') keyState.w = 0;
	if(e.code == 'KeyS') keyState.s = 0;
	if(e.code == 'KeyA') keyState.a = 0;
	if(e.code == 'KeyD') keyState.d = 0;
	if(e.code == 'KeyF') keyState.f = 0;
}

function onMouseMove(e){
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
}

function onMouseDown(e){
	ply.attack();
}

function generate_map(){
	let w = 20;
	let h = 20;
	let border = 1;

	map = new Map(w, h);
	for(let i = border; i < w-border; i++){
		for(let j = border; j < h-border; j++){
			delete map.blocks[i][j];
			map.blocks[i][j] = new Grass();
		}
	}

	for(let i = 0; i < border; i++){
		for(let j = 0; j < h; j++){
			map.blocks[i][j] = new Water();
			map.blocks[w-i-1][j] = new Water();
		}
	}
	for(let i = 0; i < border; i++){
		for(let j = border; j < w-border; j++){
			map.blocks[j][i] = new Water();
			map.blocks[j][h-i-1] = new Water();
		}
	}

	let gun = new RangedWeapon(SpriteStorage.Weapon[WeaponType.Ranged]);
	gun.name = 'Pistol';
	gun.damage = 5;
	gun.set_cooldown_time(500);
	gun.dfireSpeed = 0.01;
	gun.pos.x = 5;
	gun.pos.y = 5;
	map.addItem(gun);

	gun = new RangedWeapon(SpriteStorage.Weapon[WeaponType.Ranged]);
	gun.name = 'Pistol';
	gun.damage = 5;
	gun.set_cooldown_time(900);
	gun.pos.x = 6;
	gun.pos.y = 7;
	map.addItem(gun);

	let melee = new MeleeWeapon(SpriteStorage.Weapon[WeaponType.Melee]);
	melee.name = 'Crowbar';
	melee.damage = 3;
	melee.set_cooldown_time(900);
	melee.pos.x = 4;
	melee.pos.y = 4;
	map.addItem(melee);

	let ammo = new AmmoItem(SpriteStorage.Item[ItemType.Ammo]);
	ammo.name = 'Ammo';
	ammo.amount = 20;
	ammo.pos.x = 6;
	ammo.pos.y = 6;
	map.addItem(ammo);

	for(let i = 0; i < 20; i++){
		let x = border + Math.floor(Math.random() * (w - 2 * border) * 100) / 100;
		let y = border + Math.floor(Math.random() * (h - 2 * border) * 100) / 100;

		let ent = new Bush(new Point(x, y));
		map.entities.push(ent);
	}
}

function redraw(){
	onResize();
	ctx.imageSmoothingEnabled = false;

	//ply.changeLook();

	//kill
	map.entities.forEach((ent, ind, arr) => {
		if(!arr[ind].alive)
			arr.splice(ind, 1);
	});
	map.item.forEach((ent, ind, arr) => {
		if(!arr[ind].alive)
			arr.splice(ind, 1);
	});
	//kill

	map.item.sort((a, b) => {
		return a.pos.y - b.pos.y;
	});

	map.entities.sort((a, b) => {
		return a.sprPos.y - b.sprPos.y;
	});

	cam.update();

	for(let i = 0; i < map.item.length; i++){
		if(ply.pos.dist(map.item[i].pos) <= map.item[i].interR){
			ply.inter_collision(map.item[i]);
			map.item[i].inter_collision(ply);
		}
	}

	map.entities.forEach(ent => ent.update());
	map.item.forEach(item => item.update());

	for(let i = 0; i < map.entities.length; i++){
		if(!cam.procRect.pt_in_rect(map.entities[i].pos)) continue;
		for(let j = i+1; j < map.entities.length; j++){
			if(!cam.procRect.pt_in_rect(map.entities[j].pos)) continue;
			if(!map.entities[i].moveable && !map.entities[j].moveable) continue;
			if(!CheckCollision(map.entities[i].interRect, map.entities[j].interRect)) continue;

			map.entities[i].inter_collision(map.entities[j]);
			map.entities[j].inter_collision(map.entities[i]);

			if(!CheckCollision(map.entities[i].rect, map.entities[j].rect)) continue;

			map.entities[i].collision(map.entities[j]);
			map.entities[j].collision(map.entities[i]);
		}
	}

	keyState.f = 0;

	cam.draw(map);
	inter.draw();

	SpriteStorage.Entity[EntityType.Player].calm.step();
	SpriteStorage.Entity[EntityType.Player].walk1.step();
	SpriteStorage.Entity[EntityType.Player].walk2.step();

	with(SpriteStorage.Block[BlockType.Water])
		anims.forEach(el => el.step());
}

function init(){
	console.log('init');

	onResize();

	ctx = document.getElementById("main").getContext("2d");

	generate_map();
	ply = new Player(new Point(5, 5), new Point(0.5, 0.7));
	ply.maxSpeed = 0.03;
	map.entities.push(ply);

	inter = new Interface(ply);

	cam = new Camera(szWindow.x, szWindow.y, 30, 30);
	cam.lookAtPos(map.size.x / 2, map.size.y / 2);
	cam.lookAtEnt(ply);

	window.addEventListener('keydown', onKeydown);
	window.addEventListener('keyup', onKeyup);
	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('contextmenu', e => e.preventDefault());

	setInterval(redraw, 10);
}

var totalImages = 14;
var loadedImages = 0;

function onLoad(){
	loadedImages += 1;
	if(loadedImages == totalImages)
		setTimeout(init, 10);
}

function image_from_src(src){
	let img = new Image();
	img.onload = onLoad;
	img.src = src;
	return img;
}

function preload(){
	SpriteStorage.Block[BlockType.Grass] = image_from_src('image/grass.png');
	SpriteStorage.Block[BlockType.Water] = {
		image: image_from_src('image/water.png'),
		sprSize: new Point(BlockImgSize, BlockImgSize),
		anims: new Array()
	};
	with(SpriteStorage.Block[BlockType.Water]){
		for(let i = 0; i < 16; i++){
			anims.push(new Animation(0.02, image, new Point(0, sprSize.y * i), sprSize, 2));
		}
	}

	SpriteStorage.Entity[EntityType.Bush] = {
		image: image_from_src('image/bush.png'),
		sprSize: new Point(25, 25)
	};

	SpriteStorage.Entity[EntityType.Bullet] = {
		image: image_from_src('image/bullet.png'),
		sprSize: new Point(3, 2)
	};

	SpriteStorage.Entity[EntityType.Tree] = new Array();
	SpriteStorage.Entity[EntityType.Tree].push(image_from_src('image/tree.png'));
	SpriteStorage.Entity[EntityType.Tree].push(image_from_src('image/tree2.png'));

	SpriteStorage.Entity[EntityType.Player] = {
		image: image_from_src('image/ply.png'),
		sprSize: new Point(13, 21),
		calm: null, walk1: null, walk2: null
	};
	with(SpriteStorage.Entity[EntityType.Player]){
		calm = new Animation(0.05, image, new Point(), sprSize, 4);
		walk1 = new Animation(0.06, image, new Point(0, sprSize.y), sprSize, 4);
		walk2 = new Animation(0.06, image, new Point(0, 2 * sprSize.y), sprSize, 4);
	}

	SpriteStorage.Weapon[WeaponType.Ranged] = {
		image: image_from_src('image/gun01.png'),
		sprSize: new Point(12, 9)
	};

	SpriteStorage.Item[ItemType.Ammo] = {
		image: image_from_src('image/ammo.png'),
		sprSize: new Point(11, 6)
	};

	SpriteStorage.Weapon[WeaponType.Melee] = {
		image: image_from_src('image/crowbar.png'),
		sprSize: new Point(16, 8)
	};

	SpriteStorage.Interface = [
		image_from_src('image/interface.png'),
		image_from_src('image/interface1.png'),
		image_from_src('image/reload.png')
	];

	let myFont = new FontFace('myFont', 'url(Fifaks10Dev1.ttf)');
	myFont.load().then((font) => {
		document.fonts.add(font);
		onLoad();
	});
}