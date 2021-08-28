$(function(){

  // ウィンドウ管理
  var BW = function(){

    var select_window = [];

    // 画面一覧
    var windows = {
      1: $('#status-window'), // ステータスのウィンドウ
      2: $('#enemy-window'),  // 敵画像
      3: $('#log-window'),    // ログ画面
      4: $('#user-window'),   // ユーザー
      5: $('#target-window') // ターゲット選択
    };

    this.set = function()
    {
      select_window = arguments || [];
      return this;
    };

    this.show = function()
    {
      // 全ウィンドウを非表示
      $.each(windows, function(i, $target)
      {
          $target.hide();
          $('#log-window').html('');
      });

      // 選択したウィンドウを表示
      $.each(select_window, function(i, target){
        if( ($target = windows[target]) != undefined )
        {
            $target.show();
        }
      });
    }
  };

  // コマンド管理
  var Command = function() {

    var command_list = {
      'attack' : 'たたかう',
      'defence': 'ぼうぎょ',
      'escape' : 'にげる',
    };

    // デフォルトコマンド
    var defaults = ['attack','escape','defence','item'];

    var command = [];

    // 選択したコマンド
    var selected = [];

    var init = function(player){
      command = defaults;
    };

    // コマンド選択
    this.select = function(name)
    {
      selected = name;
    }

    // 選択コマンドを取得
    this.get_action = function() {
      return selected;
    }

    this.display = function(player) {

      var $window = $('#command-window');

      // 名前を更新
      $window.find('.name').html(player.name);

      // コマンドの中を空に
      $window.find('.command-list').html('').data('player', player.id);

      // 指定のコマンドを表示
      $.each(command, function(i, name){
        $('<li></li>').data('action', name).html(command_list[name]).appendTo('.command-list');
      });
    }

    init();
  };

  // プレイヤー管理
  var Player = function(status, command) {
    this.id;
    this.hp;
    this.mp;
    this.die;
    this.name;
    this.attack;
    this.defence;
    this.command;
    this.is_enemy = false;
    var that = this;

    // プレイヤー作成
    var create = function() {

      // 名前
      $('.name-list').append('<li class="name player-'+that.id+'">'+that.name+'</li>');

      // hp
      $hp = $('<div class="ele hp player-'+that.id+'"><label>HP</label><span class="val">'+that.hp+'</span></div>');

      // mp
      $mp = $('<div class="ele mp player-'+that.id+'"><label>MP</label><span class="val">'+that.mp+'</span></div>');

      // ステータス
      $status = $('<li></li>').addClass('status').append($hp).append($mp);

      // append
      $(".status-list").append($status);

    };

    var init = function(status, command) {
      that.id = status.id;
      that.hp = status.hp;
      that.mp = status.mp;
      that.name = status.name;
      that.attack = status.attack;
      that.defence = status.defence;
      that.command = command;
      create();
    }

    this.dead = function() {
      $('.player-'+that.id).css('color', 'red');
    }

    this.damage = function(character, damage)
    {
        if( that.hp - damage <= 0 ) {
          that.hp = 0;
          that.die = 1;
        }else{
          that.hp = that.hp - damage;
          that.die = 0;
        }

        // hp更新
        $('.hp.player-'+that.id).find('.val').html(that.hp);

        // 死亡
        var die_msg = (that.die == 1)? '<br>'+that.name+'は死亡した': '';

        // 仮メッセージ
        $('#log-window').html(character.name+'の攻撃。'+that.name+'は'+damage+'のダメージを受けた'+die_msg);

        return this;
    }

    init(status, command);
  }

  // 敵管理
  var Enemy = function(status)
  {
    this.id;
    this.hp;
    this.mp;
    this.name;
    this.attack;
    this.defence;
    this.die;
    this.is_enemy = true;
    this.img = $('#suraimu');
    var that = this;

    // 敵作成
    var create = function() {

      // 名前
      $('.target-list').append('<li><span class="name">'+that.name+'</span><span class="num">1匹</span></li>');

    };

    var init = function(status) {
      that.id = status.id;
      that.hp = status.hp;
      that.mp = status.mp;
      that.name = status.name;
      that.attack = status.attack;
      that.defence = status.defence;
      create();
    }

    this.hide = function() {
      this.img.hide();
    }

    this.damage = function(character, damage)
    {
        // ダメージ適応＆死亡判定
        if( that.hp - damage <= 0 ) {
          that.hp = 0;
          this.die = 1;
        }else{
          that.hp = that.hp - damage;
          this.die = 0;
        }

        // 仮メッセージ
        $('#log-window').html(character.name+'の攻撃。'+this.name+'に'+damage+'のダメージ');

        return this;
    }

    // 揺れ
    this.damage_move = function() {
      var mvw=4; // 横揺れ　pxの値( 2 は　2pxの意味)
      var mvh=4; // 縦揺れ　pxの値( 2 は　2pxの意味)
      var tw=15; // 横揺れ時間 10は。0.01秒
      var th=10; // 縦揺れ時間 10は。0.01秒
      this.img.css({position: 'relative'});
      var dfd = jQuery.Deferred();
      this.img.stop()
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        // 縦揺れ 開始
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th, function(){dfd.resolve();})
      return dfd.promise();
    }

    // 揺れ
    this.attack_move = function() {
      var mvw=8; // 横揺れ　pxの値( 2 は　2pxの意味)
      var mvh=8; // 縦揺れ　pxの値( 2 は　2pxの意味)
      var tw=45; // 横揺れ時間 10は。0.01秒
      var th=40; // 縦揺れ時間 10は。0.01秒
      this.img.css({position: 'relative'});
      var dfd = jQuery.Deferred();
      this.img.stop()
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        .animate({left : mvw+'px'},tw)
        .animate({left : mvw*-1+'px'},tw)
        // 縦揺れ 開始
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th)
        .animate({top : mvh+'px'},th)
        .animate({top : mvh*-1+'px'},th, function(){dfd.resolve();})
      return dfd.promise();
    }

    init(status);

  }

  // バトル管理
  var Battle = function(w) {

    // プレーヤー
    var players = [];

    // 敵
    var enemies = [];

    // コマンド選択したプレイヤー
    var selected = [];

    var that = this;

    // ウィンドウオブジェクト
    var battle_window;

    this.now_tern = 0;

    // プレーヤー作成
    this.entry = function (name, hp, mp, attack, defence)
    {
        // コマンドインスタンス
        var command = new Command();

        // 【プレイヤー】インスタンス作成
        player = new Player({
          id: players.length+1,
          name: name,
          hp: hp, 
          mp: mp,
          attack: attack,
          defence: defence
        }, command);

        // 配列に格納しておく
        players.push(player);
    }

    // プレイヤーインスタンスを取得
    var get_player = function(player_id) {
      for( var i=0, len = players.length; i<len; i++ ) {
        if( players[i] != undefined && players[i].id == player_id ) {
          return players[i];
        }
      }
    }

    // ダメージ計算(今固定)
    var calc_damage = function (attack, defence)
    {

        // ダメージ固定
        //return 5;

        // ダメージ計算式
        base = attack-defence;
        damage = Math.ceil(Math.random()*base);
        if( damage <= 0 ) damage = 1;
        return damage;
    }

    // 初期化
    var init = function(w)
    {
      battle_window = w;

      // キャラクターエントリー
      that.entry('アインス', 100, 0, 15, 10);
      that.entry('ツヴァイ', 5, 0, 10, 5);
      that.entry('ドライ', 5, 0, 10, 5);

      // プレーヤー人数チェック
      if( players.length < 1 )
      {
          alert('プレーヤーがたりません');
          return false;
      }

      // 【敵】インスタンス作成
      enemy = new Enemy({
        id: enemies.length+1,
        name: 'スラ◯ム',
        hp: 20,
        mp: 10,
        attack: 10,
        defence: 5
      });
      enemies.push(enemy);

      // ウィンドウ設定
      battle_window.set(1,2,4,5).show();

      // コマンド表示
      players[0].command.display(players[0]);

      // コマンド設定
      $(document).on('click', '.command-list li', function(){

        var $this = $(this);

        // プレイヤーIDを取得
        var player_id = $this.parent().data('player');

        // 行動プレイヤー
        var player = get_player(player_id);

        // コマンド選択
        player.command.select($this.data('action'));

        // 次の選択者
        next_user_id = get_next_user_id(player_id);

        // 最後ならばバトルスタート
        if( false == next_user_id ) {
          start();
        }else{
          player = get_player(next_user_id);
          player.command.display(player);
          return false;
        }
      });

    }

    // アクション(再帰）
    this.action = function(character, players, enemies) {

      // 終了フラグ
      var end_flg = 0;

      // キャラなし
      if( character == undefined )
      {
        // ウィンドウ初期化
        battle_window.set(1,2,4,5).show();

        // ターン初期化
        that.now_tern = 0;

        // コマンド表示
        players[0].command.display(players[0]);

        return false;
      }

      // 行動を取得
      if( character.is_enemy == false ) {

        console.log("player attack");

        console.log(character);
        // アクション
        var action = character.command.get_action();
        console.log(action);

        // ダメージ計算
        var enemy = enemies[0]; // 仮で１匹

        // 行動別
        switch( action ) {

          // 攻撃
          case 'attack':

            // ダメージ計算
            var damage = calc_damage(character.attack, enemy.defence);

            // ダメージ適用
            $.when(enemy.damage_move()).then(function(){
              enemy.damage(character, damage);
            });

            // やっつけ
            if( enemy.die ) {
              end_flg = 1;

              var dfd = jQuery.Deferred();
              dfd.then(wait_time(1000)).done(function(){

                // 死亡判定
                if( enemy.die == 1 ) {
                  enemy.hide();

                  // 仮メッセージ
                  $('#log-window').html(enemy.name+'をやっつけた');
                  return false;
                }

              });
              dfd.resolve();

            }

          break;

          // 防御
          case 'defence':

            // 防御力上昇
            character.defence++;

            // 仮メッセージ
            $('#log-window').html(character.name+'は防御している');

          break;

          // 逃げる
          case 'escape':

            // 仮メッセージ
            $('#log-window').html(character.name+'は逃げ出した');
            return false;

          break;

        }

      }else{
          
        console.log("enemy attack");

        // 対象をランダムに抽出
        var player = random(players, 1);

        // ダメージ計算
        var damage = calc_damage(character.attack, player.defence);

        $.when(character.attack_move()).then(function(){

          // ダメージ適用
          player.damage(character, damage);

          // 死亡時
          if( player.die == 1 ) {
            player.dead();
            players.splice(get_index(player.id), 1);
          }

        });
      }

      // 終了時
      if( end_flg ) {
          return false;
      }

      // ターンを進める
      that.now_tern++;

      var dfd = jQuery.Deferred();

      // 再帰
      dfd.then(wait_time(2000)).done(function() {
        that.action(characters[that.now_tern], players, enemies);
      });
      dfd.resolve();
    }

    // 待ち
    var wait_time =  function(time){
    	return (function(){
    		var dfd = $.Deferred()
    		setTimeout(function(){  dfd.resolve(); }, time);
    		return dfd.promise()
    	})
    }

    // ランダムに抽出
    var random = function (array, num) {
        var a = array;
        var t = [];
        var r = [];
        var l = a.length;
        var n = num < l ? num : l;
        while (n-- > 0) {
            var i = Math.random() * l | 0;
            r[n] = t[i] || a[i];
            --l;
            t[i] = t[l] || a[l];
        }
        if( num == 1 ) return r[0] 
        return r;
    }

    // バトル開始
    var start = function() {

      // ウィンドウ切り替え
      battle_window.set(1,2,3).show();
      var dfd = jQuery.Deferred();
      dfd.then(wait_time(500)).done(function(){

        // 行動順決定
        characters = [];
        characters = $.merge([], players);
        characters = $.merge(characters, enemies);

        // アクション実行
        that.action(characters[that.now_tern], players, enemies);

      });
      dfd.resolve();
    }

    var get_index = function(user_id ) {
      var ret = false;
      $.each(players, function(id, player) {
        if( player.id == user_id ) ret = id;
      });
      return ret;
    }

    // 次の選択者を取得
    var get_next_user_id = function(user_id) {
      var flg = 0;
      var ret = false;
      $.each(players, function (id, player) {
        if( flg == 1 ) {
          ret = player.id;
          return false;
        }
        if( player.id == user_id ) flg = 1;
      });
      return ret;
    }

    init(w);

  };

  w = new BW();
  battle = new Battle(w);

});
