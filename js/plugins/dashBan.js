//=============================================================================
// ダッシュ禁止プラグイン
// dashBan.js
// Copyright (c) 2018 村人Ａ
//=============================================================================

/*:ja
 * @plugindesc ダッシュを禁止するプラグインです
 * @author 村人A
 *
 * @help
 *　=======================================
 *　
 *　バージョン管理
 *　2019/3/7 バージョン１.01 リリース
 *　         セーブ・ロード後もダッシュ禁止・許可が反映されているようにしました。
 *　2018/1/2 バージョン１.00 リリース
 *　
 *　=======================================
 *　
 * プレイヤーのダッシュをコマンドで禁止するプラグインです
 * ダッシュが許可されているマップに移動してもダッシュ禁止は
 * 継続されます。
 *
 * プラグインコマンド:
 *   ダッシュ禁止    # ダッシュを禁止
 *   ダッシュ許可    # ダッシュを許可
 */

(function() {
	villaA_dashBan = false;
	
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ダッシュ禁止') {
			$gamePlayer.villaA_dashBan = true;
        }
		
        if (command === 'ダッシュ許可') {
			$gamePlayer.villaA_dashBan = false;
        }
    };
	
	Game_Player.prototype.isDashing = function() {
		if($gamePlayer.villaA_dashBan){
			return false;
		} else {
			return this._dashing;
		}
	};
})();