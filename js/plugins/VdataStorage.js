/*:
 * @plugindesc 特定の変数のみを file1.rpgsave にセーブ＆ロードする（環境判定対応版）
 * @author AI Assistant
 *
 * @help
 * 【プラグインコマンド】
 * Vdata save n
 * 変数 n 番の値を 'file1.rpgsave' (Web版は localStorage 'RPG File1') に保存します。
 * * Vdata load n
 * 'file1.rpgsave' から値を読み込み、変数 n 番に代入します。
 *
 * ※このプラグインは標準のセーブスロット1を上書きします。
 * ※変数以外のデータ（座標、スイッチ等）は一切保存されません。
 */

(function() {
    'use strict';

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'Vdata') {
            var subCommand = args[0];
            var variableId = Number(args[1]);
            if (subCommand === 'save') saveVariable(variableId);
            else if (subCommand === 'load') loadVariable(variableId);
        }
    };

    // --- 環境判定ロジック (ご提示のコードをベースに調整) ---
    function getBaseDirectory() {
        if (Utils.isNwjs()) {
            // DL版: テストプレイ時と製品版でパスを切り替え
            if (process.mainModule.filename.includes('index.html')) {
                var path = require('path');
                return path.dirname(process.mainModule.filename);
            }
            return './'; 
        } else if (!(typeof cordova === "undefined")) {
            return '.'; // スマホアプリ(Cordova)
        } else {
            return ''; // ブラウザ版（localStorage使用のためパス不要）
        }
    }

    // --- 保存処理 ---
    function saveVariable(variableId) {
        var value = $gameVariables.value(variableId);
        var data = LZString.compressToBase64(JsonEx.stringify({ vdata: value }));

        if (Utils.isNwjs()) {
            // DL版: fsモジュールを使用してファイル書き込み
            var fs = require('fs');
            var path = require('path');
            var dirPath = path.join(getBaseDirectory(), 'save');
            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
            
            var filePath = path.join(dirPath, 'file1.rpgsave');
            fs.writeFileSync(filePath, data);
        } else {
            // ブラウザ版・スマホアプリ版: WebStorage (RPG File1 = file1.rpgsave)
            localStorage.setItem('RPG File1', data);
        }
        console.log("Vdata saved to file1. (Var:" + variableId + " Value:" + value + ")");
    }

    // --- 読み込み処理 ---
    function loadVariable(variableId) {
        var data = null;

        if (Utils.isNwjs()) {
            var fs = require('fs');
            var path = require('path');
            var filePath = path.join(getBaseDirectory(), 'save/file1.rpgsave');
            if (fs.existsSync(filePath)) {
                data = fs.readFileSync(filePath, { encoding: 'utf8' });
            }
        } else {
            data = localStorage.getItem('RPG File1');
        }

        if (data) {
            try {
                var obj = JsonEx.parse(LZString.decompressFromBase64(data));
                $gameVariables.setValue(variableId, obj.vdata);
                console.log("Vdata loaded. Value:", obj.vdata);
            } catch (e) {
                console.error("Vdata load error:", e);
            }
        } else {
            // データがない場合は0にする（必要に応じて変更してください）
            $gameVariables.setValue(variableId, 0);
            console.log("Vdata: No save file found. Variable set to 0.");
        }
    }
})();