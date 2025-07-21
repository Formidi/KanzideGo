//=============================================================================
// PictureFileCounter.js
//=============================================================================
/*:
 * @plugindesc img/pictures内のファイル数をカウントして変数1655番に格納（テストプレイ中は.png、本番時は.rpgmvp対象、ローカル限定） 
 * @author Micelle
 *
 * @help
 * プラグインコマンド:
 *   PictureFileCount save   # saveフォルダをデスクトップへコピー
 */

(function() {
  const fs = require('fs');
  const path = require('path');

  const copySaveFolderToUserSelectedPath = () => {
    if (!Utils.isNwjs()) return;

    const chooser = document.createElement('input');
    chooser.type = 'file';
    chooser.setAttribute('nwdirectory', '');
    chooser.setAttribute('webkitdirectory', '');
    chooser.style.display = 'none';

    document.body.appendChild(chooser);

    chooser.addEventListener('change', function(evt) {
      const files = evt.target.files;
      if (!files || files.length === 0) {
        alert("フォルダが選択されませんでした。");
        return;
      }

      // 最初のファイルから親フォルダを推定
      const fakePath = files[0].path;
      const folderPath = path.dirname(fakePath);
      const savePath = path.join(process.cwd(), 'save');
      const destPath = path.join(folderPath, 'save');

      try {
        if (!fs.existsSync(savePath)) {
          alert("元のsaveフォルダが存在しません。");
          return;
        }

        // フォルダごと再帰的にコピー
        fs.cpSync(savePath, destPath, { recursive: true });
        alert('saveフォルダを選択先にコピーしました。');
        console.log(`コピー完了: ${savePath} → ${destPath}`);
      } catch (e) {
        console.error('コピー中にエラー:', e);
        alert('コピーに失敗しました。F12キーを押して、コンソールをご確認ください。');
      }
    });

    chooser.click();
  };

  // プラグインコマンドの追加（MV形式）
  const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'PictureFileCount' && args[0] === 'save') {
      copySaveFolderToUserSelectedPath();
    }
  };

})();