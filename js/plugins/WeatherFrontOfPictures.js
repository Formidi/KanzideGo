/*:
 * @target MV
 * @plugindesc Weatherをピクチャより前に表示する（マップ）
 * @author you
 * @help
 * マップ画面の天候（雨/雪/嵐）を「ピクチャの前」に出します。
 * ウィンドウ（メッセージ等）よりは後ろのままです。
 */

(function() {
  var _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
  Spriteset_Map.prototype.createUpperLayer = function() {
    _Spriteset_Map_createUpperLayer.call(this);

    // createUpperLayer の時点で pictureContainer は作られている
    // weather は lowerLayer で作られているので、最後尾に移動して最前面へ
    if (this._weather) {
      this.removeChild(this._weather);
      this.addChild(this._weather);
    }
  };
})();
