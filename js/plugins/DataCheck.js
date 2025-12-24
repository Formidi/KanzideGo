/*:
 * @target MV
 * @plugindesc 日付チェック用プラグイン（12/24～12/31で xmas をセット）
 * @author ChatGPT
 *
 * @help
 * プラグインコマンド:
 *   DataCheck
 *
 * 実行すると、
 *   ・12/24～12/31 の場合：変数1550 = "xmas"
 *   ・それ以外の日付     ：変数1550 = ""
 *
 * PC版・スマホ版共通。
 */

(function() {

  // プラグインコマンド拡張
  var _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;

  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "DataCheck") {
      this.dataCheckXmas();
    }
  };

  // 実処理
  Game_Interpreter.prototype.dataCheckXmas = function() {
    var d = new Date();
    var month = d.getMonth() + 1; // 1～12
    var day   = d.getDate();      // 1～31

    var isXmas =
      (month === 12 && day >= 24 && day <= 31);

    $gameVariables.setValue(1550, isXmas ? "xmas" : "");
  };

})();
