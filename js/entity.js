const EntityType = {Player: 0, Bush: 1, Tree: 2, Drop: 3, Bullet: 4};

class Entity {
	type;
	moveable;
	alive;
	
	pos;
	sprPos;

	size;
	interSize;

	rect;
	interRect;

	constructor(type, moveable, pos = new Point(), size = new Point()){
		this.type = type;
		this.moveable = moveable;
		this.alive = 1;

		this.pos = pos;
		this.sprPos = new Point(pos.x, pos.y + size.y / 2);

		this.size = size;
		this.interSize = new Point(size.x, size.y);

		this.rect = (new Rect()).bounds_center(pos, size);
		this.interRect = (new Rect()).bounds_center(pos, size);
	}

	update_dependencies(){
		this.sprPos.x = this.pos.x;
		this.sprPos.y = this.pos.y + this.size.y / 2;

		this.rect.bounds_center(this.pos, this.size);
		this.interRect.bounds_center(this.pos, this.interSize);
	}

	update(){
		this.update_dependencies();
	}

	getBlock(map){
		let i = Math.floor(this.pos.x);
		let j = Math.floor(this.pos.y);

		if(i < 0 || j < 0 || i >= map.size.x || j >= map.size.y) return null;

		return map.blocks[i][j];
	}

	draw_box(x, y){
		ctx.fillStyle = 'red';
		ctx.fillRect(	x + this.pos.x * CellSize() - 2,
						y + this.pos.y * CellSize() - 2,
						4, 4);

		ctx.strokeStyle = 'white';
		ctx.strokeRect(	x + this.rect.l * CellSize(),
						y + this.rect.t * CellSize(),
						this.rect.size().x * CellSize(),
						this.rect.size().y * CellSize());

		ctx.strokeStyle = 'red';
		ctx.strokeRect(	x + this.interRect.l * CellSize(),
						y + this.interRect.t * CellSize(),
						this.interRect.size().x * CellSize(),
						this.interRect.size().y * CellSize());
	}

	draw(x, y){}
	collision(ent){}
	inter_collision(ent){}
}

class MoveableEntity extends Entity {
	speed;

	constructor(type, pos = new Point(), size = new Point()){
		super(type, 1, pos, size);
		this.speed = 0;
	}

	moveOn(dx, dy){
		let new_pos = new Point(this.sprPos.x + dx, this.sprPos.y + dy);

		let cur_i = Math.floor(this.sprPos.x);
		let cur_j = Math.floor(this.sprPos.y);

		let i = Math.floor(new_pos.x);
		let j = Math.floor(new_pos.y);

		if(i < 0 || j < 0 || i >= map.size.x || j >= map.size.y){
			if(dx && dy){
				this.moveOn(dx, 0);
				this.moveOn(0, dy);
				return;
			}
			if(i < 0) new_pos.x = 0;
			if(j < 0) new_pos.y = 0;
			if(i >= map.size.x) new_pos.x = map.size.x - 0.0001;
			if(j >= map.size.y) new_pos.y = map.size.y - 0.0001;

			this.sprPos = new_pos;
			this.pos.x = this.sprPos.x;
			this.pos.y = this.sprPos.y - this.size.y / 2;
		}

		i = Math.floor(new_pos.x);
		j = Math.floor(new_pos.y);

		if([BlockType.Water, BlockType.Empty].includes(map.blocks[i][j].type)){
			if(dx && dy){
				this.moveOn(dx, 0);
				this.moveOn(0, dy);
				return;
			}
			if(i > cur_i) new_pos.x = i - 0.0001;
			if(i < cur_i) new_pos.x = cur_i;
			if(j > cur_j) new_pos.y = j - 0.0001;
			if(j < cur_j) new_pos.y = cur_j;
		}

		this.sprPos = new_pos;
			this.pos.x = this.sprPos.x;
			this.pos.y = this.sprPos.y - this.size.y / 2;
	}
}

class StaticEntity extends Entity {
	constructor(type, pos = new Point(), size = new Point()){
		super(type, 0, pos, size);
	}
}

class Bush extends StaticEntity {
	plyCol;

	constructor(pos = new Point()){
		super(EntityType.Bush, pos, new Point(0.6, 0.6));
		this.iSpr = 0;
		this.plyCol = 0;
	}

	collision(ent){
		if(ent.type != EntityType.Player) return;
		this.plyCol = 1;
	}

	draw(x, y){
		let sprData = SpriteStorage.Entity[EntityType.Bush];
		x += this.rect.center().x * CellSize() - sprData.sprSize.x * K / 2;
		y += this.rect.b * CellSize() - sprData.sprSize.y * K;
		ctx.drawImage(sprData.image,
					this.plyCol * sprData.sprSize.x, 0, sprData.sprSize.x, sprData.sprSize.y,
					x, y, sprData.sprSize.x * K, sprData.sprSize.y * K);

		this.plyCol = 0;
	}
}

class Tree extends StaticEntity {
	constructor(pos){
		super(EntityType.Tree, pos);
		this.iSpr = 1;
	}

	draw(x, y){
		let img = SpriteStorage.Entity[this.type][this.iSpr];
		ctx.drawImage(img, x, y, img.width * K, img.height * K);
	}
}

function CheckCollision(l, r){
	return r.r > l.l && l.r > r.l && r.b > l.t && l.b > r.t;
}