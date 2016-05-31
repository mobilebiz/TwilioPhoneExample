var config = require('config')
  , twilio = require('twilio')
  , client = require('twilio')(config.twilio.SID, config.twilio.Token)
  , socket = require('socket.io-client')(config.hostname)
  , twi = require('../routes/twi')
;

module.exports = twilioClient;

function twilioClient() {
  console.log('twilioClient loaded.');

  var _callSid = null;  // 相手先との通話SID

  // 接続
  socket.on('connect', function(){
    console.log('twilioClient connected.');
    socket.emit('TwilioToCenter', {
      type : 'login',
      values : {
        twilioSocketId: socket.id
      }
    });
  });

  // 切断
  socket.on('disconnect', function(){
  });

  // センターからのメッセージを受信
  socket.on('CenterToTwilio', function(data){
    console.log('CenterToTwilio (type:'+data.type+')');

    // 指定された番号に発信する
    if (data.type === 'dial') {
      console.log('twilioClient.js/CenterToTwilio(dial) called.('+data.values.callTo+')');

      // ダイヤル発信
      twi.dial(data.values.callTo, function(err, callSid) {
        if (err) {
          console.error(err.message);
        } else {
          _callSid = callSid;
          console.log(data.values.callTo+'に発信を行いました。');
        }
      });
    }

    // 通話中の回線を切断する
    if (data.type === 'disconnect') {
      console.log('twilioClient.js/CenterToTwilio(disconnect) called.');

      twi.disconnect(_callSid, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log('通話を切断しました。');
        }
      });
    }

  });

}
