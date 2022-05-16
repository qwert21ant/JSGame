var WeaponType = {Ranged: 0, Melee: 1};

class Weapon extends Item {
	weaponType;
	damage;

	cooldown;
	cooldownTimer

	constructor(weaponType, sprData){
		super(ItemType.Weapon, sprData);
		this.weaponType = weaponType;

		this.cooldown = 0;
		this.cooldownTimer = new Timer(0);
	}

	set_cooldown_time(time){
		this.cooldownTimer.time = time;
		this.cooldownTimer.reset();
	}

	attack(){};
}

class MeleeWeapon extends Weapon {
	drawIncline;

	attackTimer;

	constructor(sprData){
		super(WeaponType.Melee, sprData);
		this.drawIncline = -Math.PI / 5;

		this.attackTimer = new SquareTimer(100);
	}

	update(){
		this.attackTimer.step();
		if(!this.attackTimer.isWork)
			this.drawIncline = -Math.PI / 5;
		else
			this.drawIncline = -Math.PI / 5 * (this.attackTimer.get_percent() * 2 - 1);

		this.update_dependencies();
	}

	attack(){
		this.attackTimer.restart();
	}
}

class RangedWeapon extends Weapon {
	maxAmmo;
	curAmmo;
	ammo;

	reloading;
	reloadTimer;

	constructor(sprData){
		super(WeaponType.Ranged, sprData);
		this.maxAmmo = 16;
		this.curAmmo = Math.round(6 + Math.random() * 10);
		this.ammo = 0;

		this.reloading = 0;
		this.reloadTimer = new Timer(100);
	}

	get_info(){
		return this.name + ' [' + this.curAmmo + ']';
	}

	update(){
		if(this.reloading){
			this.reloadTimer.step();
			if(!this.reloadTimer.isWork){
				let newAmmo = Math.min(this.maxAmmo, this.curAmmo + this.ammo);
				this.ammo -= newAmmo - this.curAmmo;
				this.curAmmo = newAmmo;
				this.reloading = 0;
			}
		}

		this.update_dependencies();
	}

	reload(){
		if(this.curAmmo == this.maxAmmo || !this.ammo) return;
		this.reloading = 1;
		this.reloadTimer.restart();
	}
}

class Bullet extends MoveableEntity {
	dir;
	owner;

	constructor(pos, dir, owner){
		super(SpriteStorage.Entity[EntityType.Bullet], pos);
		this.dir = dir;
		this.dir.norm();
		this.owner = owner;
	}

	move(){
		this.pos.x += this.dir.x * this.speed;
		this.pos.y += this.dir.y * this.speed;
	}

	update(){
		if(!cam.rect.pt_in_rect(this.pos)) this.alive = 0;
		this.move();
		this.update_dependencies();
	}

	draw(x, y){
		let sprData = SpriteStorage.Entity[EntityType.Bullet];
		ctx.translate(x + this.pos.x * CellSize(), y + this.pos.y * CellSize());
		ctx.scale(K, K);
		ctx.rotate(Math.atan(this.dir.y / this.dir.x));
		ctx.drawImage(sprData.image, 0, 0, sprData.sprSize.x, sprData.sprSize.y);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	collision(ent){
		if(ent.type == this.owner) return;
		if(ent.type == EntityType.Bush) return;
		this.alive = 0;
	}
}