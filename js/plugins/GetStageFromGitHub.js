//=============================================================================
// GetStageFromGitHub
//=============================================================================
/*:
 * @plugindesc GitHubからエディットステージを持ってくる関数。
 *
 * @author chuukunn
 *
 * @param extra_page
 * @desc エディットステージのページ管理。
 * @type number
 * @default 1121
 *
 * @param extra_sub_place
 * @desc エディットステージのページ内位置管理。
 * @type number
 * @default 1122
 *
 * @param font_edit
 * @desc テキストのフォント
 * @type string
 * @default NotoSansJP-Bold
 *
 * @param font_outline
 * @desc アウトラインを描画は重いが確実な方にするか決めるためのスイッチ
 * @type number
 * @default 1179
 *
 */
//=============================================================================

(function () {
    var parameters = PluginManager.parameters('GetStageFromGitHub');
    var extra_page = Number(parameters['extra_page'] || 1172);
    var extra_sub_place = Number(parameters['extra_sub_place'] || 1173);

    const force = Number(parameters['font_outline'] || 1179);

    var font_edit = (parameters['font_edit'] || "NotoSansJP-Bold");

    const userName = 'edenad';
    const repoName = 'question';
    var pictureNum = parseInt(100);

    const isLong = 7;
    const isTooLong = 11;
    const isVeryLong = 15;
    const size1_default = 250;
    const size2_long = 200;
    const size3_toolong = 150;
    const size4_verylong = 100;

    const offset_switch = 281;

    function SetEditStageList(data) {
        this._EditStageList = data;
    }
    function GetEditStageList() {
        return this._EditStageList || {};
    }
    function SetCustomStageQuestion(data) {
        this._CustomStageQuestion = data;
    }
    function GetCustomStageQuestion() {
        return this._CustomStageQuestion || null;
    }
    function SetCustomStageData(data) {
        this._CustomStageData = data;
    }
    function GetCustomStageData() {
        return this._CustomStageData || null;
    }
    function SetCustomStageList(data) {
        this._CustomStageList = data;
        var array = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                array.push(data[key]);
            }
        }
        this._CustomStageArray = array;
    }
    function GetCustomStageRaw() {
        return this._CustomStageList || {};
    }
    function GetCustomStageConvertedToList() {
        return this._CustomStageArray || null;
    }

    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.call(this);
        try {
            console.log("GitHubから問題一覧を取得");
            fetch(`https://api.github.com/repos/${userName}/${repoName}/contents`)
                .then(response => response.json())
                .then(subdirectories => {
                    // 各サブディレクトリごとにdata.txtのコミット情報と中身を取得
                    const promises = subdirectories.map(subdirectory => {
                        const subdirectoryPath = `${subdirectory.name}/data.txt`;

                        // ファイルの中身を取得するPromise
                        const getFileContentPromise = fetch(`https://api.github.com/repos/${userName}/${repoName}/contents/${subdirectoryPath}`)
                            .then(response => response.json())
                            .then(fileContent => {
                                // ファイルの中身をBase64デコードしてUTF-8でデコード
                                const content = atob(fileContent.content);
                                const decoder = new TextDecoder('utf-8');
                                return decoder.decode(new Uint8Array([...content].map(char => char.charCodeAt(0))));
                            });

                        // ファイルのコミット情報を取得するPromise
                        const getCommitInfoPromise = fetch(`https://api.github.com/repos/${userName}/${repoName}/commits?path=${subdirectoryPath}`)
                            .then(response => response.json())
                            .then(commits => ({
                                filename: subdirectoryPath,
                                created_at: commits[0].commit.author.date || null, // 最新のコミットの日時を使用
                            }));

                        // Promise.allで2つのPromiseを同時に解決
                        return Promise.all([getFileContentPromise, getCommitInfoPromise])
                            .then(([fileContent, commitInfo]) => {
                                const contentLines = fileContent.split('\n');
                                return {
                                    filename: commitInfo.filename,
                                    fileIdentifier: subdirectory.name,
                                    created_at: commitInfo.created_at,
                                    name: contentLines[0],
                                    discription_1: contentLines[1],
                                    discription_2: contentLines[2],
                                    difficulty: contentLines[3],
                                    QuestionCount: contentLines[4],
                                    isRise: contentLines[5],
                                    isBonus: contentLines[6],
                                    author: contentLines[7],
                                };
                            });
                    });

                    // 全てのPromiseを解決してファイル情報を取得
                    Promise.all(promises)
                        .then(filesInfo => {
                            // 作成日時でファイルをソート
                            filesInfo.sort((a, b) => {
                                const dateComparison = new Date(a.created_at) - new Date(b.created_at);
                                if (dateComparison !== 0) {
                                    return dateComparison;
                                }
                                // 日付が等しい場合はファイル名で辞書順にソート
                                return a.filename.localeCompare(b.filename);
                            });
                            // ソートされたファイル情報を使って必要な処理を行う
                            SetEditStageList(filesInfo);
                        })
                        .catch(error => console.error(error));
                })
                .catch(error => console.error(error));
        } catch (e) {
            console.error(e);
        }
        try {
            console.log("ローカル問題取得");
            const fs = require('fs');
            const path = require('path');
            const stageData = {};
            var directoryPath = './www/excelData/editStage';
            const promises = [];

            fs.readdir(directoryPath, (err, folderList) => {
                if (err) {
                    console.error(err);
                    return;
                }
                for (const folder of folderList) {
                    const folderpath = path.join(directoryPath, folder);
                    const files = ['question.csv', 'data.txt'];
                    const jsonData = {};
                    for (const file of files) {
                        const promise = new Promise((resolve, reject) => {
                            fs.readFile(path.join(folderpath, file), 'utf8', (err, fileData) => {
                                switch (file.split('.').pop().toLowerCase()) {
                                    case 'csv':
                                        ImportQuestionData(folder, fileData, jsonData);
                                        resolve();
                                        break;
                                    case 'txt':
                                        ImportMetaData(folder, fileData, stageData, jsonData);
                                        resolve();
                                        break;
                                    default:
                                        reject(err);
                                        break;
                                }

                            });
                        });
                        promises.push(promise);
                    }
                }

                Promise.all(promises)
                    .then(() => {
                        SetCustomStageList(stageData);
                    })
                    .catch(error => {
                        // Handle errors if needed
                    });

            });
        } catch (e) {

        }
    };

    async function downloadStage(levelname) {
        const fileUrl = `https://github.com/${userName}/${repoName}/raw/main/${levelname}/question.csv`;
        const fileName = `./www/excelData/editStage/${levelname}/question.csv`;
        await downloadFile(fileUrl, fileName);
        const dataUrl = `https://github.com/${userName}/${repoName}/raw/main/${levelname}/data.txt`;
        const dataName = `./www/excelData/editStage/${levelname}/data.txt`;
        await downloadFile(dataUrl, dataName);
    }
    async function downloadFile(file, fileName) {
        const fs = require('fs');
        const path = require('path');
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    reject(new Error(`Failed to download file: ${response.statusText}`));
                    return;
                }

                const fileContent = await response.arrayBuffer();
                createDirectoryRecursive(path.dirname(fileName.replace(/\\/g, '/')));
                fs.writeFileSync(fileName, Buffer.from(fileContent), 'binary');
                resolve();
            } catch (error) {
                reject(new Error(`ファイルのダウンロード中にエラーが発生しました: ${error.message}`));
            }
        });
    }
    function createDirectoryRecursive(dirPath) {
        const fs = require('fs');
        const path = require('path');
        var normalizedPath = path.normalize(dirPath);
        var parts = normalizedPath.split(path.sep);

        for (var i = 1; i <= parts.length; i++) {
            var directoryPath = path.join.apply(null, parts.slice(0, i));
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }
        }
    }

    // 既存のshowPicture関数を保持
    var originalShowPicture = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function (pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode) {
        if (pictureName === null || pictureName === undefined) {
            originalShowPicture.call(this, pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode);
        } else if (String(pictureName).startsWith("　")) {
            var modifiedpictureName = "画像読み込みエラー！報告をお願いします。";
            $gameMap._interpreter.pluginCommand("D_TEXT", [modifiedpictureName, 30]);
            originalShowPicture.call(this, pictureId, null, origin, x, y, scaleX, scaleY, opacity, blendMode);
        } else if (!String(pictureName).startsWith("[")) {
            originalShowPicture.call(this, pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode);
        } else {
            $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
            $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["ALIGN", "1"]);
            var inputString = pureText(pictureName);
            var size = size1_default;
            var outline = $gameVariables.value(force) == 1 ? size1_default / 2 : size1_default / 10;
            if (inputString.length >= isVeryLong) {
                size = size4_verylong;
                outline = $gameVariables.value(force) == 1 ? size4_verylong / 2 : size4_verylong / 10;
            } else if (inputString.length >= isTooLong) {
                size = size3_toolong;
                outline = $gameVariables.value(force) == 1 ? size3_toolong / 2 : size3_toolong / 10;
            } else if (inputString.length >= isLong) {
                size = size2_long;
                outline = $gameVariables.value(force) == 1 ? size2_long / 2 : size2_long / 10;
            }
            if ($gameVariables.value(1179) == 2) {
                size = Math.ceil(size / 5);
                outline = Math.ceil(outline / 5);
            }
            $gameMap._interpreter.pluginCommand("D_TEXT", [`\\oc[black]\\ow[${outline}]${pictureName}`, size.toString()]);
            originalShowPicture.call(this, pictureId, null, origin, x, y, scaleX, scaleY, opacity, blendMode);

        }
    };
    function pureText(text) {
        return text.replace(/\\C\[[^\]]+\]/g, "").replace(/\\OC\[[^\]]+\]/g, "").replace(/\\ow\[\d+\]/g, "").replace(/\|(.*?)>/g, "").replace(/\[|\]/g, "").replace(/</g, "").replace(/㊦[^㊦]*㊦/g, '');
    }

    let previousProcess = Promise.resolve(); // 初期のPromise
    function processFolderData(folder) {
        const apiUrl = `https://api.github.com/repos/${userName}/${repoName}/contents/${folder}`;

        // 前の処理が終わるまで待機
        previousProcess = previousProcess
            .then(async () => {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch folder: ${apiUrl}`);
                }

                const stageData = GetCustomStageRaw();
                const folderUrl = `https://raw.githubusercontent.com/${userName}/${repoName}/main/${folder}/`;
                const files = ['question.csv', 'data.txt'];
                const jsonData = {};

                // 各ファイルを非同期に処理
                const filePromises = files.map(async file => {
                    const fileUrl = folderUrl + file;

                    try {
                        const fileResponse = await fetch(fileUrl);

                        if (!fileResponse.ok) {
                            throw new Error(`Failed to fetch file: ${fileUrl}`);
                        }

                        const fileData = await fileResponse.text();

                        switch (file.split('.').pop().toLowerCase()) {
                            case 'csv':
                                ImportQuestionData(folder, fileData, jsonData);
                                break;
                            case 'txt':
                                ImportMetaData(folder, fileData, stageData, jsonData);
                                break;
                            default:
                                break;
                        }
                    } catch (error) {
                        console.error(`Error processing file ${file} in folder ${folder}: ${error}`);
                    }
                });

                // すべてのファイルの処理が完了するのを待つ
                await Promise.all(filePromises);

                // フォルダの処理が完了するのを待つ
                SetCustomStageList(stageData);
            })
            .catch(error => {
                console.error(`Error: ${error}`);
            });

        return previousProcess;
    }
    function ShowEditStage(index) {
        const stage_index = index + 10 * $gameVariables.value(1175);
        const pic = 110 + index * 5;
        const y = 110 + index * 50;
        const editstage_list = GetEditStageList();
        if (editstage_list[stage_index] === undefined) {
            $gameScreen.erasePicture(pic + 1);
            $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", [(pic + 1).toString()]);
            $gameScreen.erasePicture(pic + 2);
            $gameScreen.erasePicture(pic + 3);
            $gameScreen.erasePicture(pic + 4);
            $gameScreen.erasePicture(pic + 5);
            return;
        }
        $gameScreen.showPicture(pic + 1, "Edit_Sheet_Ins", 1, 640, y, 100,100, 255, 0);
        $gameMap._interpreter.pluginCommand("P_CALL_SWITCH", [(pic + 1).toString(), `${parseInt((pic / 5) - 22) + offset_switch}`, "1", "OFF"]);
        $gameMap._interpreter.pluginCommand("D_TEXT", [editstage_list[stage_index]["name"], 24]);
        $gameScreen.showPicture(pic + 2, null, 0, 170,  y - 15, 100, 100, 255, 0);
        $gameMap._interpreter.pluginCommand("D_TEXT", [editstage_list[stage_index]["discription_1"], 24]);
        $gameScreen.showPicture(pic + 3, null, 0, 410, y - 15, 100, 100, 255, 0);
        $gameMap._interpreter.pluginCommand("D_TEXT", [editstage_list[stage_index]["author"], 24]);
        $gameScreen.showPicture(pic + 4, null, 0, 810, y - 15, 100, 100, 255, 0);
        $gameMap._interpreter.pluginCommand("D_TEXT", [editstage_list[stage_index]["QuestionCount"], 24]);
        $gameScreen.showPicture(pic + 5, null, 0, 1010, y - 15, 100, 100, 255, 0);
    }
    function MoveEditStage(index,y) {
        const pic = 110 + index * 5;
        $gameScreen.movePicture(pic + 1, 1, 640, y, 100, 100, 255, 0, 10);
        $gameScreen.movePicture(pic + 2, 0, 170, y - 15, 100, 100, 255, 0, 10);
        $gameScreen.movePicture(pic + 3, 0, 410, y - 15, 100, 100, 255, 0, 10);
        $gameScreen.movePicture(pic + 4, 0, 810, y - 15, 100, 100, 255, 0, 10);
        $gameScreen.movePicture(pic + 5, 0, 1010, y - 15, 100, 100, 255, 0, 10);
    }
    function ShowPlayStage(index, y) {
        const stage_index = index + 10 * $gameVariables.value(1175);
        const editstage_list = GetEditStageList();
        if (editstage_list.length <= stage_index) return;
        $gameMap._interpreter.pluginCommand("D_TEXT", [editstage_list[stage_index]["discription_2"], 24]);
        $gameScreen.showPicture(106, null, 0, 410, y - 40, 100, 100, 0, 0);
        $gameScreen.movePicture(106, 0, 410, y - 15, 100, 100, 255, 0, 10);
        $gameScreen.showPicture(107, "Edit_Sheet_7", 0, 800, y - 50, 100, 100, 0, 0);
        $gameScreen.movePicture(107, 0, 800, y - 25, 100, 100, 255, 0, 10);
        $gameMap._interpreter.pluginCommand("P_CALL_SWITCH", ["107", `${offset_switch + 10}`, "1", "OFF"]);
        $gameScreen.showPicture(108, "Edit_Sheet_10", 0, 900, y - 50, 100, 100, 0, 0);
        $gameScreen.movePicture(108, 0, 900, y - 25, 100, 100, 255, 0, 10);
        $gameMap._interpreter.pluginCommand("P_CALL_SWITCH", ["108", `${offset_switch + 11}`, "1", "OFF"]);
        $gameScreen.showPicture(109, "Edit_Sheet_16", 0, 1000, y - 50, 100, 100, 0, 0);
        $gameScreen.movePicture(109, 0, 1000, y - 25, 100, 100, 255, 0, 10);
        $gameMap._interpreter.pluginCommand("P_CALL_SWITCH", ["109", `${offset_switch + 12}`, "1", "OFF"]);
        $gameScreen.showPicture(110, "Edit_Sheet_DL", 0, 200, y - 50, 100, 100, 0, 0);
        $gameScreen.movePicture(110, 0, 200, y - 25, 100, 100, 255, 0, 10);
        $gameMap._interpreter.pluginCommand("P_CALL_SWITCH", ["110", `${offset_switch + 13}`, "1", "OFF"]);
    }
    function ErasePlayStage() {
        $gameScreen.erasePicture(105);
        $gameScreen.erasePicture(106);
        $gameScreen.erasePicture(107);
        $gameScreen.erasePicture(108);
        $gameScreen.erasePicture(109);
        $gameScreen.erasePicture(110);
        $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", ["107"]);
        $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", ["108"]);
        $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", ["109"]);
        $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", ["110"]);
    }
    async function SendStage(stage_length) {
        $gameVariables.setValue(1102, stage_length);
        const stage_data = GetEditStageList()[$gameVariables.value(1174) + 10 * $gameVariables.value(1175)];
        try {
            const response = await fetch(`https://api.github.com/repos/${userName}/${repoName}/contents/${stage_data["fileIdentifier"]}/question.csv`);
            const data = await response.json();
            const content = new TextDecoder('utf-8').decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
            const jsonData = {};
            ImportQuestionData(stage_data["fileIdentifier"], content, jsonData);
            SetCustomStageQuestion(jsonData);
            SetCustomStageData(stage_data);
            $gameScreen.erasePicture(51);
            $gameScreen.erasePicture(52);
            $gameScreen.erasePicture(53);
            $gameScreen.erasePicture(54);
            $gameScreen.erasePicture(55);
            $gameScreen.erasePicture(56);
            $gameScreen.erasePicture(57);
            $gameScreen.erasePicture(58);
            $gameScreen.erasePicture(59);
            $gameScreen.erasePicture(61);
            $gameScreen.erasePicture(20);
            $gameScreen.erasePicture(21);
            $gameScreen.erasePicture(22);
            $gameScreen.erasePicture(23);
            $gameScreen.erasePicture(24);
            $gameTemp.reserveCommonEvent(677);
            await waitForCommonEventToEnd(677);
            $gameTemp.reserveCommonEvent(204);
            await waitForCommonEventToEnd(204);
            $gameTemp.reserveCommonEvent(188);
            await waitForCommonEventToEnd(188);
            $gameTemp.reserveCommonEvent(231);
            await waitForCommonEventToEnd(231);
            $gameTemp.reserveCommonEvent(246);
            await waitForCommonEventToEnd(246);
            $gameTemp.reserveCommonEvent(251);
            await waitForCommonEventToEnd(251);
            $gamePlayer.reserveTransfer(2, 13, 7);
        } catch (error) {
            console.error('Error in SendStage:', error);
        }
    }
    async function Generator_Q_GitHub(){
        var data;
        var stage_name;
        if (GetCustomStageQuestion() == null) {
            const index = ($gameVariables.value(extra_page) - 1) * 3 + $gameVariables.value(extra_sub_place) - 1;
            data = GetCustomStageConvertedToList()[index]["Question"];
            stage_name = GetCustomStageConvertedToList()[index]["dataName"];
            SetCustomStageQuestion(data);
        } else {
            data = GetCustomStageQuestion();
            stage_name = GetCustomStageData()["fileIdentifier"];
        }
        await Generator(stage_name, data);
    }

    const qwertylist = ['pageup', 'pagedown', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const fghdlist = ['f', 'g', 'h', 'd'];

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'EditStage_List') {
            ErasePlayStage();
            $gameScreen.showPicture(105, "Edit_bg_Sheet", 1, 640, 360, 100, 100, 255, 0);
            for (var count = 0; count < 10; count++) {
                ShowEditStage(count);
            }
            SetCustomStageQuestion(null);
        }
        else if (command === 'EditStage_Para') {
            if (!($gameSwitches.value(76) || $gameSwitches.value(67) || $gameVariables.value(196) != 1)) {
                for (var i = 0; i < 10; i++) {
                    if (Input.isTriggered(`${qwertylist[i]}`)) {
                        $gameSwitches.setValue(offset_switch + i, true);
                    }
                }
                for (var i = 0; i < 10; i++) {
                    if ($gameSwitches.value(offset_switch + i)) {
                        for (var j = 0; j <= i; j++) {
                            MoveEditStage(j, 110 + j * 50);
                        }
                        $gameVariables.setValue(1174, i);
                        ShowPlayStage(i, 110 + i * 50 + 50);
                        for (var j = i + 1; j < 10; j++) {
                            MoveEditStage(j, 110 + j * 50 + 50);
                        }
                        AudioManager.playSe({ name: 'Cursor_X', volume: 90, pitch: 100, pan: 0 });
                        $gameSwitches.setValue(offset_switch + i, false);
                    }
                }
                for (var i = 0; i < 4; i++) {
                    if (Input.isTriggered(fghdlist[i])) {
                        $gameSwitches.setValue(offset_switch + 10 + i, true);
                    }
                    if ($gameSwitches.value(offset_switch + 10 + i)) {
                        if (i == 3) {
                            downloadStage(GetEditStageList()[$gameVariables.value(1174) + 10 * $gameVariables.value(1175)]["filename"].split("/")[0]);
                            AudioManager.playSe({ name: 'EnemyB_QuestionA', volume: 90, pitch: 100, pan: 0 });
                        } if (i <= 2) {
                            $gameVariables.setValue(15, 10000);
                            $gameMap._interpreter.pluginCommand("EditStage_Exit");
                            $gameSwitches.setValue(281, false);
                            $gameSwitches.setValue(282, false);
                            AudioManager.playSe({ name: 'Decide', volume: 90, pitch: 100, pan: 0 });
                            SendStage(i);
                        }
                        $gameSwitches.setValue(offset_switch + 10 + i, false);
                    }
                }
                if (Input.isTriggered('left')) {
                    $gameVariables.setValue(1175, $gameVariables.value(1175) - 1);
                    if ($gameVariables.value(1175) < 0) {
                        AudioManager.playSe({ name: 'Cancel', volume: 90, pitch: 100, pan: 0 });
                        $gameVariables.setValue(1175, 0);
                    } else {
                        $gameMap._interpreter.pluginCommand("EditStage_List");
                        AudioManager.playSe({ name: 'Book2', volume: 90, pitch: 100, pan: 0 });
                    }
                } else if (Input.isTriggered('right')) {
                    $gameVariables.setValue(1175, $gameVariables.value(1175) + 1);
                    $gameMap._interpreter.pluginCommand("EditStage_List");
                    AudioManager.playSe({ name: 'Book2', volume: 90, pitch: 100, pan: 0 });
                }
            }
        }
        else if (command === 'EditStage_Exit') {
            for (var count = 0; count < 10; count++) {
                $gameScreen.erasePicture(110 + count * 5 + 1);
                $gameMap._interpreter.pluginCommand("P_CALL_CE_REMOVE", [(110 + count * 5 + 1).toString()]);
                $gameScreen.erasePicture(110 + count * 5 + 2);
                $gameScreen.erasePicture(110 + count * 5 + 3);
                $gameScreen.erasePicture(110 + count * 5 + 4);
                $gameScreen.erasePicture(110 + count * 5 + 5);
            }
            ErasePlayStage();

        }
        else if (command === 'Edit_StageLoad') {
            processFolderData(args[0]);
        }
        else if (command === 'Edit_n_call') {
            if ($gameVariables.value(extra_page) * 3 - 3 + $gameVariables.value(extra_sub_place) - 1 >= GetCustomStageConvertedToList().length) {
                //問題がないときキャンセル
                AudioManager.playSe({ name: 'Cancel', volume: 90, pitch: 100, pan: 0 });
            } else {
                $gameVariables.setValue(196, 2);
                $gameMap._interpreter.pluginCommand("DeleteGitHubStages");
                $gameTemp.reserveCommonEvent(170);
            }

        }
        else if (command === 'Edit_Chikuwa') {
            $gameMap._interpreter.pluginCommand("PA_INIT", ["2", "1", "横", "45"]);
            $gameScreen.showPicture(50, "Custom_D_s2", 1, $gameVariables.value(319 + $gameVariables.value(extra_sub_place) * 2), $gameVariables.value(320 + $gameVariables.value(extra_sub_place) * 2), 100, 100, 0, 0);
            $gameScreen.movePicture(50, 1, $gameVariables.value(319 + $gameVariables.value(extra_sub_place) * 2), $gameVariables.value(320 + $gameVariables.value(extra_sub_place) * 2), 100, 100, 255, 0, 10);
            $gameMap._interpreter.pluginCommand("PA_START_LOOP", ["50", "1"]);
            $gameMap._interpreter.pluginCommand("Edit_Difficulty");

        }
        else if (command === 'Edit_Difficulty') {
            $gameVariables.setValue(15, 10000 + $gameVariables.value(extra_page) * 3 + $gameVariables.value(extra_sub_place) - 3);
            //10001～の番号が代入される
        }
        else if (command === 'Edit_BeforeStart_Cursor') {
            if ($gameSwitches.value(76) || $gameSwitches.value(67) || $gameVariables.value(196) != 1) {
                //何も実行しないとき
            }
            else if (Input.isTriggered('left')) {
                AudioManager.playSe({ name: 'Cursor_X', volume: 90, pitch: 100, pan: 0 });
                $gameVariables.setValue(extra_sub_place, parseInt($gameVariables.value(extra_sub_place)) - 1);
                if ($gameVariables.value(extra_sub_place) <= 0) {
                    $gameVariables.setValue(extra_sub_place, parseInt($gameVariables.value(extra_sub_place)) + 3);
                    $gameVariables.setValue(extra_page, parseInt($gameVariables.value(extra_page)) - 1);
                    if ($gameVariables.value(extra_page) <= 0) {
                        $gameVariables.setValue(extra_page, Math.ceil(GetCustomStageConvertedToList().length / 3));
                    }
                    $gameMap._interpreter.pluginCommand("DrawStages");
                }
                $gameScreen.showPicture(53, "Select_L", 1, $gameVariables.value(175), $gameVariables.value(176), 150, 150, 255, 0);
                $gameScreen.movePicture(53, 1, $gameVariables.value(175), $gameVariables.value(176), 100, 100, 255, 0, 10);
                $gameScreen.movePicture(50, 1, $gameVariables.value(319 + $gameVariables.value(extra_sub_place) * 2), $gameVariables.value(320 + $gameVariables.value(extra_sub_place) * 2), 100, 100, 255, 0, 1);
                $gameMap._interpreter.pluginCommand("Edit_Difficulty");

            }
            else if (Input.isTriggered('right')) {
                AudioManager.playSe({ name: 'Cursor_X', volume: 90, pitch: 100, pan: 0 });
                $gameVariables.setValue(extra_sub_place, parseInt($gameVariables.value(extra_sub_place)) + 1);
                if ($gameVariables.value(extra_sub_place) >= 4) {
                    $gameVariables.setValue(extra_sub_place, parseInt($gameVariables.value(extra_sub_place)) - 3);
                    $gameVariables.setValue(extra_page, parseInt($gameVariables.value(extra_page)) + 1);
                    if ($gameVariables.value(extra_page) >= Math.ceil(GetCustomStageConvertedToList().length / 3) + 1) {
                        $gameVariables.setValue(extra_page, 1);
                    }
                    $gameMap._interpreter.pluginCommand("DrawStages");
                }
                $gameScreen.showPicture(54, "Select_R", 1, $gameVariables.value(177), $gameVariables.value(178), 150, 150, 255, 0);
                $gameScreen.movePicture(54, 1, $gameVariables.value(177), $gameVariables.value(178), 100, 100, 255, 0, 10);
                $gameScreen.movePicture(50, 1, $gameVariables.value(319 + $gameVariables.value(extra_sub_place) * 2), $gameVariables.value(320 + $gameVariables.value(extra_sub_place) * 2), 100, 100, 255, 0, 1);
                $gameMap._interpreter.pluginCommand("Edit_Difficulty");
            }

        }
        else if (command === 'DrawStages') {
            SetCustomStageQuestion(null);
            var page = $gameVariables.value(extra_page);
            const customList = GetCustomStageConvertedToList();
            for (var i = page * 3 - 3; i < page * 3; i++) {
                var p = i % 3;
                if (i < customList.length) {
                    $gameScreen.showPicture(7 + p, `Menu_difficult_Edit${customList[i]["difficulty"]}`, 1, 274 + p * 366, 358, 100, 100, 255, 0);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["ALIGN", "1"]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [customList[i]["name"], "40"]);
                    $gameScreen.showPicture(pictureNum + 4 + p, null, 1, 274 + p * 366, 153, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 4 + p, 1, 274 + p * 366, 153, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [customList[i]["discription_1"], "24"]);
                    $gameScreen.showPicture(pictureNum + 7 + p, null, 1, 274 + p * 366, 540, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 7 + p, 1, 274 + p * 366, 540, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [customList[i]["discription_2"], "24"]);
                    $gameScreen.showPicture(pictureNum + 10 + p, null, 1, 274 + p * 366, 570, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 10 + p, 1, 274 + p * 366, 570, 100, 100, 255, 0, 10);
                    $gameScreen.showPicture(pictureNum + 13 + p, customList[i]["Question"][`${customList[i]["dataName"]}_0001`]["8"], 1, 254 + p * 366, 260, 20, 20, 192, 0);
                    $gameScreen.picture(pictureNum + 13 + p)._angle = -10;
                    $gameScreen.showPicture(pictureNum + 16 + p, customList[i]["Question"][`${customList[i]["dataName"]}_0010`]["8"], 1, 304 + p * 366, 345, 20, 20, 192, 0);
                    $gameScreen.picture(pictureNum + 16 + p)._angle = 5;
                    $gameScreen.showPicture(pictureNum + 19 + p, customList[i]["Question"][`${customList[i]["dataName"]}_0100`]["8"], 1, 264 + p * 366, 430, 20, 20, 192, 0);
                    $gameScreen.picture(pictureNum + 19 + p)._angle = -5;
                }
                else {
                    $gameScreen.showPicture(7 + p, "Menu_difficult_EditN", 1, 274 + p * 366, 358, 100, 100, 0, 0);
                    $gameScreen.movePicture(7 + p, 1, 274 + p * 366, 358, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", ["Coming Soon...", "40"]);
                    $gameScreen.showPicture(pictureNum + 4 + p, null, 1, 274 + p * 366, 358, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 4 + p, 1, 274 + p * 366, 358, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [" ", "24"]);
                    $gameScreen.showPicture(pictureNum + 7 + p, null, 1, 274 + p * 366, 540, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 7 + p, 1, 274 + p * 366, 540, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT_SETTING", ["FONT", font_edit]);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [" ", "24"]);
                    $gameScreen.showPicture(pictureNum + 10 + p, null, 1, 274 + p * 366, 570, 100, 100, 0, 0);
                    $gameScreen.movePicture(pictureNum + 10 + p, 1, 274 + p * 366, 570, 100, 100, 255, 0, 10);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [" ", "24"]);
                    $gameScreen.showPicture(pictureNum + 13 + p, null, 1, 254 + p * 366, 260, 20, 20, 192, 0);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [" ", "24"]);
                    $gameScreen.showPicture(pictureNum + 16 + p, null, 1, 304 + p * 366, 345, 20, 20, 192, 0);
                    $gameMap._interpreter.pluginCommand("D_TEXT", [" ", "24"]);
                    $gameScreen.showPicture(pictureNum + 19 + p, null, 1, 264 + p * 366, 430, 20, 20, 192, 0);
                }
            }

        }
        else if (command === 'DeleteGitHubStages') {
            var page = $gameVariables.value(extra_page);
            const customList = GetCustomStageConvertedToList();
            for (var i = page * 3 - 3; i < page * 3; i++) {
                var p = i % 3;
                if (i < customList.length) {
                    $gameScreen.movePicture(7 + p, 1, 274 + p * 366, 358, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 4 + p, 1, 274 + p * 366, 153, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 7 + p, 1, 274 + p * 366, 540, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 10 + p, 1, 274 + p * 366, 570, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 13 + p, 1, 254 + p * 366, 260, 20, 20, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 16 + p, 1, 304 + p * 366, 345, 20, 20, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 19 + p, 1, 264 + p * 366, 430, 20, 20, 0, 0, 10);
                }
                else {
                    $gameScreen.movePicture(7 + p, 1, 274 + p * 366, 358, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 4 + p, 1, 274 + p * 366, 358, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 7 + p, 1, 274 + p * 366, 540, 100, 100, 0, 0, 10);
                    $gameScreen.movePicture(pictureNum + 10 + p, 1, 274 + p * 366, 570, 100, 100, 0, 0, 10);
                }
            }
        }
        else if (command === 'Generator_Q_GitHub') {
            Generator_Q_GitHub();
        }
        else if (command === 'SetTotalQuestion') {
            /*
            const data = GetCustomStageConvertedToList()[($gameVariables.value(extra_page) - 1) * 3 + $gameVariables.value(extra_sub_place) - 1]["Question"];
            var difficulty = parseInt($gameVariables.value(290));
            const indexesToInclude = [];
            for (const key in data) {
                if (difficulty == 0 || difficulty == parseInt(data[key]["Level"])) {
                    indexesToInclude.push(data[key]);
                }
            }
            $gameVariables.setValue(681, indexesToInclude.length);
            */
        }
        else if (command === 'FireText') {
            if ($gameVariables.value(18).toString() == "0") return;
            var squareSize = size1_default; // 四角形の幅と高さ
            var magnification = 1;
            const textlength = pureText($gameVariables.value(8).toString());
            if (textlength.length >= isTooLong) {
                squareSize = size3_toolong;
                magnification = size3_toolong / squareSize;
            } else if (textlength.length >= isLong) {
                squareSize = size2_long;
                magnification = size2_long / squareSize;
            }
            const all_length = calculateValueFromString($gameVariables.value(18), squareSize * 3 / 4, squareSize);
            let [integerPart, decimalPart] = findCenterAxis($gameVariables.value(18).toString()).toString().split('.');
            var relativePos = calculateValueFromString($gameVariables.value(18).toString().slice(0, parseInt(integerPart) - 1), squareSize * 3 / 4, squareSize);
            if (decimalPart !== undefined) {
                relativePos += squareSize / 2;
            }
            $gameMap._interpreter.pluginCommand("PA_INIT", ["6", "60", "連番", "0"]);
            const before_Xscale = 50 * magnification;
            const before_Yscale = 50 * magnification;
            const before_Xposition = 640 + (- all_length / 2 + relativePos + squareSize / 2) * before_Xscale / 200;
            console.log(`与えられた文字列${$gameVariables.value(18)},全長,${all_length}1つの四角は${squareSize},${$gameVariables.value(18)}の時の中心位置は${before_Xposition},相対位置${relativePos}`);
            const after_Xscale = $gameVariables.value(167);
            const after_Yscale = $gameVariables.value(168);
            const after_Xposition = 640 + (- all_length / 2 + relativePos + squareSize / 2) * after_Xscale / 200;
            $gameScreen.showPicture(19, `Fl_${$gameVariables.value(18).toString().replace(/1/g, '')}_0001`, 1, before_Xposition, 360, before_Xscale, before_Yscale, 255, 1);
            $gameScreen.movePicture(19, 1, after_Xposition, 360, after_Xscale, after_Yscale, 255, 1, $gameVariables.value(134));
        }
        else if (command === 'FireTextDelete') {
            $gameScreen.erasePicture(19);
        }
    };
    function findCenterAxis(str) {
        let center = 0;
        let count = 0;
        let inSequence = false;

        for (let i = 0; i < str.length; i++) {
            if (str[i] === '2') {
                if (!inSequence) {
                    center = i + 1;
                    inSequence = true;
                }
                count += 1;
            } else {
                inSequence = false;
            }
        }

        if (count === 0) {
            return "No '2' found in the string";
        }

        return count % 2 === 0 ? center + count / 2 - 0.5 : center + Math.floor(count / 2);
    }
    function calculateValueFromString(inputString, a, b) {
        var stringValue = inputString.toString();

        var onesCount = 0;
        var twosCount = 0;

        for (var i = 0; i < stringValue.length; i++) {
            if (stringValue[i] === "1") {
                onesCount++;
            } else if (stringValue[i] === "2") {
                twosCount++;
            }
        }

        var result = onesCount * a + twosCount * b;
        return result;
    }
    function ImportQuestionData(filename, data, jsonData) {
        var lines = data.split('\n');
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
            if (id == "") continue;
            var answer_Row = parseText(firstLine[1]);
            var answerText_e_1057 = answer_Row[0] || "　";
            var answerText_a_1058 = answer_Row[2] || "　";
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
            var chr_text = chr_raw[2];
            var genre_13 = firstLine[4] || 0;
            var comment1_19 = firstLine[5] || "　";
            var comment2_20 = secondLine[5] || "　";
            var level = firstLine[6] + secondLine[6];
            var color = 2;
            if (level == "1" || level == "2") {
                color = 1;
            } else if (level == "3") {
                color = 2;
            } else if (level == "4") {
                color = 3;
            }
            var parent_key = filename + "_" + String(id).padStart(4, '0');
            jsonData[parent_key] = {};
            var chr = "";
            if (chr_text != "") {
                chr = chr_text.replace(/〇|○/g, '●');
            } else if (chr_raw[1] != "" && !isNaN(chr_raw[1])) {
                chr = '●'.repeat(Number(chr_raw[1]));
            }
            jsonData[parent_key]["6"] = parent_key;
            if (hasPicture) {
                jsonData[parent_key]["8"] = parent_key;
            } else {
                jsonData[parent_key]["8"] = createDTextString(questionText_e, questionText, questionText_a, chr, color);
            }
            jsonData[parent_key]["16"] = 0;
            jsonData[parent_key]["9"] = answer[0];
            if (answer.length >= 2) {
                jsonData[parent_key]["10"] = answer[1];
                if (answer.length >= 3) {
                    jsonData[parent_key]["11"] = answer[2];
                } else {
                    jsonData[parent_key]["11"] = "000000000000000000000";
                }
            } else {
                jsonData[parent_key]["10"] = "000000000000000000000";
                jsonData[parent_key]["11"] = "000000000000000000000";
            }
            jsonData[parent_key]["13"] = genre_13 || "";
            jsonData[parent_key]["14"] = num_of_chr_14 || 0;
            jsonData[parent_key]["18"] = "1".repeat(questionText_e) + "2".repeat(questionText) + "1".repeat(questionText_a);
            jsonData[parent_key]["19"] = comment1_19;
            jsonData[parent_key]["20"] = comment2_20 || "　";
            jsonData[parent_key]["Level"] = level;
            if (parseInt(questionText_e.length) + parseInt(questionText.length) + parseInt(questionText_a.length) >= 8) {
                jsonData[parent_key]["169"] = "2";
            } else if (parseInt(questionText_e.length) + parseInt(questionText.length) + parseInt(questionText_a.length) >= 5) {
                jsonData[parent_key]["169"] = "1";
            } else {
                jsonData[parent_key]["169"] = "0";
            }
            jsonData[parent_key]["992"] = "";
            jsonData[parent_key]["1057"] = answerText_e_1057;
            jsonData[parent_key]["1058"] = answerText_a_1058;
        }

    }
    function ImportMetaData(folder, data, stageData, jsonData) {
        var lines = data.split('\n');
        const newStage = {
            name: lines[0],
            discription_1: lines[1],
            discription_2: lines[2],
            difficulty: lines[3],
            QuestionCount: lines[4],
            isRise: lines[5],
            isBonus: lines[6],
            dataName: folder,
            Question: jsonData
        };
        stageData[lines[0]] = newStage;
    }
    async function Generator(stage_name, data) {
        $gameSwitches.setValue(60, false);
        var num;
        var quit = $gameVariables.value(1133);
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
            for (const key in data) {
                if (difficulty == 0 || difficulty == parseInt(data[key]["Level"])) {
                    indexesToInclude.push(data[key]);
                }
            }
            $gameVariables.setValue(1128 + difficulty, indexesToInclude.length);
        }
        $gameVariables.setValue(290, 1);
        await SetQuestionIndex(stage_name, data, num, quit);
        $gameVariables.setValue(290, 2);
        await SetQuestionIndex(stage_name, data, num, quit);
        $gameVariables.setValue(290, 3);
        await SetQuestionIndex(stage_name, data, num, quit);
        $gameVariables.setValue(290, 4);
        await SetQuestionIndex(stage_name, data, 2, quit);
        $gameVariables.setValue(7, $gameVariables.value(1133));
        $gameVariables.setValue(290, 1);
        $gameSwitches.setValue(184, true);

    }

    var usedFileNames = [];
    function generateUniqueFileName(stage_name, difficulty) {
        var fileName;
        var retryCount = 0;

        do {
            $gameMap._interpreter.pluginCommand("EditRGen", [stage_name, "100", difficulty]);
            fileName = `${stage_name}_${String($gameVariables.value(6)).padStart(4, '0')}`;
            retryCount++;
            if (retryCount >= 100) {
                usedFileNames = [];
                retryCount = 0;
                console.log("リストをリセットしました。");
            }
        } while (usedFileNames.includes(fileName));
        usedFileNames.push(fileName);

        return fileName;
    }
    async function SetQuestionIndex(stage_name, data, count,quit) {
        var difficulty = parseInt($gameVariables.value(290));
        for (let i = 0; i < count; i++) {
            var fileName = generateUniqueFileName(stage_name, difficulty);
            if (count == 10) {
                if (i < 5) {
                    //本筋(0,1,2,3,4)
                    $gameVariables.setValue(7, difficulty * 5 - 4 + i);
                } else if (i < 6) {
                    //いれかえ(5)
                    $gameVariables.setValue(380, difficulty);
                } else {
                    //残機(6,7,8,9)
                    $gameVariables.setValue(774, i - 5 + difficulty * 4 - 4);
                }
            } else if (count == 8) {
                if (i < 3) {
                    //本筋(0,1,2)
                    $gameVariables.setValue(7, difficulty * 3 - 2 + i);
                } else if (i < 4) {
                    //いれかえ(3)
                    $gameVariables.setValue(380, difficulty);
                } else {
                    //残機(4,5,6,7)
                    $gameVariables.setValue(774, i - 3 + difficulty * 4 - 4);
                }
            } else if (count == 7) {
                if (i < 2) {
                    //本筋(0,1)
                    $gameVariables.setValue(7, difficulty * 2 - 1 + i);
                } else if (i < 3) {
                    //いれかえ(2)
                    $gameVariables.setValue(380, difficulty);
                } else {
                    //残機(3,4,5,6)
                    $gameVariables.setValue(774, i - 2 + difficulty * 4 - 4);
                }
            } else {
                if (i == 0) {
                    //本筋(0)
                    var num = 10;
                    if ($gameVariables.value(1102) == 0) {
                        num = 7;
                    } else if ($gameVariables.value(1102) == 2) {
                        num = 16;
                    }
                    $gameVariables.setValue(7, num);
                } else{
                    //いれかえ(1)
                    $gameVariables.setValue(380, 4);
                }
            }
            if ($gameVariables.value(7) <= quit && $gameVariables.value(380) == 0 && $gameVariables.value(774) == 0) continue;
            $gameVariables.setValue(13, 0);
            $gameVariables.setValue(17, 0);
            for (const [key, value] of Object.entries(data[fileName])) {
                //console.log(`${key} - ${value}`);
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
                        } else if (value == "古" || value == "芸") {
                            $gameVariables.setValue(13, 6);
                            $gameVariables.setValue(17, 6);
                        } else if (value == "単") {
                            $gameVariables.setValue(13, 7);
                            $gameVariables.setValue(17, 7);
                        } else if (value == "則") {
                            $gameVariables.setValue(13, 10);
                            $gameVariables.setValue(17, 10);
                        } else if (value == "チ" || value == "チュ") {
                            $gameVariables.setValue(13, 11);
                            $gameVariables.setValue(17, 11);
                        } else if (value == "元") {
                            $gameVariables.setValue(13, 12);
                            $gameVariables.setValue(17, 12);
                        }
                    }
                }
            }

            //回答記憶
            $gameTemp.reserveCommonEvent(7);
            await waitForCommonEventToEnd(7);

            //変数リセット
            $gameVariables.setValue(380, 0);
            $gameVariables.setValue(774, 0);
        }
    }
    function parseOrReturnOriginal(inputString) {
        const parsedInt = parseInt(inputString);

        if (!isNaN(parsedInt)) {
            return parsedInt;
        } else {
            return inputString;
        }
    }
    async function waitForCommonEventToEnd(eventId) {
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (!$gameTemp.isCommonEventReserved(eventId)) {
                    clearInterval(intervalId);
                    resolve();
                }
            }, 1); // 10ミリ秒ごとに確認
        });
    }
    function createDTextString(A, B, C, chr, color) {
        if (chr != "") {
            return `[\\C[0]${A}]\\C[${color}]<${B}|[\\C[15]${chr}]>\\C[0][${C}]`;
        }
        return `[\\C[0]${A}]\\C[${color}]${B}\\C[0][${C}]`;
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

})();
