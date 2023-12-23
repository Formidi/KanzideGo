//=============================================================================
// Nuka_VersionFetch
// The MIT License (MIT)
//=============================================================================

/*:
 * @plugindesc アプリが最新バージョンで無い場合は注意ダイアログを表示
 * @author NukadukeParipiMan
 *
 * @help Nuka_VersionFetch.js
 *
 * --------------------------------------
 * プラグインコマンド詳細
 * --------------------------------------
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 *
 * Nuka_VersionFetch VersionFetch
 *  アプリのバージョンとストアの最新バージョンを比較し、アップデートがある場合は更新を促すダイアログを表示します。
 *
 */

(function(_global) {

// プラグインコマンド
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'Nuka_VersionFetch') {
        switch (args[0]) {
        case 'VersionFetch':
          //ストアの最新バージョンを取得
          const url = 'https://raw.githubusercontent.com/NukadukeParipiMan/KanzideGoVersionApp/main/README.md';
          fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
            var storeVer = json[0].version;
          //アプリのバージョンを取得
          cordova.getAppVersion.getVersionNumber(function(appVer) {
            if(appVer < storeVer){
               // アプリのバージョンが最新でなかった場合はダイアログ表示
               navigator.notification.alert(
                  '各ストアページから更新をお願いします。（更新せずにプレイすると問題に食い違いが発生します）',  // message
                  null,
                  'アップデートがあります',            // title
                  'OK'               // buttonName
               );
            } else {
                // アプリが最新バージョンだった時の処理
            }
        }, function(error){
            // アプリのバージョンが取得できなかった時の処理
        });
     });
    }
  }
};

})(this);
