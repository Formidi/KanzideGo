//=============================================================================
 /*:
 * @plugindesc スマホ用UI  ver 1.0.0 
 * UIのサイズをスマートフォン向けに最適化します。
 * @author うろろこ
 *
 * 
 *
 * @param タイトル
 * @desc タイトル画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1

 * @param メニュー
 * @desc メニュー画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *  
 * @param アイテム
 * @desc アイテム画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 * 
 * @param スキル
 * @desc スキル画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param 装備
 * @desc 装備画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param オプション
 * @desc オプション画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param ゲーム終了
 * @desc ゲーム終了画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param 戦闘
 * @desc 戦闘画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param ショップ
 * @desc ショップ画面を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param イベント関係
 * @desc 名前入力、数値入力、選択肢、アイテム選択を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 * @param アイコン位置修正
 * @desc アイコンの表示位置を変更します。
 * [ ON ] 1  /  [ OFF ] 0     
 * @default 1
 *
 *
 * @help
 * RPGツクールＭＶのデフォルトのＵＩがスマホだと使いにくいので
 * 全体的に押しやすくしました。
 * 
 * ※ゴールドウィンドウのサイズはショップがＯＮの時に変更されます。
 *
 */

(function(){

    var parameters = PluginManager.parameters('UR65_SmartPhoneUI');

    var using_title = parseInt(String(parameters['タイトル']), 10) != 0;
    var using_menu = parseInt(String(parameters['メニュー']), 10) != 0;
    var using_item = parseInt(String(parameters['アイテム']), 10) != 0;
    var using_skill = parseInt(String(parameters['スキル']), 10) != 0;
    var using_equip = parseInt(String(parameters['装備']), 10) != 0;
    var using_options = parseInt(String(parameters['オプション']), 10) != 0;
    var using_gemeend = parseInt(String(parameters['ゲーム終了']), 10) != 0;
    var using_battle = parseInt(String(parameters['戦闘']), 10) != 0;
    var using_shop = parseInt(String(parameters['ショップ']), 10) != 0;
    var using_event = parseInt(String(parameters['イベント関係']), 10) != 0;
    var using_iconposition = parseInt(String(parameters['アイコン位置修正']), 10) != 0;

    //=====================================================
    // タイトル
    //=====================================================    
    if (using_title) {
        Window_TitleCommand.prototype.lineHeight = function() {
            return 72;
        };    
    }

    //=====================================================
    // メニュー関係
    //=====================================================
    if (using_menu) {
        Window_MenuCommand.prototype.lineHeight = function() {
            return 60;
        };
        
        Window_Status.prototype.lineHeight = function() {
            return 36;
        };

        Window_MenuActor.prototype.lineHeight = function() {
            return 36;
        };

        Window_SavefileList.prototype.lineHeight = function() {
            return 36;
        };     
    }

    //アイテム
    //---------------------------------------------------------
    if (using_item) {
        Window_ItemList.prototype.lineHeight = function() {
            return 66;
        };

        Window_ItemCategory.prototype.lineHeight = function() {
            return 54;
        };
    }   
    //---------------------------------------------------------

    //スキル
    //---------------------------------------------------------
    if (using_skill) {
        Window_SkillList.prototype.lineHeight = function() {
            return 66;
        };

        Window_SkillStatus.prototype.lineHeight = function() {
            return 36;
        };

        Window_SkillType.prototype.lineHeight = function() {
            return 54;
        };        
    }    
    //---------------------------------------------------------

    //装備
    //---------------------------------------------------------
    if (using_equip) {
        Window_EquipCommand.prototype.lineHeight = function() {
            return 48;
        };

        Window_EquipCommand.prototype.maxCols = function() {
            return 3;
        };

        Window_EquipCommand.prototype.numVisibleRows = function() {
            return 1;
        };

        Window_EquipStatus.prototype.lineHeight = function() {
            return 42;
        };

        Window_EquipItem.prototype.lineHeight = function() {
            return 66;
        };

        Window_EquipItem.prototype.maxCols = function() {
            return 2;
        };

        Window_EquipSlot.prototype.lineHeight = function() {
            return 66;
        };

        Window_EquipSlot.prototype.maxCols = function() {
            return 2;
        };
        
        Window_EquipSlot.prototype.drawItem = function(index) {
            if (this._actor) {
                var rect = this.itemRectForText(index);
                this.changeTextColor(this.systemColor());
                this.changePaintOpacity(this.isEnabled(index));

                var default_font_size = this.contents.fontSize;
                this.contents.fontSize = 16;
                this.drawText(this.slotName(index), rect.x - 3, rect.y - 21, 138, this.lineHeight() / 2);
                this.contents.fontSize = 22;
                this.drawItemName(this._actor.equips()[index], rect.x - 8, rect.y + 7);
                this.contents.fontSize = default_font_size;

                this.changePaintOpacity(true);
            }
        };
    }
    //---------------------------------------------------------

    //オプション
    //---------------------------------------------------------
    if (using_options) {
        Window_Options.prototype.lineHeight = function() {
            return 72;
        };
    }

    //---------------------------------------------------------

    //ゲーム終了
    //---------------------------------------------------------
    if (using_gemeend) {
        Window_GameEnd.prototype.lineHeight = function() {
            return 72;
        };        
    }
    //---------------------------------------------------------

    //=====================================================
    // 戦闘関係
    //=====================================================
    if (using_battle) {        
        Window_BattleStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth - Graphics.boxWidth / 3;
        };

        Window_BattleLog.prototype.lineHeight = function() {
            return 36;
        };

        Window_BattleEnemy.prototype.lineHeight = function() {
            return 72;
        };

        Window_BattleEnemy.prototype.windowHeight = function() {
            return 325;
        };

        Window_BattleEnemy.prototype.windowWidth= function() {
            return Graphics.boxWidth;
        };

        Window_BattleEnemy.prototype.initialize = function(x, y) {
            this._enemies = [];
            var width = this.windowWidth();
            var height = this.windowHeight();
            Window_Selectable.prototype.initialize.call(this, x, y - 145, width, height);
            this.refresh();
            this.hide();
        };

        Window_BattleActor.prototype.lineHeight = function() {
            return 72;
        };

        Window_BattleActor.prototype.windowWidth = function() {
            return Graphics.boxWidth;
        };

        Window_BattleActor.prototype.windowHeight = function() {
            return 325;
        };

        Window_BattleActor.prototype.initialize = function(x, y) {
            Window_BattleStatus.prototype.initialize.call(this);
            this.x = x;
            this.y = y - 145;
            this.openness = 255;
            this.hide();
        };

        Window_BattleSkill.prototype.lineHeight = function() {
            return 66;
        };

        Window_BattleItem.prototype.lineHeight = function() {
            return 66;
        };

        Window_PartyCommand.prototype.lineHeight = function() {
            return 72;
        };   

        Window_PartyCommand.prototype.windowWidth = function() {
            return Graphics.boxWidth / 3;
        };

        Window_PartyCommand.prototype.windowHeight = function() {
            return 180;
        }; 

        Window_ActorCommand.prototype.lineHeight = function() {
            return 72;
        };

        Window_ActorCommand.prototype.maxCols = function() {
            return 2;
        };

        Window_ActorCommand.prototype.windowHeight = function() {
            return 180;
        };

        Window_ActorCommand.prototype.windowWidth = function() {
            return Graphics.boxWidth / 3;
        };

    }
    //=====================================================
    // ショップ関係
    //=====================================================
    if (using_shop) {
        Window_Gold.prototype.lineHeight = function() {
            return 54;
        };

        Window_ShopCommand.prototype.lineHeight = function() {
            return 54;
        };

        Window_ShopStatus.prototype.lineHeight = function() {
            return 36;
        };

        Window_ShopStatus.prototype.refresh = function() {
            this.contents.clear();
            if (this._item) {
                var x = this.textPadding();
                this.drawPossession(x, 0);
                if (this.isEquipItem()) {
                    this.drawEquipInfo(x, this.lineHeight() * 3 / 2);
                }
            }
        };
        
        Window_ShopNumber.prototype.createButtons = function() {
            var bitmap = ImageManager.loadSystem('ButtonSet72');
            var buttonWidth = 72;
            var buttonHeight = 72;
            this._buttons = [];
            for (var i = 0; i < 5; i++) {
                var button = new Sprite_Button();
                var x = buttonWidth * i;
                var w = buttonWidth * (i === 4 ? 2 : 1);
                button.bitmap = bitmap;
                button.setColdFrame(x, 0, w, buttonHeight);
                button.setHotFrame(x, buttonHeight, w, buttonHeight);
                button.visible = false;
                this._buttons.push(button);
                this.addChild(button);
            }
            this._buttons[0].setClickHandler(this.onButtonDown2.bind(this));
            this._buttons[1].setClickHandler(this.onButtonDown.bind(this));
            this._buttons[2].setClickHandler(this.onButtonUp.bind(this));
            this._buttons[3].setClickHandler(this.onButtonUp2.bind(this));
            this._buttons[4].setClickHandler(this.onButtonOk.bind(this));
        };

        Window_ShopNumber.prototype.placeButtons = function() {
            var numButtons = this._buttons.length;
            var spacing = 24;
            var spacingY = 12;
            var totalWidth = -spacing;
            for (var i = 0; i < numButtons; i++) {
                totalWidth += this._buttons[i].width + spacing;
            }
            var x = (this.width - totalWidth) / 2;
            var button;

            button = this._buttons[0];
            button.x = this.width / 2 - button.width * 2 - spacing * 3 / 2;
            button.y = this.buttonY();

            button = this._buttons[1];
            button.x = this.width / 2 - button.width - spacing / 2;
            button.y = this.buttonY();

            button = this._buttons[2];
            button.x = this.width / 2 + spacing / 2;
            button.y = this.buttonY();

            button = this._buttons[3];
            button.x = this.width / 2 + button.width + spacing * 3 / 2;
            button.y = this.buttonY();

            button = this._buttons[4];
            button.x = this.width / 2 - button.width / 2;
            button.y = this.buttonY() + button.height + spacingY;
        };

        Window_ShopNumber.prototype.drawNumber = function() {
            var x = this.cursorX();
            var y = this.itemY();
            var width = this.cursorWidth() - this.textPadding();
            this.resetTextColor();
            this.drawText(this._number, x, y, width, 'right');
        };

        Window_ShopNumber.prototype.itemY = function() {
            return Math.round(this.contentsHeight() / 4 - this.lineHeight() * 1.5);
        };

        Window_ShopNumber.prototype.priceY = function() {
            return Math.round(this.contentsHeight() / 4 + this.lineHeight() / 2);
        };

        Window_ShopBuy.prototype.lineHeight = function() {
            return 60;
        };

        Window_ShopSell.prototype.lineHeight = function() {
            return 60;
        };

    }

    
    //=====================================================
    // イベント関係
    //=====================================================
    if (using_event) {
        Window_NameEdit.prototype.initialize = function(actor, maxLength) {
            var width = this.windowWidth();
            var height = this.windowHeight();
            var x = (Graphics.boxWidth - width) / 2;
            var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 60)) / 2;
            Window_Base.prototype.initialize.call(this, x, y, width, height);
            this._actor = actor;
            this._name = actor.name().slice(0, this._maxLength);
            this._index = this._name.length;
            this._maxLength = maxLength;
            this._defaultName = this._name;
            this.deactivate();
            this.refresh();
            ImageManager.loadFace(actor.faceName());
        };

        Window_NameInput.prototype.lineHeight = function() {
            return 42;
        };

        Window_NameInput.prototype.initialize = function(editWindow) {
            var x = editWindow.x;
            var y = editWindow.y + editWindow.height +8;
            var width = editWindow.width;
            var height = this.windowHeight();
            Window_Selectable.prototype.initialize.call(this, x, y, width, height);
            this._editWindow = editWindow;
            this._page = 0;
            this._index = 0;
            this.refresh();
            this.updateCursor();
            this.activate();
        };

        Window_NumberInput.prototype.lineHeight = function() {
            return 94;
        };

        Window_NumberInput.prototype.createButtons = function() {
            var bitmap = ImageManager.loadSystem('ButtonSet72');
            var buttonWidth = 72;
            var buttonHeight = 72;
            this._buttons = [];
            for (var i = 0; i < 3; i++) {
                var button = new Sprite_Button();
                var x = buttonWidth * [1, 2, 4][i];
                var w = buttonWidth * (i === 2 ? 2 : 1);
                button.bitmap = bitmap;
                button.setColdFrame(x, 0, w, buttonHeight);
                button.setHotFrame(x, buttonHeight, w, buttonHeight);
                button.visible = false;
                this._buttons.push(button);
                this.addChild(button);
            }
            this._buttons[0].setClickHandler(this.onButtonDown.bind(this));
            this._buttons[1].setClickHandler(this.onButtonUp.bind(this));
            this._buttons[2].setClickHandler(this.onButtonOk.bind(this));
        };
        
        Window_NumberInput.prototype.placeButtons = function() {
            var numButtons = this._buttons.length;
            var spacing = 16;
            var totalWidth = -spacing;
            for (var i = 0; i < numButtons; i++) {
                totalWidth += this._buttons[i].width + spacing;
            }
            var x = (this.width - totalWidth) / 2;
            for (var j = 0; j < numButtons; j++) {
                var button = this._buttons[j];
                button.x = x;
                button.y = this.buttonY() + 240;
                x += button.width + spacing;
            }
        };

        Window_EventItem.prototype.lineHeight = function() {
            return 66;
        };

        Window_ChoiceList.prototype.lineHeight = function() {
            return 60;
        };

        Window_ChoiceList.prototype.drawItem = function(index) {
            var rect = this.itemRectForText(index);
            this.drawTextEx(this.commandName(index), rect.x, rect.y + 9);
        };
    }

    //=====================================================
    // アイコン位置修正
    //=====================================================
    if (using_iconposition) {
        Window_Base.prototype.drawItemName = function(item, x, y, width) {
            width = width || 312;
            if (item) {
                var iconBoxWidth = Window_Base._iconWidth + 4;
                this.resetTextColor();
                this.drawIcon(item.iconIndex, x + 8, y + this.lineHeight() / 2 - Window_Base._iconHeight / 2);
                this.drawText(item.name, x + iconBoxWidth + 14, y, width - iconBoxWidth);
            }
    	};
    }

})();
