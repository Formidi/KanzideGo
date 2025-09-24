//=============================================================================
// GitHub Auto Updater Plugin
//=============================================================================
/*:
 * @plugindesc Allows automatic updates from a GitHub repository.
 * @version 1.0.0
 * @author Your Name
 *
 * @param Owner
 * @desc GitHubユーザーの名前
 * @default your_owner
 *
 * @param Repo
 * @desc GitHubレポジトリの名前
 * @default your_repo
 *
 * @param DPath
 * @desc ダウンロードする場所(基本は./でいいはずです)
 * @default ./
 *
 * @param InitialSHA
 * @desc 最初期バージョンのSHA
 * @default initial_SHA
 *
 * @param Judge
 * @desc 更新判定が終わったことを示すスイッチの番号。
 * @type number
 * @default 228
 *
 * @param isUpdate
 * @desc 更新中であることを示すスイッチの番号。
 * @type number
 * @default 230
 *
 * @param pictureName
 * @desc 最新バージョンであることを示すピクチャの名前
 * @default Party_Oa
 *
 * @help
 * Githubのほうに更新があったとき、変更箇所をダウンロードして適切な場所に配置してくれるスクリプトですが、まだいろいろと問題点があります。
 *
 */

function countPictureFiles() {
  if (!Utils.isNwjs()) return;

  const fs = require("fs");
  const path = require("path");

  const dirPath = path.join(process.cwd(), "img", "pictures");
  const isPlaytest = $gameTemp.isPlaytest();
  const extension = isPlaytest ? ".png" : ".rpgmvp";
  const variableId = 1655;

  try {
    const files = fs.readdirSync(dirPath);
    const count = files.filter(file => file.endsWith(extension)).length;
    $gameVariables.setValue(variableId, count);
    console.log(`[PictureFileCounter] ファイル数: ${count}（拡張子: ${extension}）`);
  } catch (e) {
    console.error("画像フォルダの読み込みに失敗しました:", e);
  }
}

