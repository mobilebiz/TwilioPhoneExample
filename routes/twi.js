/**
 * Twilio関連
 */
var config = require('config')
  , twilio = require('twilio')
  , client = require('twilio')(config.twilio.SID, config.twilio.Token)
  , socket = require('socket.io-client')(config.hostname)
;

/**
 * 相手先に発信するTwiMLを返す
 * @param number 電話番号
 * @return err エラーオブジェクト
 * @return TwiML
 **/
exports.dial = function(number, callback) {
  console.log('twi.dial called('+number+')');

  var clientName = null;
  if (isNaN(number)) {
    clientName = number;
  } else {
    number =  (number.substring(0, 1) === '+' ? number : '+81' + number.substring(1));   // 0AB〜Jを+81に変換
  }
  var resp = new twilio.TwimlResponse();
  resp.dial({
    callerId: config.twilio.From,
  }, function() {
    if (clientName) {
      this.client(clientName, {
        statusCallback: 'https://'+config.basicAuth.user+':'+config.basicAuth.pass+'@'+config.twilio.Server+'/statusCallback',
        statusCallbackMethod: "POST",
        statusCallbackEvent: "ringing answered completed"
      });
    } else {
      this.number(number, {
        statusCallback: 'https://'+config.basicAuth.user+':'+config.basicAuth.pass+'@'+config.twilio.Server+'/statusCallback',
        statusCallbackMethod: "POST",
        statusCallbackEvent: "ringing answered completed"
      });
    }
  });
  callback(null, resp.toString());
};

/**
 * 通話を切断する
 * @param  callSid 切断したいCallSid
 * @return err エラーオブジェクト
 */
exports.disconnect = function(callSid, callback) {
  console.log('twi.disconnect called('+callSid+')');

  client.calls(callSid).update({
    status: 'completed'
  }, function(err, call) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

/**
 * ステータスに変化があった場合にTwilio側から呼ばれ、ステータスに応じてTwilioToCenterのメッセージを返却する
 * @param  reqBody     twilio側がセットしてきたパラメータ群
 * @return             なし
 */
exports.statusCallback = function(reqBody, callback) {
  console.log('twi.statusCallback called.');

  // センターに通知
  socket.emit('TwilioToCenter', {
    type : reqBody.CallStatus,
    values: {
    }
  });
  callback(null);
};

/**
 * ケイパビリティトークンを生成する
 * @param clientName 着信用クライアント名
 * @return {[type]} token 生成されたトークン
 */
exports.getToken = function(clientName, callback) {
  console.log('twi.getToken called('+clientName+')');

  // すでに同じ名前のアプリケーションがある場合は、それらを削除しておく
  client.applications.list({ friendlyName: "dial" }, function(err, data) {
    if (err) console.log(err.message);
    data.applications.forEach(function(app) {
      client.applications(app.sid).delete();
    });
    // Twilioアプリケーションを作成
    client.applications.create({
      friendlyName: "dial",
      voiceUrl: config.hostname+"/dial",
      voiceMethod: "GET"
    }, function(err, app) {
      if (err) {
        console.log('Twilioアプリケーションの作成に失敗しました。'+err.message);
        callback(err);
      } else {
        // 発信を許可
        var	capability = new twilio.Capability(config.twilio.SID, config.twilio.Token);
      	capability.allowClientOutgoing(app.sid); // 上で作成したアプリケーションのSID
        if (clientName) capability.allowClientIncoming(clientName);   // 着信用クライアント名
        var token = capability.generate();
        console.log('ケイパビリティトークンを生成しました。('+token+')');
      	callback(null, token);  // トークンの有効期間は1時間
      }
    });
  });
};
