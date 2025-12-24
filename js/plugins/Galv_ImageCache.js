//-----------------------------------------------------------------------------
//  Galv's Image Cache
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ImageCache.js
//-----------------------------------------------------------------------------
//  2017-10-12 - Version 1.1 - updated to work with MV 1.5.1 files
//  2017-04-26 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ImageCache = true;

var Galv = Galv || {};                  // Galv's main object
Galv.CACHE = Galv.CACHE || {};          // Galv's stuff


//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.1) Pre-cache images that cause issues when loading during gameplay
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Folder 1
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default animations|
 *
 * @param Folder 2
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default battlebacks1|
 *
 * @param Folder 3
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default battlebacks2|
 *
 * @param Folder 4
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default characters|
 *
 * @param Folder 5
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default enemies|
 *
 * @param Folder 6
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default faces|
 *
 * @param Folder 7
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default parallaxes|
 *
 * @param Folder 8
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default pictures|
 *
 * @param Folder 9
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default sv_actors|
 *
 * @param Folder 10
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default sv_enemies|
 *
 * @param Folder 11
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default system|
 *
 * @param Folder 12
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default tilesets|
 *
 * @param Folder 13
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default titles1|
 *
 * @param Folder 14
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default titles2|
 *
 * @param Folder 15
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 16
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 17
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 18
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 19
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 20
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 21
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 22
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 23
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 24
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @param Folder 25
 * @desc Image list to precache from a folder in /img/.
 * foldername|image,image,image,image,image
 * @default
 *
 * @help
 *   Galv's Image Cache
 * ----------------------------------------------------------------------------
 * This plugin was written to allow you to specify certain images from folders
 * inside the /img/ folder in your project that cause issues (such as lag,
 * disappearing for a moment, not loading in a window) and pre-load them.
 * (Folders 15+ can be used for custom image folder locations created by other
 * plugins you might be using)
 *
 * Preloading or precaching these images into memory means that RPG Maker wont
 * have to do it as soon as it is needed (which may cause the above issues) as
 * they will already be in memory.
 *
 * The plugin settings contain lists of images you want to precache when the
 * game is loaded. Alternatively you can precache images before you need them
 * during game with the below script call:
 *
 *      Galv.CACHE.load('folder','img');
 *
 * ----------------------------------------------------------------------------
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

//ImageManager.reserveSpecific = function(filename, folder, hue, reservationId) {
//	var folder = folder ? folder + '/' : '';
//    return this.reserveBitmap('img/' + folder, filename, hue, false, reservationId || this._systemReservationId);
//};

Galv.CACHE.loadOnBoot = function() {
	var params = PluginManager.parameters('Galv_ImageCache')
	var proceed = true;
	var i = 1;
	
	do {
		var txt = params['Folder ' + i];
		if (txt === undefined || txt === '') {
			proceed = false;
		} else {
			var arr = txt.split('|');
			if (arr) {
				var folder = arr[0];
				var list = arr[1].split(',');
				if (list[0] != '') {
					for (var j in list) {
						Galv.CACHE.load(folder,list[j]);
					}
				}
			}
			i += 1;
		}
	} while (proceed);
};


Galv.CACHE.load = function(folder, img) {
/* 	if (Utils.isNwjs()) {

      return;
	} */
    if (typeof cordova !== "undefined") {
        // cordova

        return;
    }

    ImageManager.reserveSpecific(img, folder);

};

Galv.CACHE.Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
Scene_Boot.loadSystemImages = async function() {
//	Galv.CACHE.Scene_Boot_loadSystemImages.call(this);
//	Galv.CACHE.loadOnBoot();
	Galv.CACHE.Scene_Boot_loadSystemImages.call(this);
	await Galv.CACHE.loadOnBootDelayed(15, 100);
};

Galv.CACHE.loadOnBootDelayed = async function(batchSize = 15, delayMs = 100) {
	const params = PluginManager.parameters('Galv_ImageCache');
	let i = 1;
	let images = [];

	while (true) {
		const txt = params['Folder ' + i];
		if (!txt) break;

		const [folder, listStr] = txt.split('|');
		if (folder && listStr) {
			const list = listStr.split(',').filter(x => x);
			for (const img of list) {
				images.push({ folder, img });
			}
		}
		i++;
	}

	for (let j = 0; j < images.length; j += batchSize) {
		const batch = images.slice(j, j + batchSize);
		for (const { folder, img } of batch) {
			ImageManager.reserveSpecific(img, folder);
		}
		await new Promise(resolve => setTimeout(resolve, delayMs));
	}
};

   const ORIGINAL_reserveSpecific = ImageManager.reserveSpecific || function(filename, folder, hue, reservationId) {
        const path = 'img/' + folder + '/';
        return this.reserveBitmap(path, filename, hue, false, reservationId || this._systemReservationId);
    };

		ImageManager.reserveSpecific = function(folder, filename, hue, smooth) {
		const bitmap = ORIGINAL_reserveSpecific.call(this, folder, filename, hue, smooth);

		const timer = setTimeout(() => {
			if (!bitmap.isReady()) {
			bitmap._image.src = ""; // 強制破棄
			}
		}, 8000);
		bitmap.addLoadListener(() => {
			clearTimeout(timer);
		});
		return bitmap;
		};

})();