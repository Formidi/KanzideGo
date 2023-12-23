//=============================================================================
// Rubi_riru.js
//=============================================================================
/*:
 * @plugindesc ルビ振りを行います。用語登録によるオートルビ振り機能つき。
 * @author riru
 *
 *
 * @param Auto Ruby
 * @desc 自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Help Auto Ruby
 * @desc スキルの説明やヘルプメッセージ等（ヘルプで一部制御文字が使えるところ）も自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Database Auto Ruby
 * @desc アクターやアイテム名などウィンドウ内の他すべての場所も自動ルビ振りをする（する：true　しない：false）
 * @default true
 *
 * @param Jisage
 * @desc 字下げを行う（1行目は字下げをしないとルビが切れます。）（する：0　しない：1　ルビがあるときだけ字下げ：2）
 * @default 0
 *
 * @param Ruby Size
 * @desc ルビのサイズ補正。字下げONの場合このサイズに合わせて字下げ、行詰みの度合いが変わります。あまり大きすぎると上の文字に被ります
 * @default -1
 *
 * @help
 *
 * ルビ振りプラグイン ver 1.06
 *
 *＜使い方＞
 *\r[ルビを振る漢字,よみがな]と記入すると漢字の上によみがながつきます。
 *例）\r[君,きみ]
 *jsエディタでこのファイルを開いてGame_Message.prototype.rubyDictionary　の中によく使う単語を登録しておくと自動でルビ振りをしてくれます。ただし手動でもルビ振りをしている場合は手動の読みを優先します。ひらがな、カタカナは送り仮名として認識され漢字、アルファベットの上にのみルビがつきます。
 *※認識の関係上、[,の中は自動ルビ振りがされません。（例[この中はだめ,）この場合はお手数ですが手動で設定していただきますようお願いいたします
 *
 * ＜規約＞
 * 有償無償問わず使用できます。改変もご自由にどうぞ。使用報告もいりません。２次配布は作成者を偽らなければOKです（ただし素材単品を有償でやりとりするのはNG）。
 *著作権は放棄していません。使用する場合は以下の作者とURLをreadmeなどどこかに記載してください
 *
 * ＜作者情報＞
 *作者：riru 
 *HP：ガラス細工の夢幻
 *URL：http://garasuzaikunomugen.web.fc2.com/index.html
 *＜更新履歴＞
 *2019年1月7日　Ver1.06。ルビ振りが作動しない不具合を修正。
 *2018年7月11日　Ver1.05。Ver1.04でカバーしきれていない記号があったのを修正。特殊文字を使うと間が空くことがある不具合を修正。
 *4月18日　Ver1.04。1.03の修正内で記号等が反映されていなかった不具合を修正。
 *4月18日　Ver1.03。文章以外で全角と半角文字が混合していると文字幅が狭くなる不具合を修正。
 *2016年4月14日　Ver1.02。ヘルプメッセージやアクター名などにもルビ振り可能になりました
 *2016年4月12日　Ver1.01。制御文字の直後,同じ単語が連続しているなど特定の条件下で自動ルビ振りがうまくいかない不具合を修正。
 */

