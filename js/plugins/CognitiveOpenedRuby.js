//=============================================================================
// CognitiveOpenedRuby
//=============================================================================
/*:
 * @plugindesc ルビの感知+入力された文字列の処理
 *
 * @author chuukunn
 *
 * @param replacehalf
 * @desc スイッチ何番を半角感知用にするか
 * @type number
 * @default 272
 */
//=============================================================================

(function () {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    var parameters = PluginManager.parameters('CognitiveOpenedRuby');
    var replacehalf = Number(parameters['replacehalf'] || 272);

    function generateCombinations(input) {
        const results = [];

        const recurse = (current, remaining) => {
            if (remaining.length === 0) {
                results.push(current);
            } else if (remaining[0] === '₨') {
                recurse(current, remaining.slice(2));//含んでいない場合
                recurse(current + remaining[1], remaining.slice(2));//含んでいる場合
            } else {
                recurse(current + remaining[0], remaining.slice(1));
            }
        };
        recurse('', String(input));

        const processedStrings = [];
        results.forEach((text) => {
            // 元の文字列を加える
            processedStrings.push(text);

            // 文頭にAを加える
            if ($gameVariables.value(1057) != "　") {
                const stringWithPrefix = String($gameVariables.value(1057)) + text;
                processedStrings.push(stringWithPrefix);
            }

            // 文末にBを加える
            if ($gameVariables.value(1058) != "　") {
                const stringWithSuffix = text + String($gameVariables.value(1058));
                processedStrings.push(stringWithSuffix);
            }

            // 文頭にAを加えて、文末にBを加える
            if ($gameVariables.value(1057) != "　" && $gameVariables.value(1058) != "　") {
                const stringWithPrefixAndSuffix = String($gameVariables.value(1057)) + text + String($gameVariables.value(1058));
                processedStrings.push(stringWithPrefixAndSuffix);
            }
        });
        return processedStrings;
    }

    function convertKatakanaToHiragana(input) {
        const hiragana = String(input).replace(/「/g, '').replace(/」/g, '').replace(/￥/g, '').replace(/　/g, '').replace(/[\u30a1-\u30f6]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });

        if (!$gameSwitches.value(replacehalf)) {
            return hiragana.replace(/ /g, '').toLowerCase();
        }
        return hiragana.toLowerCase();
    }

    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ConvertAnswer') {
            var AnswerList = [];
            $gameVariables.setValue(12, convertKatakanaToHiragana($gameVariables.value(12)));
            for (var i = 9; i < 12;i++) {
                if ($gameVariables.value(i) == "000000000000000000000") {
                    continue;
                } else {
                    var list = generateCombinations($gameVariables.value(i).toLowerCase());
                    AnswerList.push(...list);
                }
            }
            if (AnswerList.includes($gameVariables.value(12))) {
                $gameVariables.setValue(12, $gameVariables.value(9));
            };
        }
    };

})();