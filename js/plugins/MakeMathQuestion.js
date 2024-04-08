//=============================================================================
// MakeMathQuestion
//=============================================================================
// 作者: chuukunn
// バージョン: 1.0.0
//=============================================================================
/*:
 * @plugindesc 数字アタック用のスクリプトです。
 *
 * @param question
 * @desc もんだいをいれるばしょ
 * @default 8
 *
 * @param answer
 * @desc こたえをいれるばしょ
 * @default 9
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
            Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 100 * $gameVariables.value(380) + 10000 * $gameVariables.value(774));
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
            }
            if ($gameVariables.value(1265) >= 1) {
                $gameVariables.setValue(mondai_index, transformTextWithNumbers($gameVariables.value(mondai_index)));
            }
        } else if (command === 'MakeMathQuestion_Original') {
            const difficulty = parseInt(args[0]);
            if (difficulty >= 0 && difficulty <= 1) {
                Ingenuity_Easy();
                //console.log(`特殊問題:${$gameVariables.value(mondai_index)} ＝ ${$gameVariables.value(kotae_index)}`);
            } else if (difficulty >= 2 && difficulty <= 5) {
                Ingenuity(difficulty);
                //console.log(`特殊問題:${$gameVariables.value(mondai_index)} ＝ ${$gameVariables.value(kotae_index)}`);
            } else if (difficulty >= 6) {
                Ingenuity_Hard(difficulty);
                //console.log(`特殊問題:${$gameVariables.value(mondai_index)} ＝ ${$gameVariables.value(kotae_index)}`);
            }
        } else if (command === 'MakeMathQuestion_Abacus') {
            Abacus(parseInt(args[0]));
        }
    };

    
    function generateBigNum(digits, sub_digits) {
      let max = Math.min(digits * 10 - 1,999);
      let min = Math.min(digits ,100);
      if (digits === 1 && sub_digits === 1) {
        max = 19;
        min = 10;
      } else if (digits === 10 && sub_digits === 1) {
        max = 199;
        min = 100;
      } else if (digits === 100 && sub_digits === 0) {
        max = 49;
        min = 10;
      }
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num % 10 == 0 ? num + Math.floor(Math.random() * 9) + 1 : num;
    }

    function generateSmallNum(digits,sub_digits) {
      let max = digits < 100 ? 9 : digits - 1;
      let min = digits < 100 ? 2 : digits / 10;
      if (digits === 100 && sub_digits === 0) {
        max = 29;
        min = 10;
      }
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num % 10 == 0 ? num + Math.floor(Math.random() * 9) + 1 : num;
    }


    function GenerateMD(digits, sub_digits) {
        const BigNum = generateBigNum(digits, sub_digits);
        const SmallNum = generateSmallNum(digits,sub_digits);
        if (Math.random() < 0.5) {
            return [`${BigNum} × ${SmallNum}`, BigNum * SmallNum];
        } else {
            if (Math.random() < 0.2) {
                return [`${BigNum * SmallNum} ÷ ${BigNum}`, SmallNum];
            } else {
                return [`${BigNum * SmallNum} ÷ ${SmallNum}`, BigNum];
            }
        }
    }

    function generateMathQuestion_PM(level, num_of_pm, num_of_md) {
        var digits = parseInt(Math.pow(10, Math.floor((level - 1) / 2)));//1~2なら1、3~4なら10、5~6なら100。
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
                randomValue = Math.floor(Math.random() * 9 * digits) + digits;
                if (i == 0 && sub_digits == 1) {
                    //難易度が偶数かつ最初の数字の場合、ちょっと大きくする。
                    randomValue += digits * 10;
                }
                if ($gameVariables.value(1265) >= 1) {
                    if (Math.random() < 0.25 && randomValue >= 10) {
                        randomValue = Math.floor(randomValue / 10) * 10;
                    } else if (Math.random() < 0.25 && randomValue >= 100) {
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

    function getRandomDigits(digits) {
        return Math.floor(Math.random() * Math.pow(10, digits - 1) * 9) + Math.pow(10, digits - 1);
    }


    function getRandomPrime(difficulty) {
        let min = 1;
        let max = 100;
        if (difficulty == 2) {
            min = 10;
            max = 40;
        } else if (difficulty == 3) {
            min = 20;
            max = 70;
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
            max = 8;
        } else if (digits === 100) {
            min = 11;
            max = 20;
        } else {
            return "Unsupported digits value";
        }

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function addFractions(numerator1, denominator1, numerator2, denominator2) {
        // 最大公約数を求める関数
        function gcd(a, b) {
            if (b === 0) {
                return a;
            }
            return gcd(b, a % b);
        }

        // 最小公倍数を求める関数
        function lcm(a, b) {
            return (a * b) / gcd(a, b);
        }

        // 分母の最小公倍数を求める
        const lcmDenominator = lcm(denominator1, denominator2);

        // 分子を最小公倍数に合わせて調整する
        const adjustedNumerator1 = numerator1 * (lcmDenominator / denominator1);
        const adjustedNumerator2 = numerator2 * (lcmDenominator / denominator2);

        // 足し算を行う
        const sumNumerator = adjustedNumerator1 + adjustedNumerator2;

        // 既約分数にするために最大公約数で割る
        const gcdSum = gcd(sumNumerator, lcmDenominator);
        const reducedNumerator = sumNumerator / gcdSum;
        const reducedDenominator = lcmDenominator / gcdSum;

        // 答えをオブジェクトとして返す
        return {
            numerator: reducedNumerator,
            denominator: reducedDenominator,
        };
    }
    function Ingenuity_Easy() {
        Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 100 * $gameVariables.value(380) + 10000 * $gameVariables.value(774));
        const num = Math.floor(Math.random() * 7) + 2;//2~9
        const mini = Math.floor(Math.random() * 3) + 1;//1~3
        const rand = Math.floor(Math.random() * 60) + 1;
        const randomValue = Math.floor(Math.random() * 9000) + 1000;
        if (rand <= 10) {
            quest = `${num} ＋ ${num} ＋ ${num} ＋ ${num} ＋ ${num}`;
            answer = num * 5;
        }else if (rand <= 20){
            quest = `${num + mini} － ${num} ＋ ${num + mini * 3} － ${num + mini * 2} ＋ ${num + mini * 5} － ${num + mini * 4}`;
            answer = 3 * mini;
        }else if (rand <= 30){
            quest = `${randomValue} × 0 ＋ ${num} ＋ ${mini}`;
            answer = num + mini;
        }else if (rand <= 40){
            quest = `${num} － ${randomValue} ÷ ${randomValue}`;
            answer = num - 1;
        }else if (rand <= 50){
            quest = `${randomValue} ＋ ${num} － ${randomValue}`;
            answer = num;
        }else if (rand <= 60){
            quest = `${num + 1} ＋ ${num + 2} ＋ ${num + 3} ＋ ${num + 4} ＋ ${num + 5}`;
            answer = num * 5 + 15;
        }

        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);
    }
    function Ingenuity(difficulty) {
        Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 100 * $gameVariables.value(380) + 10000 * $gameVariables.value(774));
        //console.log(`${$gameVariables.value(1177) + $gameVariables.value(7) + 10 * $gameVariables.value(380) + 100 * $gameVariables.value(774) }`);
        //difficultyが2~3なら2桁、4~5なら3桁、1か6以上なら無し
        //3か5なら+
        var digits = parseInt(Math.pow(10, Math.floor(difficulty / 2)));
        var sub_digit = difficulty % 2;

        const exclude_high_level = false;
        var randomValue = Math.floor(Math.random() * 3 * digits) + digits;//10→10~30、100→100~300
        if (randomValue % 10 == 0) {
            randomValue += Math.floor(Math.random() * 5) + 1;
        }
        const randomValue_one = getRandomNumber(digits);//10→2~4、100→11~20
        const randomValue_two = getRandomNumber(digits);//10→2~4、100→11~20
        const randomBigValue_one = getRandomPrime(difficulty + 2);
        const randomBigValue_two = getRandomPrime(difficulty + 2);
        const randomBigValue_three = getRandomPrime(difficulty + 2);
        const randomBigValue_four = getRandomPrime(difficulty + 2);

        const randomonedigitsValue = Math.floor(Math.random() * 7) + 2;//2~9
        const randomminidigitsValue = Math.floor(Math.random() * 4) + 2;//2~5
        
        const RandomValueNear10n = digits * (Math.floor(Math.random() * 8) + 1) + Math.floor(Math.random() * difficulty) + 1;

        var randomPrimeValue = getRandomPrime(difficulty);
        var random10n_minus_randomPrimeValue = digits * (11 + Math.floor(Math.random() * 8)) - randomPrimeValue;

        const just_num = [[5, 4], [5, 8], [25, 2], [25, 4], [125, 4], [125, 8], [75, 4], [75, 8], [45, 4], [45, 8]];
        const divide_parts = [[2, "0.5"], [4,"0.25"], [5, "0.2"], [10, "0.1"], [8, "0.125"], [20, "0.05"], [50, "0.02"]];
        const divide_ones = [[111,3,37],[121,11,11],[1111,101,11],[1331,11,121],[14641,121,121],[14641,11,1331], [111111,11,10101], [111111,111,1001]];

        const just_num_index = Math.min(Math.max(0, Math.floor(Math.random() * 4) + 2 * (difficulty - 2)), divide_parts.length - 1);

        const divide_parts_index = Math.floor(Math.random() * 7);

        const divide_ones_index = Math.min(Math.max(0, Math.floor(Math.random() * 2) + 2 * (difficulty - 2)), divide_parts.length - 1);

        const rand = Math.floor(Math.random() * 100) + 1;
        const sign = parseInt(rand % 2);

        var quest = "";
        var answer = 0;

        const a = Math.floor(Math.random() * 3 * digits / 10) + digits / 5;
        const b = Math.floor(Math.random() * 3 * digits / 10) + digits / 5;
        const c = Math.floor(Math.random() * 3 * digits / 10) + digits / 5;
        const numbers = [2, 3, 4, 5, 6, 7, 8, 9];
        var d = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];
        var e = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];
        var f = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];
        var g = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];

        if (rand <= 10 && !exclude_high_level) {//分数の掛け算、割り算、分数と小数
            if (difficulty == 5){
                const den = just_num[Math.floor(Math.random() * 4)][Math.max(5 - difficulty,0)];
                if(den * d - e * randomValue_one - 1 >= 1 && Math.random() < 0.7){
                    quest = `㌫${den * d - e * randomValue_one - 1}/${den}㌫ ＋ ${removeTrailingZeros((e * randomValue_one + 1) / den)}`;
                    answer = d;
                } else {
                    quest = `㌫${den * d + (e * randomValue_one + 1)}/${den}㌫ － ${removeTrailingZeros((e * randomValue_one + 1) / den)}`;
                    answer = d;
                }
            } else if (difficulty == 4) {
                if (Math.random() < 0.7) {
                    quest = `㌫${b * d}/${g}㌫ × ㌫${c * e}/${b}㌫ × ㌫${g * f}/${c}㌫`;
                } else {
                    quest = `㌫${b * d}/${g}㌫ × ㌫${c * e}/${b}㌫ ÷ ㌫${c}/${g * f}㌫`;
                }
                answer = d * e * f;
            } else if(difficulty == 3){
                quest = `㌫${f * d}/${g}㌫ ÷ ㌫${f}/${g * e}㌫`;
                answer = d * e;
            } else {
                quest = `㌫${f * d}/${g}㌫ × ㌫${g * e}/${f}㌫`;
                answer = d * e;
            }
        } else if (rand <= 20 && !exclude_high_level) {//分数の足し算、引き算、通分
            if (difficulty == 5){
                if (e * a - f >= 1 && Math.random() < 0.7) {
                    quest = `㌫${e * a - f}/${a}㌫ ＋ ㌫${f * g}/${a * g}㌫`;
                    answer = e;
                } else {
                    quest = `㌫${e * a + f}/${a}㌫ － ㌫${f * g}/${a * g}㌫`;
                    answer = e;
                }
            }else if (difficulty == 4) {
                const { numerator, denominator } = addFractions(d, e, f, g);
                quest = denominator == 1 ? quest = `㌫${d}/${e}㌫ ＋ ㌫${f}/${g}㌫` : `㌫${d}/${e}㌫ ＋ ㌫${f}/${g}㌫ ＝ ㌫■/${denominator}㌫`;
                answer = numerator;
            }else if (difficulty == 3) {
                if ((e * a - f - b) >= 1 && Math.random() < 0.7) {
                    quest = `㌫${e * a - f - b}/${a}㌫ ＋ ㌫${f}/${a}㌫ ＋ ㌫${b}/${a}㌫`;
                    answer = e;
                } else {
                    quest = `㌫${e * a + f + b}/${a}㌫ － ㌫${f}/${a}㌫ － ㌫${b}/${a}㌫`;
                    answer = e;
                }
            } else {
                if ((e * a - f) >= 1 && Math.random() < 0.7) {
                    quest = `㌫${e * a - f}/${a}㌫ ＋ ㌫${f}/${a}㌫`;
                    answer = e;
                } else {
                    quest = `㌫${e * a + f}/${a}㌫ － ㌫${f}/${a}㌫`;
                    answer = e;
                }
            }
        } else if (rand <= 30 && !exclude_high_level) {//0、小数の混ざる掛け算
            if (sub_digit == 1) {
                quest = `${RandomValueNear10n * 10} × ${insertDecimalPoint(randomValue_one)}`;
                answer = RandomValueNear10n * randomValue_one;
            } else {
                if (randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign] % 100 == 0){
                    quest = `${insertDecimalPoint(randomValue_one * just_num[just_num_index][sign])} × ${insertDecimalPoint(just_num[just_num_index][1 - sign])}`;
                    answer = Math.round(randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign] / 100);
                }else if(randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign] % 10 == 0){
                    quest = `${insertDecimalPoint(just_num[just_num_index][sign])} × ${randomValue_one * just_num[just_num_index][1 - sign]}`;
                    answer = Math.round(randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign] / 10);
                }else{
                    quest = `${just_num[just_num_index][sign]} × ${randomValue_one * just_num[just_num_index][1 - sign]}`;
                    answer = randomValue_one * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
                }
            }
        } else if (rand <= 40) {//交換法則、結合法則(掛け算、割り算)
            if (sub_digit == 1) {
                if (Math.random() < 0.3 && !exclude_high_level) {
                    quest = `${just_num[just_num_index][sign] * randomonedigitsValue} × ㌫${randomonedigitsValue * just_num[just_num_index][1 - sign]}/${randomonedigitsValue}㌫`;
                    answer = randomonedigitsValue * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
                } else if(randomonedigitsValue % 2 == 0){
                    quest = `${just_num[just_num_index][sign] * randomonedigitsValue} × ${randomonedigitsValue * just_num[just_num_index][1 - sign]} ÷ ${randomonedigitsValue}`;
                    answer = randomonedigitsValue * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
                }else{
                    quest = `${just_num[just_num_index][sign] * randomonedigitsValue} × ${randomonedigitsValue * just_num[just_num_index][1 - sign]} ÷ ${randomonedigitsValue}`;
                    answer = randomonedigitsValue * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
                }
            } else {
                if (Math.random() < 0.7) {
                    quest = `${just_num[just_num_index][sign]} × ${randomPrimeValue} × ${just_num[just_num_index][1 - sign]}`;
                }else{
                    quest = `${randomPrimeValue} × ${just_num[just_num_index][sign]} × ${just_num[just_num_index][1 - sign]}`;
                }
                answer = randomPrimeValue * just_num[just_num_index][sign] * just_num[just_num_index][1 - sign];
            }
        } else if (rand <= 50) {//分配法則(基礎)
            if (difficulty == 5) {
                quest = `${d * randomminidigitsValue} ÷ ${randomminidigitsValue} ＋ ${(f - 1) * d * randomminidigitsValue} × ${randomminidigitsValue} ÷ ${randomminidigitsValue * randomminidigitsValue}`;
                answer = f * d;
            } else if (difficulty == 4) {
                quest = `${random10n_minus_randomPrimeValue} × ${randomonedigitsValue} ＋ ${randomonedigitsValue} × ${randomPrimeValue + randomminidigitsValue * 10}`;
                answer = randomonedigitsValue * (random10n_minus_randomPrimeValue + randomminidigitsValue * 10 + randomPrimeValue);
            } else if (difficulty == 3) {
                quest = `${randomonedigitsValue} × ${RandomValueNear10n * 11} － ${RandomValueNear10n} × ${randomonedigitsValue} `;
                answer = randomonedigitsValue * RandomValueNear10n * 10;
            } else {
                quest = `${randomonedigitsValue} × ${random10n_minus_randomPrimeValue} ＋ ${randomPrimeValue} × ${randomonedigitsValue} `;
                answer = randomonedigitsValue * (random10n_minus_randomPrimeValue + randomPrimeValue);
            }
        } else if (rand <= 60) {//分配法則(応用)
            if (difficulty == 5) {
                quest = `${RandomValueNear10n} × ${digits + randomonedigitsValue}`;
                answer = RandomValueNear10n * (digits + randomonedigitsValue);
            } else if (difficulty == 4) {
                quest = `${digits * randomminidigitsValue + randomonedigitsValue} × ${randomValue_two} － ${randomonedigitsValue * randomValue_two}`;
                answer = digits * randomminidigitsValue * randomValue_two;
            } else if (difficulty == 3) {
                quest = `${100 - d} ＋ ${100 - e} ＋ ${100 - f} ＋ ${randomValue}`;
                answer = 300 - d - e - f + randomValue;
            } else {
                quest = `${digits * d + randomminidigitsValue} × ${e} － ${randomminidigitsValue * e}`;
                answer = digits * d * e;

            }
        } else if (rand <= 70) {//交換法則、結合法則(足し算、引き算)
            if (sub_digit == 1) {
                if (Math.random() < 0.5) d = -1 * d;
                if (Math.random() < 0.5) f = -1 * f;
                if (Math.random() < 0.5) g = -1 * g;
                quest = `${digits * e - d} ＋ ${digits * e - g} ＋ ${digits * e + d} ＋ ${digits * e - f} ＋ ${digits * e + g}`;
                answer = digits * e * 5 - f;
            } else {
                if(randomBigValue_three > randomBigValue_four){
                    quest = `${randomBigValue_one + digits} － ${randomBigValue_four + digits} ＋ ${randomBigValue_three} － ${randomBigValue_one}`;
                    answer = randomBigValue_three - randomBigValue_four;
                }else{
                    quest = `${randomBigValue_one + digits * 2} － ${randomBigValue_three + digits} ＋ ${randomBigValue_four} － ${randomBigValue_one}`;
                    answer = randomBigValue_four + digits - randomBigValue_three;
                }
            }
        } else if (rand <= 75 && !exclude_high_level) {//様々な計算
            if (difficulty == 5) {
                quest = `${d}${e}${f}${g} ＋ ${e}${f}${g}${d} ＋ ${f}${g}${d}${e} ＋ ${g}${d}${e}${f}`;
                answer = 1111 * (d + e + f + g);
            } else if(difficulty == 4){
                quest = `${randomValue_one * 100} × ${randomValue_two * 100}`;
                answer = randomValue_one * randomValue_two * 10000;
            } else {
                quest = `㌫1/■㌫ ＝ ${divide_parts[divide_parts_index][1]}`;
                answer = divide_parts[divide_parts_index][0];
            }
        }else if (rand <= 80) {//暗算したい掛け算割り算
            if (rand <= 76) {
                quest = `${divide_ones[divide_ones_index][1]} × ${divide_ones[divide_ones_index][2]}`;
                answer = `${divide_ones[divide_ones_index][0]}`;
            } else if (rand <= 77){
                quest = `${divide_ones[divide_ones_index][0]} ÷ ${divide_ones[divide_ones_index][1]}`;
                answer = `${divide_ones[divide_ones_index][2]}`;
            } else if (rand <= 78) {
                quest = `${divide_ones[divide_ones_index][2]} × ${divide_ones[divide_ones_index][1]}`;
                answer = `${divide_ones[divide_ones_index][0]}`;
            } else {
                quest = `${divide_ones[divide_ones_index][0]} ÷ ${divide_ones[divide_ones_index][2]}`;
                answer = `${divide_ones[divide_ones_index][1]}`;
            }
        } else if(rand <= 90){//穴埋め計算
            if (difficulty == 5) {
                quest = `${randomValue * randomonedigitsValue} ÷ ■ ＝ ${randomValue} ÷ ${randomValue_one}`;
                answer = randomValue_one * randomonedigitsValue;
            } else if (difficulty == 4) {
                quest = `${randomValue_one * randomonedigitsValue} × ■ ＝ ${randomPrimeValue * randomonedigitsValue} × ${randomValue_one}`;
                answer = randomPrimeValue;
            } else if (difficulty == 3) {
                quest = `${randomValue_one * randomonedigitsValue} × ■ ＝ ${randomPrimeValue * randomonedigitsValue} × ${randomValue_one}`;
                answer = randomPrimeValue;
            } else if(a % b != 0){
                quest = `㌫${a * d}/${b * d}㌫ ＝ ㌫■/${b}㌫`;
                answer = a;
            } else {
                quest = `㌫${c * d}/${b * d}㌫ ＝ ㌫■/${b}㌫`;
                answer = c;
            }
        } else if(rand <= 100){//括弧を含む計算
            if (sub_digit == 1) {
                if (Math.random() < 0.5){
                    quest = `(${just_num[just_num_index][0] * f} ＋ ${radomPrimeValue}) × ${just_num[just_num_index][1]}`;
                    answer = just_num[just_num_index][0] * just_num[just_num_index][1] * f + radomPrimeValue * ${just_num[just_num_index][1]}; 
                }else {
                    quest = `(${just_num[just_num_index][0] * just_num[just_num_index][1]} ＋ ${d * just_num[just_num_index][sign]}) ÷ ${just_num[just_num_index][sign]}`;
                    answer = just_num[just_num_index][1 - sign] + d; 
                }
            } else {
                if(a > b){
                    quest = `(${d * a + 1} － ${d * b + 1}) ÷ ${d}`;
                    answer = a - b;
                } else {
                    quest = `(${d * a + 1} ＋ ${d * b - 1}) ÷ ${d}`;
                    answer = a + b;
                }
            }
        }

        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);
    }

    function removeTrailingZeros(num) {
      const str = num.toFixed(5);
      let i = str.length - 1;
      while (str[i] === "0") {
        i--;
      }
      if (str[i] === ".") {
        return str.slice(0, i);
      }
      return str.slice(0, i + 1);
    }

    function insertDecimalPoint(number) {
      const numberString = number.toString();
      const stringLength = numberString.length;

      // 一桁の整数の場合、頭に "0" を挿入する
      if (stringLength === 1) {
          return '0.' + numberString;
      }

      const secondLastIndex = stringLength - 1;
      if(numberString.slice(secondLastIndex) == "0"){
          return numberString.slice(0, secondLastIndex);
      }
      return numberString.slice(0, secondLastIndex) + '.' + numberString.slice(secondLastIndex);
    }


    function shuffleArray(array) {
        // Fisher-Yatesアルゴリズムを使って配列をランダムに並べ替える
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function Ingenuity_Hard(level) {
        var rand = Math.floor(Math.random() * 60) + 1 + 60 * (parseInt(level) - 6);
        var quest = "";
        var answer = 0;
        if (rand <= 10) {
            const randomPrimeValue = getRandomPrime(3);
            const myArray = [2, 8];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0]} × ${shuffledArray[1] * randomPrimeValue} × 625`;
            answer = 10000 * randomPrimeValue;
        } else if (rand <= 20) {
            const randomPrimeBigValue = getRandomPrime(6) * (Math.floor(Math.random() * 20) + 10);
            const randomPrimeValue = getRandomPrime(3);
            const randomonedigitsValue = Math.floor(Math.random() * 3);
            const quotient = Math.floor(randomPrimeBigValue / randomPrimeValue);
            const surplus = randomPrimeBigValue % randomPrimeValue;
            quest = `${randomPrimeBigValue} ÷ ${randomPrimeValue} ＝ ${quotient - randomonedigitsValue} ＋ ■ ÷ ${randomPrimeValue}`;
            answer = surplus + randomonedigitsValue * randomPrimeValue;
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
            const randomPrimeValue = getRandomPrime(5);
            const myArray = ["0.375", "0.625", "0.875"];
            const myArray_ToMulti = [3, 5, 7];
            const choice = Math.floor(Math.random() * 3);
            quest = `${randomPrimeValue * 8} × ${myArray[choice]}`;
            answer = randomPrimeValue * myArray_ToMulti[choice];
        } else if (rand <= 60) {
            const randomPrimeValue = getRandomPrime(3);
            quest = `${1000 + randomPrimeValue} × ${1000 - randomPrimeValue}`;
            answer = 1000000 - randomPrimeValue * randomPrimeValue;
        } else if (rand <= 70) {
            const randomThreePower = Math.pow(3, Math.floor(Math.random() * 4) + 3);
            quest = `59049 ÷ ${randomThreePower}`;
            answer = parseInt(59049 / randomThreePower);
        } else if (rand <= 80) {
            const randomPrimeValue_one = getRandomPrime(3);
            const randomPrimeValue_two = getRandomPrime(3);
            const randomPrimeValue_three = getRandomPrime(3);
            const randomPrimeValue_four = getRandomPrime(4);
            quest = `${10000 - randomPrimeValue_one} ＋ ${10000 - randomPrimeValue_two} ＋ ${10000 - randomPrimeValue_three} ＋ ${10000 - randomPrimeValue_four}`;
            answer = 40000 - randomPrimeValue_one - randomPrimeValue_two - randomPrimeValue_three - randomPrimeValue_four;
        } else if (rand <= 90) {
            const randomPrimeValue = getRandomPrime(6);
            const myArray = [7, 11, 13];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0] * randomPrimeValue} × ${shuffledArray[1]} × ${shuffledArray[2]}`;
            answer = 1001 * randomPrimeValue;
        } else if (rand <= 100) {
            const randomPrimeValue = getRandomPrime(6);
            const myArray = [73, 137, randomPrimeValue];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0]} × ${shuffledArray[1]} × ${shuffledArray[2]}`;
            answer = 10001 * randomPrimeValue;
        } else if (rand <= 110) {
            const randomPrimeValue = getRandomPrime(6);
            const myArray = [7, 11, 13];
            const shuffledArray = shuffleArray(myArray);
            quest = `${shuffledArray[0] * randomPrimeValue} × ${shuffledArray[1] * shuffledArray[2]}`;
            answer = 1001 * randomPrimeValue;
        } else if (rand <= 120) {
            const v_start = Math.floor(Math.random() * 2) + 1;
            const v_differ = Math.floor(Math.random() * 2) + 1;
            quest = `㌫${v_differ}/${v_start * (v_start + v_differ)}㌫ ＋ ㌫${v_differ}/${(v_start + v_differ) * (v_start + v_differ * 2)}㌫ ＋ ㌫${v_differ}/${(v_start + v_differ * 2) * (v_start + v_differ * 3)}㌫ ＝ ㌫${3 * v_differ}/■㌫`;
            answer = v_start * (v_start + 3 * v_differ);
        }
        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);
    }

    function Abacus(level) {
        var quest = "";
        var answer = 0;
        var multi = [[6, 4], [5, 5], [4, 6]];
        var divide = [[3, 6], [4, 5], [5, 4], [6, 3]];
        if (level == 1) {
            multi = [[2, 4], [3, 3], [4, 2]];
            divide = [[2, 4], [3, 3], [4, 2]];
        } else if (level == 2) {
            multi = [[2, 5], [3, 4], [4, 3], [5, 2]];
            divide = [[2, 4], [3, 3], [4, 2]];
        } else if (level == 3) {
            multi = [[3, 5], [4, 4], [5, 3]];
            divide = [[2, 5], [3, 4], [4, 3], [5, 2]];
        } else if (level == 4) {
            multi = [[3, 6], [4, 5], [5, 4], [6, 3]];
            divide = [[3, 5], [4, 4], [5, 3]];
        }

        const randomIndex_multi = Math.floor(Math.random() * multi.length);
        const randomElement_multi = multi[randomIndex_multi];
        const randomIndex_divide = Math.floor(Math.random() * divide.length);
        const randomElement_divide = divide[randomIndex_divide];

        if (Math.random() < 0.5) {
            const num1 = getRandomDigits(randomElement_multi[0]);
            const num2 = getRandomDigits(randomElement_multi[1]);
            quest = `${num1} × ${num2}`;
            answer = num1 * num2;
        } else {

            const num1 = getRandomDigits(randomElement_divide[0]);
            const num2 = getRandomDigits(randomElement_divide[1]);
            quest = `${num1 * num2} ÷ ${num2}`;
            answer = num1;
        }
        $gameVariables.setValue(mondai_index, quest);
        $gameVariables.setValue(kotae_index, answer);

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
            "α", "β", "γ", "δ", "ε", "ϛ", "ζ", "η", "θ",
        ];
        const greekTens = [
            "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ϟ",
        ];
        const greekHundreds = [
            "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω", "ϡ",
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
        const rand = isFirst ? Math.floor(Math.random() * 30) + 31 : Math.floor(Math.random() * 60) + 1;
        if (level == 1) {//ひらがな、漢字
            if (rand <= 30) {
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
        } else if (level == 4) {//ローマ数字、韓国語、スペイン語、フランス語
            if (rand <= 20) {
                return intToRoman(num);
            } else if (rand <= 40) {
                return convertToKorean(num);
            } else if (rand <= 50) {
                return numberToSpanish(num);
            } else if (rand <= 60) {
                return numberToFrench(num);
            } 
        } else if (level == 5) {//韓国語、スペイン語、フランス語、ドイツ語、ギリシャ語
            if (rand <= 12) {
                return convertToKorean(num);
            } else if (rand <= 24) {
                return numberToSpanish(num);
            } else if (rand <= 36) {
                return numberToFrench(num);
            } else if (rand <= 48) {
                return numberToGerman(num);
            } else if (rand <= 60) {
                return numberToGreekNumbers(num);
            }
        } else if (level == 6) {//ドイツ語、ロシア語、ギリシャ語、ギリシャ文字
            if (rand <= 15) {
                return numberToGerman(num);
            } else if (rand <= 30) {
                return numberToRussian(num);
            } else if (rand <= 45) {
                return numberToGreekNumbers(num);
            } else if (rand <= 60) {
                return numberToGreekGlyph(num);
            }
        }
    } 

})();
