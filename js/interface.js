class Interface{
	entity;

	constructor(ent){
		this.entity = ent;
	}

	formatNums(a, b){
		let A = a.toString();
		let B = b.toString();

		for(let i = 0, j = B.length - A.length; i < j; i++)
			A = ' ' + A;

		return A + '|' + B;
	}

	draw(){
		let img = SpriteStorage.Interface[0];

		ctx.drawImage(img, 3 * K, 3 * K, img.width * K, img.height * K);

		let fontSize = Math.floor(6 * K);
		ctx.font = fontSize + 'px myFont';
		let text = this.formatNums(this.entity.health, this.entity.maxHealth);
		let textSize = ctx.measureText(text);

		ctx.fillStyle = '#f00';
		ctx.fillRect(21 * K, 7 * K, this.entity.health / this.entity.maxHealth * 50 * K, 7 * K);
		ctx.fillStyle = '#000';
		ctx.fillText(text, 46 * K - textSize.width / 2, 14 * K);

		text = this.formatNums(this.entity.food, this.entity.maxFood);
		textSize = ctx.measureText(text);
		ctx.fillStyle = '#0f0';
		ctx.fillRect(21 * K, 25 * K, this.entity.food / this.entity.maxFood * 50 * K, 7 * K);
		ctx.fillStyle = '#000';
		ctx.fillText(text, 46 * K - textSize.width / 2, 32 * K);

		img = SpriteStorage.Interface[1];

		ctx.drawImage(img, 3 * K, szWindow.y / 2 - img.height / 2 * K, img.width * K, img.height * K);

		if(ply.inventory.first){
			let sprData = ply.inventory.first.sprData;
			ctx.translate(14 * K, szWindow.y / 2 - img.height / 2 * K + 10 * K);
			ctx.scale(K, K);
			ctx.rotate(-Math.PI * 0.2);
			ctx.translate(-sprData.sprSize.x / 2, -sprData.sprSize.y * 0.3);

			ctx.drawImage(sprData.image,
					sprData.sprSize.x, 0, sprData.sprSize.x, sprData.sprSize.y,
					0, 0, sprData.sprSize.x, sprData.sprSize.y);

			ctx.setTransform(1, 0, 0, 1, 0, 0);

			if(ply.inventory.first.weaponType == WeaponType.Ranged){
				if(ply.inventory.first.reloading){
					let img_reload = SpriteStorage.Interface[2];
					ctx.drawImage(img_reload,
						0, 0, img_reload.width, img_reload.height,
						3 * K, szWindow.y / 2 - img.height / 2 * K, img_reload.width * K, img_reload.height * K);
				}

				text = this.formatNums(ply.inventory.first.curAmmo, ply.inventory.first.ammo);

				ctx.font = fontSize + 'px myFont';
				ctx.fillStyle = ply.inventory.first.curAmmo ? '#000' : '#f00';
				textSize = ctx.measureText(text);
				ctx.fillText(text, 39 * K - textSize.width / 2, szWindow.y / 2 - img.height / 2 * K + 15 * K);
			}
		}
		if(ply.inventory.second){
			let sprData = ply.inventory.second.sprData;
			ctx.translate(14 * K, szWindow.y / 2 - img.height / 2 * K + 35 * K);
			ctx.scale(K, K);
			ctx.rotate(-Math.PI * 0.2);
			ctx.translate(-sprData.sprSize.x / 2, -sprData.sprSize.y * 0.3);

			ctx.drawImage(sprData.image,
					sprData.sprSize.x, 0, sprData.sprSize.x, sprData.sprSize.y,
					0, 0, sprData.sprSize.x, sprData.sprSize.y);

			ctx.setTransform(1, 0, 0, 1, 0, 0);

			if(ply.inventory.second.weaponType == WeaponType.Ranged){
				text = this.formatNums(ply.inventory.second.curAmmo, ply.inventory.second.ammo);

				ctx.font = fontSize + 'px myFont';
				ctx.fillStyle = ply.inventory.second.curAmmo ? '#000' : '#f00';
				textSize = ctx.measureText(text);
				ctx.fillText(text, 39 * K - textSize.width / 2, szWindow.y / 2 - img.height / 2 * K + 40 * K);
			}
		}
	}
}