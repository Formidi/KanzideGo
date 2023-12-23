//=============================================================================
// QuestionImport
//=============================================================================
/*:
 * @plugindesc jsonで問題保存
 *
 * @help
 * jsonで問題を保存して、Qjsonで問題が出てきます。(多分)
 * 現状2通りの取得方法があり、
 * 1:GitHubから取得する方法
 * 2:ローカルファイルから取得する方法
 * を使い分けています。
 * ブラウザで実行する場合だと2が使えないので必然的に1を使うことになります。
 * 動作的には2のほうが軽いはずです。
 * 現状はオンライン状態なら1、オフライン状態なら2を使うようになっています。
 * パラメータのOwnerとRepoはGitHub Auto Updaterと同じもので大丈夫です。
 * 使用時にはexcelDataファイル内にLv01~Lv07,Ca004を入れておくことで読み込んでくれます。
 * GitHubとローカルの両方に入れてください。
 *
 * @author chuukunn
 *
 * @param Owner
 * @desc GitHubユーザーの名前
 * @default your_owner
 *
 * @param Repo
 * @desc GitHubレポジトリの名前
 * @default your_repo
 *
 * @param SHAForApp
 * @desc スマホアプリ版で使用するProjectKanzideGoのSHA
 * @default 0
 *
 * @param IsLocal
 * @desc 場合に任せるなら0、強制的にローカルにするなら1、強制的にGitHubにするなら2
 * @type number
 * @default 0
 *
 * @param length_tmp
 * @desc 文字列の長さを配置する一時的変数
 * @type number
 * @default 1123
 *
 * @param Replace
 * @desc 1ならアイコンが表示される、0なら表示されない
 * @type number
 * @default 1
 *
 */