(function() {

    var parameters = PluginManager.parameters('Rubi_riru');
    var p_auto_Ruby = Boolean(parameters['Auto Ruby']       === 'true' || false);
    var p_help_auto_Ruby = Boolean(parameters['Help Auto Ruby']       === 'true' || false);
    var p_data_auto_Ruby = Boolean(parameters['Database Auto Ruby']       === 'true' || false);
    var p_Jisage = Number(parameters['Jisage'] || 0);
    var ruby_c_size = Number(parameters['Ruby Size'] || -1);

Game_Message.prototype.rubyDictionary = function() {//自動登録用辞書。ここに直接書き込む（送り仮名込み）。漢字が被る場合は文字数が多い文字を先に。
//例
//var ruby_dic = [["君達","きみたち"],["楽し","たの"],["楽","らく"],["君","くん"]];

var ruby_dic = [];
    return ruby_dic;
};
riru_Ruby_Message_processstartMessage =
		Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
    riru_Ruby_Message_processstartMessage.call(this);
    if(p_auto_Ruby)this._textState.text = this.convertEscapeCharacters($gameMessage.createRubytext($gameMessage.allText()));
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(this._textState.text)))this._textState.y += 6+ruby_c_size;
};
Game_Message.prototype.ruby_e_hantei = function(text) {
   var text_re = new RegExp("\x1br\\[(.*?),.*?\\]","img");//textの正規表現
return text_re.test(text);
};
Game_Message.prototype.createRubytext = function(alltext) {
var ruby_dic = $gameMessage.rubyDictionary();
     //送り仮名
     var kana = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわをんらりるれろぁぃぅぇぉっゃゅょゎゔがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオガギグゲゴカキクケコザジズゼゾサシスセソダヂヅデドタチツテトバビブベボナニヌネノパピプペポハヒフヘホァィゥェォマミムメモッャュョヮヤユヨワンラリルレロヴヲ"; 
     for (var i = 0; i < ruby_dic.length; i++) {
       var text = ruby_dic[i][0];//ルビが振られる漢字
       var text_re = new RegExp("(\\s|^|\\]|\\\\)"+"([^\\[]*?)"+text+"([^,]*?)"+"(\\s|\\\\|$)","mg");//前に[がない(手動でルビを振っているもの以外）辞書漢字
       //iに使用されている漢字が他の２文字以降にもある場合（例i:楽　他：音楽）、
       if (text_re.test(alltext)) {//辞書内i番の文字があるか？
         var kana_re = new RegExp("["+kana+"]","mg");//ひらがなが一文字でもある場合の正規
         var kana_ar = text.match(kana_re);
         var okurigana = "";
         if (text.match(kana_re)) {//送り仮名があった場合送り仮名を作成
           for (var j = 0; j < kana_ar.length; j++) {//送り仮名のみの文字列作成
             okurigana += kana_ar[j][0];
           }
         }    
         //ルビ制御文字に置換
         var after_text = text.replace(kana_re, "");//かなを取り除いた文字列
         alltext = alltext.replace(text_re, "$1$2\\R["+after_text+","+ruby_dic[i][1]+"]"+okurigana+"$3$4" );
         //マッチした文字列の中に複数対象があった場合
         var text_match = alltext.match(text_re);//マッチした配列
         var text_text_re = new RegExp(text,"mg");//textの正規表現
         var text_rep_count = 0;//置換する回数
         if (text_match){
           for (var k = 0; k < text_match.length; k++) {
             if(text_match[k].match(text_text_re)){
               var text_match_match = text_match[k].match(text_text_re);
               for (var l = 0; l < text_match_match.length; l++) {
                 text_rep_count++;
               }  
             }
           }  
         }  
         for (var m = 0; m < text_rep_count; m++) {
         alltext = alltext.replace(text_re, "$1$2\\R["+after_text+","+ruby_dic[i][1]+"]"+okurigana+"$3$4" );
         }         
       }  
     } 
   return alltext;  
};
Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {//再定義
    if (text&&typeof text == "string") {
        var textState = { index: 0, x: x, y: y, left: x };
        if(p_data_auto_Ruby){
          textState.text = this.convertEscapeCharacters($gameMessage.createRubytext(text));
        }else{
           textState.text = this.convertEscapeCharacters(text);
        }    
        textState.height = this.calcTextHeight(textState, false);
        var text_length_text = textState.text;//制御文字を抜いた文字長さ
         var text_length_re = new RegExp("\x1br\\[(.*?),.*?\\]","img");//textの正規表現
         text_length_text = text_length_text.replace(text_length_re, "$1" );
        if (this.textWidth(text_length_text)<maxWidth){
          if (align === 'center') {
              textState.x += (maxWidth - this.textWidth(text_length_text)) / 2;
          }else if (align === 'right') {
              textState.x += maxWidth - this.textWidth(text_length_text);
          }
        } 
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState.text)))textState.y += 6+ruby_c_size;//字下げ
          hankaku = new RegExp('[ -~]',"img");//半角が含まれているもの
        var hankaku_text = text_length_text.match(hankaku);//半角がいくつ含まれているかマッチ
        if (hankaku_text == null) hankaku_text = [];
        if (hankaku_text.length == 0){
    var hankaku_width =  Math.min(maxWidth/text_length_text.length,this.textWidth(text_length_text)/text_length_text.length);//一文字あたりの幅
    hankaku_width /= 2;
        }else{  
          var hankaku_width = (this.textWidth(text_length_text)-(text_length_text.length-hankaku_text.length)*this.contents.fontSize)/text_length_text.length;//半角の状態での一文字あたりの幅
        }
     hankaku_textwidth = Math.min(maxWidth/(hankaku_text.length+((text_length_text.length-hankaku_text.length)*2)),this.contents.fontSize/2);
     zenkaku_textwidth =  Math.min(maxWidth/((hankaku_text.length+((text_length_text.length-hankaku_text.length)*2))/2),this.contents.fontSize);
        while (textState.index < textState.text.length) {
        
          switch (textState.text[textState.index]) {
          case '\x1b':
           if (this.obtainEscapeCode(textState)=='R') {
             this.makerubydraw(textState);
            }
            break;
          default:
            this.processNormalCharacterruby(textState);
            break;
          }
        }
    }else{  
      if(p_Jisage==0)y += 6+ruby_c_size;//riru追加字下げ
      this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
    }    
};
Window_Base.prototype.processNormalCharacterruby = function(textState) {//drawtext用
    var c = textState.text[textState.index++];
    if (c.match(hankaku)) {//半角の場合
      var w = hankaku_textwidth;
    }else{
      var w = zenkaku_textwidth;
    } 
    this.contents.drawText(c, textState.x, textState.y, w, textState.height);
    textState.x += w;
};
Window_Base.prototype.makerubydraw = function(textState) {//drawtext用
 var ruby = this.obtainEscapeParampex(textState).split(",");
    var ow = this.textWidth(ruby[0]);
    var w = 0;
    if (hankaku.test(ruby[0])){//半角が入っているか？
     for (var i = 0; i < ruby[0].match(hankaku).length; i++) {
       w += hankaku_textwidth;
     } 
     w += (ruby[0].length-ruby[0].match(hankaku).length)*zenkaku_textwidth;
    }else{
    var w = zenkaku_textwidth*ruby[0].length;
    } 
         this.contents.fontSize /= 3;
         this.contents.fontSize += ruby_c_size;
    this.contents.drawText(ruby[1], textState.x, textState.y-this.contents.fontSize*2-6+ruby_c_size, w, textState.height+10,'center');
         this.contents.fontSize -= ruby_c_size;
         this.contents.fontSize *= 3;
    this.contents.drawText(ruby[0], textState.x, textState.y, w, textState.height);
    textState.x += w;
};