(function () {
  // 起動時に画像数をカウント
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    countPictureFiles();
  };

    var parameters = PluginManager.parameters('GitHubAutoUpdater');
    var owner = String(parameters['Owner'] || 'your_owner');
    var repo = String(parameters['Repo'] || 'your_repo');
    var downloadPath = String(parameters['DPath'] || './');
    var initialSHA = String(parameters['InitialSHA'] || 'initial_SHA');
    var Judge = Number(parameters['Judge'] || 228);
    var isUpdate = Number(parameters['isUpdate'] || 230);
    var pictureName = parameters['pictureName'] || 'Party_Oa';

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = async function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'DoUpdate') {
            if (navigator.onLine && !Utils.isOptionValid('test')) {
                try {
                    commiting();
                } catch (e) {
                    console.log("アップデート可能な環境ではないためキャンセルされました");
                }
            } else if (Utils.isOptionValid('test')){
                ResetRepo();
            }
        }
    }
    async function ResetRepo() {
        const fs = require('fs');
        const filePath = './data/commitSHA.txt';

        console.log("コミットのリセットを開始します");
        fs.writeFileSync(filePath, initialSHA);
        console.log("コミットがリセットされました。");
    }

    const delay = 100; // 0.1秒（100ミリ秒）

    function delayAsync(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function commiting() {
        const fs = require('fs');
        const path = require('path');

        //最新のコミットを取得する
        const latestCommitSHA = await getLatestCommitSHA(owner, repo);

        //直近のSHAのプロジェクトファイル内から取得する
        const SHAfilePath = './www/data/commitSHA.txt';
        const lastCommitSHA = await getLastCommitSHA(SHAfilePath);

        //最後の更新と保存されている更新が異なる場合は更新処理に入る
        if (lastCommitSHA !== latestCommitSHA) {
            //アップデート中スイッチのオン
            $gameSwitches.setValue(230, true);

            //バージョン更新の通知
            $gameMap._interpreter.pluginCommand("D_TEXT", [`バージョン更新:${lastCommitSHA}→${latestCommitSHA}`, "20"]);
            $gameScreen.showPicture(55, null, 0, 10, 10, 100, 100, 255, 0);

            //コミット間の違いを検知
            const commitChanges = await getCommitChanges(owner, repo, lastCommitSHA, latestCommitSHA);

            //ダウンロード一覧を保存するリスト
            const downloadPromises = [];

            //進捗を管理する整数
            var progress = 0;

            //変更があったすべてのファイルに対して処理を行う
            for (const file of commitChanges) {
                const fileName = path.join(downloadPath, file.filename);

                if (file.status === 'removed' && fs.existsSync(fileName)) {
                    //ファイルが消されているならローカルのファイルも消す
                    fs.unlinkSync(fileName);

                    //ファイルを消したことの通知
                    $gameMap._interpreter.pluginCommand("D_TEXT", [`${fileName}を消去しました。`, "20"]);
                    $gameScreen.showPicture(56, null, 0, 300, 35, 100, 100, 255, 0);
                } else if (!fs.existsSync(fileName) || fs.readFileSync(fileName, 'utf8') !== file.content) {
                    //ファイルに変更がかかっていたならローカルにファイルをダウンロードしてくる
                    const downloadPromise = downloadFile(file, fileName)
                        .then(() => {
                            //ダウンロードが完了したときに表示を更新
                            progress += 1;
                            $gameMap._interpreter.pluginCommand("D_TEXT", [`${fileName}をダウンロードしました`, "20"]);
                            $gameScreen.showPicture(56, null, 0, 300, 35, 100, 100, 255, 0);
                            $gameMap._interpreter.pluginCommand("D_TEXT", [`ダウンロード中... ${progress} / ${commitChanges.length}`, "20"]);
                            $gameScreen.showPicture(57, null, 0, 10, 35, 100, 100, 255, 0);
                        })
                        .catch(error => {
                            console.error(`Error: ${error.message}`);
                        });
                    //ダウンロード中のファイル一覧に現在のファイルを追加
                    downloadPromises.push(downloadPromise);
                }

                await delayAsync(delay);
                //連続で実行すると負荷がかかるため0.1秒の間を開ける
            }

            //すべてのダウンロードが終わるまで待機
            await Promise.all(downloadPromises);

            //新しいSHAを書き込む
            fs.writeFileSync(SHAfilePath, latestCommitSHA);
            $gameSwitches.setValue(isUpdate, false);

            //処理が終わったことを伝え、3秒後にシャットダウン
            $gameScreen.erasePicture(56);
            $gameScreen.erasePicture(57);
            $gameMap._interpreter.pluginCommand("D_TEXT", [`${commitChanges.length}個のファイルを処理しました。`, "20"]);
            $gameMap._interpreter.pluginCommand("D_TEXT", [`今一度、ゲームを閉じていただき、再起動してください。`, "20"]);
            $gameMap._interpreter.pluginCommand("D_TEXT", [`ファイル数が200個を超えていた場合は、右下の案内をご覧ください。`, "20"]);
            $gameScreen.showPicture(55, null, 0, 10, 10, 100, 100, 255, 0);

            this.wait(60000);
            window.close();

            this.wait(10000);
            await performShutdownSequence(commitChanges);


        } else {
            $gameSwitches.setValue(Judge, true);
            $gameScreen.showPicture(55, pictureName, 0, 0, 0, 100, 100, 255, 0);
        }

    }

    async function shutdownAfterDelay(delayMs) {
        return new Promise(resolve => {
            setTimeout(resolve, delayMs);
        });
    }

    async function performShutdownSequence() {
        const one_second = 1000;
        const false_eternity = 100000000;

        await shutdownAfterDelay(one_second);
        
        $gameMap._interpreter.pluginCommand("D_TEXT", [`アップデートが完了しました。一旦ゲームを閉じ、もう一度起動してください。`, "20"]);
        $gameScreen.showPicture(55, null, 0, 10, 10, 100, 100, 255, 0);
        await shutdownAfterDelay(false_eternity);

        window.close();
    }

    //最新のコミットを取得
    async function getLatestCommitSHA(owner, repo) {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits/main`;
        const response = await fetch(url);

        if (!response.ok) {
            return Promise.reject(`GitHub APIからのコミットSHAの取得中にエラーが発生しました: ${response.statusText}`);
        }

        const data = await response.json();
        return data.sha;
    }

    async function getLastCommitSHA(filePath) {
            try {
                const fs = require('fs');
                const util = require('util');
                const readFileAsync = util.promisify(fs.readFile);
                const fileData = await readFileAsync(filePath, 'utf8');
                return fileData;
            } catch (err) {
                console.log(err);
                return initialSHA;
            }
        }

    async function getCommitChanges(owner, repo, fromSHA, toSHA) {
    let allFiles = [];
    let page = 1;
    const perPage = 300; // GitHub APIの最大値
    
    while (true) {
        const url = `https://api.github.com/repos/${owner}/${repo}/compare/${fromSHA}...${toSHA}?page=${page}&per_page=${perPage}`;
        const response = await fetch(url);

        if (!response.ok) {
            return Promise.reject(`GitHub APIからのデータ取得中にエラーが発生しました: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 最初のページでtotal_commitsをチェック
        if (page === 1) {
            console.log(`合計ファイル数: ${data.files.length}個のファイルが見つかりました`);
            
            // 300個未満なら従来通り
            if (data.files.length < 300) {
                return data.files;
            }
        }

        // ファイルを配列に追加
        allFiles = allFiles.concat(data.files);
        
        // 次のページがあるかチェック
        const linkHeader = response.headers.get('link');
        if (!linkHeader || !linkHeader.includes('rel="next"')) {
            break; // 次のページがない場合は終了
        }
        
        page++;
        
        // API制限回避のため少し待機
        await delayAsync(100);
    }
    
    console.log(`全${allFiles.length}個のファイルを取得しました`);
    return allFiles;
    }


    async function downloadFile(file, fileName) {
        const fileUrl = file.raw_url;
        const fs = require('fs');
        const path = require('path');
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(fileUrl);
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
})();
