//=============================================================================
// SAN_Imp_ColorCache.js
//=============================================================================
// Copyright (c) 2018 Sanshiro
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//=============================================================================
// GitHub  : https://github.com/rev2nym
// Twitter : https://twitter.com/rev2nym
//=============================================================================

/*:
 * @plugindesc カラーキャッシュ 1.0.0
 * パフォーマンス改善プラグインです。
 * @author Sanshiro https://github.com/rev2nym
 * @help
 * ■概要
 * 色データの取得結果をキャッシュ化することでゲームの処理速度の改善を図ります。
 * テキストカラーやゲージカラーを毎フレーム取得して
 * ウィンドウやスプライトを毎フレーム再描画するようなゲームの
 * 処理速度の改善により効果を発揮します。
 * 
 * ■詳細
 * 「Bitmap.getPixel()」メソッドと「Bitmap.getAlphaPixel()」メソッドの結果を
 * キャッシュ化することで「CanvasRenderingContext2D.getImageData()」メソッドの
 * 呼び出し回数を削減し Major GC の回数を削減する効果が期待できます。
 * これらの処理は主に「Window_Base.textColor()」メソッドと
 * 「Window_Base.pendingColor()」メソッドで使用されており
 * ウィンドウに関係する大抵の色データ取得メソッドで使用されています。
 * 
 * ■利用規約
 * MITライセンスのもと、商用利用、改変、再配布が可能です。
 * ただし冒頭のコメントは削除や改変をしないでください。
 * これを利用したことによるいかなる損害にも作者は責任を負いません。
 * サポートは期待しないでください＞＜。
 */

var Imported = Imported || {};
Imported.SAN_Imp_ColorCache = true;

var Sanshiro = Sanshiro || {};
Sanshiro.Imp_ColorCache = Sanshiro.Imp_ColorCache || {};
Sanshiro.Imp_ColorCache.version = '1.0.0';

(function() {
'use strict';

//-----------------------------------------------------------------------------
// Bitmap
//
// ビットマップ

// オブジェクト初期化
var _Bitmap_initialize = 
    Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function(width, height) {
    _Bitmap_initialize.call(this, width, height);
    this.initPixelCache();
};

// ピクセルキャッシュの初期化
Bitmap.prototype.initPixelCache = function() {
    this._pixelCache = {};
    this._alphaPixelCache = {};
};

// ピクセルキャッシュのクリア
Bitmap.prototype.clearPixelCache = function() {
    this._pixelCache = {};
    this._alphaPixelCache = {};
};

// ピクセルの色データの取得("#rrggbb")
var _Bitmap_getPixel =
    Bitmap.prototype.getPixel;
Bitmap.prototype.getPixel = function(x, y) {
    var key = x + '_' + y;
    var result = (!!this._pixelCache[key] ?
        this._pixelCache[key] :
        _Bitmap_getPixel.call(this, x, y)
    );
    this._pixelCache[key] = result;
    return result;
};

// ピクセルのアルファデータの取得
var _Bitmap_getAlphaPixel = 
    Bitmap.prototype.getAlphaPixel;
Bitmap.prototype.getAlphaPixel = function(x, y) {
    var key = x + '_' + y;
    var result = (!!this._alphaPixelCache[key] ?
        this._alphaPixelCache[key] :
        _Bitmap_getAlphaPixel.call(this, x, y)
    );
    this._alphaPixelCache[key] = result;
    return result;
};

// ダーティフラグの設定
var _Bitmap__setDirty =
    Bitmap.prototype._setDirty;
Bitmap.prototype._setDirty = function() {
    _Bitmap__setDirty.call(this);
    this.clearPixelCache();
};

})();
