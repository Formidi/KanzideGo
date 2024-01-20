//=============================================================================
// SAN_Imp_SkipParallelEventPreload.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Sanshiro
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//=============================================================================
// GitHub  : https://github.com/rev2nym
// Twitter : https://twitter.com/rev2nym
//=============================================================================

/*:
 * @plugindesc 並列イベントプリロードスキップ 1.0.0
 * パフォーマンス改善プラグインです。
 * @author Sanshiro https://github.com/rev2nym
 * @help
 * ■概要
 * 並列イベント処理時に画像プリロードリクエストをスキップすることで
 * 並列イベントと派生するコモンイベントのコマンド解析処理を省略し
 * 処理速度の改善を図ります。
 * 
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_Imp_SkipParallelEventPreload = true;

var Sanshiro = Sanshiro || {};
Sanshiro.Imp_SkipParallelEventPreload =
    Sanshiro.Imp_SkipParallelEventPreload || {};
Sanshiro.Imp_SkipParallelEventPreload.version = '1.0.0';

(function() {
'use strict';

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// インタープリター

// プリロードリクエストメソッド
var _Game_Interpreter_requestImages = Game_Interpreter.requestImages;

//-----------------------------------------------------------------------------
// Game_Event
//
// イベント

// 並列イベント時の更新
var _Game_Event_updateParallel =
    Game_Event.prototype.updateParallel;
Game_Event.prototype.updateParallel = function() {
    Game_Interpreter.requestImages = function() {};
    _Game_Event_updateParallel.call(this);
    Game_Interpreter.requestImages = _Game_Interpreter_requestImages;
};

})();