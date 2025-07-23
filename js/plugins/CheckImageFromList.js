//=============================================================================
// CheckImagesFromList.js
//=============================================================================

/*:
 * @plugindesc 外部リストで指定された画像名が存在するか（拡張子問わず）チェックし、なければ変数1655に1を代入します。
 * @author Micelle
 *
 * @help
 * プラグインコマンド（MV用）：
 *   CheckImagesFromList （URL）
 * 
 * 例:
 *   CheckImagesFromList https://example.com/list.txt
 * 
 * 注意：
 * ・NW.js環境（ローカルまたはテストプレイ）でのみ動作します。
 * ・チェック対象フォルダは img/pictures/ です。
 * ・ファイル名のみ（拡張子なし）で一致判定します。
 */

(function() {
  var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'CheckImagesFromList') {
      const url = args[0];
      if (!url) return;

      const fetchUrl = url + '?bust=' + Date.now();

      fetch(fetchUrl)
        .then(res => {
          if (!res.ok) throw new Error("Fetch failed");
          return res.text();
        })
        .then(text => {
          const fileNames = text.trim().split(/\r?\n/);
          const path = require('path');
          const fs = require('fs');

          const imageDir = Utils.isNwjs()
            ? ($gameTemp.isPlaytest()
                ? path.join("img", "pictures")
                : path.join("www", "img", "pictures"))
            : null;

          if (!imageDir || !fs.existsSync(imageDir)) {
            console.warn("画像フォルダが見つかりませんでした:", imageDir);
            return;
          }

          let missing = [];
          const files = fs.readdirSync(imageDir);
          for (let name of fileNames) {
            const match = files.find(file => path.parse(file).name === name);
            if (!match) missing.push(name);
          }

          if (missing.length > 0) {
            console.warn("見つからなかった画像:", missing);
            $gameTemp.reserveCommonEvent(326);
          } else {
            $gameSwitches.setValue(496, true);
          }
        })
        .catch(err => {
          console.error("CheckImagesFromList エラー:", err);
            $gameSwitches.setValue(496, true);          
        });
    }
  };
})();