/*:
 * @plugindesc スマホ環境では30fpsに制限するプラグイン
 * @author Micelle
 */

(function() {
  // --- 対象：スマホ or （PCテスト用に）NW.js ---
  var isMobileLike =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  //    || (Utils.isNwjs && Utils.isNwjs()); // ←PCテスト後は外す

  if (!isMobileLike) return;

  // 1) スマホ側は流体タイムステップを強制ON（加速/減速の防止）
  const FORCE_ON = true;
  const _applyData = ConfigManager.applyData;
  ConfigManager.applyData = function(config) {
    _applyData.call(this, config);
    this.synchFps = FORCE_ON;
  };
  const _makeData = ConfigManager.makeData;
  ConfigManager.makeData = function() {
    const cfg = _makeData.call(this);
    cfg.synchFps = FORCE_ON;
    return cfg;
  };
  if (Window_Options && Window_Options.prototype) {
    const _processOk = Window_Options.prototype.processOk;
    Window_Options.prototype.processOk = function() {
      const symbol = this.commandSymbol(this.index());
      if (symbol === 'synchFps') return;
      _processOk.call(this);
    };
    const _cursorRight = Window_Options.prototype.cursorRight;
    Window_Options.prototype.cursorRight = function(wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === 'synchFps') return;
      _cursorRight.call(this, wrap);
    };
    const _cursorLeft = Window_Options.prototype.cursorLeft;
    Window_Options.prototype.cursorLeft = function(wrap) {
      const symbol = this.commandSymbol(this.index());
      if (symbol === 'synchFps') return;
      _cursorLeft.call(this, wrap);
    };
  }

  // 2) update一本化：論理は60Hz相当、描画は30fps厳密ゲート
  const LOGIC_STEP_MS   = 1000 / 60; // ≒16.667ms
  const RENDER_STEP_MS  = 1000 / 30; // ≒33.333ms
  const MAX_STEPS       = 3;         // スパイク時の暴走防止

  const _requestUpdate  = SceneManager.requestUpdate;
  const _terminate      = SceneManager.terminate;
  const _changeScene    = SceneManager.changeScene;
  const _updateScene    = SceneManager.updateScene;
  const _renderScene    = SceneManager.renderScene;

  let lastTime   = 0;
  let logicAcc   = 0;
  let lastRender = 0;

  // rAF予約はそのまま使う
  SceneManager.requestUpdate = function() {
    _requestUpdate.call(this);
  };

  SceneManager.update = function() {
    const now = (performance && performance.now) ? performance.now() : Date.now();
    if (lastTime === 0) {
      lastTime = now;
      lastRender = now;
    }

    // 経過時間（過大スパイクは丸め）
    let dt = now - lastTime;
    if (dt > 250) dt = 250;
    lastTime = now;

    // 論理更新は60Hz相当（複数回まわす）
    logicAcc += dt;
    let steps = 0;
    while (logicAcc >= LOGIC_STEP_MS && steps < MAX_STEPS) {
      this.updateInputData();
      _changeScene.call(this);
      _updateScene.call(this);
      logicAcc -= LOGIC_STEP_MS;
      steps++;
    }

    // 描画は30fpsゲート（33ms未満ならスキップ）
    if (now - lastRender >= RENDER_STEP_MS) {
      _renderScene.call(this);
      lastRender = now;
    }

    // 次フレ
    this.requestUpdate();
  };

  SceneManager.terminate = function() {
    lastTime = 0;
    logicAcc = 0;
    lastRender = 0;
    _terminate.call(this);
  };
})();