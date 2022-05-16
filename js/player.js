class Player extends MoveableEntity {
	lookAng;
	lookDir;

	moveDir;
	isMoving;

	maxHealth;
	health;

	maxFood;
	food;

	inventory;
	dropR;

	noAmmoPlaying;
	noAmmoTimer;

	constructor(pos, size){
		super(EntityType.Player, pos, size);

		this.lookAng = 0;
		this.lookDir = 1;

		this.moveDir = {h: 1, v: 1};
		this.isMoving = 0;

		this.maxHealth = 100;
		this.health = this.maxHealth;
		this.maxFood = 100;
		this.food = this.maxFood;

		this.inventory = {
			first: null,
			second: null,
			money: 0
		};
		this.dropR = 0.5;

		this.noAmmoPlaying = 0;
		this.noAmmoTimer = new Timer(80);
	}

	move(){
		let spd = this.maxSpeed;
		if(keyState.w + keyState.s + keyState.a + keyState.d >= 2)
			spd /= Math.sqrt(2);

		if(keyState.w) this.moveDir.v = -1;
		else this.moveDir.v = 1;

		if(keyState.a) this.moveDir.h = -1;
		else if(keyState.d) this.moveDir.h = 1;

		let mx = keyState.a ? -1 : (keyState.d ? 1 : 0);
		let my = keyState.w ? -1 : (keyState.s ? 1 : 0);
		this.moveOn(spd * mx, spd * my);
		this.isMoving = mx || my;
	}

	update(){
		this.move();
		this.changeLook();

		if(this.inventory.first)
			this.inventory.first.update();
		if(this.inventory.second)
			this.inventory.second.update();

		if(this.noAmmoPlaying)
			this.noAmmoTimer.step();

		this.update_dependencies();
	}

	changeLook(){
		let cpos = new Point(szWindow.x / 2, szWindow.y / 2);
		let mpos = new Point(mousePos.x, mousePos.y);

		let dist = cpos.dist(mpos);
		
		this.lookDir = mpos.x > cpos.x ? 1 : -1;
		//this.moveDir.h = this.lookDir;
		this.lookAng = Math.asin((mpos.y - cpos.y) / dist);
	}

	draw_weapon(x, y){
		if(!this.inventory.first) return;
		let sprData = this.inventory.first.sprData;

		x += Math.round(this.rect.center().x * CellSize());
		y += Math.round(this.rect.center().y * CellSize());

		ctx.translate(x, y);
		if((this.inventory.first && this.inventory.first.weaponType == WeaponType.Ranged ? this.lookDir : this.moveDir.h) == 1)
			ctx.scale(K, K);
		else
			ctx.scale(-K, K);

		if(this.inventory.first.weaponType == WeaponType.Ranged){
			ctx.rotate(this.lookAng);
			ctx.translate(0, -sprData.sprSize.y / 2);
		}else if(this.inventory.first.weaponType == WeaponType.Melee){
			ctx.rotate(this.inventory.first.drawIncline);//-Math.PI / 6);
			ctx.translate(-sprData.sprSize.x * 0.1, -sprData.sprSize.y / 2);
		}

		ctx.drawImage(sprData.image,
				0, 0, sprData.sprSize.x, sprData.sprSize.y,
				0, 0, sprData.sprSize.x, sprData.sprSize.y);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	draw_player(x, y){
		let sprData = SpriteStorage.Entity[this.type];

		x += Math.round(this.rect.center().x * CellSize() - sprData.sprSize.x / 2 * K);
		y += Math.round(this.rect.b * CellSize() - sprData.sprSize.y * K);

		let scale = new Point(
			(this.inventory.first && this.inventory.first.weaponType == WeaponType.Ranged) ? this.lookDir : this.moveDir.h, 1);
		if(!this.isMoving)
			SpriteStorage.Entity[this.type].calm.draw(ctx, x, y, scale);
		else{
			if(this.moveDir.v == 1) SpriteStorage.Entity[this.type].walk1.draw(ctx, x, y, scale);
			else SpriteStorage.Entity[this.type].walk2.draw(ctx, x, y, scale);
		}
	}

	draw(x, y){
		if(this.moveDir.v == 1){
			this.draw_player(x, y);
			this.draw_weapon(x, y);
		}else{
			this.draw_weapon(x, y);
			this.draw_player(x, y);
		}
	}

	attack(){
		if(!this.inventory.first) return;
		let wpn = this.inventory.first;

		wpn.attack();
		if(wpn.weaponType == WeaponType.Ranged){
			if(!wpn.curAmmo) return;
			if(wpn.reloading) return;

			wpn.curAmmo--;

			let blt = new Bullet(
					new Point(this.pos.x,// + (this.lookDir ? 1 : -1) * Math.cos(this.lookAng) * 0.4,
						this.pos.y),// - 0.1 + Math.sin(this.lookAng) * 0.4),
					new Point(mousePos.x - szWindow.x / 2, mousePos.y - szWindow.y / 2),
					this.type);
			blt.speed = 0.3;
			map.entities.push(blt);
		}else if(wpn.weaponType == WeaponType.Melee){
			//wpn.attacking = 1;
		}
	}

	pick_drop(drop){
		if(!keyState.f) return;
		//if(drop.itemType != ItemType.Weapon) return;
		keyState.f = 0;
		drop.alive = 0;
		if(drop.itemType == ItemType.Weapon){
			if(!this.inventory.first){
				this.inventory.first = drop;
			} else if(this.inventory.first.name == drop.name){
				this.inventory.first.ammo += drop.curAmmo;
				drop.curAmmo = 0;
				drop.alive = 1;
			} else if(!this.inventory.second){
				this.swap_inventory();
				this.inventory.first = drop;
			} else if(this.inventory.second.name == drop.name){
				this.inventory.second.ammo += drop.curAmmo;
				drop.curAmmo = 0;
				drop.alive = 1;
			} else {
				this.drop_weapon();
				this.inventory.first = drop;
			}
		}else if(drop.itemType == ItemType.Ammo){
			if(this.inventory.first && this.inventory.first.itemType == ItemType.Weapon &&
					this.inventory.first.weaponType == WeaponType.Ranged)
				this.inventory.first.ammo += drop.amount;
			else if(this.inventory.second && this.inventory.second.itemType == ItemType.Weapon &&
					this.inventory.second.weaponType == WeaponType.Ranged)
				this.inventory.second.ammo += drop.amount;
			else{
				keyState.f = 1;
				drop.alive = 1;
			}
		}
	}

	drop_weapon(){
		if(!this.inventory.first) return;
		this.inventory.first.alive = 1;
		let dx = random(-this.dropR / 2, this.dropR / 2);
		let dy = random(-this.dropR / 2, this.dropR / 2);
		this.inventory.first.pos.x = this.pos.x + dx;
		this.inventory.first.pos.y = this.pos.y + dy;

		if(this.inventory.first.weaponType == WeaponType.Ranged && this.inventory.first.ammo){
			let dropAmmo = new AmmoItem(SpriteStorage.Item[ItemType.Ammo], this.inventory.first.ammo);
			dropAmmo.pos.x = this.pos.x - dx;
			dropAmmo.pos.y = this.pos.y - dy;
			dropAmmo.name = 'Ammo';
			map.addItem(dropAmmo);

			this.inventory.first.ammo = 0;
		}

		map.addItem(this.inventory.first);
		this.inventory.first = null;
	}

	reload_weapon(){
		if(!this.inventory.first) return;
		let wpn = this.inventory.first;
		if(wpn.weaponType != WeaponType.Ranged) return;
		wpn.reload();
	}

	swap_inventory(){
		if(this.inventory.first && this.inventory.first.weaponType == WeaponType.Ranged && this.inventory.first.reloading) return;
		let t = this.inventory.first;
		this.inventory.first = this.inventory.second;
		this.inventory.second = t;
	}

	inter_collision(ent){
		if(ent.type == EntityType.Drop)
			this.pick_drop(ent);
	}
}