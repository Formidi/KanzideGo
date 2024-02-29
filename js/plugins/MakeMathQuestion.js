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
            var phase = phaseChecker();
            if (($gameVariables.value(1265) == 0 && phase >= 2 && phase <= 5 && Math.random() < 0.5) || true) {
                Ingenuity(3);
                console.log(`特殊問題:${$gameVariables.value(mondai_index)} ＝ ${$gameVariables.value(kotae_index)}`);
            } else if (($gameVariables.value(1265) == 0 && phase == 6 && Math.random() < 0.6 && $gameVariables.value(1117) == 0)) {
                Ingenuity_Hard();
                //console.log(`特殊問題:${$gameVariables.value(mondai_index)} ＝ ${$gameVariables.value(kotae_index)}`);
            } else {
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
                        expression[randomIndex] = "■";
                        var quest = expression.join().replace(/,/g, '');
                        $gameVariables.setValue(mondai_index, `${quest} ＝ ${answer}`);
                        $gameVariables.setValue(kotae_index, tmp);
                        //console.log(`${quest} ＝ ${answer}`);
                    }
                } else {
                    var quest = expression.join().replace(/,/g, '');
                    $gameVariables.setValue(mondai_index, quest);
                    $gameVariables.setValue(kotae_index, answer);
                    //console.log(quest);
                }
                if ($gameVariables.value(1265) >= 1) {
                    $gameVariables.setValue(mondai_index, transformTextWithNumbers($gameVariables.value(mondai_index)));
                    //console.log(countStringLength($gameVariables.value(mondai_index)));
                    //console.log($gameVariables.value(mondai_index));
                }
            }
        }
    };

    function isPrime(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        let i = 5;
        while (i * i <= num) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
            i += 6;
        }
        return true;
    }

    function phaseChecker() {
        var q = parseInt($gameVariables.value(7));
        var thresholds = [2, 5, 7, 10, 12, 15, 16];
        var max = 6;
        if ($gameVariables.value(1102) == 0) {
            thresholds = [1, 2, 3, 4, 5, 6, 7];
            max = 6;
        } else if ($gameVariables.value(1102) == 1) {
            thresholds = [2, 3, 5, 6, 8, 9, 10];
            max = 6;
        }
        phase = max;
        if ($gameVariables.value(1117) >= 11) {
            phase = Math.min($gameVariables.value(1117) - 11, 13);
        } else {
            for (var i = 0; i < thresholds.length; i++) {
                if (q <= thresholds[i]) {
                    phase = i;
                    break;
                }
            }
        }
        if ($gameVariables.value(1117) == 1) {
            phase = Math.min(phase + 2, 13);
        } else if ($gameVariables.value(1117) == 2) {
            phase = Math.min(phase + 4, 13);
        } else if ($gameVariables.value(1117) == 3) {
            phase = Math.min(phase + 6, 13);
        }
        return phase;
    }

    function getRandomPrime(difficulty) {
        let min = 1;
        let max = 100;
        if (difficulty == 2) {
            min = 10;
            max = 30;
        } else if (difficulty == 3) {
            min = 30;
            max = 50;
        } else if (difficulty == 4) {
            min = 50;
            max = 100;
        } else if (difficulty == 5) {
            min = 100;
            max = 200;
        } else  {
            min = 200;
            max = 999;
        }
        while (true) {
            let num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (isPrime(num)) return num;
        }
    }
    function getRandomNumber(digits) {
        let min, max;

        if (digits === 10) {
            min = 2;
            max = 4;
        } else if (digits === 100) {
            min = 11;
            max = 30;
        } else {
            return "Unsupported digits value";
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function Ingenuity(difficulty) {
        //difficultyが2~3なら2桁、4~5なら3桁、1か6以上なら無し
        //3か5なら+
        var digits = parseInt(Math.pow(10, Math.floor(difficulty / 2)));
        var sub_digit = difficulty % 2;

        var randomValue = Math.floor(Math.random() * 3 * digits) + digits;//10→10~30、100→100~300
        if (randomValue % 10 == 0) {
            randomValue += Math.floor(Math.random() * 5) + 1;
        }
        var randomValue_one = getRandomNumber(digits);//10→2~4、100→11~30
        var randomValue_two = getRandomNumber(digits);//10→2~4、100→11~30

        var randomonedigitsValue = Math.floor(Math.random() * 7) + 2;//2~9
        var randomminidigitsValue = Math.floor(Math.random() * 3) + 2;//2~5

        var randomValue_10n_minus_one_two = digits / 10 * (10 + randomonedigitsValue - 2) - randomValue_one - randomValue_two;
        
        var RandomValueNear10n = digits + Math.floor(Math.random() * difficulty) - 3;
        if (RandomValueNear10n % 10 == 0) {
            RandomValueNear10n += Math.floor(Math.random() * difficulty) * 10;
        }

        var RandomValueNear10n_sub = digits + Math.floor(Math.random() * 10);
        if (RandomValueNear10n_sub % 10 == 0) {
            RandomValueNear10n_sub += Math.floor(Math.random() * 5) + 1;
        }

        var randomPrimeValue = getRandomPrime(difficulty);
        var random10n_minus_randomPrimeValue = digits * (11 + Math.floor(Math.random() * 8)) - randomPrimeValue

        const just_num = [[5, 2], [5, 4], [25, 2], [25, 4], [125, 4], [125, 8], [45, 4], [45, 8], [75, 4], [75, 8]];
        var just_num_index = Math.floor(Math.random() * 4) + 2 * (difficulty - 2);
        if (just_num_index < 0) {
            just_num_index = 0
        } else if (just_num_index >= just_num.length) {
            just_num_index = just_num.length - 1;
        }
        var rand = Math.floor(Math.random() * 60) + 1;
        var sign = parseInt(rand % 2);
        var quest = "";
        var answer = 0;

        if (rand <= 10) {
            quest = `${just_num[just_num_index][sign]} × ${randomValue_one} × ${just_num[just_num_index][1 - sign]}`;
            answer = randomValue_one * just_num[just_num_index][0] * just_num[just_num_index][1];
        } else if (rand <= 20) {
            if (sub_digit == 1) {
                quest = `${digits * randomonedigitsValue + randomValue_one} × ${randomValue_two} － ${randomValue_one * randomValue_two}`;
                answer = digits * randomonedigitsValue * randomValue_two;
            } else {
                if (randomValue < randomValue_10n_minus_one_two + randomValue_one + randomValue_two) {
                    quest = `${randomValue_10n_minus_one_two} － ${randomValue} ＋ ${randomValue_two} ＋ ${randomValue_one}`;
                    answer = randomValue_10n_minus_one_two + randomValue_one + randomValue_two - randomValue;
                } else {
                    quest = `${randomValue_10n_minus_one_two} ＋ ${randomValue} ＋ ${randomValue_two} ＋ ${randomValue_one}`;
                    answer = randomValue_10n_minus_one_two + randomValue_one + randomValue_two + randomValue;
                }
            }
        } else if (rand <= 30) {
            if (sub_digit == 1) {
                quest = `${just_num[just_num_index][sign] * randomValue_two} × ${randomValue_one * just_num[just_num_index][1 - sign]} ÷ ${randomValue_two}`;
                answer = randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
            } else {
                quest = `${randomValue_one * just_num[just_num_index][sign]} × ${just_num[just_num_index][1 - sign]}`;
                answer = randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
            }
        } else if (rand <= 40) {
            if (sub_digit == 1) {
                quest = `${RandomValueNear10n} × ${RandomValueNear10n_sub}`;
                answer = RandomValueNear10n * RandomValueNear10n_sub;
            } else {
                quest = `${RandomValueNear10n * 10} × ${randomValue_one}`;
                answer = RandomValueNear10n * 10 * randomValue_one;
            }
        } else if (rand <= 50) {
            if (rand <= 45) {
                quest = `${random10n_minus_randomPrimeValue} × ${randomonedigitsValue} ＋ ${randomonedigitsValue} × ${randomPrimeValue}`;
                answer = randomonedigitsValue * (random10n_minus_randomPrimeValue + randomPrimeValue);
            } else {
                quest = `${randomPrimeValue * randomminidigitsValue} ÷ ${randomminidigitsValue} ＋ ${randomValue_one * randomminidigitsValue * randomminidigitsValue} ÷ ${randomminidigitsValue * randomminidigitsValue}`;
                answer = randomValue_one + randomPrimeValue;
            }
        } else if (rand <= 60) {
            if (sub_digit == 1) {
                quest = `${randomValue * randomonedigitsValue} × ■ ＝ ${randomPrimeValue * randomonedigitsValue} × ${randomValue}`;
                answer = randomPrimeValue;
            } else {
                if (randomPrimeValue - randomonedigitsValue * 2 >= 1 && randomPrimeValue + randomonedigitsValue * 2 >= 1) {
                    quest = `${randomPrimeValue + randomonedigitsValue * 2} ＋ ${randomPrimeValue + randomonedigitsValue} ＋ ${randomPrimeValue} ＋ ${randomPrimeValue - randomonedigitsValue} ＋ ${randomPrimeValue - randomonedigitsValue * 2}`;
                    answer = randomPrimeValue * 5;
                } else if (randomPrimeValue - randomonedigitsValue >= 1 && randomPrimeValue + randomonedigitsValue >= 1) {
                    quest = `${randomPrimeValue + randomonedigitsValue} ＋ ${randomPrimeValue} ＋ ${randomPrimeValue - randomonedigitsValue}`;
                    answer = randomPrimeValue * 3;
                } else {
                    quest = `${randomPrimeValue * randomonedigitsValue} ÷ ${randomPrimeValue}`;
                    answer = randomonedigitsValue;
                }
            }
        }
        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);
    }
    function shuffleArray(array) {
        // Fisher-Yatesアルゴリズムを使って配列をランダムに並べ替える
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function Ingenuity_Hard() {
        var rand = Math.floor(Math.random() * 60) + 1;
        var quest = "";
        var answer = 0;
        if (rand <= 10) {
            const randomPrimeValue = getRandomPrime(6);
            const myArray = [7, 11, 13];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0] * randomPrimeValue} × ${shuffledArray[1]} × ${shuffledArray[2]}`;
            answer = 1001 * randomPrimeValue;
        } else if (rand <= 20) {
            const randomPrimeValue_one = getRandomPrime(2);
            const randomPrimeValue_two = getRandomPrime(2);
            const myArray = [2, 8];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0] * randomPrimeValue_one} × ${shuffledArray[1] * randomPrimeValue_two} × 625`;
            answer = 10000 * randomPrimeValue_one * randomPrimeValue_two;
        } else if (rand <= 30) {
            const randomTwoPower = Math.pow(2, Math.floor(Math.random() * 6) + 3);
            quest = `65536 ÷ ${randomTwoPower}`;
            answer = parseInt(65536 / randomTwoPower);
        } else if (rand <= 40) {
            const randomPrimeValue_one = getRandomPrime(2);
            const randomPrimeValue_two = getRandomPrime(2);
            const randomPrimeValue_three = getRandomPrime(2);
            const randomPrimeValue_four = getRandomPrime(3);
            quest = `${10000 - randomPrimeValue_one} ＋ ${10000 - randomPrimeValue_two} ＋ ${10000 - randomPrimeValue_three} ＋ ${10000 - randomPrimeValue_four}`;
            answer = 40000 - randomPrimeValue_one - randomPrimeValue_two - randomPrimeValue_three - randomPrimeValue_four;
        } else if (rand <= 50) {
            const randomPrimeValue = getRandomPrime(6);
            const myArray = [73, 137, randomPrimeValue];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0]} × ${shuffledArray[1]} × ${shuffledArray[2]}`;
            answer = 10001 * randomPrimeValue;
        } else if (rand <= 60) {
            const randomPrimeValue = getRandomPrime(4);
            quest = `${1000 + randomPrimeValue} × ${1000 - randomPrimeValue}`;
            answer = 1000000 - randomPrimeValue * randomPrimeValue;
        }
        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);
    }
    function countStringLength(text) {
        let length = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // 韓国語、漢字、ひらがな、特定の記号を全角として扱う
            if (char.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af＋－×÷=]/)) {
                length += 2;
            } else {
                length += 1;
            }
        }
        return length;
    }
    function transformTextWithNumbers(text) {
        // 全角文字を2、半角文字を1と数える関数
        function getStringLength(str) {
            let length = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                // 韓国語、漢字、ひらがな、特定の記号を全角として扱う
                if (char.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af＋－×÷＝■]/)) {
                    length += 2;
                } else {
                    length += 1;
                }
                if (length > 35) break;
            }
            return length;
        }

        var level = $gameVariables.value(1265);
        let result = "";
        let remainingText = text;
        let isFirst = true;

        while (remainingText.length > 0) {
            const match = remainingText.match(/\d+/);
            if (!match) {
                // 数字がなければ残りを追加して終了
                result += remainingText;
                break;
            }

            const index = match.index;
            result += remainingText.substring(0, index);

            if (match[0].length > 3) {
                // 4桁以上の数字はそのまま残す
                result += match[0];
            } else {
                // 3桁以下の数字に対して置換を試行
                let replaced = match[0];
                for (let i = 0; i < 60; i++) {
                    if (i == 15 || i == 30 || i == 45) {
                        level = Math.max(1, level - 1);
                    }
                    const newReplaced = extreme(parseInt(match[0]), level,isFirst);

                    if (getStringLength(result + newReplaced + remainingText.substring(index + match[0].length)) <= 35) {
                        replaced = newReplaced;
                        isFirst = false;
                        break;
                    }
                }

                // 置換を行う
                result += replaced;
            }

            remainingText = remainingText.substring(index + match[0].length);
        }

        return result;
    }

    function GenerateMD(digits, sub_digits) {
        if (Math.random() < 0.5) {
            let YaYaBigNum = Math.floor(Math.random() * (5 * sub_digits + 3) * digits) + 2 * digits;
            if (YaYaBigNum % 10 == 0) YaYaBigNum += Math.floor(Math.random() * 9) + 1;
            if (digits == 100 && sub_digits == 0) YaYaBigNum = YaYaBigNum % 100 + 100;
            var SmallNum = Math.floor(Math.random() * 8) + 2;//small_numは難易度が5以下なら1桁の2以上。
            if ((digits >= 100 && sub_digits == 1) || digits >= 1000) SmallNum += Math.floor(Math.random() * 7) * 10 + 20;//難易度6以上なら2桁に。容赦はない。
            if (SmallNum % 10 == 0 && digits >= 100) SmallNum += Math.floor(Math.random() * 9) + 1;
            return [`${YaYaBigNum} × ${SmallNum}`, YaYaBigNum * SmallNum];
        } else {
            var YaYaSmallNum = Math.floor(Math.random() * 7 * digits) + 2 * digits;//1→2~9、2→20~90、3→200~900
            if (digits == 100 && sub_digits == 0) YaYaSmallNum = Math.floor(Math.random() * 70) + 20;
            if (YaYaSmallNum % 10 == 0) YaYaSmallNum += Math.floor(Math.random() * 9) + 1;
            var SmallNum = Math.floor(Math.random() * 8) + 2;
            SmallNum += Math.floor(Math.random() * digits / 10);
            if (digits >= 100 && sub_digits == 1) SmallNum += Math.floor(Math.random() * digits * 9 / 10) + digits / 10;
            if (SmallNum % 10 == 0 && digits >= 10) SmallNum += Math.floor(Math.random() * 9) + 1;
            if (Math.random() < 0.5 && digits <= 10) {
                return [`${YaYaSmallNum * SmallNum} ÷ ${YaYaSmallNum}`, SmallNum];
            } else {
                return [`${YaYaSmallNum * SmallNum} ÷ ${SmallNum}`, YaYaSmallNum];
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

    function intToRoman(num) {
        if (num < 1 || num > 1000) return "Invalid number";

        const lookup = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        };
        let roman = '';
        for (let i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }

    function numberToWords(num) {
        if (num === 0) return "zero";
        if (num < 0 || num > 1000) return "Invalid number";

        const belowTwenty = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
            "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

        if (num < 20) {
            return belowTwenty[num];
        }

        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" + belowTwenty[num % 10] : "");
        }

        if (num < 1000) {
            return belowTwenty[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " and " + numberToWords(num % 100) : "");
        }

        return "one thousand";
    }


    function convertToKanji(num) {
        if (num < 1 || num > 1000 || !Number.isInteger(num)) {
            return '無効な数値';
        }

        const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千'];

        if (num === 1000) {
            return '千';
        }

        let kanji = '';
        const numStr = num.toString();

        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[i];
            const unitIndex = numStr.length - i - 1;

            if (digit !== '0') {
                if (digit === '1' && unitIndex > 0) {
                    kanji += units[unitIndex];
                } else {
                    kanji += digits[digit] + units[unitIndex];
                }
            }
        }

        return kanji;
    }

    function convertToDaiji(num) {
        if (num < 1 || num > 1000 || !Number.isInteger(num)) {
            return '無効な数値';
        }

        const digits = ['零', '壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖'];
        const units = ['', '拾', '陌', '阡'];

        if (num === 1000) {
            return '阡';
        }

        let kanji = '';
        const numStr = num.toString();

        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[i];
            const unitIndex = numStr.length - i - 1;

            if (digit !== '0') {
                if (digit === '1' && unitIndex > 0) {
                    kanji += units[unitIndex];
                } else {
                    kanji += digits[digit] + units[unitIndex];
                }
            }
        }

        return kanji;
    }

    function numberToGerman(num) {
        if (num < 0 || num > 1000) {
            return "Invalid number";
        }

        if (num === 0) return "null";
        if (num === 1000) return "tausend";

        if (num === 1) return "eins";
        const basicNumbers = {
            1: "ein", 2: "zwei", 3: "drei", 4: "vier",
            5: "fünf", 6: "sechs", 7: "sieben", 8: "acht", 9: "neun",
            10: "zehn", 11: "elf", 12: "zwölf", 13: "dreizehn",
            14: "vierzehn", 15: "fünfzehn", 16: "sechzehn",
            17: "siebzehn", 18: "achtzehn", 19: "neunzehn",
            20: "zwanzig"
        };

        if (num <= 20) {
            return basicNumbers[num];
        } else if (num < 100) {
            const tens = Math.floor(num / 10);
            const ones = num % 10;
            if (ones > 0) {
                return basicNumbers[ones] + "und" + basicNumbers[tens] + (tens === 3 ? "ßig" : "zig");
            } else {
                return basicNumbers[tens] + (tens === 3 ? "ßig" : "zig");
            }
        } else {
            const hundreds = Math.floor(num / 100);
            const remainder = num % 100;
            return basicNumbers[hundreds] + "hundert" + (remainder > 0 ? numberToGerman(remainder) : "");
        }
    }

    function numberToSpanish(num) {
        if (num < 0 || num > 1000) {
            return "Invalid number";
        }

        if (num === 0) return "cero";
        if (num === 1000) return "mil";


        const belowTwenty = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
            "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
        const tens = ["", "", "veinti", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
        const hundred = ["", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
        const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

        if (num < 20) {
            return belowTwenty[num];
        }

        if (num === 20) return "veinte";

        if (num < 30) {
            return tens[Math.floor(num / 10)] + belowTwenty[num % 10];
        }

        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " y " : "") + belowTwenty[num % 10];
        }

        if (num < 1000) {
            return (num % 100 !== 0 ? hundreds[Math.floor(num / 100)] : hundred[Math.floor(num / 100)]) + (num % 100 !== 0 ? " " + numberToSpanish(num % 100) : "");
        }
    }

    function numberToFrench(num) {
        if (num < 0 || num > 1000) {
            return "Invalid number";
        }

        if (num === 0) return "cero";
        if (num === 1000) return "mille";


        const belowTwenty = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
            "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
        const tens_undersixty = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante"];

        if (num < 20) {
            return belowTwenty[num];
        }

        if (num < 70 && num % 10 === 0) {
            return tens_undersixty[Math.floor(num / 10)];
        }

        if (num < 70) {
            return tens_undersixty[Math.floor(num / 10)] + (num % 10 === 1 ? "-et-" : "-") + belowTwenty[num % 10];
        }

        if (num < 80) {
            return tens_undersixty[Math.floor(num / 10)] + (num % 10 === 1 ? "-et-" : "-") + belowTwenty[num % 60];
        }

        if (num === 80) return "quatre-vingts";

        if (num < 100) {
            return "quatre-vingt-" + belowTwenty[num % 80];
        }

        if (num === 100) return "cent";

        if (num % 100 === 0) return belowTwenty[Math.floor(num / 100)] + "-cents";

        if (num < 1000) {
            return belowTwenty[Math.floor(num / 100)] + "-cent-" + numberToFrench(num % 100);
        }
    }

    function convertToHiragana(num) {
        if (num < 1 || num > 1000 || !Number.isInteger(num)) {
            return '無効な数値';
        }

        const digits = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
        const units = ['', 'じゅう', 'ひゃく', 'せん'];

        if (num === 1000) {
            return 'せん';
        }

        let kanji = '';
        const numStr = num.toString();

        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[i];
            const unitIndex = numStr.length - i - 1;

            if (digit !== '0') {
                if (unitIndex === 2) {
                    if (digit === '1') {
                        kanji += 'ひゃく';
                    } else if (digit === '3') {
                        kanji += 'さんびゃく';
                    } else if (digit === '6') {
                        kanji += 'ろっぴゃく';
                    } else if (digit === '8') {
                        kanji += 'はっぴゃく';
                    } else {
                        kanji += digits[digit] + units[unitIndex];
                    }
                } else {
                    if (digit === '1' && unitIndex > 0) {
                        kanji += units[unitIndex];
                    } else {
                        kanji += digits[digit] + units[unitIndex];
                    }
                }
            }
        }

        return kanji;
    }

    function convertToKorean(num) {
        if (num < 1 || num > 1000 || !Number.isInteger(num)) {
            return '잘못된 숫자';
        }

        const digits = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
        const units = ['', '십', '백', '천'];

        if (num === 1000) {
            return '천';
        }

        let koreanNum = '';
        const numStr = num.toString();

        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[i];
            const unitIndex = numStr.length - i - 1;

            if (digit !== '0') {
                if (digit === '1' && unitIndex > 0) {
                    koreanNum += units[unitIndex];
                } else {
                    koreanNum += digits[digit] + units[unitIndex];
                }
            }
        }

        return koreanNum;
    }

    function numberToRussian(num) {
        if (num < 1 || num > 1000 || !Number.isInteger(num)) {
            return 'Неверное число';
        }

        if (num === 1000) {
            return 'тысяча';
        }

        const digits = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
        const tens = ['', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
        const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
        const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

        let russianNum = '';
        const hundred = Math.floor(num / 100);
        const ten = Math.floor((num % 100) / 10);
        const unit = num % 10;

        if (hundred > 0) {
            russianNum += hundreds[hundred] + ' ';
        }

        if (ten > 1) {
            russianNum += tens[ten] + ' ';
            if (unit > 0) {
                russianNum += digits[unit];
            }
        } else if (ten === 1) {
            russianNum += teens[unit];
        } else if (unit > 0) {
            russianNum += digits[unit];
        }

        return russianNum.trim();
    }

    function numberToGreekNumbers(num) {
        if (num === 0) return "μηδέν";
        if (num === 1000) return "χίλια";
        const units = ["", "ένα", "δύο", "τρία", "τέσσερα", "πέντε", "έξι", "επτά", "οκτώ", "εννέα"];
        const tens = ["", "δέκα", "είκοσι", "τριάντα", "σαράντα", "πενήντα", "εξήντα", "εβδομήντα", "ογδόντα", "ενενήντα"];
        const hundreds = ["", "εκατό", "διακόσια", "τριακόσια", "τετρακόσια", "πεντακόσια", "εξακόσια", "επτακόσια", "οκτακόσια", "εννιακόσια"];

        let result = "";
        const hundredth = Math.floor(num / 100);
        if (hundredth > 0) {
            result += hundreds[hundredth] + " ";
            num %= 100;
        }

        const tenth = Math.floor(num / 10);
        if (tenth > 0) {
            result += tens[tenth] + " ";
            num %= 10;
        }

        if (num > 0) {
            result += units[num];
        }

        return result;
    }


    function numberToGreekGlyph(num) {
        if (num === 1000) return ",α'";
        const greekUnits = [
            "α", "β", "γ", "δ", "ε", "ϛ", "ζ", "η", "θ", "ι",
        ];
        const greekTens = [
            "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ϟ", "ρ",
        ];
        const greekHundreds = [
            "ρ", "σ", "τ'", "υ", "φ", "χ", "ψ", "ω", "ϡ", "ϡ",
        ];
        let greekNum = "";

        // Hundreds
        const hundredsDigit = Math.floor(num / 100);
        if (hundredsDigit > 0) {
            greekNum += greekHundreds[hundredsDigit - 1];
        }

        // Tens
        const tensDigit = Math.floor((num % 100) / 10);
        if (tensDigit > 0) {
            greekNum += greekTens[tensDigit - 1];
        }

        // Units
        const unitsDigit = num % 10;
        if (unitsDigit > 0) {
            greekNum += greekUnits[unitsDigit - 1];
        }

        return greekNum + "'";
    }



    function extreme(num,level,isFirst) {
        var rand = Math.floor(Math.random() * 60) + 1;//1~60
        if (isFirst) {
            rand = Math.floor(Math.random() * 30) + 31;//31~60
        }
        if (level == 1) {//そのまま、ひらがな、漢字
            if (rand <= 10) {
                return num;
            } else if (rand <= 40) {
                return convertToHiragana(num);
            } else if (rand <= 60) {
                return convertToKanji(num);
            }
        } else if (level == 2) {//ひらがな、漢字、英語、大字
            if (rand <= 15) {
                return convertToHiragana(num);
            } else if (rand <= 30) {
                return convertToKanji(num);
            } else if (rand <= 45) {
                return numberToWords(num);
            } else if (rand <= 60) {
                return convertToDaiji(num);
            }
        } else if (level == 3) {//英語、大字、ローマ数字
            if (rand <= 20) {
                return numberToWords(num);
            } else if (rand <= 40) {
                return convertToDaiji(num);
            } else if (rand <= 60) {
                return intToRoman(num);
            }
        } else if (level == 4) {//ローマ数字、ドイツ語、スペイン語、フランス語
            if (rand <= 15) {
                return intToRoman(num);
            } else if (rand <= 30) {
                return numberToGerman(num);
            } else if (rand <= 45) {
                return numberToSpanish(num);
            } else if (rand <= 60) {
                return numberToFrench(num);
            } 
        } else if (level == 5) {//ドイツ語、スペイン語、フランス語、韓国語、ロシア語
            if (rand <= 12) {
                return numberToGerman(num);
            } else if (rand <= 24) {
                return numberToSpanish(num);
            } else if (rand <= 36) {
                return numberToFrench(num);
            } else if (rand <= 48) {
                return convertToKorean(num);
            } else if (rand <= 60) {
                return numberToRussian(num);
            }
        } else if (level == 6) {//韓国語、ロシア語、ギリシャ語、ギリシャ文字
            if (rand <= 15) {
                return convertToKorean(num);
            } else if (rand <= 30) {
                return numberToRussian(num);
            } else if (rand <= 45) {
                return numberToGreekNumbers(num);
            } else if (rand <= 60) {
                return numberToGreekGlyph(num);
            }
        }
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
                if (i == 0 && sub_digits == 1) {
                    //難易度が偶数かつ最初の数字の場合、一桁上の数字が抽選される。
                    randomValue = Math.floor(Math.random() * 9 * digits) + digits;
                } else if (i != 0 && digits == 100 && sub_digits == 0) {
                    //難易度5かつ最初の数字でない場合、10~99が抽選される。
                    randomValue = Math.floor(Math.random() * 90) + 10;
                }else{
                    randomValue = Math.floor(Math.random() * 9 * digits) + digits;
                }
                if ($gameVariables.value(1265) >= 1) {
                    if (Math.random() < 0.5 && randomValue >= 10) {
                        randomValue = Math.floor(randomValue / 10) * 10;
                    } else if (Math.random() < 0.5 && randomValue >= 100) {
                        randomValue = Math.floor(randomValue / 100) * 100;
                    }
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
