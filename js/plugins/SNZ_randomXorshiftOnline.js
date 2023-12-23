//=============================================================================
// SNZ_randomXorshiftOnline.js
//=============================================================================

/*:
 * @plugindesc ランダムに何かをする処理の精度を上げます　ブラウザプレイ対応
 *
 * @author しんぞ
 *
 * @help コアスクリプトで宣言されている関数Math.randomIntは
 * 精度が低い（似たような数値ばかり出る）と不評なMath.randomをそのまま使ってしまっているので
 * 他の方法で上書きしてみました
 * ランダムに何かをするプラグインより上に配置してください
 * SNZ_randomXorshiftはブラウザ上で実行するとエラーになったため、
 * 別バージョンを用意しました
 * こちらのバージョンのライセンスは「ご自由に」です使用転載改変なんでもどうぞ
 */
(function() {

  var nextUInt = function() {
    var x = Math.floor( Math.random() * 1000000000 ) ;
    var y = Math.floor( Math.random() * 1000000000 ) ;
    var z = Math.floor( Math.random() * 1000000000 ) ;
    var w = Math.floor( Math.random() * 100000000 ) ;
    var t = x ^ x << 11;
    x = y;
    y = z;
    z = w;
    w = (w ^ w >>> 19) ^ (t ^ t >>> 8);

    var result = w >>> 0;
    return result / 4294967296;
  }

  ///////////////////////////////////////////////
  Math.randomInt = function(max) {
    return Math.floor(max * nextUInt());
  }
})();
