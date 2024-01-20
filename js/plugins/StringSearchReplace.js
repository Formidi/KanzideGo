(function() {
    var parameters = PluginManager.parameters('StringSearchReplace');

    // プラグインコマンドの処理
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'StringSearchReplace') {
            var variableAId = parseInt(args[0]);
            var variableBId = parseInt(args[1]);
            var variableAValue = $gameVariables.value(variableAId);
            var variableBValue = $gameVariables.value(variableBId);

            // 変数Aに代入された文字列内で変数Bの文字列を検索し、"[解答]"に置き換える
            var replacedValue = variableAValue.replace(variableBValue, "[解答]");
            $gameVariables.setValue(variableAId, replacedValue);
        } else if (command === 'StringManipulation') { // 新しいプラグインコマンドを追加
            var variableCId = parseInt(args[0]);
            var variableCValue = $gameVariables.value(variableCId);
            if (variableCValue.length >= 1) {
                // カタカナを平仮名に置き換える
                var hiraganaValue = variableCValue.replace(/[\u30a1-\u30f6]/g, function (match) {
                    return String.fromCharCode(match.charCodeAt(0) - 96);
                });
                // 文末が「ｎ」なら、「ん」に置き換える
                if (hiraganaValue.charAt(hiraganaValue.length - 1) === 'ｎ' || hiraganaValue.charAt(hiraganaValue.length - 1) === 'n') {
                    hiraganaValue = hiraganaValue.slice(0, -1) + 'ん';
                }

                // 平仮名と伸ばし棒以外の文字を削除する
                hiraganaValue = hiraganaValue.replace(/ゟ/g, 'より').replace(/[^ぁ-ゖーqｑ]/g, '');

                // 変数Cに結果を代入する
                if (hiraganaValue.length >= 1) {
                    $gameVariables.setValue(variableCId, hiraganaValue);
                }
            }
        }
    };
}) ();