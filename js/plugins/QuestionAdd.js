(function () {
    const keyDictionary = {
        'Q': '8',
        'A1': '9',
        'A2': '10',
        'A3': '11',
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
        '珍回': '992'
    };

    function convertLineEndings(text) {
        // \r を削除して LF (\n) に変換
        return text.replace(/\r/g, '');
    }

    // ゲーム開始時の処理
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        const fs = require('fs');
        if (Utils.isOptionValid('test')) {
            fs.readFile('./excelData/input.txt', 'utf8', (err, inputText) => {
                if (err) {
                    console.error('ファイルの読み込みエラー:', err);
                    return;
                }

                inputText = convertLineEndings(inputText);

                fs.readFile('./excelData/question.json', 'utf8', (err2, data) => {
                    const existingData = JSON.parse(data);
                    const separator = '--------------------------------';
                    const sections = inputText.split(separator);

                    for (const section of sections) {
                        try {
                            const lines = section.trim().split('\n');
                            var datakey;
                            for (const line of lines) {
                                if (line === "") continue;
                                var [key, value] = line.split(':');
                                if (value === "") {
                                    if (key === "A2" || key === "A3") {
                                        value = "000000000000000000000";
                                    } else if (key === "A1" || key === "送前" || key === "送後" || key === "珍回") {
                                        value = "　";
                                    } else {
                                        value = "0";
                                    }
                                }
                                if (key === "Q") {
                                    datakey = value;
                                    existingData[datakey] = {}; // data_toaddオブジェクトを初期化
                                    existingData[datakey]["6"] = datakey;
                                } else {
                                    if (keyDictionary[key] != undefined && keyDictionary[key] !== null && keyDictionary[key] !== "") {
                                        existingData[datakey][keyDictionary[key]] = value;
                                    }
                                }
                            }
                        } catch (e) {
                            console.log("読み込みが失敗したか、終端に到達しました");
                        }
                    }

                    fs.writeFile('./excelData/question.json', JSON.stringify(existingData, null, 2), (err) => {
                        if (err) {
                            console.error('ファイルの書き込みエラー:', err);
                            return;
                        }
                        console.log('データがquestion.jsonに追加されました。');
                    });
                });



                // 既存のデータをJSONファイルに読み込む

            });
        }
        _Scene_Boot_start.call(this);
    };
})();
