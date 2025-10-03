/*:
 * @plugindesc Backup Assign.rpgsave to www/save/backup as Assign_YYYYMMDD (MV / NW.js)
 * @author Micelle
 * @help
 * プラグインコマンド:
 *   ChikuwaBackUp
 *
 * 仕様:
 * - 実行時に www/save/Assign.rpgsave を www/save/backup/Assign_YYYYMMDD にコピーします。
 * - backup フォルダが無ければ自動作成します。
 * - ブラウザ版ではファイルアクセス不可のため動作しません（NW.js専用）。
 */
(function(){
  // 日付を YYYYMMDD で返す
  function ymd(d){
    const z=n=>('0'+n).slice(-2);
    return d.getFullYear()+z(d.getMonth()+1)+z(d.getDate());
  }
  function doBackup(){
    if(!(window.Utils&&Utils.isNwjs&&Utils.isNwjs())){
      console.warn('[ChikuwaBackUp] ブラウザ環境では実行できません。'); return;
    }
    const fs   = require('fs');
    const path = require('path');
    // www の絶対パス
    const wwwDir = path.dirname(process.mainModule.filename);
    const saveDir = path.join(wwwDir,'save');
    const src = path.join(saveDir,'Assign.rpgsave');
    const backupDir = path.join(saveDir,'backup');
    // 元ファイル存在チェック
    if(!fs.existsSync(src)){
      console.warn('[ChikuwaBackUp] 元ファイルが見つかりません: '+src); return;
    }
    // backup フォルダ作成（なければ）
    try{ fs.mkdirSync(backupDir,{recursive:true}); }catch(e){}
    // 出力ファイル名（拡張子なし、例: Assign_20251002）
    const outName = 'Assign_'+ymd(new Date())+'.rpgsave';
    const dst = path.join(backupDir,outName);
    try{
      const buf = fs.readFileSync(src);
      fs.writeFileSync(dst, buf);
      console.log('[ChikuwaBackUp] Backup OK -> '+dst);
    }catch(err){
      console.error('[ChikuwaBackUp] 失敗: ', err);
    }
  }

  // プラグインコマンド（MV）
  const _pc = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command,args){
    _pc.call(this, command, args);
    if(command==='ChikuwaBackUp'){ doBackup(); }
  };
})();
