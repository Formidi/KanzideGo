//iOSは広告表示後のみフォアグラウンド時にアラート表示


/*---------------------------------------------------------------------------*
 * Torigoya_FixMuteAudio.js
 *---------------------------------------------------------------------------*
 * 2019/11/08 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc スマホでブラウザを非アクティブにすると音が二度と鳴らなくなることがあるのを防止するやつ
 * @author ru_shalm
 * @help
 *
 * ■ なにこれ！
 * 以下の修正パッチのプラグインバージョンです
 * https://github.com/rpgtkoolmv/corescript/pull/209
 *
 * ■ どういうときにおかしくなるの？
 * 1. Androidを用意します
 * 2. Chromeでゲームを開きます
 * 3. ゲームから音声が鳴り始めます
 * 4. スマホのホームボタンを押して、Chromeを非表示にします
 * 5. 自動的に音声のフェードアウトが始まります
 * 6. 0.5秒以内にChromeをタップして再度表示します
 * 7. 音、死す
 *
 * ■ なんでやねん
 * Androidではブラウザ(Chrome)を非表示にしても音が鳴りっぱなしになってしまうため
 * RPGツクールMVのコアスクリプトの中に、
 * ブラウザが非表示になったら音が止まる仕組みが入っています。
 *
 * この時、音が急に止まるのではなく1秒かけてフェードアウトするようになっています。
 * そして、ブラウザを再度表示したときには0.5秒かけてフェードインします。
 *
 * フェードアウトよりフェードインのほうが短い時間のため
 * あまりに早くブラウザの表示・非表示を繰り返してしまうと
 * フェードアウトが完了する前にフェードインが終わってしまい
 * 最終的にフェードアウトの音量をゼロにする操作だけが残ってしまい
 * 音が鳴らなくなってしまいます＞＜
 *
 * このプラグインでは、フェードインの時間を0.5秒から1秒にすることで
 * どんなに超高速に操作をしたとしても、
 * フェードアウトしたままにならないようにしています。
 */

(function () {
    'use strict';

    WebAudio._onShow = function () {
        if (this._shouldMuteOnHide()) {
            this._fadeIn(1); // 0.5 -> 1
        }
    };

    WebAudio._fadeIn = function(duration) {
        if (this._masterGainNode) {
            var ua = window.navigator.userAgent.toLowerCase();
            if (navigator.userAgent.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1 && 'ontouchend' in document) {
                if (!interstitialDisplay) {
                alert("ゲームを再開します");
            }
        }
        var gain = this._masterGainNode.gain;
        var currentTime = WebAudio._context.currentTime;
        gain.setValueAtTime(0, currentTime);
        gain.linearRampToValueAtTime(this._masterVolume, currentTime + duration);
    }
};
    
})();

