// --------------------------------------------------------------------------
// 
// VolumeOffset
//
// Copyright (c) kotonoha*
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
// 2017/03/30 ver1.0 プラグイン公開
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc コンフィグのボリューム値を小刻みにするプラグイン
 * @author kotonoha*
 *
 * @help コンフィグのボリューム値を小刻みにするプラグインです。
 * 
 * @param OffsetParameter
 * @desc 増減させる数値を入力してください。
 * @default 10
 *
 */

(function() {

    var parameters = PluginManager.parameters('VolumeOffset');
	var OffsetParameter = Number(parameters['OffsetParameter']);

	Window_Options.prototype.volumeOffset = function() {
		if (OffsetParameter === 0) {
	    	return 10;
	    }else{
	    	return OffsetParameter;
	    }
	};

})();