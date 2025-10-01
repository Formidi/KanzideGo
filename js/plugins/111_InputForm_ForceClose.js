/* 111_InputForm_ForceClose.js
   111_InputFormのフォームを強制終了/非表示にする拡張コマンド */
(function(){
  function clearWaitMode(it){ if(it && it._waitMode==='input_form') it.setWaitMode(''); }
  function clearAllWaits(){
    clearWaitMode($gameMap && $gameMap._interpreter);
    clearWaitMode($gameTroop && $gameTroop._interpreter);
    if($gameMap && $gameMap._commonEvents){
      $gameMap._commonEvents.forEach(function(ce){
        if(ce && ce._interpreter) clearWaitMode(ce._interpreter);
      });
    }
  }
  function killForm(){
    var inp=document.getElementById('_111_input');
    var sub=document.getElementById('_111_submit');
    if(inp) inp.remove();
    if(sub) sub.remove();
    if(window.Input) Input.form_mode=false;   // 111_InputFormが立てたフラグを戻す
    clearAllWaits();                           // イベントの待機解除
  }
  function hideForm(hide){
    var inp=document.getElementById('_111_input');
    var sub=document.getElementById('_111_submit');
    var d = hide ? 'none' : '';
    if(inp) inp.style.display=d;
    if(sub) sub.style.display=d;
  }

  // 使い方：
  // InputForm kill            … 強制終了（DOM除去＋待機解除）
  // InputForm success v=11    … 変数11に現在の入力値を入れて終了
  // InputForm cancel          … 値は書かずに終了
  // InputForm hide on/off     … 表示の一時非表示/再表示（終了はしない）
  var _pc = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command,args){
    _pc.call(this, command, args);
    if(command!=='InputForm') return;

    if(args[0]==='kill'){ killForm(); return; }

    if(args[0]==='success'){
      // 例) InputForm success v=11
      var kv = (args[1]||'').split('=');
      var vid = Number(kv[1]||0);
      var inp=document.getElementById('_111_input');
      if(vid>0 && inp) $gameVariables.setValue(vid, inp.value);
      killForm(); return;
    }

    if(args[0]==='cancel'){ killForm(); return; }

    if(args[0]==='hide'){
      var onoff=(args[1]||'').toLowerCase();
      hideForm(onoff==='on'); return;
    }
  };
})();