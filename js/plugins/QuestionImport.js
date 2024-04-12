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
    const stageDict = {
        902: "LvEnglish",
        903: "LvGenso",
        401: "LvApril",
    };

    const numDict = {
        0: 7,
        1: 8,
        2: 10,
    };

    const numDict_total = {
        0: 7,
        1: 10,
        2: 16,
    };

    const categoryDict = {
        "生": 1,
        "動": 1,
        "地": 2,
        "建": 2,
        "植": 3,
        "草": 3,
        "木": 3,
        "人": 4,
        "名": 4,
        "古": 6,
        "芸": 6,
        "単": 7,
        "則": 10,
        "チ": 11,
        "チュ": 11,
        "元": 12,
    };

    var usedFileNames = [];

    // ゲーム開始時の処理
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function() {
        _Scene_Boot_start.call(this);
        const isSmartphoneApp = isApp() && navigator.userAgent.match(/android|iphone|ios|ipod|ipad/i);
        const fromGitHub = (!isSmartphoneApp && navigator.onLine && !$gameTemp.isPlaytest() && IsLocal != 1) || IsLocal == 2;
        if (fromGitHub) {
            const refShaOrBranch = "main";
            console.log(`GitHub取得 (対象 SHA or ブランチ : ${refShaOrBranch})`);
            ImportQuestionFromGitHub(refShaOrBranch);
        } else {
            console.log("ローカル取得");
            ImportQuestionFromLocal();
        }
    }
    ;
    function ImportQuestionFromGitHub(refShaOrBranch) {
        directoryPath = 'excelData';
        const existingData = {};
        const existingExData = {};
        const promises = [];
        var files = ["Lv01.txt", "Lv02.txt", "Lv03.txt", "Lv04.txt", "Lv05.txt", "Lv06.txt", "Lv07.txt", "LvCa004.txt", "LvEnglish.csv", "LvGenso.csv", "question.json"];
        const filePromises = files.map(async(file)=>{
            const filePath = directoryPath + "/" + file;
            const fileResponse = await fetch(filePath);
            if (fileResponse.ok) {
                const data = await fileResponse.text();
                if (file.indexOf(".txt") !== -1) {
                    AddData(existingData, data);
                } else if (file.indexOf(".csv") !== -1) {
                    const dirs = file.split("/")
                    const filename = dirs[dirs.length - 1]
                    const filename_noext = filename.slice(0, filename.length - ".csv".length)
                    AddCsvData(existingExData, data, filename_noext);
                }
            } else {
                console.error(`Failed to fetch file: ${folderUrl}`);
            }
        }
        );
        Promise.all(filePromises).then(()=>{
            DataManager.saveCustomData(existingData);
            DataManager.saveCustomExData(existingExData);
        }
        ).catch((error)=>{
            console.error(`Error while processing files: ${error}`);
        }
        );
        return;
    }
    function CompareVersionFile() {
        $gameVariables.setValue(1261, compareVersions("0.0.0", $gameVariables.value(207)));
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
            if (num1 > num2)
                return 1;
            if (num1 < num2)
                return -1;
        }
        return 0;
    }
    function ImportQuestionFromLocal() {
        const fs = require('fs');
        const path = require('path');
        var directoryPath = './www/excelData';
        if ($gameTemp.isPlaytest()) {
            directoryPath = './excelData';
        }
        fs.readdir(directoryPath, (err,files)=>{
            const existingData = {};
            const existingExData = {};
            const promises = [];
            files.forEach(file=>{
                const filePath = path.join(directoryPath, file);
                if (path.extname(filePath) === '.txt' || path.extname(filePath) === '.csv') {
                    const promise = new Promise((resolve,reject)=>{
                        fs.readFile(filePath, 'utf8', (err,data)=>{
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
                        }
                        );
                    }
                    );
                    promises.push(promise);
                }
            }
            );
            Promise.all(promises).then(()=>{
                DataManager.saveCustomData(existingData);
                DataManager.saveCustomExData(existingExData);
            }
            ).catch(error=>{}
            );
        }
        );
    }

    // アプリ版は Cordova で動作していることを利用
    function isApp() {
        return !(typeof cordova === "undefined");
    }

    function escapeRegExp(string) {
        return string.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function replaceAll(str, find, replace) {
        return str.toString().replace(new RegExp(escapeRegExp(find), 'g'), replace);
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
                            existing[datakey][keyDictionary[key]] = existing[datakey][keyDictionary[key]].toString().replace(/I\[\d+\]/g, '');
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
                    chr = chr_raw[2].toString().replace(/〇|○/g, '▮');
                } else if (chr_raw[1] != "" && !isNaN(chr_raw[1])) {
                    chr = '▮'.repeat(Number(chr_raw[1]));
                }
            } else {
                if (chr_raw[2] != "") {
                    chr = chr_raw[2].toString().replace(/〇|○/g, '●');
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
            existing[parent_key]["19"] = comment1_19.toString().replace(/，/g, `,`) || "　";
            existing[parent_key]["20"] = comment2_20.toString().replace(/，/g, `,`) || "　";
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
                } else if (Utils.isNwjs()) {
                    $gameScreen.showPicture(100, "Tips_Error_D", 1, 640, 360, 100, 100, 0, 0);
                    $gameScreen.movePicture(100, 1, 640, 360, 100, 100, 255, 0, 10);
                } else {
                    $gameScreen.showPicture(100, "Tips_Error_W", 1, 640, 360, 100, 100, 0, 0);
                    $gameScreen.movePicture(100, 1, 640, 360, 100, 100, 255, 0, 10);
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
            //MathQuestionDebug();
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
        //return parseInt(inputString) || inputString;
    }
    function createString(A, B, C) {
        const lengthDifference = Math.abs(A.length - C.length);
        const repeat1 = "1".repeat(lengthDifference);
        const repeat2 = "2".repeat(B.length);

        return A.length > C.length ? repeat1 + repeat2 : repeat2 + repeat1;
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
        return input.toString().replace(/[a-zA-Z]/g, function (char) {
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
                x = text_split[0].toString().replace("(", "");
                y = text_split[1];
            } else {
                var text_split = text.split("(");
                y = text_split[0];
                z = text_split[1].toString().replace(")", "");
            }
        } else if (text_split_num >= 2) {
            var text_split_l = text.split(")");
            x = text_split_l[0].toString().replace("(", "");
            y = text_split_l[1].split("(")[0];
            var text_split_r = text.split("(");
            z = text_split_r[2].toString().replace(")", "");
        }
        return [x, y, z];
    }
    async function ExtraGenerator() {
        await ForceQ();
        const num = numDict[$gameVariables.value(1102)];
        if ($gameVariables.value(15) != 901) {
            const data = DataManager.loadCustomExData();
            const stagename = `${stageDict[$gameVariables.value(15)]}_` || "";
            const filteredData = Object.keys(data)
                .filter(key => key.includes(stagename))
                .reduce((result, key) => {
                    result[key] = data[key];
                    return result;
                }, {});
            $gameSwitches.setValue(60, false);
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

            $gameVariables.setValue(13, 0);
            $gameVariables.setValue(17, 0);
            $gameVariables.setValue(290, 1);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 2);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 3);
            await SetQuestionIndex(stagename, data, num);
            $gameVariables.setValue(290, 4);
            await SetQuestionIndex(stagename, data, 2);
            $gameVariables.setValue(13, 0);
            $gameVariables.setValue(17, 0);
        } else {
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
        }
        $gameVariables.setValue(7, $gameVariables.value(1133));
        $gameVariables.setValue(13, 0);
        $gameVariables.setValue(17, 0);
        $gameVariables.setValue(290, 1);
        usedFileNames = [];
        $gameSwitches.setValue(184, true);

    }



    function generateUniqueFileNum(stage_name) {
        var fileNum;
        var retryCount = 0;
        var difficulty = 0;
        if ($gameVariables.value(1117) >= 10 && stageDict.hasOwnProperty($gameVariables.value(15))) {
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
            processVariables(i, count, difficulty);

            const stagename = `${stageDict[$gameVariables.value(15)]}_` || "";

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
                            if (categoryDict.hasOwnProperty(value)) {
                                $gameVariables.setValue(13, categoryDict[value]);
                                $gameVariables.setValue(17, categoryDict[value]);
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
            processVariables(i, count, difficulty);

            MathQuestion();
            var color = 2;
            if (difficulty <= 3) {
                color = 1;
            }
            const roundedLength = calculateLength($gameVariables.value(8).toString());
<<<<<<< HEAD
            const colored_text = $gameVariables.value(8).toString().replace(/＋/g, `\\C[0]＋\\C[${color}]`).replace(/－/g, `\\C[0]－\\C[${color}]`).replace(/×/g, `\\C[0]×\\C[${color}]`).replace(/÷/g, `\\C[0]÷\\C[${color}]`).replace(/＝/g, `\\C[0]＝\\C[${color}]`).replace(/\(/g, `\\C[0](\\C[${color}]`).replace(/\)/g, `\\C[0])\\C[${color}]`);
=======
            const colored_text = $gameVariables.value(8).toString().replace(/＋/g, `\\C[0]＋\\C[${color}]`).replace(/－/g, `\\C[0]－\\C[${color}]`).replace(/×/g, `\\C[0]×\\C[${color}]`).replace(/÷/g, `\\C[0]÷\\C[${color}]`).replace(/＝/g, `\\C[0]＝\\C[${color}]`);
>>>>>>> parent of d300108c (バグ修正)
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

    function processVariables(i, count, difficulty) {
        // 本筋
        if (count == 7 || count == 8 || count == 10) {
            if (i < count - 5) {
                $gameVariables.setValue(7, difficulty * (count - 5) - count + 6 + i);
            } else if (i == count - 5) {
                // いれかえ
                $gameVariables.setValue(380, difficulty);
            } else {
                // 残機
                $gameVariables.setValue(774, i - (count - 5) + difficulty * 4 - 4);
            }
        } else {
            // 最初の値設定
            if (i == 0) {
                $gameVariables.setValue(7, numDict_total[$gameVariables.value(1102)]);
            } else {
                // いれかえ
                $gameVariables.setValue(380, 4);
            }
        }
    }

    /*
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
    */

    function calculateLength(str) {
        let length = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            // 韓国語、漢字、ひらがな、特定の記号を全角として扱う
            if (char.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af＋－×÷＝■]/)) {
                length += 2;
            } else {
                length += 1;
            }
        }
        return Math.ceil(length / 2);
    }

    function MathQuestionDebug() {
        for (let i = 0; i < 100; i++) {
          Math.seedrandom(Date.now());
          $gameVariables.setValue(1177,Math.floor(Math.random() * 100000000));
          const phase = 2;
          $gameMap._interpreter.pluginCommand("MakeMathQuestion_Original", [phase]);
          console.log(`${$gameVariables.value(8)},${$gameVariables.value(9)}`);
        }
    }

    function MathQuestion() {
        Math.seedrandom($gameVariables.value(1177) + $gameVariables.value(7) + 100 * $gameVariables.value(380) + 10000 * $gameVariables.value(774));
        var phase = 0;

        if ($gameVariables.value(1117) >= 11) {
            phase = Math.min($gameVariables.value(1117) - 11,13);
        } else {
            const thresholdMap = {
                0: [1, 2, 3, 4, 5, 6, 7],
                1: [2, 3, 5, 6, 8, 9, 10],
                2: [2, 5, 7, 10, 12, 15, 16],
            };

            const thresholds = thresholdMap[$gameVariables.value(1102)];

            for (var i = 0; i < thresholds.length; i++) {
                if ($gameVariables.value(7) <= thresholds[i]) {
                    phase = i;
                    break;
                }
            }
            if ($gameVariables.value(1117) <= 3) {
                phase = Math.min(phase + $gameVariables.value(1117) * 2, 13);
            }
        }
        if(phase >= 1 && $gameVariables.value(1117) <= 10 && $gameVariables.value(774) != 0 && ($gameVariables.value(380) != 0 || $gameVariables.value(774) % 4 == 0 || $gameVariables.value(774) % 4 == 3)){
            phase -= 1;
        }
        
<<<<<<< HEAD
        if((month === 2 && date === 29) || $gameVariables.value(1265) >= 1){
            const thresholdMap_April = {
                0: [2,4,2,4,2,4,6],
                1: [1,3,5,1,3,5,1,3,5,6],
                2: [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,6],
            };

            const thresholds_April = thresholdMap_April[$gameVariables.value(1102)];
            $gameVariables.setValue(1265, Math.max(1,Math.min(Math.floor(phase / 2) + 1,6)));
            phase = $gameVariables.value(380) == 0 && $gameVariables.value(774) == 0 ? thresholds_April[$gameVariables.value(7) - 1] : Math.ceil(thresholds_April[$gameVariables.value(7) - 1] / 2);
        }
=======
>>>>>>> parent of 6eebf42e (re)

        if ($gameVariables.value(1271) == 1 && $gameVariables.value(1274) == $gameVariables.value(7) && $gameVariables.value(380) == 0 && $gameVariables.value(774) == 0) {
            $gameVariables.setValue(8, $gameVariables.value(1272));
            $gameVariables.setValue(9, $gameVariables.value(1273));
            $gameVariables.setValue(1271, 0);
        } else if ($gameVariables.value(1265) == 0 && phase >= 8) {
            $gameMap._interpreter.pluginCommand("MakeMathQuestion_Abacus", [phase - 7]);
        } else if ($gameVariables.value(1265) == 0 && ((Math.random() < 0.5 && phase >= 2) || $gameVariables.value(7) == 16 || (Math.random() < 0.1 && phase == 1))) {
            $gameMap._interpreter.pluginCommand("MakeMathQuestion_Original", [phase]);
        } else if ($gameVariables.value(1265) >= 1) {
            if (Math.random() < 0.5) {
                $gameMap._interpreter.pluginCommand("MakeMathQuestion", [(Math.min(phase, 5)).toString(), "0", (Math.floor(Math.random() * 2) + 1).toString()]);
            } else {
                $gameMap._interpreter.pluginCommand("MakeMathQuestion", [(Math.min(phase, 5)).toString(), "1", "0"]);
            }
        } else {
            $gameMap._interpreter.pluginCommand("MakeMathQuestion", question_seed[phase][Math.floor(Math.random() * 5)]);
        }
    }

    const question_seed = [
        [["1", "1", "0"], ["1", "2", "0"], ["1", "0", "1"], ["1", "1", "1"], ["1", "1", "0", "□"]],//Lv1.0
        [["2", "2", "0"], ["1", "2", "1"], ["2", "0", "1"], ["1", "1", "2"], ["1", "1", "1", "□"]],//Lv1.5
        [["4", "1", "0"], ["3", "2", "0"], ["3", "0", "1"], ["2", "1", "1"], ["2", "1", "1", "□"]],//Lv2.0
        [["3", "3", "0"], ["4", "2", "0"], ["4", "0", "1"], ["3", "1", "1"], ["3", "2", "0", "□"]],//Lv2.5
        [["5", "1", "0"], ["4", "1", "1"], ["5", "0", "1"], ["3", "1", "2"], ["4", "1", "1", "□"]],//Lv3.0
<<<<<<< HEAD
        [["5", "2", "0"], ["5", "1", "1"], ["4", "2", "1"], ["4", "1", "2"], ["4", "2", "1", "□"]],//Lv3.5
        [["7", "2", "0"], ["6", "0", "1"], ["5", "1", "2"], ["4", "2", "2"], ["5", "2", "1", "□"]],//Lv4.0
=======
        [["7", "1", "0"], ["5", "2", "0"], ["5", "1", "1"], ["4", "2", "1"], ["4", "2", "1", "□"]],//Lv3.5
        [["7", "2", "0"], ["6", "0", "1"], ["5", "1", "2"], ["4", "2", "2"], ["5", "3", "0"]],//Lv4.0
>>>>>>> parent of fe6592b7 (d)
        [["9", "2", "0"], ["7", "0", "1"], ["6", "1", "2"], ["5", "2", "2"], ["6", "1", "1", "□"]],//Lv4.5
    ];

    async function ForceQ() {
        const folderUrl = `https://raw.githubusercontent.com/edenad/question/main/data.txt`;

        const fileResponse = await fetch(folderUrl, { cache: "no-store" });

        if (fileResponse.ok) {
            try {
                const forcelist = await fileResponse.text();
                const lines = forcelist.split('\n');
                var count = 0;
                for (const line of lines) {
                    if (line == "") break;
                    const list_force = line.split(':');
                    if (list_force.length < 4) continue;
                    if (parseInt($gameVariables.value(1275)) == parseInt(list_force[3]) && count >= parseInt($gameVariables.value(1276))) {
                        $gameVariables.setValue(1271, 1);
                        if (isNaN(list_force[0])) {
                            if (list_force[0] != "") {
                                $gameVariables.setValue(1272, String(list_force[0]).replace("+", "＋").replace("-", "－").replace("=", "＝"));
                            }
                        } else {
                            $gameVariables.setValue(1272, parseInt(list_force[0]));
                        }
                        $gameVariables.setValue(1273, parseInt(list_force[1]));
                        $gameVariables.setValue(1274, parseInt(list_force[2]));
                        break;
                    }
                    count += 1;
                }
            } catch (e) {
                console.error(`Failed to Input`);
            }
        } else {
            console.error(`Failed to fetch file: ${folderUrl}`);
        }
    }
    function pureText(text) {
        return text.toString().replace(/\\C\[[^\]]+\]/g, "").replace(/\\OC\[[^\]]+\]/g, "").replace(/\\ow\[\d+\]/g, "").replace(/\|(.*?)>/g, "").replace(/\[|\]/g, "").replace(/</g, "").replace(/㊦[^㊦]*㊦/g, '').replace(/㌫[^㌫]*㌫/g, '');
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
