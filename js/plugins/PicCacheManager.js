/*:
 * @target MV
 * @plugindesc [MV] Track & clear img/pictures cache by filename prefix (e.g., Enemy*)
 *
 * @help
 * Plugin Commands:
 *   PicCacheStart PREFIX   # start tracking loadPicture, but only names starting with PREFIX
 *     e.g. PicCacheStart Enemy
 *
 *   PicCacheClear          # clear tracked pictures from MV cache (call after erasing pictures)
 *   PicCacheStop           # stop tracking
 *
 * Notes:
 * - Call "Erase Picture" (or $gameScreen.clearPictures()) BEFORE PicCacheClear,
 *   so no sprite still references the bitmap.
 */

(function() {
  "use strict";

if (!Utils.isNwjs() && typeof cordova === "undefined") {
    console.log("[PicCache] disabled (browser)");
    return;
  }

  // -------------------------------
  // State
  // -------------------------------
  var _tracking = false;
  var _prefix = "";
  var _trackedNames = Object.create(null); // name => true

  function startsWithPrefix(name) {
    if (!_prefix) return true;
    return String(name).indexOf(_prefix) === 0;
  }

  // -------------------------------
  // Hook loadPicture to record names
  // -------------------------------
  var _ImageManager_loadPicture = ImageManager.loadPicture;
  ImageManager.loadPicture = function(filename, hue) {
    if (_tracking && filename && startsWithPrefix(filename)) {
      _trackedNames[String(filename)] = true;
    }
    return _ImageManager_loadPicture.call(this, filename, hue);
  };

  // -------------------------------
  // Cache deletion helper
  // -------------------------------
  function _deletePictureFromCacheByName(name) {
    var folder = "img/pictures/";
    var encoded = encodeURIComponent(name);
    var needle = folder + encoded + "."; // extension wildcard

    // 1) MV ImageCache
    var cache = ImageManager && ImageManager._imageCache;
    if (cache && cache._items) {
      Object.keys(cache._items).forEach(function(k) {
        if (k.indexOf(needle) !== -1) {
          var item = cache._items[k];
          if (item && item.bitmap && item.bitmap.destroy) {
            try { item.bitmap.destroy(); } catch (e) {}
          }
          delete cache._items[k];
        }
      });
    }

    // 2) Pixi caches (best-effort)
    if (window.PIXI && PIXI.utils) {
      var texCache = PIXI.utils.TextureCache;
      if (texCache) {
        Object.keys(texCache).forEach(function(k) {
          if (k.indexOf(needle) !== -1) {
            var tex = texCache[k];
            if (tex && tex.destroy) {
              try { tex.destroy(true); } catch (e) {}
            }
            delete texCache[k];
          }
        });
      }
      var baseCache = PIXI.utils.BaseTextureCache;
      if (baseCache) {
        Object.keys(baseCache).forEach(function(k) {
          if (k.indexOf(needle) !== -1) {
            var btex = baseCache[k];
            if (btex && btex.destroy) {
              try { btex.destroy(); } catch (e) {}
            }
            delete baseCache[k];
          }
        });
      }
    }
  }

  function clearTrackedPictures() {
    var names = Object.keys(_trackedNames);
    if (!names.length) return;

    names.forEach(function(name) {
      _deletePictureFromCacheByName(name);
    });

    _trackedNames = Object.create(null);
  }

  // -------------------------------
  // Plugin commands
  // -------------------------------
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    command = String(command);
    args = args || [];

    if (command === "PicCacheStart") {
      _tracking = true;
      _prefix = (args[0] != null) ? String(args[0]) : "";
      _trackedNames = Object.create(null);
      console.log("[PicCache] start. prefix=", _prefix);
    }

    if (command === "PicCacheStop") {
      _tracking = false;
      console.log("[PicCache] stop.");
    }

    if (command === "PicCacheClear") {
      // IMPORTANT: call after Erase Picture / clearPictures
      clearTrackedPictures();
      console.log("[PicCache] cleared tracked pictures.");
    }
  };

})();
