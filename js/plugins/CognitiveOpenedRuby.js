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
 *
 * @param replacehistorical
 * @desc 「変数」何番を歴史的仮名遣い感知用にするか
 * @type number
 * @default 1263
 */
//=============================================================================

(function () {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    var parameters = PluginManager.parameters('CognitiveOpenedRuby');
    var replacehalf = Number(parameters['replacehalf'] || 272);
    var replacehistorical = Number(parameters['replacehistorical'] || 1263);
    DataManager.loadCustomData = function () {
        return this._NormalQuestionData || [];
    };

    function generateVariations(strList) {
        let replacements = {
            'が': ['か', 'が'], 'ぎ': ['き', 'ぎ'], 'ぐ': ['く', 'ぐ'], 'げ': ['け', 'げ'], 'ご': ['こ', 'ご'],
            'ざ': ['さ', 'ざ'], 'じ': ['じ'], 'ず': ['ず'], 'ぜ': ['せ', 'ぜ'], 'ぞ': ['そ', 'ぞ'],
            'だ': ['た', 'だ'], 'ぢ': ['ち', 'ぢ'], 'づ': ['つ', 'づ'], 'で': ['て', 'で'], 'ど': ['と', 'ど'],
            'ば': ['は', 'ば'], 'び': ['ひ', 'び'], 'ぶ': ['ふ', 'ぶ'], 'べ': ['へ', 'べ'], 'ぼ': ['ほ', 'ぼ'],
            'ぱ': ['は', 'ぱ'], 'ぴ': ['ひ', 'ぴ'], 'ぷ': ['ふ', 'ぷ'], 'ぺ': ['へ', 'ぺ'], 'ぽ': ['ほ', 'ぽ']
        };
        let additionalReplacements = {};


        if ($gameVariables.value(replacehistorical) == 3) {
            additionalReplacements = {
                'じ': ['ぢ'], 'ず': ['づ'],
                'ぢ': ['じ'], 'づ': ['ず']
            };
        }
        if ($gameVariables.value(replacehistorical) == 2) {
            additionalReplacements = {
                'じ': ['し', 'ぢ'], 'ず': ['す', 'づ'],
                'ぢ': ['ち', 'じ'], 'づ': ['つ', 'ず']
            };
        }
        if ($gameVariables.value(replacehistorical) == 1) {
            additionalReplacements = {
                'じ': ['し'], 'ず': ['す']
            };
        }
        // 基本の規則と追加の規則を統合
        for (const [key, values] of Object.entries(additionalReplacements)) {
            if (replacements[key]) {
                replacements[key] = Array.from(new Set([...replacements[key], ...values]));
            } else {
                replacements[key] = values;
            }
        }

        function helper(s, index) {
            if (index === s.length) {
                return [s];
            }

            const currentChar = s[index];
            const variations = replacements[currentChar] || [currentChar];
            const results = [];

            for (const variant of variations) {
                const newStr = s.slice(0, index) + variant + s.slice(index + 1);
                results.push(...helper(newStr, index + 1));
            }

            return results;
        }
        console.log(strList);
        return strList.map(str => helper(str, 0)).reduce((acc, val) => acc.concat(val), []);
    }
    function generateCombinations(input) {
        const results = [];
        const questionList = DataManager.loadCustomData();
        const numericValues = [];
        const nonNumericValues = [];
        if (questionList[$gameVariables.value(8)]) {
            const originalData = questionList[$gameVariables.value(8)]["1087"];

            for (const item of originalData.split(",")) {
                if (isNaN(item)) {
                    nonNumericValues.push(item.toString());
                } else {
                    numericValues.push(item);
                }
            }
        }

        console.log("数値の配列:", numericValues);
        console.log("文字列の配列:", nonNumericValues);

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

        for (const item of nonNumericValues) {
            recurse('', String(item));
        }
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




        $gameVariables.setValue(replacehistorical, parseInt(numericValues.find(value => 1001 <= parseInt(value) && parseInt(value) <= 1010)) - 1000);
        if ($gameVariables.value(replacehistorical) >= 1) {
            return generateVariations(processedStrings);
        } else {
            return processedStrings;
        }
        
    }

    function convertKatakanaToHiragana(input) {
        const hiragana = String(input).replace(/「/g, '').replace(/」/g, '').replace(/￥/g, '').replace(/　/g, '').replace(/[\u30a1-\u30f6]/g, function (match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });

        let result = hiragana.toLowerCase();

        if (!$gameSwitches.value(replacehalf)) {
            result = result.replace(/ /g, '');
        }

        if (/^[a-zA-Z]+$/.test(result)) {
            result = result.charAt(0).toUpperCase() + result.slice(1);
        }

        if (result == "Q" || result == "Ｑ") {
            return "q";
        }

        return result;
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
            console.log(AnswerList);
            if (AnswerList.includes(String($gameVariables.value(12)).toLowerCase())) {
                $gameVariables.setValue(12, $gameVariables.value(9));
            };
        }
    };

})();