(function () {
    var parameters = PluginManager.parameters('QuestionImport');
    var owner = String(parameters['Owner'] || 'your_owner');
    var repo = String(parameters['Repo'] || 'your_repo');
    var shaForApp = String(parameters['SHAForApp'] || 'main');
    var IsLocal = Number(parameters['IsLocal'] || 0);
    var Replace = Number(parameters['Replace'] || 1);
    var length_tmp = Number(parameters['length_tmp'] || 1123);
    const keyDictionary = {
        '問題': '8',
        '解１': '9',
        '解２': '10',
        '解３': '11',
        '送前': '1057',
        '送後': '1058',
        '文上': '19',
        '文下': '20',
        '配列': '18',
        '長い': '169',
        'ジャ': '13',
        '文数': '14',
        'サブ': '16',
        'カジ': '1087',
        '珍回': '992',
        '品詞': '1094'
    };

    var usedFileNames = [];

    // ゲーム開始時の処理
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.call(this);
        const isSmartphoneApp = isApp() && navigator.userAgent.match(/android|iphone|ios|ipod|ipad/i);
        const fromGitHub = (!isSmartphoneApp && navigator.onLine && !$gameTemp.isPlaytest() && IsLocal != 1) || IsLocal == 2;
        if (fromGitHub) {
            // HEAD 以外の commit ID を利用したい場合は、ここで指定
            const refShaOrBranch = "main";
            console.log(`GitHub取得 (対象 SHA or ブランチ : ${refShaOrBranch})`);
            ImportQuestionFromGitHub(refShaOrBranch);
        }
        else {
            console.log("ローカル取得");
            ImportQuestionFromLocal();

        }
    };

    function ImportQuestionFromGitHub(refShaOrBranch) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/excelData?ref=${refShaOrBranch}`;
        fetch(apiUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Failed to fetch folder list: ${apiUrl}`);
                }
            })
            .then(data => {
                const existingData = {};
                const existingExData = {};
                const txtFiles = data.filter(item => {
                    if (item && item.name) {
                        return item.name.endsWith('.txt') || item.name.endsWith('.csv');
                    }
                    return false;
                });

                // 各.txtファイルの内容を取得しコンソールに表示
                const filePromises = txtFiles.map(async (file) => {
                    const folderUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${refShaOrBranch}/${file.path}`;
                    const fileResponse = await fetch(folderUrl);

                    if (fileResponse.ok) {
                        const data = await fileResponse.text();
                        if (file.path.endsWith(".txt")) {
                            AddData(existingData, data);
                        } else if (file.path.endsWith(".csv")) {
                            const dirs = file.path.split("/")
                            const filename = dirs[dirs.length - 1]
                            const filename_noext = filename.slice(0, filename.length - ".csv".length)
                            AddCsvData(existingExData, data, filename_noext);
                        }
                    } else {
                        console.error(`Failed to fetch file: ${folderUrl}`);
                    }
                });

                // すべてのファイルの処理が終わった後にデータを保存
                Promise.all(filePromises)
                    .then(() => {
                        DataManager.saveCustomData(existingData);
                        DataManager.saveCustomExData(existingExData);
                    })
                    .catch((error) => {
                        console.error(`Error while processing files: ${error}`);
                    });
            })
            .catch(error => {
                console.error(`Error: ${error}`);
            });
    }

    function CompareVersionFile() {
        const fileName = 'version.txt';
        const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/excelData/${fileName}`;

        fetch(fileUrl)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error(`Failed to fetch file: ${fileUrl}`);
                }
            })
            .then(data => {
                $gameVariables.setValue(1261,compareVersions(data.split("\n")[0], $gameVariables.value(207)));
            })
            .catch(error => {
                console.error(`Error: ${error}`);
            });
    }

    function parseVersion(versionString) {
        return versionString.match(/\d+/g).map(Number);
    }

    function compareVersions(version1, version2) {
        const v1 = parseVersion(version1);
        const v2 = parseVersion(version2);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = i < v1.length ? v1[i] : 0;
            const num2 = i < v2.length ? v2[i] : 0;

            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }

        return 0;
    }

    function ImportQuestionFromLocal()
    {
        const fs = require('fs');
        const path = require('path');
        var directoryPath = './www/excelData';
        if ($gameTemp.isPlaytest()) {
            directoryPath = './excelData';
        }

        fs.readdir(directoryPath, (err, files) => {
            const existingData = {};
            const existingExData = {};
            const promises = [];
            files.forEach(file => {
                const filePath = path.join(directoryPath, file);
                if (path.extname(filePath) === '.txt' || path.extname(filePath) === '.csv') {
                    const promise = new Promise((resolve, reject) => {
                        fs.readFile(filePath, 'utf8', (err, data) => {
                            if (path.extname(filePath) === '.txt') {
                                if (err) {
                                    console.error(`ファイル ${file} を読み込む際にエラーが発生しました:`, err);
                                    reject(err);
                                } else {
                                    AddData(existingData, data);
                                    resolve();
                                }
                            } else if (path.extname(filePath) === '.csv') {
                                if (err) {
                                    console.error(`ファイル ${file} を読み込む際にエラーが発生しました:`, err);
                                    reject(err);
                                } else {
                                    AddCsvData(existingExData, data, path.basename(filePath).split('.').slice(0, -1).join('.'));
                                    resolve();
                                }
                            }
                        });
                    });
                    promises.push(promise);
                }
            });
            Promise.all(promises)
                .then(() => {
                    DataManager.saveCustomData(existingData);
                    DataManager.saveCustomExData(existingExData);
                    console.log(existingExData);
                })
                .catch(error => {
                    // Handle errors if needed
                });
        });
    }

    // アプリ版は Cordova で動作していることを利用
    function isApp() {
        return !(typeof cordova === "undefined");
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }

    function AddData(existing, d) {
        const separator = '--------------------------------';
        const sections = d.split(separator);
        for (const section of sections) {
            // CRLF, LF の差異を吸収してから split
            const lines = replaceAll(section, '\r\n', '\n').trim().split('\n');
            var datakey;
            for (const line of lines) {
                if (line === "") continue;
                var [key, value] = line.split(':');
                if (value === "") {
                    if (key === "解２" || key === "解３") {
                        value = "000000000000000000000";
                    } else if (key === "解１" || key === "送前" || key === "送後" || key === "珍回") {
                        value = "　";
                    } else {
                        value = "0";
                    }
                }
                if (key === "問題") {
                    datakey = value;
                    existing[datakey] = {}; // data_toaddオブジェクトを初期化
                    existing[datakey]["8"] = datakey;
                } else {
                    if (keyDictionary[key] != undefined && keyDictionary[key] !== null && keyDictionary[key] !== "") {
                        existing[datakey][keyDictionary[key]] = value;
                        if (Replace == 0) {
                            existing[datakey][keyDictionary[key]] = existing[datakey][keyDictionary[key]].replace(/I\[\d+\]/g, '');
                        }
                    }
                }
            }
        }
    }

    function AddCsvData(existing, data, filename) {
        // CRLF, LF の差異を吸収してから split
        var lines = replaceAll(data, '\r\n', '\n').split('\n');
        var hasPicture = false;
        for (var i = 0; i < lines.length; i++) {
            var rowData = lines[i].split(',');
            if (rowData[3] === "字") {
                lines = lines.slice(i - 1);
                break;
            } else if (rowData[3] === "画") {
                lines = lines.slice(i - 1);
                hasPicture = true;
                break;
            }
        }

        for (var i = 1; i < lines.length - 1; i = i + 2) {
            var firstLine = lines[i].split(',');
            var secondLine;
            if (firstLine.length <= 3) {
                i = i + 1;
                firstLine = lines[i].split(',');
            }
            secondLine = lines[i + 1].split(',');
            if (secondLine.length <= 3) {
                i = i + 1;
                secondLine = lines[i + 1].split(',');
            }

            var id = firstLine[0];
            var answer_Row = parseText(firstLine[1]);
            var answerText_e_1057 = answer_Row[0];
            var answerText_a_1058 = answer_Row[2];
            var answer = answer_Row[1].split('、');
            var splitText = parseText(secondLine[1]);
            var questionText_e = splitText[0];
            var questionText = splitText[1];
            var questionText_a = splitText[2];
            var num_of_chr_14;
            if (firstLine[2] != "") {
                num_of_chr_14 = 1;
            } else {
                num_of_chr_14 = 0;
            }
            var chr_raw = parseText(firstLine[2]);
            var genre_13 = firstLine[4];

            var comment1_19 = firstLine[5];

            var comment2_20 = secondLine[5];
            var level = firstLine[6] + secondLine[6];
            var appendix = "";
            if (firstLine.length >= 8) {
                appendix = firstLine[7] + secondLine[7];
            }
            var color = 1;
            if (parseInt(level) >= 4) {
                color = 2;
            }
            if (parseInt(level) >= 6) {
                color = 3;
            }
            var parent_key = filename + "_" + String(id).padStart(4, '0');
            existing[parent_key] = {};
            var chr = "";
            const isAlphabet = /^[A-Za-z]+$/.test(answer);
            //chr_raw[1]は数字
            //chr_raw[2]は(あるなら)文章
            if (parseInt(chr_raw[1]) != chr_raw[2].length && chr_raw[2] != "") {
                //console.log(`ミスの可能性があります:${parent_key}`);
            }
            if (isAlphabet) {
                if (chr_raw[2] != "") {
                    chr = chr_raw[2].replace(/〇|○/g, '▮');
                } else if (chr_raw[1] != "" && !isNaN(chr_raw[1])) {
                    chr = '▮'.repeat(Number(chr_raw[1]));
                }
            } else {
                if (chr_raw[2] != "") {
                    chr = chr_raw[2].replace(/〇|○/g, '●');
                } else if (chr_raw[1] != "" && !isNaN(chr_raw[1])) {
                    chr = '●'.repeat(Number(chr_raw[1]));
                }
            }

            existing[parent_key]["9"] = addAsteriskBeforeReplacement(answer[0], chr_raw[2]);
            if (answer.length >= 2) {
                existing[parent_key]["10"] = addAsteriskBeforeReplacement(answer[1], chr_raw[2]);
                if (answer.length >= 3) {
                    existing[parent_key]["11"] = addAsteriskBeforeReplacement(answer[2], chr_raw[2]);
                } else {
                    existing[parent_key]["11"] = "000000000000000000000";
                }
            } else {
                existing[parent_key]["10"] = "000000000000000000000";
                existing[parent_key]["11"] = "000000000000000000000";
            }
            chr = convertToFullWidth(chr);
            //existing[parent_key]["6"] = parent_key;
            existing[parent_key]["6"] = id;
            if (hasPicture) {
                existing[parent_key]["8"] = parent_key;
            } else {
                existing[parent_key]["8"] = createDTextString(questionText_e, questionText, questionText_a, chr, color, appendix);
            }
            existing[parent_key]["16"] = 0;
            existing[parent_key]["13"] = genre_13 || "";
            existing[parent_key]["14"] = num_of_chr_14 || 0;
            existing[parent_key]["18"] = createString(questionText_e, questionText, questionText_a);
            existing[parent_key]["19"] = comment1_19.replace(/，/g, `,`) || "　";
            existing[parent_key]["20"] = comment2_20.replace(/，/g, `,`) || "　";
            existing[parent_key]["Level"] = level;
            if (parseInt(questionText_e.length) + parseInt(questionText.length) + parseInt(questionText_a.length) >= 8) {
                existing[parent_key]["169"] = "2";
            } else if (parseInt(questionText_e.length) + parseInt(questionText.length) + parseInt(questionText_a.length) >= 5) {
                existing[parent_key]["169"] = "1";
            } else {
                existing[parent_key]["169"] = "0";
            }
            existing[parent_key]["992"] = "";
            existing[parent_key]["1057"] = answerText_e_1057 || "　";
            existing[parent_key]["1058"] = answerText_a_1058 || "　";
        }

    }

    function addAsteriskBeforeReplacement(A, B) {
        if (A.length !== B.length) {
            return A;
        }

        let result = '';

        for (let i = 0; i < A.length; i++) {
            if (A[i] == B[i]) {
                result += '₨';
            }

            // 文字を追加
            result += A[i];
        }

        return result;
    }

    DataManager.saveCustomData = function (data) {
        this._NormalQuestionData = data;
    };
    DataManager.loadCustomData = function () {
        return this._NormalQuestionData || [];
    };
    DataManager.saveCustomExData = function (data) {
        this._ExtraQuestionData = data;
    };
    DataManager.loadCustomExData = function () {
        return this._ExtraQuestionData || [];
    };

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'Qjson') {
            var list = DataManager.loadCustomData();
            var dict = list[args[0]];
            try {
                for (const [key, value] of Object.entries(dict)) {
                    if (value != "000000000000000000000") {
                        $gameVariables.setValue(parseInt(key), parseOrReturnOriginal(value));
                    } else {
                        $gameVariables.setValue(parseInt(key), value);
                    }
                }
            } catch (e) {
              if ($gameVariables.value(1169) == 0) {
                if (!(typeof cordova === "undefined")) {
                    $gameScreen.showPicture(100, "Tips_Error_sp", 1, 640, 360, 100, 100, 0, 0);
                    $gameScreen.movePicture(100, 1, 640, 360, 100, 100, 255, 0, 10);
                    this.wait(10);
                } else if (Utils.isNwjs()) {
                    $gameScreen.showPicture(100, "Tips_Error_D", 1, 640, 360, 100, 100, 0, 0);
                    $gameScreen.movePicture(100, 1, 640, 360, 100, 100, 255, 0, 10);
                    this.wait(10);
                } else {
                    $gameScreen.showPicture(100, "Tips_Error_W", 1, 640, 360, 100, 100, 0, 0);
                    $gameScreen.movePicture(100, 1, 640, 360, 100, 100, 255, 0, 10);
                    this.wait(10);
                }
              }
                $gameVariables.setValue(1169,1);
            }
        }
        else if (command === 'ExQjson') {
            var list = DataManager.loadCustomExData();
            var dict = list[args[0]];
            if (dict) {
                for (const [key, value] of Object.entries(dict)) {
                    if (value != "000000000000000000000") {
                        $gameVariables.setValue(parseInt(key), parseOrReturnOriginal(value));
                    } else {
                        $gameVariables.setValue(parseInt(key), value);
                    }
                }
            } else {
            }
        } else if (command === 'GetTotalQuestionNum') {
            const stage_name = args[0];
            const difficulty = parseInt(args[1]);
            const data = DataManager.loadCustomExData();
            const indexesToInclude = [];
            for (const key in data) {
                if (key.includes(stage_name) && difficulty == parseInt(data[key]["Level"])) {
                    indexesToInclude.push(data[key]);
                }
            }
            $gameVariables.setValue(681, indexesToInclude.length);
        } else if (command === 'Ex_Generator') {
            try {
                ExtraGenerator();
            } catch (e) {
                console.log(e);
            }
        } else if (command === 'CalculateTheQuestionLength') {
            $gameVariables.setValue(length_tmp, pureText($gameVariables.value(8).toString()).length);
        } else if (command === 'CompareGitHubVersion') {
            CompareVersionFile();
        }
    };
    function parseOrReturnOriginal(inputString) {
        const parsedInt = parseInt(inputString);

        if (!isNaN(parsedInt)) {
            return parsedInt;
        } else {
            return inputString;
        }
    }
    function createString(A, B, C) {
        let result = "";

        if (A.length > C.length) {
            result += "1".repeat(A.length - C.length);
            result += "2".repeat(B.length);
        } else if (A.length < C.length) {
            result += "2".repeat(B.length);
            result += "1".repeat(C.length - A.length);
        } else {
            result += "2".repeat(B.length);
        }

        return result;
    }
    function createDTextString(A, B, C, chr, color, appendix) {
        if (appendix != "" && chr != "") {
            if (appendix.includes("【")) {
                appendix = appendix + "　";
            }
            return `[\\OC[rgba(0,0,0,1)]\\C[0]${A}]\\C[${color}]<${B}|[\\C[15]${chr}]>\\C[0][${C}]㊦${appendix}㊦`;
        }
        else if (chr != "") {
            return `[\\OC[rgba(0,0,0,1)]\\C[0]${A}]\\C[${color}]<${B}|[\\C[15]${chr}]>\\C[0][${C}]`;
        }
        return `[\\OC[rgba(0,0,0,1)]\\C[0]${A}]\\C[${color}]${B}\\C[0][${C}]`;
    }

    function convertToFullWidth(input) {
        return input.replace(/[a-zA-Z]/g, function (char) {
            return String.fromCharCode(char.charCodeAt(0) + 0xfee0);
        });
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
    async function ExtraGenerator() {
        if ($gameVariables.value(15) != 901) {
            const data = DataManager.loadCustomExData();
            var stagename = "";
            if ($gameVariables.value(15) == 902) {
                stagename = 'LvEnglish';
            } else if ($gameVariables.value(15) == 903) {
                stagename = 'LvGenso';
            }
            const filteredData = Object.keys(data)
                .filter(key => key.includes(stagename))
                .reduce((result, key) => {
                    result[key] = data[key];
                    return result;
                }, {});
            $gameSwitches.setValue(60, false);
            var num;

            if ($gameVariables.value(1102) == 0) {
                num = 7;
            }
            else if ($gameVariables.value(1102) == 1) {
                num = 8;
            }
            else if ($gameVariables.value(1102) == 2) {
                num = 10;
            }
            for (var difficulty = 1; difficulty < 5; difficulty++) {
                const indexesToInclude = [];
                var i = difficulty + $gameVariables.value(1117);
                if ($gameVariables.value(1117) >= 10) {
                    i = $gameVariables.value(1117) - 10;
                }
                for (const key in filteredData) {
                    if (i == 0 || i == parseInt(filteredData[key]["Level"])) {
                        indexesToInclude.push(filteredData[key]);
                    }
                }
                $gameVariables.setValue(1128 + difficulty, indexesToInclude.length);
            }
            $gameVariables.setValue(290, 1);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 2);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 3);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 4);
            await SetQuestionIndex(stagename, data, 2);
            $gameVariables.setValue(7, $gameVariables.value(1133));
            $gameVariables.setValue(290, 1);
            $gameSwitches.setValue(184, true);
        } else {
            var num;

            if ($gameVariables.value(1102) == 0) {
                num = 7;
            }
            else if ($gameVariables.value(1102) == 1) {
                num = 8;
            }
            else if ($gameVariables.value(1102) == 2) {
                num = 10;
            }
            for (var difficulty = 1; difficulty < 5; difficulty++) {
                $gameVariables.setValue(1128 + difficulty, "？？？");
            }
            $gameVariables.setValue(290, 1);
            await SetQuestionIndexMath(num);
            $gameVariables.setValue(290, 2);
            await SetQuestionIndexMath(num);
            $gameVariables.setValue(290, 3);
            await SetQuestionIndexMath(num);
            $gameVariables.setValue(290, 4);
            await SetQuestionIndexMath(2);
            $gameVariables.setValue(7, $gameVariables.value(1133));
            $gameVariables.setValue(290, 1);
            usedFileNames = [];
            $gameSwitches.setValue(184, true);
        }

    }

    function generateUniqueFileNum(stage_name) {
        var fileNum;
        var retryCount = 0;
        var difficulty = 0;
        if ($gameVariables.value(1117) >= 10 && $gameVariables.value(15) == 902) {
            difficulty = $gameVariables.value(1117) - 10;
        } else if ($gameVariables.value(1117) == 1 && $gameVariables.value(15) == 902) {
            difficulty = $gameVariables.value(290) + 1;
        } else {
            difficulty = $gameVariables.value(290);
        }
        do {
            $gameMap._interpreter.pluginCommand("EXRGen", [stage_name, "100", String(difficulty)]);
            fileNum = $gameVariables.value(6);
            retryCount++;
            if (retryCount >= 500) {
                usedFileNames = [];
                retryCount = 0;
            }
        } while (usedFileNames.includes(fileNum));
        usedFileNames.push(fileNum);
        return fileNum;
    }
    async function SetQuestionIndex(stage_name, data, count) {
        const difficulty = $gameVariables.value(290);
        for (let i = 0; i < count; i++) {
            var filenum = generateUniqueFileNum(stage_name);
            if (count == 7 || count == 8 || count == 10) {
                if (i < count - 5) {
                    // 本筋
                    $gameVariables.setValue(7, difficulty * (count - 5) - count + 6 + i);
                } else if (i == count - 5) {
                    // いれかえ
                    $gameVariables.setValue(380, difficulty);
                } else {
                    // 残機
                    $gameVariables.setValue(774, i - (count - 5) + difficulty * 4 - 4);
                }
            } else {
                if (i == 0) {
                    var num = 10;
                    if ($gameVariables.value(1102) == 0) {
                        num = 7;
                    } else if ($gameVariables.value(1102) == 2) {
                        num = 16;
                    }
                    $gameVariables.setValue(7, num);
                } else {
                    $gameVariables.setValue(380, 4);
                }
            }

            var stagename = "";
            if ($gameVariables.value(15) == 902) {
                stagename = 'LvEnglish_';
            } else if ($gameVariables.value(15) == 903) {
                stagename = 'LvGenso_';
            }

            if ($gameVariables.value(1133) >= 1) {
                if ($gameVariables.value(380) >= 1 && $gameVariables.value(545 + $gameVariables.value(380)) != 0) {
                    filenum = $gameVariables.value(545 + $gameVariables.value(380));
                } else if ($gameVariables.value(774) >= 1 && $gameVariables.value(804 - 12 + 12 * $gameVariables.value(774)) != 0) {
                    filenum = $gameVariables.value(804 - 12 + 12 * $gameVariables.value(774));
                } else if ($gameVariables.value(380) == 0 && $gameVariables.value(774) == 0 && $gameVariables.value(110 + $gameVariables.value(7)) != 0) {
                    filenum = $gameVariables.value(110 + $gameVariables.value(7));
                }

            }
            var fileName = stagename + String(filenum).padStart(4, '0');

            //console.log(`現在、変数7は${$gameVariables.value(7)}、変数380は${$gameVariables.value(380)}、変数774は${$gameVariables.value(774)}になっています。`);
            //console.log(`格納される問題は${filenum}、${$gameVariables.value(290)}です。この状態でコモンイベント7を実行します。`);

            $gameVariables.setValue(13, 0);
            $gameVariables.setValue(17, 0);
            try {
                for (const [key, value] of Object.entries(data[fileName])) {
                    if (!isNaN(key)) {
                        $gameVariables.setValue(parseInt(key), parseOrReturnOriginal(value));
                        if (key == "13") {
                            if (value == "生" || value == "動") {
                                $gameVariables.setValue(13, 1);
                                $gameVariables.setValue(17, 1);
                            } else if (value == "地" || value == "建") {
                                $gameVariables.setValue(13, 2);
                                $gameVariables.setValue(17, 2);
                            } else if (value == "植" || value == "草" || value == "木") {
                                $gameVariables.setValue(13, 3);
                                $gameVariables.setValue(17, 3);
                            } else if (value == "人" || value == "名") {
                                $gameVariables.setValue(13, 4);
                                $gameVariables.setValue(17, 4);
                            } else if (value == "則") {
                                $gameVariables.setValue(13, 10);
                                $gameVariables.setValue(17, 10);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }

            //回答記憶
            $gameTemp.reserveCommonEvent(7);
            await waitForCommonEventToEnd(7);

            //変数リセット
            $gameVariables.setValue(380, 0);
            $gameVariables.setValue(774, 0);
        }
    }

    async function SetQuestionIndexMath(count) {
        const difficulty = $gameVariables.value(290);
        for (let i = 0; i < count; i++) {
            if (count == 7 || count == 8 || count == 10) {
                if (i < count - 5) {
                    // 本筋
                    $gameVariables.setValue(7, difficulty * (count - 5) - count + 6 + i);
                } else if (i == count - 5) {
                    // いれかえ
                    $gameVariables.setValue(380, difficulty);
                } else {
                    // 残機
                    $gameVariables.setValue(774, i - (count - 5) + difficulty * 4 - 4);
                }
            } else {
                if (i == 0) {
                    var num = 10;
                    if ($gameVariables.value(1102) == 0) {
                        num = 7;
                    } else if ($gameVariables.value(1102) == 2) {
                        num = 16;
                    }
                    $gameVariables.setValue(7, num);
                } else {
                    $gameVariables.setValue(380, 4);
                }
            }

            MathQuestion();
            var color = 2;
            if (difficulty <= 3) {
                color = 1;
            }
            const roundedLength = calculateLength($gameVariables.value(8).toString());
            const colored_text = $gameVariables.value(8).toString().replace(/＋/g, `\\C[0]＋\\C[${color}]`).replace(/－/g, `\\C[0]－\\C[${color}]`).replace(/×/g, `\\C[0]×\\C[${color}]`).replace(/÷/g, `\\C[0]÷\\C[${color}]`).replace(/＝/g, `\\C[0]＝\\C[${color}]`);
            const q_text = `[\\C[0]]\\C[${color}]${colored_text}`;
            $gameVariables.setValue(8, q_text);
            $gameVariables.setValue(9, $gameVariables.value(9).toString());
            $gameVariables.setValue(10, "000000000000000000000");
            $gameVariables.setValue(11, "000000000000000000000");
            $gameVariables.setValue(13, "");
            $gameVariables.setValue(14, 0);
            $gameVariables.setValue(16, 0);
            $gameVariables.setValue(18, parseInt('2'.repeat(Math.min(roundedLength,9))));
            $gameVariables.setValue(19, "　");
            $gameVariables.setValue(20, "　");
            if (roundedLength >= 8) {
                $gameVariables.setValue(169, 2);
            } else if (roundedLength >= 5) {
                $gameVariables.setValue(169, 1);
            } else {
                $gameVariables.setValue(169, 0);
            }
            $gameVariables.setValue(992, "");
            $gameVariables.setValue(1057, "　");
            $gameVariables.setValue(1058, "　");

            //console.log(`現在、変数7は${$gameVariables.value(7)}、変数380は${$gameVariables.value(380)}、変数774は${$gameVariables.value(774)}になっています。`);
            //console.log(`格納される問題は${q_text}です。この状態でコモンイベント7を実行します。`);
            //回答記憶
            $gameTemp.reserveCommonEvent(7);
            await waitForCommonEventToEnd(7);

            //変数リセット
            $gameVariables.setValue(380, 0);
            $gameVariables.setValue(774, 0);
        }
    }

    function calculateLength(math_length) {
        let length = 0;

        for (let i = 0; i < math_length.length; i++) {
            const char = math_length.charAt(i);

            // 半角英数字または半角スペースの場合は1を加算
            if (/[\w ]/.test(char)) {
                length += 1;
            } else {
                // それ以外の文字の場合は2を加算
                length += 2;
            }
        }
        // 2で割り、結果を切り上げる
        return Math.ceil(length / 2);
    }
    function MathQuestion() {
        var q = parseInt($gameVariables.value(7));
        Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 10 * $gameVariables.value(380) + 100 * $gameVariables.value(774));
        const randomIndex = Math.floor(Math.random() * 5);
        var thresholds = [2, 5, 7, 10, 12, 15, 16];
        var max = 6;
        if ($gameVariables.value(1102) == 0) {
            thresholds = [1, 3, 5, 7];
            max = 3;
        } else if ($gameVariables.value(1102) == 1) {
            thresholds = [1, 2, 4, 5, 7, 10];
            max = 5;
        }
        phase = max;
        if ($gameVariables.value(1117) >= 10) {
            phase = Math.min($gameVariables.value(1117) - 10,13);
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
        }
        $gameMap._interpreter.pluginCommand("MakeMathQuestion", question_seed[phase][randomIndex]);
    }

    const question_seed = [
        [["1", "0", "1"], ["1", "1", "0"], ["1", "2", "0"], ["2", "0", "1"], ["1", "1", "0", "□"]],
        [["1", "1", "1"], ["2", "2", "0"], ["2", "2", "0"], ["2", "1", "1"], ["1", "1", "1", "□"]],
        [["3", "2", "0"], ["3", "0", "1"], ["2", "1", "1"], ["1", "1", "2"], ["2", "1", "1", "□"]],
        [["3", "3", "0"], ["3", "1", "2"], ["4", "1", "1"], ["5", "2", "0"], ["3", "2", "0", "□"]],
        [["5", "0", "1"], ["6", "1", "0"], ["4", "1", "1"], ["4", "1", "2"], ["4", "1", "1", "□"]],
        [["5", "2", "0"], ["4", "2", "1"], ["4", "1", "2"], ["4", "1", "1", "□"], ["5", "2", "0", "□"]],
        [["6", "0", "1"], ["7", "2", "0"], ["5", "1", "2"], ["7", "2", "0", "□"], ["6", "1", "1", "□"]],
        [["7", "0", "1"], ["7", "1", "0"], ["7", "2", "0"], ["6", "1", "1", "□"], ["7", "2", "0", "□"]],
        [["7", "1", "1"], ["8", "2", "0"], ["8", "2", "0"], ["8", "1", "1"], ["7", "1", "1", "□"]],
        [["9", "2", "0"], ["9", "0", "1"], ["8", "1", "1"], ["7", "1", "2"], ["8", "1", "1", "□"]],
        [["9", "3", "0"], ["9", "1", "2"], ["10", "1", "1"], ["11", "2", "0"], ["9", "2", "0", "□"]],
        [["11", "0", "1"], ["12", "1", "0"], ["10", "1", "1"], ["10", "1", "2"], ["10", "1", "1", "□"]],
        [["11", "2", "0"], ["10", "2", "1"], ["10", "1", "2"], ["10", "1", "1", "□"], ["11", "2", "0", "□"]],
        [["12", "0", "1"], ["12", "3", "0"], ["11", "1", "2"], ["12", "3", "0", "□"], ["12", "1", "1", "□"]]
        ];
    function pureText(text) {
        return text.replace(/\\C\[[^\]]+\]/g, "").replace(/\\OC\[[^\]]+\]/g, "").replace(/\\ow\[\d+\]/g, "").replace(/\|(.*?)>/g, "").replace(/\[|\]/g, "").replace(/</g, "").replace(/㊦[^㊦]*㊦/g, '');
    }
    async function waitForCommonEventToEnd(eventId) {
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (!$gameTemp.isCommonEventReserved(eventId)) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 10); // 1ミリ秒ごとに確認
        });
    }
})();
