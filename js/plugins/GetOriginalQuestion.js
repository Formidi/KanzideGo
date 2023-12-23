//=============================================================================
// GetOriginalQuestion
//=============================================================================
/*:
 * @plugindesc .csv形式の問題を読み込めます。
 *
 * @help
 * プロジェクト名/excelData/editLevel直下にある.csvファイルを読み込み、問題として出力できるようにしたものです。
 * 読み込められる.csvに関しては、現状では以前いただいた.excelデータを.csvに変換した際に現れたものを読み込めるようにしてあります。
 *
 * できること:
 * QuestionRandomExtract 第一引数 第二引数 第三引数 第四引数
 *
 * 問題を取り出します。
 *
 *   第一引数で与えた数だけ重複なしでインデックスを引いてきます。
 *   第二引数はファイル名を指定します。
 *   第三引数はレベルを指定します。
 *   第四引数は問題の保存する変数を指定します。複数の場合は,区切りで保存されます。
 *
 *   例:「QuestionRandomExtract 1 KanzideGo_Shinmon 4 4」は、KanzideGo_Shinmonファイル内のLv4問題からランダムで1問抽出し、そのインデックスを変数4に保存します。
 *
 * Answer 第一引数 第二引数 第三引数 第四引数 第五引数 第六引数 第七引数
 *
 * 取り出した問題の解答を画面に表示します。漢字画像はテキストから自動で作られます。
 *
 *  第一引数は問題名(LV01_0101やLV05_1111など)を指定します。
 *  第二引数は複数の問題がある場合に何番目の問題の答えを取得するか指定します。
 *  第三引数はファイル名を指定します。
 *  第四引数はフェードの有無を指定します。
 *  第五/六引数は表示するx,y座標を指定します。
 *  第七引数は使用するピクチャ番号を指定します。
 *  ※注意！ 第七引数の値とそれ+3までが使用されます。例えば下記の例であれば54までがこれに使用されます。
 *   例:「4 0 KanzideGo_Shinmon 4 640 360 51」は、上のコマンドの後に実行した場合にKanzideGo_Shinmonファイルから該当問題を取り出し、位置(640,360)を中心に文字列とかを表示します。


 * QuestionTextExtract 第一引数 第二引数
 *
 * 問題を取り出せます。現状ではそれ以上でもそれ以下でもありません。何かやりたいことがある場合はこの項目を編集してほしいです。
 * 詳細については285行目あたりを参照してください。
 *
 *  第一引数は問題インデックスを指定します。
 *  第二引数はファイル名を指定します。
 * @author chuukunn
 *
 * @arg question_save
 * @desc 最大31問を収納してくれる変数です。外部からいじる必要はないです。
 * @type number
 * @default 500
 *
 * @arg nowStage
 * @desc 現在のステージを示す変数を参照してください。Stage1では0、Stage2では1、Stage3では2、Finalでは3かそれ以上。
 * @type number
 * @default 501
 *
 * @arg progress
 * @desc 現在の進み具合を収納してくれる変数です。外部からいじる必要はないです。
 * @type number
 * @default 502
 *
 * @arg review1
 * @desc 解いた問題を収納してくれる変数です。
 * @type number
 * @default 503
 *
 * @arg review2
 * @desc いれかえた問題を収納してくれる変数です。
 * @type number
 * @default 504
 *
 * @arg review3
 * @desc 残機消費した問題を収納してくれる変数です。
 * @type number
 * @default 505
 *
 * @arg question_get
 * @desc 現在の問題のインデックスを取り出せる変数です。
 * @type number
 * @default 506
 *
 */

