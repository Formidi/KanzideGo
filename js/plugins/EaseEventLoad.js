//=============================================================================
// Plugin for RPG Maker MV and MZ
// EaseEventLoad.js
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc Optimaize Events' Process To Reduce Their Load
 * @author Sasuke KANNAZUKI
 *
 * @help This plugin does not provide plugin commands.
 * This plugin runs under RPG Maker MV(Ver1.6.0 or later) and MZ.
 * This plugin aims to ease the load of event processing.
 *
 * [Summary]
 * On current system, setting many events on the one map is
 * often the burden of the system.
 * This plugin makes to ease the burden by introducing
 * several optimize functions.
 *
 * [How this plugin achieve reduce load]
 * 1. Get much faster the events at the specified position
 * 2. Skip event move routine if the event neither move nor do animation
 *  except move route forcing.
 * 3. Don't make event sprite if the event set no graphic.
 *  If the event needs sprite, dynamically create sprite.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @target MV MZ
 * @plugindesc イベント処理軽量化
 * @author 神無月サスケ
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * このプラグインは、RPGツクールMV(Ver1.6.0以降)およびMZに対応しています。
 * このプラグインは、イベントがシステムにかける負荷を軽減します。
 *
 * ■概要
 * ひとつのマップに多くのイベントを置くと、しばしばフレームレートが下がります。
 * 100～200以上の多数のイベントがあるマップでは特にそれが顕著になります。
 * このプラグインは、いくつかの最適化を施し、イベントが多数あるマップでの
 * フレームレートの低下を緩和します。
 *
 * ■軽量化のメカニズム
 * 1. その座標にあるイベントを高速に取得可能にした
 * 2. 移動やアニメをしないイベントは、移動関連の判定処理を行わない
 *   「移動ルートの設定」などで移動中は例外
 * 3. 画像が設定されていないイベントはスプライトを作成しない
 *    画像変更やアニメーションが行われる際はその場で作成する
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(() => {
  // ----------------------------------------------------------------------
  // Optimize 1: make eventXy much faster
  // ----------------------------------------------------------------------

  //
  // make event position table to make eventXy much faster.
  //
  const _Game_Temp_initialize = Game_Temp.prototype.initialize
  Game_Temp.prototype.initialize = function() {
    _Game_Temp_initialize.call(this);
    this.eventAt = new EventPositionTable();
  };

  // This is a hash whose key is coord, value is eventIds.
  // Number of event there: 0:null 1:Event ID >2:Array of Event ID
  class EventPositionTable {
    constructor() {
      this.clear();
    }

    clear() {
      this._xyTable = {};
    }

    aToNum(x, y) {
      return (y << 12) + x;
    }

    set(eventId, x, y) {
      const key = this.aToNum(x, y);
      const value = this._xyTable[key];
	  if (value == null) {
        this._xyTable[key] = eventId;
      } else if (typeof value === 'number') {
        this._xyTable[key] = [value, eventId];
      } else if (Array.isArray(value)) {
        this._xyTable[key].push(eventId);
      }
    }

    unset(eventId, x, y) {
      if (x < 0) { // before the event sets coord
        return;
      }
      const key = this.aToNum(x, y);
      const value = this._xyTable[key];
      if (typeof value === 'number' && value === eventId) {
        this._xyTable[key] = null;
      } else if (Array.isArray(value)) {
        if (value.length === 2) {
          this._xyTable[key] = value[0] === eventId ? value[1] : value[0];
        } else {
          this._xyTable[key] = this._xyTable[key].filter(e => e !== eventId);
        }
      }
    }

    get(x, y) {
      const key = this.aToNum(x, y);
      const value = this._xyTable[key];
      if (value == null) {
        return [];
      } else if (typeof value === 'number') {
        return [value];
      } else if (Array.isArray(value)) {
        return value;
      }
    }

    setFirst(events) {
      this.clear();
      for (const event of events) {
        if (event) {
          const eventId = event.eventId();
          const x = event.x;
          const y = event.y;
          this.set(eventId, x, y);
        }
      }
    }
  }

  //
  // at setting the new map, clear event position table
  //
  const _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    $gameTemp.eventAt.clear();
    _Game_Map_setup.call(this, mapId);
  };


  //
  // when load the game, initialize and recreate position table
  //
  const _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
  Game_System.prototype.onAfterLoad = function() {
    _Game_System_onAfterLoad.call(this);
    $gameTemp.eventAt.setFirst($gameMap.events());
  };

  //
  // when an event change the location, modify event position table
  //
  const _Game_Event_initMembers = Game_Event.prototype.initMembers;
  Game_Event.prototype.initMembers = function() {
    _Game_Event_initMembers.call(this);
    // stay invalid coord until the event locate is set.
    this._x = -1;
    this._y = -1;
  };

  const _Game_Event_setPosition = Game_Event.prototype.setPosition;
  Game_Event.prototype.setPosition = function(x, y) {
    $gameTemp.eventAt.unset(this.eventId(), this.x, this.y);
    _Game_Event_setPosition.call(this, x, y);
    $gameTemp.eventAt.set(this.eventId(), this.x, this.y);
  };

  const _Game_Event_moveStraight = Game_Event.prototype.moveStraight;
  Game_Event.prototype.moveStraight = function(d) {
    $gameTemp.eventAt.unset(this.eventId(), this.x, this.y);
    _Game_Event_moveStraight.call(this, d);
    $gameTemp.eventAt.set(this.eventId(), this.x, this.y);
  };

  const _Game_Event_moveDiagonally = Game_Event.prototype.moveDiagonally;
  Game_Event.prototype.moveDiagonally = function(horz, vert) {
    $gameTemp.eventAt.unset(this.eventId(), this.x, this.y);
    _Game_Event_moveDiagonally.call(this, horz, vert);
    $gameTemp.eventAt.set(this.eventId(), this.x, this.y);
  };

  const _Game_Event_jump = Game_Event.prototype.jump;
  Game_Event.prototype.jump = function(xPlus, yPlus) {
    $gameTemp.eventAt.unset(this.eventId(), this.x, this.y);
    _Game_Event_jump.call(this, xPlus, yPlus);
    $gameTemp.eventAt.set(this.eventId(), this.x, this.y);
  };

  //
  // obtain events' list there much faster then default
  //
  Game_Map.prototype.eventsXy = function(x, y) {
    return $gameTemp.eventAt.get(x, y).map(id => $gameMap.event(id));
  };

  Game_Map.prototype.eventsXyNt = function(x, y) {
    return this.eventsXy(x, y).filter(event => event.posNt(x, y));
  };

  Game_Map.prototype.tileEventsXy = function(x, y) {
    return this.eventsXy(x, y).filter(e => e.isTile() && e.posNt(x, y));
  };

  // ----------------------------------------------------------------------
  // Optimize 2: Skip move check routine if the event is fixed
  // ----------------------------------------------------------------------

  //
  // check event is fixed(neither move nor change animation pattern)
  //
  Game_CharacterBase.prototype.isFixed = function() {
    return false;
  };

  Game_Event.prototype.isFixed = function() {
    return this._moveType === 0 && (!this._characterName || !this._stepAnime);
  };

  const _Game_Event_setupPage = Game_Event.prototype.setupPage;
  Game_Event.prototype.setupPage = function() {
    _Game_Event_setupPage.call(this);
    this._fixed = this.isFixed();
  };

  //
  // if the event is fixed, skip all update routine
  //
  const _Game_Event_update = Game_Event.prototype.update;
  Game_Event.prototype.update = function() {
    if (!this._fixed) {
      _Game_Event_update.call(this);
    }
  };

  //
  // process when it sets force movement to fixed event
  //
  const _Game_Event_memorizeMoveRoute =
    Game_Event.prototype.memorizeMoveRoute;
  Game_Event.prototype.memorizeMoveRoute = function() {
    _Game_Event_memorizeMoveRoute.call(this);
    this._fixed = false;
  };

  const _Game_Event_restoreMoveRoute = 
    Game_Event.prototype.restoreMoveRoute;
  Game_Event.prototype.restoreMoveRoute = function() {
    _Game_Event_restoreMoveRoute.call(this);
    this._fixed = this.isFixed();
  };

  // ----------------------------------------------------------------------
  // Optimize 3: Not make sprite if the event is not set graphic
  // ----------------------------------------------------------------------

  //
  // when event's graphic may change, judge whether to need sprite
  //
  Game_Event.prototype._createSprite = function() {
    this._noSprite = false;
    $gameMap.addSpriteRequest(this.eventId());
  };

  Game_Event.prototype.isNoGraphic = function() {
    return !this._tileId && !this._characterName;
  };

  Game_Event.prototype.createSpriteIfNeed = function() {
    if (this._noSprite == null) { // at first
      this._noSprite = this.isNoGraphic();
    } else if (this._noSprite && !this.isNoGraphic()) { // need to create
      this._createSprite();
    }
  };

  //
  // functions that may change the event graphic
  //
  const _Game_Event_setTileImage = Game_Event.prototype.setTileImage;
  Game_Event.prototype.setTileImage = function(tileId) {
    _Game_Event_setTileImage.call(this, tileId);
    this._noSprite = false;
  };

  const _Game_Event_setImage = Game_Event.prototype.setImage;
  Game_Event.prototype.setImage = function(characterName, characterIndex) {
    _Game_Event_setImage.call(this, characterName, characterIndex);
    this.createSpriteIfNeed();
  };

  //
  // process request for creating event sprite dynamically
  //
  const _Game_Map_setup2 = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function(mapId) {
    _Game_Map_setup2.call(this, mapId);
    this.resetSpriteRequest();
  };

  Game_Map.prototype.resetSpriteRequest = function() {
    this._spriteRequest = null;
  };

  Game_Map.prototype.addSpriteRequest = function(eventId) {
    this._spriteRequest = this._spriteRequest || [];
    this._spriteRequest.push(eventId);
  };

  Game_Map.prototype.spriteRequest = function() {
    return this._spriteRequest;
  };

  //
  // to display animation on map, make sure there's an event sprite.
  //

  if (Game_Temp.prototype.requestAnimation) { // MZ
    const _Game_Temp_requestAnimation = Game_Temp.prototype.requestAnimation;
    Game_Temp.prototype.requestAnimation = function(targets, animationId,
      mirror = false) {
      for (const target of targets) {
        if (target._noSprite) {
          target._createSprite();
        }
      }
      _Game_Temp_requestAnimation.call(this, targets, animationId, mirror);
    };
  } else { // MV
    const _Game_Event_requestAnimation = Game_Event.prototype.requestAnimation;
    Game_Event.prototype.requestAnimation = function(animationId) {
      if (this._noSprite) {
        this._createSprite();
      }
      _Game_Event_requestAnimation.call(this, animationId);
    };
  }

  //
  // when starting the map, make only visible sprites
  //

  if (!Game_Followers.prototype.reverseData) { // MV
    Game_Followers.prototype.reverseData = function() {
      return this._data.clone().reverse();
    };
  }

  // ***overwrite!!!***
  Spriteset_Map.prototype.createCharacters = function() {
    this._characterSprites = [];
    this.addVisibleEventsFirst();
    // following process is the same process as core script
    for (const vehicle of $gameMap.vehicles()) {
      this._characterSprites.push(new Sprite_Character(vehicle));
    }
    for (const follower of $gamePlayer.followers().reverseData()) {
      this._characterSprites.push(new Sprite_Character(follower));
    }
    this._characterSprites.push(new Sprite_Character($gamePlayer));
    for (const sprite of this._characterSprites) {
      this._tilemap.addChild(sprite);
    }
  };

  Spriteset_Map.prototype.addVisibleEventsFirst = function() {
    const events = $gameMap.events().filter(e => !e.isNoGraphic());
    for (const event of events) {
      this.addVisibleEvent(event);
    }
  };

  Spriteset_Map.prototype.addVisibleEvent = function(event) {
    const newSprite = new Sprite_Character(event);
    this._characterSprites.push(newSprite);    
    this._tilemap.addChild(newSprite);
  };

  //
  // create event sprites dynamically
  //
  const _Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function() {
    if ($gameMap.spriteRequest()) {
      const eventIds = $gameMap.spriteRequest();
      for (eventId of eventIds) {
        this.addVisibleEvent($gameMap.event(eventId));
      }
      $gameMap.resetSpriteRequest();
    }
    _Spriteset_Map_update.call(this);
  };

})();
