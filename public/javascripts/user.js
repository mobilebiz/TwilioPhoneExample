// ケイパビリティトークン
var _token = null;

// クライアント名
var _client = null;

// コネクション
var _connection = null;

// socket.io接続
var socket = io.connect();

// 接続時
socket.on('connect', function() {});

// 切断時
socket.on('disconnect', function(client) {});

// センターからの受信
socket.on('CenterToUser', function(data) {
  /* メッセージの受信 */
  if (data.type === 'info') {
    // メッセージを表示
    $("#message").html(data.values.message);
  }
});

// ケイパビリティトークンを取得
function getToken() {
  var params = {
    client: _client
  };
  $.ajax({
    type: "GET",
    url: "token",
    data: params,
    timeout: 20000,
    success: function(results) {
      if (results.status === 'NG') {
        alert('ケイパビリティトークンの取得に失敗しました。');
        return false;
      } else {
        _token = results.token;  // ケイパビリティトークンを保存
        Twilio.Device.setup(_token);  // TwilioDeviceのセットアップ
      }
    },
    error: function(err) {
      alert('エラーが発生しました'+err);
      return false;
    }
  });

};

// ログインボタンを押した
function btn_login_click() {
  myNavigator.pushPage('main.html', {
    animation: 'slide',
    onTransitionEnd: function() {
      btn_connect.setDisabled(true);      // 発信ボタンを無効にする
      btn_disconnect.setDisabled(true);   // 切断ボタンを有効にする
      _client = $("#client").val();
      $("#clientName").html(_client);
      // ケイパビリティトークンを取得
      getToken();
    }
  });
}

// 発信/応答ボタンを押した
function btn_connect_click() {
  btn_connect.setDisabled(true);      // 発信ボタンを無効にする
  btn_disconnect.setDisabled(false);  // 切断ボタンを有効にする
  if ($("#btn_connect").text().trim() === '発信') {  // 発信
    Twilio.Device.connect({
      number: $("#callTo").val()
    });
  } else {  // 着信
    if (_connection.status()=="pending") {
      _connection.accept();  // 接続許可
    }
  }
}

// 切断ボタンを押した
function btn_disconnect_click() {
  // 切断
  Twilio.Device.disconnectAll();
  btn_connect.setDisabled(false);     // 発信ボタンを有効にする
  btn_disconnect.setDisabled(true);   // 切断ボタンを無効にする
}

// テンキーボタンを押した
function btn_tenkey_click(value) {
  if (_connection) {
    _connection.sendDigits(value);
  } else {
    var val = $('#callTo').val()+value;
    $('#callTo').val(val);
  }
}

ons.bootstrap();
ons.ready(function() {
  /* TwilioDevice関連イベント */
  Twilio.Device.ready(function (device) { // 準備完了
    $("#message").html('準備完了');
    btn_connect.setDisabled(false);     // 発信ボタンを有効にする
    btn_disconnect.setDisabled(true);   // 切断ボタンを無効にする
  });

  Twilio.Device.error(function (error) {  // エラー発生
    $("#message").html("Error: " + error.message);
  });

  Twilio.Device.offline(function (device) { // 接続断（ケイパビリティトークン無効）
    getToken(); // 再度トークンを取得
  });

  Twilio.Device.connect(function (conn) { // 接続完了
    _connection = conn;
    $("#message").html('接続しました');
  });

  // 回線切断
  Twilio.Device.disconnect(function (conn) {
    _connection = null;
    $("#message").html('通話が終了しました');
    $("#btn_connect").text('発信'); // 応答ボタンを有効にする
    btn_connect.setDisabled(false);     // 発信ボタンを有効にする
    btn_disconnect.setDisabled(true);   // 切断ボタンを無効にする
  });

  // 着信
  Twilio.Device.incoming(function (conn) {
    _connection = conn;
    $("#message").html(conn.parameters.From + "から着信中です");   // 発信者を表示
    $("#btn_connect").text('応答'); // 応答ボタンを有効にする
  });

//  btn_connect.setDisabled(true);      // 発信ボタンを無効にする
//  btn_disconnect.setDisabled(true);   // 切断ボタンを無効にする

});
