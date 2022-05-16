const BlockType = {Empty: 0, Grass: 1, Flower: 2, Sand: 3, Stone: 4, Water: 5}

const BlockImgSize = 20;

function CellSize(){
	return BlockImgSize * K;
}

class Block {
	type;
	iSpr;

	constructor(type = BlockType.Empty){
		this.type = type;
		this.iSpr = 0;
	}

	draw(ctx, x, y, surround = [BlockType.Empty, BlockType.Empty, BlockType.Empty, BlockType.Empty]){
		if(SpriteStorage.Block[this.type] == undefined) return;
		ctx.drawImage(	SpriteStorage.Block[this.type],
						BlockImgSize * this.iSpr, 0, BlockImgSize, BlockImgSize,
						x, y, CellSize(), CellSize());
	}
}

class Empty extends Block {
	constructor(){
		super(BlockType.Empty);
	}
}

class Grass extends Block {
	constructor(){
		super(BlockType.Grass);
		this.iSpr = Math.floor(Math.random() * 4);
	}
}

class Water extends Block {
	constructor(){
		super(BlockType.Water);
	}

	draw(ctx, x, y, surround = [BlockType.Empty, BlockType.Empty, BlockType.Empty, BlockType.Empty]){
		let ind = 0;
		ind += (surround[0] != BlockType.Water ? 1 : 0);
		ind += 2 * (surround[1] != BlockType.Water ? 1 : 0);
		ind += 4 * (surround[2] != BlockType.Water ? 1 : 0);
		ind += 8 * (surround[3] != BlockType.Water ? 1 : 0);
		if(SpriteStorage.Block[this.type] == undefined) return;
		//console.log('Draw water: ' + x + ' ' + y);
		SpriteStorage.Block[this.type].anims[ind].draw(ctx, x, y);
	}
}