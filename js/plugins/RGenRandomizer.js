//=============================================================================
// RGenRandomizer.js
//=============================================================================
/*:
 * @plugindesc ランダムな変数出力
 *
 * @author chuukunn
 *
 * @param exported_value
 * @desc プラグインコマンド実行時に出力される変数のID。
 * @type number
 * @default 6
 * 
 * @param group
 * @desc 制限時、どのグループであるかを示す「変数番号」。
 * @type number
 * @default 1084
 * 
 * @param numofQ
 * @desc 制限時の総問題数。
 * @type number
 * @default 1266
 * 
 * @param seeds
 * @desc シードを保存する変数番号。
 * @type number
 * @default 1264
 */
//=============================================================================
(function () {
    var parameters = PluginManager.parameters('RGenRandomizer');
    var exported_value = Number(parameters['exported_value'] || 6);
    var group = Number(parameters['group'] || 1084);
    var numofQ = Number(parameters['numofQ'] || 1266);
    var seeds = Number(parameters['seeds'] || 1264);

    //this._customListを初期化する関数
    DataManager.initCustomList = function () {
        this._customList = [];
    };

    //this._customListに要素を追加する関数
    DataManager.addToCustomList = function (data) {
        this._customList.push(data);
    };

    //this._customListに直接リストを代入する関数
    DataManager.SetCustomList = function (data) {
        this._customList = data;
    };

    //this._customListをもらうための関数
    DataManager.getCustomList = function () {
        return this._customList || [];
    };

    DataManager.loadCustomData = function () {
        return this._NormalQuestionData || [];
    };

    //GetStageFromGitHubからステージをもらっているときに、その値を参照して問題リストをもらう関数
    function GetQuestion() {
        return this._CustomStageQuestion || null;
    }

    var cachedResults = {};

    function calculateC(a, b) {
        // a と b の組み合わせをキーとして計算結果を保存しておく
        const key = a.toString() + '|' + b.toString();

        // キャッシュ内に計算結果が保存されていれば、それを返す
        if (cachedResults.hasOwnProperty(key)) {
            //console.log("算出済み！" + cachedResults[key]);
            return cachedResults[key];
        }

        // 計算処理
        const questionList = DataManager.loadCustomData();
        //過去問リストの中から該当する問題のリストを作る
        const level = a;
        let count = 0;
        for (let key in questionList) {
            if (questionList.hasOwnProperty(key) && key.startsWith(`Lv0${level}`)) {
                if (questionList[key] && questionList[key]["1087"].split(',').some(value => value == b)) {
                    count++;
                }
            }
        }
        $gameVariables.setValue(numofQ, count);

        // 計算結果をキャッシュに保存しておく
        cachedResults[key] = count;

        // 計算結果を返す
        return count;
    }

    var cash_seeds = [];

    //既存のプラグインコマンドを上書き
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        //追加の処理を実行
        if (command === 'RGen') {
            //もしリストがまだないなら初期化
            if (!DataManager._customList) {
                DataManager.initCustomList();
            }
            //ステージ判別用のアイデンティファイアー
            var variableId = args[0];
            var min = parseInt(args[1]);//問題抽選の最小値
            var max = parseInt(args[2]);//問題抽選の最大値
            var probability = parseInt(args[3]);//重複がなくなる確率
            var addedQuestion_num = args.length >= 5 ? parseInt(args[4]) : 0;
            var addedQuestion_probability = args.length >= 5 ? parseInt(args[5]) : 0;
            var Customlist = DataManager.getCustomList();
            if (variableId && min && max && probability >= 0 && probability <= 100) {
                if (variableId.startsWith("Ca")) {
                    var plusnum = parseInt(0);
                    if ($gameVariables.value(15) == 103) {
                        plusnum = parseInt(2);
                    } else if (104 <= $gameVariables.value(15) && $gameVariables.value(15) <= 109 && $gameVariables.value(15) != 105) {
                        plusnum = parseInt(1);
                    }
                    variableId = `${variableId}_${String(parseInt($gameVariables.value(15)) - 100).padStart(3, '0')}_Lv${$gameVariables.value(290) + $gameVariables.value(757) + plusnum}`;
                    max = $gameVariables.value(200 + parseInt($gameVariables.value(290) + $gameVariables.value(757) + plusnum));
                    if ($gameVariables.value(290) + $gameVariables.value(757) + plusnum == 7) {
                        max = $gameVariables.value(209);
                    }
                }
                var value = 0;//まず0を付与
                if (addedQuestion_probability > Math.random() * 100) {//もし新規問題割込みプログラムが起きたなら
                    value = getRandomNumberInIdentifierRangeNotInCustomlist(variableId, min, max, Customlist, addedQuestion_num);//新規問題優先で重複なしの抽選
                } else if (probability > Math.random() * 100) {//もし重複無しプログラムが起きたなら
                    value = getRandomNumberInIdentifierRangeNotInCustomlist(variableId, min, max, Customlist, 0);//重複なしの抽選
                } else if ($gameVariables.value(group) != 0) {//もしカジュアルのステージなら
                    value = getRandomNumberInIdentifierRangeNotInCustomlist(variableId, min, max, Customlist, 0);//カジュアルの抽選
                } else {//どれにも引っかからない場合
                    value = generateRandomNumber(min, max);
                }
                $gameVariables.setValue(exported_value, value);//最終的に出た値を代入する
            }
        }
        else if (command === 'RGen_Seed') {
            const numbers = [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126,
                546, 547, 548, 549,
                804, 816, 828, 840, 852, 864, 876, 888, 900, 912, 924, 936];
            let list = "";
            numbers.forEach((number) => {
                // ここで各数値に対して処理を行う
                list += $gameVariables.value(number).toString().padStart(4, '0');
            });
            
            $gameVariables.setValue(seeds, list);
        }
        else if (command === 'RGen_Record') {
            //もしリストがまだないなら初期化
            if (!DataManager._customList) {
                DataManager.initCustomList();
            }
            $gameVariables.setValue(seeds, 0);
            var Customlist = DataManager.getCustomList();//リストの取得
            if ($gameVariables.value(15) != 901) {
                var tag;// = $gameVariables.value(8).split('_')[0];//ここでいうタグはレベル名。例えばLvEx004_0001ならLvEx004が抽出される。
                if ($gameVariables.value(15) <= 100) {
                    tag = "Ma";
                } else if ($gameVariables.value(15) <= 500) {
                    tag = `Ca_${String(parseInt($gameVariables.value(15)) - 100).padStart(3, '0')}`;
                } else if ($gameVariables.value(15) <= 600) {
                    tag = "Ma";
                }
                if ($gameVariables.value(15) <= 10000) {
                    if ($gameVariables.value(15) == 902) {
                        tag = `Stage${$gameVariables.value(15)}Lv${DataManager.loadCustomExData()["LvEnglish_" + String($gameVariables.value(6)).padStart(4, '0')]["Level"]}`;
                    }
                    if ($gameVariables.value(15) == 903) {
                        tag = `Stage${$gameVariables.value(15)}Lv${DataManager.loadCustomExData()["LvGenso_" + String($gameVariables.value(6)).padStart(4, '0')]["Level"]}`;
                    }
                }

                //それぞれ、メイン、ラッシュ、カジュアル(ベーシックのみ別処理)のタグ管理
                //ステージ101なら→Ca_001_
                //メイン、ラッシュはMa_Lv(レベル名の中にある数値)
                //こうして得られた名前を過去問リストに登録
                DataManager.addToCustomList(`${tag}_${$gameVariables.value(6)}`);
                //console.log(DataManager.getCustomList());
                //もし規定数を超えていた場合はリセットをかける
                DataManager.SetCustomList(removeItemsWithSubstring(Customlist, tag, parseInt($gameVariables.value(681))));
            }
        } else if (command === 'RGen_Count') {
            calculateC(args[0], $gameVariables.value(group));
        }
        else if (command === 'RGen_reset') {
            if (!DataManager._customList) {
                DataManager.initCustomList();
            }
            DataManager.SetCustomList(removeItemsForceWithSubstring(DataManager.getCustomList(), args[0]));
            //特定タグに対してリセットをかける
        }
        else if (command === 'EXRGen') {
            if (!DataManager._customList) {
                DataManager.initCustomList();
            }
            var stageName = args[0];
            var probability = parseInt(args[1]);
            var level = parseInt(args[2]);
            var Customlist = DataManager.getCustomList();
            if (stageName && probability >= 0 && probability <= 100) {
                var isFilter = false;
                if (probability > Math.random() * 100) {
                    isFilter = true;
                }
                var value = getExRandomNumber(stageName, Customlist, level, isFilter);
                $gameVariables.setValue(exported_value, parseInt(value.slice(value.lastIndexOf('_') + 1)));
            }
        }
        else if (command === 'EditRGen') {
            if (!DataManager._customList) {
                DataManager.initCustomList();
            }
            var stageName = args[0];
            var probability = parseInt(args[1]);
            var level = parseInt(args[2]);
            var Customlist = DataManager.getCustomList();
            if (stageName && probability >= 0 && probability <= 100) {
                var isFilter = false;
                if (probability > Math.random() * 100) {
                    isFilter = true;
                }
                var value = getEditRandomNumber(stageName, Customlist, level, isFilter);
                $gameVariables.setValue(exported_value, parseInt(value.slice(value.lastIndexOf('_') + 1)));
            }
        }
    };

    function removeItemsForceWithSubstring(list, substring) {
        list = list.filter(function (currentItem) {
            return !currentItem.includes(substring);
        });

        return list;
    }

    function generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function removeItemsWithSubstring(list, substring, limit) {
        var count = list.reduce(function (acc, currentItem) {
            if (currentItem.includes(substring)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        if (count >= limit) {
            list = list.filter(function (currentItem) {
                return !currentItem.includes(substring);
            });
        }

        return list;
    }

    function getRandomNumberInIdentifierRangeNotInCustomlist(identifier, a, b, customlist, grad) {
        var a_save = a;
        if (grad >= 1) {
            a = b - grad + 1;
        }
        //もし問題抽選に勾配がある(gradが1以上、つまり新問優先)なら、最小値をb - grad + 1まで上げる。
        //console.log(customlist);
        const matchingNumbers = customlist.filter(item => item.startsWith(identifier));
        const questionList = DataManager.loadCustomData();
        //過去問リストの中から該当する問題のリストを作る

        const allNumbersInRange = Array.from({ length: b - a + 1 }, (_, index) => a + index);
        //過去問があるときは、a~bまでの数字が入ったリストを作成
        const matchingNumbersInRange = matchingNumbers.map(item => parseInt(item.split('_').slice(-1)[0]));
        const level = identifier.slice(-1);
        //console.log(`${level}, ${$gameVariables.value(group)}`);
        const availableNumbers = allNumbersInRange.filter(number => !matchingNumbersInRange.includes(number) && ($gameVariables.value(group) == 0 || questionList[`Lv0${level}_${String(number).padStart(4, '0')}`]["1087"].split(',').some(value => value == $gameVariables.value(group))));

        //console.log(availableNumbers);
        //a~bまでの数字が入ったリストから、過去問で出た問題を除く
        if (availableNumbers.length === 0 && grad >= 1) {//もし利用できる乱数がなく、かつgradが1以上なら
            //console.log("勾配無し");
            return getRandomNumberInIdentifierRangeNotInCustomlist(identifier, a_save, b, customlist, 0);
            //新問は出し切ったということなので、勾配をなくしてやり直す
        } else if (availableNumbers.length <= 1) {
            //利用できる乱数が1以下になったら
            DataManager.SetCustomList(removeItemsForceWithSubstring(DataManager.getCustomList(), identifier));
            //いったん過去問リストにリセットをかけて
            console.log("リセット");
            return getRandomNumberInIdentifierRangeNotInCustomlist(identifier, a, b, customlist, 0);
            //再度この関数を実行する
        }
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        return availableNumbers[randomIndex];
        //a~bまでの数字が入ったリストから、過去問で出た問題を除いたリストから、ランダムで1つ選ぶ
    }
    function getExRandomNumber(stageName, Customlist, level, doFilter) {
        const ex_dict = DataManager.loadCustomExData();
        const indexesToInclude = [];
        for (const key in ex_dict) {
            if (key.includes(stageName) && (level == parseInt(ex_dict[key]["Level"]) || parseInt(ex_dict[key]["Level"]) == 0) && (!doFilter || !Customlist.includes(key))) {
                if (!(ex_dict[key]["13"] == "植" && $gameVariables.value(1322) == 1) && !(ex_dict[key]["13"] == "生" && $gameVariables.value(1321) == 1)) {
                    indexesToInclude.push(key);
                }
            }
        }
        if (indexesToInclude.length == 0) {
            DataManager.SetCustomList(removeItemsForceWithSubstring(Customlist, `${stageName}_Lv${level}`));
            return getExRandomNumber(stageName, Customlist, level, doFilter);
        }
        const randomIndex = Math.floor(Math.random() * indexesToInclude.length);
        return indexesToInclude[randomIndex];
    }

    function getEditRandomNumber(stageName, Customlist, level, doFilter) {
        const ex_dict = GetQuestion();
        const indexesToInclude = [];
        for (const key in ex_dict) {
            if ((level == parseInt(ex_dict[key]["Level"]) || parseInt(ex_dict[key]["Level"]) == 0) && (!doFilter || !Customlist.includes(key))) {
                if (!(ex_dict[key]["13"] == "植" && $gameVariables.value(1322) == 1) && !(ex_dict[key]["13"] == "生" && $gameVariables.value(1321) == 1)) {
                    indexesToInclude.push(key);
                }
            }
        }
        if (indexesToInclude.length == 0) {
            DataManager.SetCustomList(removeItemsForceWithSubstring(Customlist, stageName));
        }
        const randomIndex = Math.floor(Math.random() * indexesToInclude.length);
        return indexesToInclude[randomIndex];
    }

})();