Window_Base.prototype.drawTextEx = function(text, x, y) {//再定義
    if (text) {
        var textState = { index: 0, x: x, y: y, left: x };
        if(p_help_auto_Ruby){
          textState.text = this.convertEscapeCharacters($gameMessage.createRubytext(text));
        }else{
          textState.text = this.convertEscapeCharacters(text);
        }    
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState.text)))textState.y += 6+ruby_c_size;//riru追加
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState.x - x;
    } else {
        return 0;
    }
};

riru_Ruby_Message_processEscapeCharacter =
		Window_Base.prototype.processEscapeCharacter;
Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'R':
        this.makeruby(textState);
      break;
    default:
      riru_Ruby_Message_processEscapeCharacter.call(this,
				code, textState);
      break;
    }
};
Window_Base.prototype.makeruby = function(textState) {
 var ruby = this.obtainEscapeParampex(textState).split(",");
    var ow = this.textWidth(ruby[0]);
         this.contents.fontSize /= 3;
         this.contents.fontSize += ruby_c_size;
    var w = this.textWidth(ruby[0]);
    this.contents.drawText(ruby[1], textState.x, textState.y-this.contents.fontSize*2-6+ruby_c_size, ow, textState.height+10,'center');
         this.contents.fontSize -= ruby_c_size;
         this.contents.fontSize *= 3;
     w = this.textWidth(ruby[0]);
    this.contents.drawText(ruby[0], textState.x, textState.y, w * 2, textState.height);
    textState.x += w;
};
Window_Base.prototype.obtainEscapeParampex = function(textState) {//riru文字も含めた判別
    var arr = /^\[(.*?)\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[1];
    } else {
        return '';
    }
};
riru_Ruby_Message_processNewLine =
		Window_Base.prototype.processNewLine;
Window_Base.prototype.processNewLine = function(textState) {
    riru_Ruby_Message_processNewLine.call(this,textState);
    if(p_Jisage==0||(p_Jisage==2&&$gameMessage.ruby_e_hantei(textState)))textState.height -= Math.max(3+ruby_c_size, 2);//riru追加箇所
};
Window_Message.prototype.needsNewPage = function(textState) {//再定義
    return (!this.isEndOfText(textState) &&
            textState.y + textState.height > this.contents.height-ruby_c_size+3);
};

})();
