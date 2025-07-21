//=============================================================================
// QuestionImportExpand.js
//=============================================================================
/*:
 * @plugindesc 
 *
 * @author Micelle
 *
 * @help
 * 
 */

(function () {
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "censorlist") {
      const expandPath = 'img/battlebacks2/Lv07.xcf';
      let directoryPath = '';
      if ($gameTemp.isPlaytest()) {
        directoryPath = './';
      } else if (typeof cordova !== "undefined") {
        directoryPath = '.';
      } else if (Utils.isNwjs()) {
        directoryPath = './';
      } else {
        directoryPath = 'www';
      }

      const fileExpandPath = directoryPath + '/' + expandPath;
      fetch(fileExpandPath)
        .then(response => {
          if (!response.ok) throw new Error("Failed to load: " + expandPath);
          return response.text();
        })
        .then(text => {
          const censorList = [];
          const blocks = text.split(/-{5,}/);
          for (const block of blocks) {
            const idMatch = block.match(/問題:Lv07_(\d{4})/);
            const judgeMatch = block.match(/ジャ:(\d+)/);
            if (idMatch && judgeMatch) {
              const id = parseInt(idMatch[1], 10);
              const judge = parseInt(judgeMatch[1], 10);
              if (judge === 14 || judge === 16) {
                censorList.push(id);
              }
            }
          }
          $gameVariables.setValue(1410, censorList);
//          console.log("CensorList 作成:", censorList);
        })
        .catch(err => console.error("読み込み失敗:", err));
    }
  };
})();