(function () {
    var parameters = PluginManager.parameters('GetOriginalQuestion');
    var FlashcardData = 796;
    var FlashcardPage = 797;
    var FlashcardPageMax = 798;
    var FlashcardType = 799;
    var QName = 800;
    const fs = require('fs');
    const path = require('path');

    // JSONファイルのパス
    var jsonFilePath = './excelData/question.json';

    // ゲーム開始時の処理
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.call(this);

        // JSONデータを読み込み、内部データに変換して保存
        this.loadAndStoreData();
    };

    Scene_Boot.prototype.loadAndStoreData = function () {
        try {
            var xhr = new XMLHttpRequest();
            var url = jsonFilePath;
            xhr.open('GET', url, false);
            xhr.overrideMimeType('application/json');
            xhr.send();
            if (xhr.status === 200) {
                var jsonData = JSON.parse(xhr.responseText);
                // 内部データに保存
                DataManager.storeCustomData(jsonData);
            } else {
                console.error('Failed to load JSON file: ' + url);
            }
        } catch (error) {
            // 例外をキャッチして処理するコード
        }
    };

    // DataManagerにカスタムデータを保存する関数を追加
    DataManager.storeCustomData = function (data) {
        this._customData = data;
    };

    // DataManagerからカスタムデータを取得する関数を追加
    DataManager.getCustomData = function () {
        return this._customData || null;
    };


    function loadCSVData(callback) {
        fs.readFile('excelData/editLevel/output_result.txt', 'utf8', (err, data) => {
            if (err) {
                console.error('ファイルを読み取る際にエラーが発生しました。', err);
                return;
            }

            // ブロックごとにデータを分割
            var blocks = data.split('\n\n');

            // 結果を格納するオブジェクト
            var result = {};

            // 各ブロックを処理
            blocks.forEach((block) => {
                console.log(block);
                console.log("-------");
                /*
                var lines = block.split('\n');
                var key = lines[0]; // 最初の行をキーとする

                // ブロック内のデータを処理
                var values = {};
                for (let i = 1; i < lines.length; i++) {
                    var [index, value] = lines[i].split(' : ');
                    values[index.trim()] = value.trim();
                }

                // 結果に追加
                result[key] = values;
                */
            });
            // 結果を表示（または保存）

            // コールバック関数を呼び出す
            if (typeof callback === "function") {
                callback();
            }
        });
    }

    function insertValueToFirstEmptyIndex(num, valueToInsert) {
        var list = $gameVariables.value(num).split(',');
        for (let i = 0; i < list.length; i++) {
            if (!list[i]) { list[i] = valueToInsert; break; }
        }
        $gameVariables.setValue(num, list);
    }

    function parseText(text) {
        let x = "";
        let y = "";
        let z = "";

        const text_split_num = text.split("(").length - 1;
        if (text_split_num === 0) {
            y = text;
        } else if (text_split_num === 1) {
            if (text.charAt(0) === '(') {
                var text_split = text.split(")");
                x = text_split[0].replace("(", "");
                y = text_split[1];
            } else {
                var text_split = text.split("(");
                y = text_split[0];
                z = text_split[1].replace(")", "");
            }
        } else if (text_split_num >= 2) {
            var text_split_l = text.split(")");
            x = text_split_l[0].replace("(", "");
            y = text_split_l[1].split("(")[0];
            var text_split_r = text.split("(");
            z = text_split_r[2].replace(")", "");
        }
        return [x, y, z];
    }

    class Question {
        constructor(id, questionText, answer, comment1, comment2, genre, num_of_chr, level, fileName, questionText_e, questionText_a) {
            this.id = id;//問題ID
            this.questionText = questionText;//問題文(色のついた部分のみ)
            this.answer = answer;//解答、リストではないことに注意
            this.comment1 = comment1;//説明1
            this.comment2 = comment2;//説明2
            this.genre = genre;//ジャンル
            this.num_of_chr = num_of_chr;//文字数
            this.level = level;//問題レベル
            this.fileName = fileName;//問題の画像ファイルの名前
            this.questionText_e = questionText_e;//問題文の前にある白文字列
            this.questionText_a = questionText_a;//問題文の後にある白文字列
        }
    }

    function getRandomIndexes(arr, count) {
        const indexes = [...arr];
        const result = [];

        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * indexes.length);
            const selected = indexes.splice(randomIndex, 1)[0];
            result.push(selected);
        }

        return result;
    }

    function Register(link, file, callback) {
        fs.readFile(link, 'utf8', function (err, data) {
            if (err) {
                console.error("CSVファイルの読み込み中にエラーが発生しました。");
                return;
            }
            var questions = [];

            var lines = data.split('\n');

            for (var i = 0; i < lines.length; i++) {
                var rowData = lines[i].split(',');
                if (rowData[3] === "字") {
                    lines = lines.slice(i - 1);
                    break;
                }
            }
            for (var i = 1; i < lines.length - 1; i = i + 2) {
                var firstLine = lines[i].split(',');
                var secondLine;

                if (firstLine.length <= 3) {
                    i = i + 1;
                    firstLine = lines[i].split(',');
                    console.log("skip1");
                }

                secondLine = lines[i + 1].split(',');

                if (secondLine.length <= 3) {
                    i = i + 1;
                    secondLine = lines[i + 1].split(',');
                    console.log("skip2");
                }

                var id = firstLine[0];
                var answer = firstLine[1];
                var splitText = parseText(secondLine[1]);
                var questionText_e = splitText[0];
                var questionText = splitText[1];
                var questionText_a = splitText[2];
                var num_of_chr = firstLine[2];
                var genre = firstLine[4];
                var comment1 = firstLine[5];
                var comment2 = secondLine[5];
                var level = firstLine[6] + secondLine[6];
                var filename = file.split('.')[0] + "_" + String(id).padStart(4, '0');
                var question = new Question(id, questionText, answer, comment1, comment2, genre, num_of_chr, level, filename, questionText_e, questionText_a);
                console.log(question);
                if (answer != "") {
                    questions.push(question);
                }
            }
            var jsonString = JSON.stringify(questions);
            console.log(file.split('.')[0]);
            localStorage.setItem(file.split('.')[0], jsonString);

            if (typeof callback === "function") {
                callback();
            }
        });
    }

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'Answer') {
            var q_name = DataManager.getCustomData()[args[0]];
            var haveAnimation = args[1];
            var position_x = parseInt(args[2]);
            var position_y = parseInt(args[3]);
            var pic_num = parseInt(args[4]);

            var Qpicture_x = position_x - 362;
            var Qpicture_y = position_y + 18;
            var ExpUp_x = position_x - 80;
            var ExpUp_y = position_y - 10;
            var ExpDo_x = position_x - 80;
            var ExpDo_y = position_y + 39;
            var Answer_x = position_x + 272;
            var Answer_y = position_y - 48;
            var Num_x = position_x - 615;
            var Num_y = position_y - 78;

            var textlist = [];
            for (var i = 9; i < 11; i++) {
                if (q_name[i] != "000000000000000000000") {
                    var inputText = "\\c[6]" + q_name[i] + "\\c[0]";
                    if ($gameVariables.value(FlashcardType) != "open") inputText = "\\c[6]" + "●".repeat(q_name[i].length); + "\\c[0]";
                    if (q_name.hasOwnProperty("1057")) inputText = "\\c[0][" + q_name["1057"] + "]" + inputText;
                    if (q_name.hasOwnProperty("1058")) inputText += "\\c[0][" + q_name["1058"] + "]";
                    textlist.push(inputText);
                    //"\\ow[20]\\oc[black]" +
                }
            }
            if (haveAnimation == "1") {
                //$gameMap._interpreter.pluginCommand("D_TEXT", [inputText, "300"]);
                //$gameScreen.showPicture(pic_num + 0, null, 1, Qpicture_x, Qpicture_y, 32, 32, 0, 0);
                $gameScreen.showPicture(pic_num + 0, args[0], 1, Qpicture_x, Qpicture_y, 32, 32, 0, 0);

                $gameMap._interpreter.pluginCommand("D_TEXT", [textlist.join("、"), "32"]);
                $gameScreen.showPicture(pic_num + 1, null, 1, Answer_x, Answer_y, 100, 100, 0, 0);

                $gameMap._interpreter.pluginCommand("D_TEXT", [q_name["19"], "32"]);
                $gameScreen.showPicture(pic_num + 2, null, 0, ExpUp_x, ExpUp_y, 100, 100, 0, 0);

                $gameMap._interpreter.pluginCommand("D_TEXT", [q_name["20"], "32"]);
                $gameScreen.showPicture(pic_num + 3, null, 0, ExpDo_x, ExpDo_y, 100, 100, 0, 0);

                $gameScreen.movePicture(pic_num + 0, 1, Qpicture_x, Qpicture_y, 32, 32, 255, 0, 10);
                $gameScreen.movePicture(pic_num + 1, 1, Answer_x, Answer_y, 100, 100, 255, 0, 10);
                $gameScreen.movePicture(pic_num + 2, 0, ExpUp_x, ExpUp_y, 100, 100, 255, 0, 10);
                $gameScreen.movePicture(pic_num + 3, 0, ExpDo_x, ExpDo_y, 100, 100, 255, 0, 10);
            } else {

                //$gameMap._interpreter.pluginCommand("D_TEXT", [inputText, "300"]);
                //$gameScreen.showPicture(pic_num + 0, null, 1, Qpicture_x, Qpicture_y, 32, 32, 255, 0);
                $gameScreen.showPicture(pic_num + 0, args[0], 1, Qpicture_x, Qpicture_y, 32, 32, 255, 0);

                $gameMap._interpreter.pluginCommand("D_TEXT", [textlist.join("、"), "32"]);
                $gameScreen.showPicture(pic_num + 1, null, 1, Answer_x, Answer_y, 100, 100, 255, 0);

                console.log(q_name["19"]);
                if ($gameVariables.value(FlashcardType) == "close") {
                    $gameMap._interpreter.pluginCommand("D_TEXT", ["\\c[8]？？？\\c[0]", "32"]);
                } else {
                    $gameMap._interpreter.pluginCommand("D_TEXT", [q_name["19"], "32"]);
                }
                $gameScreen.showPicture(pic_num + 2, null, 0, ExpUp_x, ExpUp_y, 100, 100, 255, 0);

                if (q_name.hasOwnProperty("20") && $gameVariables.value(FlashcardType) != "close") {
                    $gameMap._interpreter.pluginCommand("D_TEXT", [q_name["20"], "32"]);
                    $gameScreen.showPicture(pic_num + 3, null, 0, ExpDo_x, ExpDo_y, 100, 100, 255, 0);
                } else if ($gameVariables.value(FlashcardType) == "close") {
                    $gameMap._interpreter.pluginCommand("D_TEXT", ["\\c[8]？？？\\c[0]", "32"]);
                    $gameScreen.showPicture(pic_num + 3, null, 0, ExpDo_x, ExpDo_y, 100, 100, 255, 0);
                }
                $gameMap._interpreter.pluginCommand("D_TEXT", [args[5] + 1, "32"]);
                $gameScreen.showPicture(pic_num + 4, null, 0, Num_x, Num_y, 100, 100, 255, 0);
            }
        } else if (command === 'Csv_Question_Set') {
            var difficulty = $gameVariables.value(15);
            var stage;
            if (difficulty <= 100) {
                difficulty += 1;
                var stage1 = GetQuestionIndex(difficulty, 10);
                difficulty += 1;
                var stage2 = GetQuestionIndex(difficulty, 10);
                difficulty += 1;
                var stage3 = GetQuestionIndex(difficulty, 10);
                difficulty += 1;
                var final = GetQuestionIndex(difficulty, 1);
                stage = [stage1, stage2, stage3, final];

            } else if (difficulty <= 500) {
                difficulty += 1;
                var stage1 = GetQuestionIndex(difficulty, 8);
                var stage2 = GetQuestionIndex(difficulty, 8);
                var stage3 = GetQuestionIndex(difficulty, 8);
                var final = GetQuestionIndex(difficulty, 1);
                stage = [stage1, stage2, stage3, final];

            } else {
                difficulty -= 500;
                stage = GetQuestionIndex(difficulty, 15);
            }

            $gameVariables.setValue(review1, ",,,,,,,,,,,,,,,");//問題の保存場所
            $gameVariables.setValue(review2, ",,");//いれかえの保存場所
            $gameVariables.setValue(review3, ",,,,");//残機消費の保存場所

            $gameVariables.setValue(question_save, stage);

        } else if (command === 'Csv_Question_Get') {
            $gameVariables.value(question_get).split(',')[$gameVariables.value(nowStage) * 10 + $gameVariables.value(progress)];
        } else if (command === 'Csv_Question_Result') {
            var AnswerList = $gameVariables.value(question_save).split(',');
            var isNext = $gameVariables.value(503);//「残機消費で問題が入れ替われらない状態下で不正解した」あるいは「最終問題」なら0、それ以外なら1。
            var isCorrect = $gameVariables.value(504);//「問題に正解した」なら1。
            var isChanged = $gameVariables.value(505);//「いれかえをした」なら1。
            if (isNext == 1) {
                $gameVariables.setValue(progress, $gameVariables.value(progress) + 1);
            }
            var insertIndex = AnswerList[$gameVariables.value(nowStage) * 10 + $gameVariables.value(progress)];
            if (isCorrect == 1) {
                insertValueToFirstEmptyIndex(review1, insertIndex);
            } else if (isChanged == 1) {
                insertValueToFirstEmptyIndex(review2, insertIndex);
            } else {
                insertValueToFirstEmptyIndex(review3, insertIndex);
            }
        } else if (command === 'ReadQuestion') {
            GetLevelData(args[0]);
        } else if (command === 'EnterFlashcard') {
            $gameScreen.showPicture(101, "Com_bg", 0, 0, 0, 100, 100, 255, 0);
            if ($gameVariables.value(FlashcardType) == "0") $gameVariables.setValue(FlashcardType, "close");
            $gameVariables.setValue(FlashcardPageMax, Math.ceil($gameVariables.value(FlashcardData).split(",").length / 4));
            $gameVariables.setValue(FlashcardPage, 0);
            $gameMap._interpreter.pluginCommand("PreViewFlashcard");
        } else if (command === 'PreViewFlashcard') {
            for (var i = 102; i < 126; i++) {
                $gameScreen.erasePicture(i);
            }
            if ($gameVariables.value(FlashcardType) == "0") {
                $gameVariables.setValue(FlashcardType, "close");
            } else if (args != undefined) {
                $gameVariables.setValue(FlashcardType, args[0]);
            }
            var StartIndex = $gameVariables.value(FlashcardPage) * 4;
            if ($gameVariables.value(FlashcardData) != "0") {
                var FlashcardList = $gameVariables.value(FlashcardData).split(",");
                for (var i = 0; i < 4; i++) {
                    if (FlashcardList.length <= StartIndex + i) break;
                    $gameMap._interpreter.pluginCommand('Answer', [FlashcardList[StartIndex + i], "0", "640", 101 + i * 159, 102 + 5 * i, StartIndex + i]);
                }

            }
        } else if (command === 'PageNext') {
            $gameVariables.setValue(FlashcardPage, ($gameVariables.value(FlashcardPage) + 1) % $gameVariables.value(FlashcardPageMax));
            $gameMap._interpreter.pluginCommand("PreViewFlashcard");
        } else if (command === 'PagePrev') {
            $gameVariables.setValue(FlashcardPage, ($gameVariables.value(FlashcardPage) - 1 + $gameVariables.value(FlashcardPageMax)) % $gameVariables.value(FlashcardPageMax));
            $gameMap._interpreter.pluginCommand("PreViewFlashcard");

        } else if (command === 'ExitFlashcard') {
            for (var i = 50; i < 75; i++) {
                $gameScreen.erasePicture(i);
            }
        } else if (command === 'AddFlashcard') {
            if (args[0] !== undefined) {
                if ($gameVariables.value(FlashcardData) == "0") {
                    $gameVariables.setValue(FlashcardData, `${args[0]}`);
                } else {
                    $gameVariables.setValue(FlashcardData, `${args[0]},${$gameVariables.value(FlashcardData)}`);
                }
                return;
            }
            var customData = DataManager.getCustomData();
            if (typeof customData === "object" && customData !== null) {
                var keys = Object.keys(customData);
                var randomKey = keys[Math.floor(Math.random() * keys.length)];
                if ($gameVariables.value(FlashcardData) == "0") {
                    $gameVariables.setValue(FlashcardData, randomKey);
                } else {
                    $gameVariables.setValue(FlashcardData, `${randomKey},${$gameVariables.value(FlashcardData)}`);
                }
                $gameVariables.setValue(QName, randomKey);
            }
            console.log($gameVariables.value(FlashcardData));
        } else if (command === 'LoadQuestionFile') {
            var fs = require('fs');
            var file_path = 'data/CommonEvents.json';

            // ファイルからJSONデータを読み取る
            var input_string = fs.readFileSync(file_path, 'utf-8');


            // 正規表現パターンを定義
            var pattern = /{"id":(56|57|58|59|60|61|62|63|64|65|66|67|68|69|70|71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132|133|134|135|136|137|138|139|140|141|142|143|144|145|146|147|148|149|150|151|152|153|154|155|156|157|158|159|160|350|580),/;

            // 各行をチェックして条件に一致しない行を削除
            var lines = input_string.split('\n');
            var filtered_lines = lines.filter(function (line) {
                return pattern.test(line);
            });

            // フィルタリングされた行を連結して新しい文字列を作成
            var output_string = filtered_lines.join('\n');

            // 正規表現パターンを定義
            var pattern = /("parameters"\s*:\s*\[)((?:[^\]]|\](?![},]))+)(\])/g;

            var matches = [];
            var match;

            while ((match = pattern.exec(output_string)) !== null) {
                matches.push(match[0].substring(14, match[0].length - 1));
            }


            var parameters_list = [];

            for (var i = 0; i < matches.length; i++) {
                var match = matches[i];
                parameters_list.push(match);
            }

            var split_indices = {};
            var level = 0;
            var level_list = [0, "01", "02", "03", "04", "05", "06", "Ca004", "07"];
            var parent_key = "";

            // 区切りを見つける
            for (var i = 0; i < parameters_list.length; i++) {
                var elements = parameters_list[i].split(',');
                if (elements.length >= 2) {
                    if (elements[0] == '1' && elements[1] == '6') {
                        if (elements[elements.length - 2] == "1") {
                            level += 1;
                        }
                        parent_key = 'Lv' + level_list[level] + '_' + formatToFourDigits(elements[elements.length - 2]);
                        split_indices[parent_key] = {};
                    } else if (elements[0] == elements[1] && elements[0] != "8") {
                        elements[elements.length - 1] = elements[elements.length - 1].replace(/\\"/g, '').replace(/"/g, '').replace(/　/g, '');
                        if (typeof split_indices[parent_key] !== 'undefined' && (elements[0] !== "9" || elements[elements.length - 1].trim() !== "")) {
                            split_indices[parent_key][elements[0]] = elements[elements.length - 1];
                        } else {
                            if (typeof split_indices[parent_key] !== 'undefined') {
                                delete split_indices[parent_key];
                            }
                        }
                    }
                }
            }

            // JSON形式に変換
            var json_output = JSON.stringify(split_indices, null, 2);

            // JSONデータを.jsonファイルに保存
            fs.writeFileSync('excelData/question.json', json_output, 'utf-8');

            console.log("データをoutput.jsonファイルに保存しました。");
        }
    };

    function formatToFourDigits(number) {
        var formatted_number = String(number).padStart(4, '0');
        return formatted_number;
    }


    function GetLevelData(levelKey) {
        var data = DataManager.getCustomData(); // カスタムデータを取得
        if (data) {
            var levelData = data[levelKey]; // レベルキーに対応するデータを取得
            if (levelData) {
                setVariablesFromLevelData(levelData);
            } else {
                // レベルデータが存在しない場合のエラーメッセージ
                console.error('Level data for ' + levelKey + ' not found.');
            }
        } else {
            // カスタムデータが存在しない場合のエラーメッセージ
            console.error('Custom data not loaded.');
        }
    }

    // ゲーム変数に設定する関数
    function setVariablesFromLevelData(levelData) {
        // levelData の各プロパティを処理
        for (var key in levelData) {
            if (levelData.hasOwnProperty(key)) {
                var value = levelData[key];
                var variableId = parseInt(key); // プロパティ名を数値に変換
                if (!isNaN(variableId)) {
                    $gameVariables.setValue(variableId, value);
                }
            }
        }
    }

    DataManager.getCustomDataForLevel = function (levelKey) {
        var customData = this.getCustomData();
        if (customData && customData[levelKey]) {
            return customData[levelKey];
        } else {
            return null;
        }
    };

    function GetQuestionIndex(difficulty,count) {
        var stage_difficulty = $gameVariables.value(15);
        var file_name = "Lv0" + difficulty;
        if (stage_difficulty == 0 && difficulty == 4) {
            //ノーマルならLv4の出題範囲を制限
        } else if (stage_difficulty == 1 && (difficulty == 4 || difficulty == 5)) {
            //ハードならLv4,5の出題範囲を制限
        }
        /*
        var loadedData = localStorage.getItem(file_name);
        var loadedArray = JSON.parse(loadedData);
        */
        // 特定のジャンルを除外した配列を作成
        const indexesToInclude = loadedArray.reduce((indexes, question, index) => {
            if (question.genre !== "人") {
                indexes.push(index);
            }
            return indexes;
        }, []);

        // インデックスのリストからランダムに要素を選んで結果の配列に追加
        const result = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * indexesToInclude.length);
            const selectedIndex = indexesToInclude.splice(randomIndex, 1)[0];
            result.push(selectedIndex);
        }
    }


})();
