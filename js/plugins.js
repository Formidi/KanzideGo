// Generated by RPG Maker.
// Do not edit this file directly.
var $plugins =
[
{"name":"SA_CoreSpeedImprovement","status":true,"description":"v18.1 SA Core Speed Improvement (Define at the top)","parameters":{"Enable CWC-cache":"false","Minimum CWC-cache holding count":"15","Logging level":"4"}},
{"name":"Community_Basic","status":true,"description":"基本的なパラメーターを設定するプラグインです。","parameters":{"cacheLimit":"30","screenWidth":"1280","screenHeight":"720","changeWindowWidthTo":"","changeWindowHeightTo":"","renderingMode":"auto","alwaysDash":"ON"}},
{"name":"DatabaseConverter","status":false,"description":"データベース変換プラグイン","parameters":{"excelDataPath":"excelData","ExportPrefix":"","targetDatabase":"[\"{\\\"JsonName\\\":\\\"Actors\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Classes\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Skills\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Items\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Weapons\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Armors\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Enemies\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"Troops\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"States\\\",\\\"VariableName\\\":\\\"\\\"}\",\"{\\\"JsonName\\\":\\\"MapInfos\\\",\\\"VariableName\\\":\\\"\\\"}\"]","fileFormat":"xlsx","originalDataLoad":"false","autoImport":"false","exportEventTest":"true","originalDatabaseStack":"false","commandPrefix":""}},
{"name":"Galv_ImageCache","status":true,"description":"(v.1.1) Pre-cache images that cause issues when loading during gameplay","parameters":{"Folder 1":"animations|","Folder 2":"battlebacks1|","Folder 3":"battlebacks2|","Folder 4":"characters|","Folder 5":"enemies|","Folder 6":"faces|","Folder 7":"parallaxes|","Folder 8":"pictures|","Folder 9":"sv_actors|","Folder 10":"sv_enemies|","Folder 11":"system|","Folder 12":"tilesets|","Folder 13":"titles1|","Folder 14":"titles2|","Folder 15":"","Folder 16":"","Folder 17":"","Folder 18":"","Folder 19":"","Folder 20":"","Folder 21":"","Folder 22":"","Folder 23":"","Folder 24":"","Folder 25":""}},
{"name":"ExcludeMaterialGuard","status":true,"description":"未使用素材削除ガードプラグイン","parameters":{"画像素材":"[\"particles/_ANIM_Absorb_8\",\"particles/asterisk1\",\"particles/asterisk1g\",\"particles/asterisk_thick1\",\"particles/asterisk_thick1g\",\"particles/asterisk_thin1\",\"particles/asterisk_thin1g\",\"particles/bubble1\",\"particles/bubble2\",\"particles/bubble1g\",\"particles/bubble2g\",\"particles/cartoon_fuss1\",\"particles/cartoon_fuss2\",\"particles/circle\",\"particles/circle2\",\"particles/circle3\",\"particles/circle2g\",\"particles/circle3g\",\"particles/cloud1\",\"particles/cloud2\",\"particles/cloud3\",\"particles/cloud1s\",\"particles/cloud2s\",\"particles/cloud3s\",\"particles/fish1\",\"particles/fish1g\",\"particles/flame1\",\"particles/flame1g\",\"particles/flare\",\"particles/flare2\",\"particles/heart1\",\"particles/heart4\",\"particles/heart1g\",\"particles/heart4g\",\"particles/hexagon1\",\"particles/hexagon1g\",\"particles/hexagon_line1\",\"particles/hexagon_line2\",\"particles/hexagon_line3\",\"particles/hexagon_line1g\",\"particles/hexagon_line2g\",\"particles/hexagon_line3g\",\"particles/leaf1\",\"particles/leaf1g\",\"particles/line1\",\"particles/line2\",\"particles/line3\",\"particles/line4\",\"particles/line_drop1\",\"particles/line_oval1\",\"particles/line_oval2\",\"particles/line_oval3\",\"particles/line_rain1\",\"particles/line_rain2\",\"particles/line_ray1\",\"particles/line_ray2\",\"particles/line_ray3\",\"particles/note1\",\"particles/note1g\",\"particles/note_tuplet1\",\"particles/note_tuplet1g\",\"particles/particle1\",\"particles/particle2\",\"particles/particle3\",\"particles/particle4\",\"particles/particle5\",\"particles/particle6\",\"particles/particle7\",\"particles/particle8\",\"particles/particle9\",\"particles/petal1\",\"particles/petal2\",\"particles/petal1g\",\"particles/petal2g\",\"particles/ring1\",\"particles/ring2\",\"particles/ring3\",\"particles/ring1g\",\"particles/ring2g\",\"particles/ring3g\",\"particles/ripple1\",\"particles/ripple2\",\"particles/ripple1g\",\"particles/ripple2g\",\"particles/shine1\",\"particles/shine2\",\"particles/shine3\",\"particles/shine1g\",\"particles/shine_thin1\",\"particles/shine_thin2\",\"particles/shine_thin3\",\"particles/shine_thin1g\",\"particles/smog1\",\"particles/smog2\",\"particles/smoke1\",\"particles/smoke2\",\"particles/snow1\",\"particles/snow2\",\"particles/snow3\",\"particles/snow4\",\"particles/snow5\",\"particles/snow1g\",\"particles/snow2g\",\"particles/snow3g\",\"particles/snow4g\",\"particles/snow5g\",\"particles/snow_blizard1\",\"particles/snow_blizard1g\",\"particles/snow_particle1\",\"particles/snow_particle2\",\"particles/snow_particle1g\",\"particles/snow_particle2g\",\"particles/square1\",\"particles/square3\",\"particles/square5\",\"particles/square1g\",\"particles/square3g\",\"particles/square5g\",\"particles/square_line1\",\"particles/square_line2\",\"particles/square_line3\",\"particles/square_line1g\",\"particles/square_line2g\",\"particles/square_line3g\",\"particles/star1\",\"particles/star1g\",\"particles/star_thick1\",\"particles/star_thick1g\",\"particles/star_thin1\",\"particles/star_thin1g\",\"particles/sunlight\",\"particles/thunder1\",\"particles/thunder2\",\"particles/thunder3\",\"particles/thunder1_2\",\"particles/triangle1\",\"particles/triangle1g\",\"particles/triangle_line1\",\"particles/triangle_line2\",\"particles/triangle_line1g\",\"particles/triangle_line2g\",\"system/ActionButton\",\"system/CancelButton\",\"system/DirPad\"]","音声素材":""}},
{"name":"CustomizeErrorScreen","status":true,"description":"エラー画面表示改善プラグイン","parameters":{"MainMessage":"以下のエラーが発生しました。","HyperLink":"https://forms.gle/QV1sbnDHAxf3uKig9","OutputDetail":"true"}},
{"name":"VolumeOffset","status":true,"description":"コンフィグのボリューム値を小刻みにするプラグイン","parameters":{"OffsetParameter":"5"}},
{"name":"MadeWithMv","status":false,"description":"メイン画面へ進む前に、\"Made with MV\"のスプラッシュ画面もしくはカスタマイズされたスプラッシュ画面を表示します。","parameters":{"Show Made With MV":"true","Made with MV Image":"MadeWithMv","Show Custom Splash":"false","Custom Image":"","Fade Out Time":"120","Fade In Time":"120","Wait Time":"160"}},
{"name":"AutoLoad","status":true,"description":"タイトル画面仕様変更プラグイン","parameters":{"効果音演奏":"ON","完全スキップ":"OFF","タイトルマップID":"1"}},
{"name":"111_InputForm","status":true,"description":"フォーム作って文字入力（修正版）","parameters":{}},
{"name":"AcceptAllKeys","status":true,"description":"使えるキーを拡張します","parameters":{"key_a":"a","key_b":"b","key_c":"c","key_d":"d","key_e":"e","key_f":"f","key_g":"g","key_h":"h","key_i":"i","key_j":"j","key_k":"k","key_l":"l","key_m":"m","key_n":"n","key_o":"o","key_p":"p","key_q":"pageup","key_r":"r","key_s":"s","key_t":"t","key_u":"u","key_v":"v","key_w":"pagedown","key_x":"escape","key_y":"y","key_z":"ok","key_backspace":"escape","key_tab":"tab","key_enter":"ok","key_shift":"escape","key_control":"control","key_alt":"alt","key_escape":"escape","key_space":"ok","key_pageup":"pageup","key_pagedown":"pagedown","key_left":"left","key_right":"right","key_up":"up","key_down":"down","key_insert":"escape","numpad_0":"escape","numpad_2":"down","numpad_4":"left","numpad_6":"right","numpad_8":"up","F9":"debug"}},
{"name":"FixSimultaneouslyPress","status":true,"description":"同時押し仕様変更プラグイン","parameters":{}},
{"name":"Chikuwa","status":true,"description":"「どのデータをロードしても共有した変数を読み込める」プラグイン","parameters":{"FileName":"Assign","WebStorageKey":"Chikuwa"}},
{"name":"CustomizeConfigDefault","status":true,"description":"オプションデフォルト値設定プラグイン","parameters":{"常時ダッシュ":"ON","コマンド記憶":"OFF","BGM音量":"20","BGS音量":"30","ME音量":"30","SE音量":"30","常時ダッシュ消去":"ON","コマンド記憶消去":"ON","BGM音量消去":"OFF","BGS音量消去":"ON","ME音量消去":"OFF","SE音量消去":"OFF"}},
{"name":"CustomizeConfigItem","status":true,"description":"オプション任意項目作成プラグイン","parameters":{"数値項目":"","文字項目":"","スイッチ項目":"","音量項目":""}},
{"name":"DTextPicture","status":true,"description":"動的文字列ピクチャ生成プラグイン","parameters":{"itemIconSwitchId":"0","lineSpacingVariableId":"0","frameWindowSkin":"","frameWindowPadding":"18","padCharacter":"0","prefixText":"","n_value":"1180"}},
{"name":"TRP_ParticleList","status":true,"description":"","parameters":{}},
{"name":"TRP_ParticlePreset","status":true,"description":"","parameters":{}},
{"name":"TRP_Particle","status":true,"description":"※TRP_ParticlePresetより下に配置","parameters":{"importLibrary":"true","importFilter":"true","systemParticles":"[\"particle set click click\",\"particle set click2 click\"]","commandName":"particle,パーティクル","keepPictureOrder":"false","walkOffset":"16","dashOffset":"16","categoryClear":"==============================","clearCharacterOnMapChange":"true","clearPartyOnMapChange":"true","clearScreenOnMapChange":"true","clearBattleScreenOnEnd":"false","clearBattleCharaOnEnd":"true","categoryPerformance":"==============================","regionMargin":"2","outsideMargin":"6","maxParticles":"100000","categoryConflict":"==============================","disableState":"false","disableSkill":"false","disableRoute":"false","cacheBeforeTerminate":"false","categorySenior":"==============================","sceneTypes":"[\"Scene_Menu-Scene_Save-Scene_Item-Scene_Equip-Scene_Actor-Scene_Skill-Scene_Status\",\"Scene_Title\",\"Scene_Load\",\"Scene_Options\",\"Scene_Shop\",\"Scene_Gameover\"]","noRewriteFunctions":"false","categoryDebug":"==============================","displayCount":"false","errorLog":"true"}},
{"name":"TRP_ParticleEditor","status":true,"description":"※TRP_Particleより下に配置","parameters":{"showGuide":"true","paramFontSize":"18","noColorCode":"false","buttonFontSize":"13","buttonWidth":"86","saveAsArray":"false","copyAsArray":"true"}},
{"name":"dashBan","status":true,"description":"ダッシュを禁止するプラグインです","parameters":{}},
{"name":"PictureCallCommon","status":true,"description":"ピクチャのボタン化プラグイン","parameters":{"透明色を考慮":"true","ピクチャ番号の変数番号":"0","ポインタX座標の変数番号":"0","ポインタY座標の変数番号":"0","タッチ操作抑制":"false","タッチ操作抑制スイッチ":"0","戦闘中常にコモン実行":"false","並列処理として実行":"false","無効スイッチ":"0"}},
{"name":"PictureAnimation","status":true,"description":"ピクチャのアニメーションプラグイン","parameters":{"最初のセルに戻る":"false"}},
{"name":"stbvorbis_stream_asm","status":false,"description":"","parameters":{}},
{"name":"stbvorbis_stream","status":false,"description":"","parameters":{}},
{"name":"AudioStreaming","status":true,"description":"音声読み込みを高速化し、oggファイルのみを使用します。","parameters":{"mode":"10","deleteM4a":"false"}},
{"name":"SAN_Imp_ColorCache","status":false,"description":"カラーキャッシュ 1.0.0\nパフォーマンス改善プラグインです。","parameters":{}},
{"name":"SAN_Imp_SkipParallelEventPreload","status":true,"description":"並列イベントプリロードスキップ 1.0.0\nパフォーマンス改善プラグインです。","parameters":{}},
{"name":"EasingPicture","status":true,"description":"ピクチャーの移動パターンを増やします。","parameters":{}},
{"name":"LoadingExtend","status":true,"description":"ロード中画像拡張プラグイン","parameters":{"イメージ列数":"2","イメージ行数":"7","表示タイプ":"1","セル指定変数":"1","アニメーション間隔":"800","表示位置X座標":"","表示位置Y座標":"","待機フレーム数":"30","点滅なし":"OFF"}},
{"name":"PictureVariableSetting","status":true,"description":"ピクチャ関連のイベント機能拡張プラグイン","parameters":{"初期値":"OFF","ピクチャ表示最大数":"180"}},
{"name":"GraphicsRenderFix","status":true,"description":"放置していると画面がフリーズするのを修正","parameters":{}},
{"name":"SNZ_randomXorshiftOnline","status":false,"description":"ランダムに何かをする処理の精度を上げます　ブラウザプレイ対応","parameters":{}},
{"name":"MPI_AutoWaitForPicture","status":true,"description":"ピクチャの表示実行時、画像読み込み完了まで自動でウェイトする機能を提供します。","parameters":{"ピクチャの表示自動ウェイト切替スイッチ":"60"}},
{"name":"StringSearchReplace","status":true,"description":"","parameters":{}},
{"name":"Torigoya_RetryLoadPlus","status":false,"description":"ファイルの読み込み失敗時にリトライします","parameters":{"Retry Max":"10","Retry Message Text":"ファイルの読み込みに失敗しました。\\nネットワーク状況を確認して、リトライしてください。","Retry Button Text":"リトライする"}},
{"name":"SNZ_randomXorshiftOnline","status":false,"description":"ランダムに何かをする処理の精度を上げます　ブラウザプレイ対応","parameters":{}},
{"name":"RGenRandomizer","status":true,"description":"ランダムな変数出力","parameters":{"exported_value":"6"}},
{"name":"GetStageFromGitHub","status":true,"description":"GitHubからエディットステージを持ってくる関数。","parameters":{"extra_page":"1172","extra_sub_place":"1173","font_edit":"NotoSansJP-Bold","font_outline":"1179"}},
{"name":"CognitiveOpenedRuby","status":true,"description":"ルビの感知+入力された文字列の処理","parameters":{"replacehalf":"272"}},
{"name":"QuestionImport","status":true,"description":"jsonで問題保存","parameters":{"Owner":"Formidi","Repo":"KanzideGoQuestion","SHAForApp":"","IsLocal":"0","length_tmp":"1167","Replace":"1"}},
{"name":"ApplicationPictureRename","status":true,"description":"区切りのピクチャ名をスマホプレイ時に置換します","parameters":{"RenameStrings":"A2,Howto_Select_A1,Howto_Select_A2,Select_Ctrl_A,Select_Ctrl_B,Select_Ctrl_C,Select_Ctrl_D,Select_D,Select_D_b,Select_D_c,Select_Down_A,Select_Down_B,Select_Down_C,Select_Down_D,Select_Shift_A,Select_Shift_B,Select_Shift_C,Select_Shift_D,Select_Shift_E,Select_Shift_F,Select_Shift_G,Select_Space_A,Select_Space_B,Select_Space_C,Select_Space_D,Select_Space_E,Select_Space_F,Select_Space_G,Select_Space_H,Select_Space_I,Select_U,Select_U_a,Select_U_b,Select_U2,Select_Up_A,Select_Up_B,Select_Up_C,Update_SelectA,Update_SelectB,Window_Text_N,Window_Text_Y,Miss_Mes_A,Window_length_bg,Select_D_cA,Select_Ctrl_E"}},
{"name":"GitHubAutoUpdater","status":true,"description":"Allows automatic updates from a GitHub repository.","parameters":{"Owner":"Formidi","Repo":"KanzideGo","DPath":"./www/","InitialSHA":"b488158f19d7dae218f4b66839eb425a6a4eac7d","Judge":"232","isUpdate":"230","pictureName":"Version_Latest"}},
{"name":"MakeMathQuestion","status":true,"description":"プラグインの説明をここに記述します。","parameters":{"question":"8","answer":"9"}},
{"name":"seedrandom","status":true,"description":"","parameters":{}},
{"name":"varIDforPlugin","status":true,"description":"【末尾に導入】\r\nプラグイン引数に変数の値を採用","parameters":{}},
{"name":"Torigoya_FixMuteAudio","status":false,"description":"スマホでブラウザを非アクティブにすると音が二度と鳴らなくなることがあるのを防止するやつ","parameters":{}},
{"name":"ThroughFailedToLoad","status":false,"description":"ロード失敗エラーのすり抜けプラグイン","parameters":{"テストプレー時無効":"true","Web版で無効":"false","無視種別":"3"}},
{"name":"FixImageLoading","status":false,"description":"画像ロード時のチラつき防止プラグイン","parameters":{}},
{"name":"UR65_SmartPhoneUI","status":false,"description":"スマホ用UI  ver 1.0.0\nUIのサイズをスマートフォン向けに最適化します。","parameters":{"タイトル":"0","メニュー":"0","アイテム":"0","スキル":"0","装備":"0","オプション":"1","ゲーム終了":"0","戦闘":"0","ショップ":"0","イベント関係":"1","アイコン位置修正":"0"}},
{"name":"Nuka_VersionFetch","status":false,"description":"アプリが最新バージョンで無い場合は注意ダイアログを表示","parameters":{}},
{"name":"--------------------------------","status":false,"description":"--------------------------------","parameters":{}},
{"name":"DRS_BoostEngineMV","status":false,"description":"ゲームスピードを動的に変更します。","parameters":{}}
];