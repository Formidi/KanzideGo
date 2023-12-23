

/*:
 * @plugindesc 使えるキーを拡張します
 * @author dummy
 *
 * @param key_a
 * @desc キー入力の内部割り当てを定義します。
 * @default a
 * @param key_b
 * @desc キー入力の内部割り当てを定義します。
 * @default b
 * @param key_c
 * @desc キー入力の内部割り当てを定義します。
 * @default c
 * @param key_d
 * @desc キー入力の内部割り当てを定義します。
 * @default d
 * @param key_e
 * @desc キー入力の内部割り当てを定義します。
 * @default e
 * @param key_f
 * @desc キー入力の内部割り当てを定義します。
 * @default f
 * @param key_g
 * @desc キー入力の内部割り当てを定義します。
 * @default g
 * @param key_h
 * @desc キー入力の内部割り当てを定義します。
 * @default h
 * @param key_i
 * @desc キー入力の内部割り当てを定義します。
 * @default i
 * @param key_j
 * @desc キー入力の内部割り当てを定義します。
 * @default j
 * @param key_k
 * @desc キー入力の内部割り当てを定義します。
 * @default k
 * @param key_l
 * @desc キー入力の内部割り当てを定義します。
 * @default l
 * @param key_m
 * @desc キー入力の内部割り当てを定義します。
 * @default m
 * @param key_n
 * @desc キー入力の内部割り当てを定義します。
 * @default n
 * @param key_o
 * @desc キー入力の内部割り当てを定義します。
 * @default o
 * @param key_p
 * @desc キー入力の内部割り当てを定義します。
 * @default p
 * @param key_q
 * @desc キー入力の内部割り当てを定義します。
 * @default pageup
 * @param key_r
 * @desc キー入力の内部割り当てを定義します。
 * @default r
 * @param key_s
 * @desc キー入力の内部割り当てを定義します。
 * @default s
 * @param key_t
 * @desc キー入力の内部割り当てを定義します。
 * @default t
 * @param key_u
 * @desc キー入力の内部割り当てを定義します。
 * @default u
 * @param key_v
 * @desc キー入力の内部割り当てを定義します。
 * @default v
 * @param key_w
 * @desc キー入力の内部割り当てを定義します。
 * @default pagedown
 * @param key_x
 * @desc キー入力の内部割り当てを定義します。
 * @default escape
 * @param key_y
 * @desc キー入力の内部割り当てを定義します。
 * @default y
 * @param key_z
 * @desc キー入力の内部割り当てを定義します。
 * @default ok

 * @param key_backspace
 * @desc キー入力の内部割り当てを定義します。
 * @default backspace
 * @param key_tab
 * @desc キー入力の内部割り当てを定義します。
 * @default tab
 * @param key_enter
 * @desc キー入力の内部割り当てを定義します。
 * @default ok
 * @param key_shift
 * @desc キー入力の内部割り当てを定義します。
 * @default shift
 * @param key_control
 * @desc キー入力の内部割り当てを定義します。
 * @default control
 * @param key_alt
 * @desc キー入力の内部割り当てを定義します。
 * @default control
 * @param key_escape
 * @desc キー入力の内部割り当てを定義します。
 * @default escape
 * @param key_space
 * @desc キー入力の内部割り当てを定義します。
 * @default ok
 * @param key_pageup
 * @desc キー入力の内部割り当てを定義します。
 * @default pageup
 * @param key_pagedown
 * @desc キー入力の内部割り当てを定義します。
 * @default pagedown
 * @param key_left
 * @desc キー入力の内部割り当てを定義します。
 * @default left
 * @param key_right
 * @desc キー入力の内部割り当てを定義します。
 * @default right
 * @param key_up
 * @desc キー入力の内部割り当てを定義します。
 * @default up
 * @param key_down
 * @desc キー入力の内部割り当てを定義します。
 * @default down
 * @param key_insert
 * @desc キー入力の内部割り当てを定義します。
 * @default escape
 * @param numpad_0
 * @desc キー入力の内部割り当てを定義します。
 * @default escape
 * @param numpad_2
 * @desc キー入力の内部割り当てを定義します。
 * @default down
 * @param numpad_4
 * @desc キー入力の内部割り当てを定義します。
 * @default left
 * @param numpad_6
 * @desc キー入力の内部割り当てを定義します。
 * @default right
 * @param numpad_8
 * @desc キー入力の内部割り当てを定義します。
 * @default up
 * @param F9
 * @desc キー入力の内部割り当てを定義します。
 * @default debug


 * @help
 * ============================================================================
 * コマンドの使い方
 * ============================================================================
 *
 * コマンド一覧
 * 
 * 特定の入力状態をスイッチに代入する
 * 特定のキーではなく、特定のキーが押された結果関連付けられた状態に対応します
 * たとえば、control状態はcontrolキーとaltキーのどちらが押されてもtrueを返します
 * keyCheck 代入先スイッチ番号 ParametersのValueで関連付けられた文字列
 * 例：スイッチ1にokの状態を代入する
 * keyCheck 1 ok
 * 
 * 確認用コマンド
 * 並列実行で実行しておけば、押されたと思われるキーを列挙します
 * たとえば、control状態がtrueの時、control状態をtrueにする可能性のあるcontrolとaltが表示されます
 * keyShow
 */

  (function() {
  var parameters = PluginManager.parameters('AcceptAllKeys');
  
    Input.keyMapper = {
//    9: 'tab',       // tab
9: parameters['key_tab'],
//    13: 'ok',       // enter
13: parameters['key_enter'],
//    16: 'shift',    // shift
16: parameters['key_shift'],
//    17: 'control',  // control
17: parameters['key_control'],
//    18: 'control',  // alt
18: parameters['key_alt'],
//    27: 'escape',   // escape
27: parameters['key_escape'],
//    32: 'ok',       // space
32: parameters['key_space'],
//    33: 'pageup',   // pageup
33: parameters['key_pageup'],
//    34: 'pagedown', // pagedown
34: parameters['key_pagedown'],
//    37: 'left',     // left arrow
37: parameters['key_left'],
//    38: 'up',       // up arrow
38: parameters['key_up'],
//    39: 'right',    // right arrow
39: parameters['key_right'],
//    40: 'down',     // down arrow
40: parameters['key_down'],
    45: 'escape',   // insert
45: parameters['key_insert'],
//    81: 'pageup',   // Q
//    87: 'pagedown', // W
//    88: 'escape',   // X
//    90: 'ok',       // Z
//    96: 'escape',   // numpad 0
96: parameters['numpad_0'],
//    98: 'down',     // numpad 2
98: parameters['numpad_2'],
//    100: 'left',    // numpad 4
100: parameters['numpad_4'],
//    102: 'right',   // numpad 6
102: parameters['numpad_6'],
//    104: 'up',      // numpad 8
104: parameters['numpad_8'],
//    120: 'debug',    // F9
120: parameters['F9'],

8: parameters['key_backspace'],
65: parameters['key_a'],
66: parameters['key_b'],
67: parameters['key_c'],
68: parameters['key_d'],
69: parameters['key_e'],
70: parameters['key_f'],
71: parameters['key_g'],
72: parameters['key_h'],
73: parameters['key_i'],
74: parameters['key_j'],
75: parameters['key_k'],
76: parameters['key_l'],
77: parameters['key_m'],
78: parameters['key_n'],
79: parameters['key_o'],
80: parameters['key_p'],
81: parameters['key_q'],
82: parameters['key_r'],
83: parameters['key_s'],
84: parameters['key_t'],
85: parameters['key_u'],
86: parameters['key_v'],
87: parameters['key_w'],
88: parameters['key_x'],
89: parameters['key_y'],
90: parameters['key_z']
};
  



	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
        	_Game_Interpreter_pluginCommand.call(this, command, args);
		if(command === 'keyCheck'){
			var var_num = args[0];
			var test = args[1];
			var tf = Input.isPressed( test );
			$gameSwitches.setValue(var_num, tf);
		}


		if(command === 'keyShow'){
			var string = "";
			var j=0;
			for(var key in parameters){
				var test = parameters[key];
				var check = Input.isPressed(test);
				if(check){
					if(j>0){
						string += ',';
				  	}
					string += key;
				 	j++;
				}
			}

			if(string){
			  $gameMessage.setFaceImage('Actor2', 3);
			  $gameMessage.setBackground(1);
			  $gameMessage.add(string + "　が押されました");
			}
		}
	}

  
  })();