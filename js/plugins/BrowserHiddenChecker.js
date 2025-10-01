/*:
 * @plugindesc Detect tab/app switching (MV/MZ) + NW.js minimize; if hidden/minimized >=1s, var 1430=1.
 * @author Micelle
 *
 * @help
 * Plugin commands:
 *   BrowserHidden on
 *   BrowserHidden off
 */

(function() {
  var monitoring = false;
  var hiddenAt = null;   // ブラウザ非表示になった時刻(ms)
  var minimizedAt = null;// NW.js最小化になった時刻(ms)
  var timerId = null;
  var VAR_ID = 1430;
  var THRESHOLD = 1000;

  function now(){ return Date.now(); }

  function startMonitoring() {
    if (monitoring) return;
    monitoring = true;
    document.addEventListener("visibilitychange", onVisChange, { passive: true });
    window.addEventListener("blur", onBlur, { passive: true });
    window.addEventListener("focus", onFocus, { passive: true });

    // NW.js: 最小化/復元イベント
    if (Utils && Utils.isNwjs && Utils.isNwjs()) {
      try {
        const win = nw.Window.get();
        win.on('minimize', onNwMinimize);
        win.on('restore',  onNwRestore);
      } catch(e){}
    }

    hiddenAt = document.hidden ? now() : null;
    armTimerIfHidden();
  }

  function stopMonitoring() {
    if (!monitoring) return;
    monitoring = false;
    document.removeEventListener("visibilitychange", onVisChange);
    window.removeEventListener("blur", onBlur);
    window.removeEventListener("focus", onFocus);
    try {
      if (Utils && Utils.isNwjs && Utils.isNwjs()) {
        const win = nw.Window.get();
        win.removeListener('minimize', onNwMinimize);
        win.removeListener('restore',  onNwRestore);
      }
    } catch(e){}
    clearTimeout(timerId);
    timerId = null;
    hiddenAt = null;
    minimizedAt = null;
  }

  function onBlur(){ /* 判定は visibilitychange/NW側で */ }
  function onFocus(){}

  function onVisChange() {
    if (document.hidden) {
      if (!hiddenAt) hiddenAt = now();
      armTimerIfHidden();
    } else {
      // 復帰時に実時間で判定（モバイル/省電力対策）
      if (hiddenAt && now() - hiddenAt >= THRESHOLD) setFlag();
      hiddenAt = null;
      clearTimeout(timerId); timerId = null;
    }
  }

  function onNwMinimize() {
    minimizedAt = now();
    // 最小化中はタイマー動かない可能性が高いので、復帰時にまとめて判定
  }

  function onNwRestore() {
    if (minimizedAt && now() - minimizedAt >= THRESHOLD) setFlag();
    minimizedAt = null;
  }

  function armTimerIfHidden() {
    clearTimeout(timerId);
    if (!document.hidden || !hiddenAt) return;
    timerId = setTimeout(function(){
      if (document.hidden && hiddenAt && (now()-hiddenAt)>=THRESHOLD) setFlag();
    }, THRESHOLD+10);
  }

  function setFlag() {
    if (window.$gameVariables) $gameVariables.setValue(VAR_ID, 1);
  }

  // plugin command (MV)
  const _pc = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args){
    _pc.call(this, command, args);
    if (command === "BrowserHidden") {
      if (args[0] === "on")  startMonitoring();
      if (args[0] === "off") stopMonitoring();
    }
  };
})();