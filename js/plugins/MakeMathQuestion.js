//=============================================================================
// My Custom Plugin
//=============================================================================
// 作者: chuukunn
// バージョン: 1.0.0
//=============================================================================
/*:
 * @plugindesc プラグインの説明をここに記述します。
 *
 * @param question
 * @desc もんだいをいれるばしょ
 * @default 8
 *
 * @param answer
 * @desc こたえをいれるばしょ
 * @default 9
 *
 * @help
 *
 * 使い方:プラグインコマンド、MakeMathQuestion [引数1] [引数2] [引数3] [引数4(任意)]を実行すると、問題文が変数479に、答えが変数480に保存されます。
 * 引数1:四則演算の桁数のレベル(だいたいの目安、範囲外が出ることもある)
 * 1:1桁±1桁、1桁×1桁、1桁÷1桁。
 * 2:2桁±1桁、1桁×1桁、2桁÷1桁。
 * 3:2桁±2桁、2桁×1桁、2桁÷1桁。
 * 4:2桁±2桁、2桁×1桁、3桁÷1桁。
 * 5:3桁±2桁、3桁×1桁、3桁÷2桁。
 * 6:3桁±3桁、3桁×2桁、3桁÷2桁。
 * 引数2:＋－の挿入数
 * 引数3:×÷の挿入数
 * 引数4:□という文字にすると伏せ問題になる。ただし伏せ問題が使えるのは足し算引き算を含む場合のみ。
 * 注意点:引数3が引数2より2以上多いとバグります。(8×4×2+6÷2のような問題はできない)
 * 注意点:引数3が引数2より1以上多い時に伏字をしようとするとバグります。(49×□=343のような問題はできない)
 * 例:
 *  MakeMathQuestion 1 1 0 → 4 － 1 = 3,7 － 2 = 5,7 ＋ 7 = 14
 *  MakeMathQuestion 2 0 1 → 45 ÷ 9 = 5,6 × 3 = 18,36 ÷ 9 = 4
 *  MakeMathQuestion 3 1 1 → 30 ＋ 72 ÷ 3 = 54,208 ÷ 4 ＋ 72 = 124
 *  MakeMathQuestion 4 1 2 → 356 ÷ 4 ＋ 77 × 9 = 782
 *  MakeMathQuestion 5 1 0 □　→ 579 ＋ □ = 594,□ = 15,631 － □ = 605,□ = 26
 *  MakeMathQuestion 6 10 5 □ → 803 ＋ 8040 ÷ 12 ＋ 664 × 92 － 484 ＋ 446 × 97 ＋ 453 ＋ 696 － 562 ＋ 2439 ÷ 9 ＋ 522 ÷ 261 ＋ □ = 106378,□ = 179
 */
//=============================================================================

