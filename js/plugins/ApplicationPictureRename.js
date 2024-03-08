//=============================================================================
// ApplicationPictureRename.js
//=============================================================================
/*:
 * @plugindesc 区切りのピクチャ名をスマホプレイ時に置換します
 *
 * @help
 * ,区切りのピクチャ名を置換します。
 *
 * @param RenameStrings
 * @desc テキストのフォント
 * @type string
 * @default Cust_SelectA,Gameover_Select_A1,Gameover_Select_A2,Gameover_Select_A3,Howto_Select_A1,Howto_Select_A2,Menu_h1,Menu_m1,Menu_m2,Menu_m3,Menu_m4,Menu_s1,Menu_s2,Select_Ctrl_A,Select_Ctrl_B,Select_Ctrl_C,Select_Ctrl_D,Select_Down_B,Select_Shift_A,Select_Shift_B,Select_Shift_C,Select_Shift_D,Select_Shift_E,Select_Shift_F,Select_Shift_G,Select_Space_A,Select_Space_B,Select_Space_C,Select_Space_D,Select_Space_E,Select_Space_F,Select_Space_G,Update_Select_A,Update_Select_B,Window_Text_N,Window_Text_Y
 *
 * @author chuukunn
 *
 */

(function () {
    var parameters = PluginManager.parameters('ApplicationPictureRename');
    var RenameStrings = (parameters['RenameStrings'] || "Cust_SelectA,Gameover_Select_A1,Gameover_Select_A2,Gameover_Select_A3,Howto_Select_A1,Howto_Select_A2,Menu_h1,Menu_m1,Menu_m2,Menu_m3,Menu_m4,Menu_s1,Menu_s2,Select_Ctrl_A,Select_Ctrl_B,Select_Ctrl_C,Select_Ctrl_D,Select_Down_B,Select_Shift_A,Select_Shift_B,Select_Shift_C,Select_Shift_D,Select_Shift_E,Select_Shift_F,Select_Shift_G,Select_Space_A,Select_Space_B,Select_Space_C,Select_Space_D,Select_Space_E,Select_Space_F,Select_Space_G,Update_SelectA,Update_SelectB,Window_Text_N,Window_Text_Y");
    function isInputInRenameStrings(input) {
        const stringList = RenameStrings.split(',').map(item => item.trim());
        return stringList.includes(input);
    }

    var originalShowPicture = Game_Screen.prototype.showPicture;
    Game_Screen.prototype.showPicture = function (pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode) {

        if (isInputInRenameStrings(pictureName)) {
            if (navigator.userAgent.match(/android|iphone|ios|ipod|ipad/i)) {
                originalShowPicture.call(this, pictureId, pictureName + "_sp", origin, x, y, scaleX, scaleY, opacity, blendMode);
            } else {
                originalShowPicture.call(this, pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode);
            }

        } else {
            originalShowPicture.call(this, pictureId, pictureName, origin, x, y, scaleX, scaleY, opacity, blendMode);
        }
    };

})();
