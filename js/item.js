var ItemType = {Weapon: 0, Ammo: 1};

class Item extends StaticEntity {
	itemType;

	interR;

	sprData;
	isHl;

	name;
	desc;

	constructor(itemType, sprData){
		super(EntityType.Drop, new Point(), new Point(sprData.sprSize.x / BlockImgSize, sprData.sprSize.y / BlockImgSize));
		this.itemType = itemType;
		this.sprData = sprData;
		this.interR = 1.2;
		this.isHl = 0;
		this.name = 'none';
		this.desc = 'none';
	}

	inter_collision(ent){
		this.isHl = 1;
	}

	get_info(){
		return this.name;
	}

	draw_info(x, y){
		x += this.rect.center().x * CellSize();
		y += (this.rect.t - 0.1) * CellSize();

		let fontSize = Math.floor(8 * K);
		let text = this.get_info();

		ctx.font = fontSize + 'px myFont';
		let textSize = ctx.measureText(text);

		let padding = new Point(0.1 * CellSize(), 0.05 * CellSize());

		ctx.fillStyle = '#444';
		ctx.fillRect(	x - textSize.width / 2 - padding.x,
						y - fontSize - padding.y, textSize.width + 2 * padding.x, fontSize + 2 * padding.y);

		ctx.fillStyle = 'white';

		ctx.fillText(text, x - textSize.width / 2, y);

		this.isHl = 0;
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

		ctx.beginPath();
		ctx.arc(x + this.pos.x * CellSize(), y + this.pos.y * CellSize(), this.interR * CellSize(), 0, 2 * Math.PI, false);
		ctx.strokeStyle = 'red';
		ctx.stroke();
		ctx.closePath();
	}

	draw(x, y){
		x += this.rect.center().x * CellSize() - this.sprData.sprSize.x * K / 2;
		y += this.rect.b * CellSize() - this.sprData.sprSize.y * K;
		ctx.drawImage(this.sprData.image,
				this.isHl ? this.sprData.sprSize.x : 0, 0,
				this.sprData.sprSize.x, this.sprData.sprSize.y, x, y, this.sprData.sprSize.x * K, this.sprData.sprSize.y * K);
	}
}

class AmmoItem extends Item {
	amount;

	constructor(sprData, amount = 20){
		super(ItemType.Ammo, sprData);
		this.amount = amount;
	}

	get_info(){
		return this.name + ' x' + this.amount;
	}
}