(function () {
    // プラグインのコマンド定義
    var pluginCommand = Game_Interpreter.prototype.pluginCommand;
    var parameters = PluginManager.parameters('MakeMathQuestion');
    var mondai_index = Number(parameters['question'] || 8);
    var kotae_index = Number(parameters['answer'] || 9);
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        pluginCommand.call(this, command, args);
        if (command === 'MakeMathQuestion') {
            Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 10 * $gameVariables.value(380) + 100 * $gameVariables.value(774));
            const [question, answer] = generateMathQuestion_PM(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]));
            var expression = [question[0]];
            for (let i = 1; i < question.length; i++) {
                if (!isNaN(question[i])) {
                    if (question[i] >= 0) {
                        expression.push(" ＋ ");
                        expression.push(question[i]);
                    } else {
                        expression.push(" － ");
                        expression.push(Math.abs(question[i]));
                    }
                } else {
                    if (question[i].indexOf("－") !== -1) {
                        expression.push(question[i]);
                    } else {
                        expression.push(" ＋ ");
                        expression.push(question[i]);
                    }
                }
            }
            if (args.length >= 4) {
                if (args[3] == "□") {
                    const numberIndexes = [];
                    for (let i = 0; i < expression.length; i++) {
                        if (!isNaN(expression[i])) {
                            numberIndexes.push(i);
                        }
                    }
                    // リストからランダムなインデックスを選択
                    const randomIndex = numberIndexes[Math.floor(Math.random() * numberIndexes.length)];
                    var tmp = expression[randomIndex];
                    $gameVariables.setValue(kotae_index, tmp);
                    expression[randomIndex] = "■";
                    var quest = expression.join().replace(/,/g, '');
                    $gameVariables.setValue(mondai_index, `${quest} ＝ ${answer}`);
                }
            } else {
                var quest = expression.join().replace(/,/g, '');
                $gameVariables.setValue(mondai_index, quest);
                $gameVariables.setValue(kotae_index, answer);
            }
        }
    };

    function GenerateMD(digits, sub_digits) {
        if (Math.random() < 0.5) {
            let YaYaBigNum = Math.floor(Math.random() * (5 * sub_digits + 3) * digits) + 2 * digits;
            if (YaYaBigNum % 10 == 0) YaYaBigNum += Math.floor(Math.random() * 9) + 1;
            var SmallNum = Math.floor(Math.random() * 8) + 2;//small_numは難易度が5以下なら1桁。
            if (digits == 100 && sub_digits == 1) SmallNum += Math.floor(Math.random() * 10) * 10;//難易度6なら2桁に。容赦はない。
            return [`${YaYaBigNum} × ${SmallNum}`, YaYaBigNum * SmallNum];
        } else {
            var YaYaSmallNum = Math.floor(Math.random() * 7 * digits) + 2 * digits;//1→2~9、2→20~90、3→200~900
            if (digits == 100 && sub_digits == 0) YaYaSmallNum = Math.floor(Math.random() * 70) + 20;
            var SmallNum = Math.floor(Math.random() * 8) + 2;
            if (digits >= 100) SmallNum += Math.floor(Math.random() * 10);
            if (SmallNum == 0) SmallNum += Math.floor(Math.random() * 9) + 1;
            if (Math.random() < 0.5 || digits <= 10) {
                return [`${YaYaSmallNum * SmallNum} ÷ ${SmallNum}`, YaYaSmallNum];
            } else {
                return [`${YaYaSmallNum * SmallNum} ÷ ${YaYaSmallNum}`, SmallNum];
            }
        }
    }

    function calculateExpression(exp) {
        if (!isNaN(exp)) return exp;
        if (!exp.indexOf("－") !== -1) return -1;
        const parts = exp.split(" × ");
        if (parts.length === 2) {
            return parseFloat(parts[0]) * parseFloat(parts[1]);
        }

        const divisionParts = exp.split(" ÷ ");
        if (divisionParts.length === 2) {
            const denominator = parseFloat(divisionParts[1]);
            return parseFloat(divisionParts[0]) / denominator;
        }
        return exp;
    }

    // 問題文を生成する関数
    function generateMathQuestion_PM(level, num_of_pm, num_of_md) {
        var digits = parseInt(Math.pow(10,Math.floor((level - 1) / 2)));//1~2なら1、3~4なら10、5~6なら100。
        var sub_digits = parseInt(1 - level % 2);//2,4,6なら1、それ以外なら0。
        const arr = [];
        let ans = 0;
        var randomValue;
        var answer;
        for (let i = 0; i < num_of_pm + 1; i++) {
            if (Math.random() < num_of_md / (num_of_pm + 1 - i)) {
                [randomValue, answer] = GenerateMD(digits, sub_digits);
                num_of_md -= 1;
            } else {
                // digitsが1なら1~9、digitsが10なら10~99、100なら100~999の乱数。
                if (i == 0 && digits == 1 && sub_digits == 1) {
                    //難易度2かつ最初の数字の場合、10~20が抽選される。
                    randomValue = Math.floor(Math.random() * 11) + 10;
                } else if (i != 0 && digits == 100 && sub_digits == 0) {
                    //難易度5かつ最初の数字でない場合、10~99が抽選される。
                    randomValue = Math.floor(Math.random() * 90) + 10;
                }else{
                    randomValue = Math.floor(Math.random() * 9 * digits) + digits;
                }
                answer = randomValue;
            }
            arr.push(randomValue);
            ans += answer;
        }
        if (arr.length == 1) {
            if (isNaN(arr[0])) return [arr, ans];
            arr.sort((a, b) => b - a);
            if (Math.random() < 0.5) arr[1] = -1 * arr[1];
            ans = arr[0] + arr[1];
            return [arr, ans];
        }
        var per = 0.8;
        while (Math.random() < per) {
            var changeIndex = Math.floor(Math.random() * (arr.length - 1)) + 1;
            var arrValue = calculateExpression(arr[changeIndex]);
            if (arrValue < arr[0] && arrValue * 2 < ans && arrValue >= 1) {
                ans -= 2 * arrValue;
                if (!isNaN(arr[changeIndex])) {
                    arr[changeIndex] = -1 * arr[changeIndex];
                } else {
                    arr[changeIndex] = ` － ${arr[changeIndex]}`;
                }
                per -= 0.2;
            }
            if (arrValue > arr[0]) {
                var tmp = arr[0];
                arr[0] = arr[changeIndex];
                arr[changeIndex] = tmp;
            }
        }
        return [arr, ans];
    }
})();
