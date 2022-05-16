class Map {
	size;
	blocks;
	item;
	entities;

	constructor(w, h){
		this.size = new Point(w, h);
		this.blocks = new Array(w);
		for(let i = 0; i < w; i++){
			this.blocks[i] = new Array(h);
			for(let j = 0; j < h; j++)
				this.blocks[i][j] = new Block();
		}
		this.item = new Array();
		this.entities = new Array();
	}

	addEntity(ent){
		this.entities.push(ent);
	}

	addItem(item){
		this.item.push(item);
	}
}

class Camera {
	size;
	procSize;

	rect;
	procRect;

	pos;
	bcg_color;

	lookEnt;
	lookPos;

	constructor(w, h, pw, ph){
		this.size = new Point(w, h);
		this.procSize = new Point(pw, ph);

		this.pos = new Point();
		this.bcg_color = 'black';

		this.lookObj = null;
		this.lookPos = new Point();

		this.rect = new Rect(0, 0, 0, 0);
		this.procRect = new Rect(0, 0, 0, 0);
	}

	lookAtEnt(ent){
		this.lookEnt = ent;
	}

	lookAtPos(x, y){
		this.lookPos.x = x;
		this.lookPos.y = y;
	}

	update(){
		if(this.lookEnt){
			this.pos.x = Math.floor(this.lookEnt.pos.x * CellSize());
			this.pos.y = Math.floor(this.lookEnt.pos.y * CellSize());
		}else{
			this.pos.x = Math.floor(this.lookPos.x * CellSize());
			this.pos.y = Math.floor(this.lookPos.y * CellSize());
		}

		this.rect.l = Math.max(Math.floor((this.pos.x - this.size.x / 2) / CellSize()), 0);
		this.rect.t = Math.max(Math.floor((this.pos.y - this.size.y / 2) / CellSize()), 0);
		this.rect.r = Math.min(Math.ceil((this.pos.x + this.size.x / 2) / CellSize()), map.size.x);
		this.rect.b = Math.min(Math.ceil((this.pos.y + this.size.y / 2) / CellSize()), map.size.y);

		this.procRect.l = Math.floor(this.pos.x / CellSize() - this.procSize.x / 2);
		this.procRect.t = Math.floor(this.pos.y / CellSize() - this.procSize.y / 2);
		this.procRect.r = Math.floor(this.pos.x / CellSize() + this.procSize.x / 2);
		this.procRect.b = Math.floor(this.pos.y / CellSize() + this.procSize.y / 2);
	}

	draw(map){
		ctx.fillStyle = this.bcg_color;
		ctx.fillRect(0, 0, this.size.x, this.size.y);

		let sur = new Array(4);

		for(let j = this.rect.t; j < this.rect.b; j++){
			for(let i = this.rect.l; i < this.rect.r; i++){
				let x = Math.round(-this.pos.x + this.size.x / 2 + i * CellSize());
				let y = Math.round(-this.pos.y + this.size.y / 2 + j * CellSize());
				sur[0] = (j-1 >= this.rect.t) ? map.blocks[i][j-1].type : BlockType.Empty;
				sur[1] = (i+1 < this.rect.r) ? map.blocks[i+1][j].type : BlockType.Empty;
				sur[2] = (j+1 < this.rect.b) ? map.blocks[i][j+1].type : BlockType.Empty;
				sur[3] = (i-1 >= this.rect.l) ? map.blocks[i-1][j].type : BlockType.Empty;
				map.blocks[i][j].draw(ctx, x, y, sur);
				ctx.strokeStyle = 'white';
				//ctx.strokeRect(x, y, CellSize(), CellSize());
			}
		}

		map.item.forEach((item) => {
			if(this.procRect.pt_in_rect(item.pos))
				item.draw(this.size.x / 2 - this.pos.x, this.size.y / 2 - this.pos.y);
		});
		map.entities.forEach((ent) => {
			if(this.procRect.pt_in_rect(ent.pos))
				ent.draw(this.size.x / 2 - this.pos.x, this.size.y / 2 - this.pos.y);
		});
		map.item.forEach((item) => {
			if(this.procRect.pt_in_rect(item.pos) && item.isHl)
				item.draw_info(this.size.x / 2 - this.pos.x, this.size.y / 2 - this.pos.y);
		});

		if(debug){
			map.entities.forEach((ent) => {
				ent.draw_box(this.size.x / 2 - this.pos.x, this.size.y / 2 - this.pos.y);
			});
			map.item.forEach((item) => {
				item.draw_box(this.size.x / 2 - this.pos.x, this.size.y / 2 - this.pos.y);
			});
		}
	}
}