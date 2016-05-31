var express = require('express')
  , bodyParser = require('body-parser')
  , basicAuth = require('basic-auth-connect')
  , config = require('config')
  , twilio = require('twilio')
  , https = require('https')
  , fs = require('fs')
  , sio = require('./routes/sio')
  , twi = require('./routes/twi')
;

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// TwilioClient画面の表示
app.get('/', function(request, response) {
  response.render('pages/index', {
    title: 'TwilioPhoneExample'
  });
});

// ケイパビリティトークンを返す
app.get('/token', function(request, response) {
  var results = {};
  twi.getToken(request.query.client, function(err, token) {
    if (err) {
      results = {
        status: 'NG',
        token: null
      };
    } else {
      results = {
        status: 'OK',
        token: token
      };
    }
    response.json(results);
  });
});

// ケイパビリティトークンを返す（monacaクライアント用）
app.get('/tokenMonaca', function(request, response) {
  var results = {};
  twi.getToken(request.query.client, function(err, token) {
    if (err) {
      results = err.message;
    } else {
      results = token;
    }
    response.send(results);
  });
});

// 発信を行うTwiMLを返す
app.get('/dial', function(request, response) {
  var number = request.query.number || request.query.To || '';
  twi.dial(number, function(err, twiml) {
    if (err) {
      response.sendStatus(500);
    } else {
      response.type('text/xml');
      response.send(twiml);
    }
  });
});

// ステータスの変化時にTwilioからコールされる
app.all('/statusCallback', basicAuth(function(user, pass) {
  return user === config.basicAuth.user && pass === config.basicAuth.pass;
}));
app.post('/statusCallback', function(request, response) {
  response.setHeader('Content-Type', 'text/plain');
  twi.statusCallback(request.body, function(err) {
    if (err) {
      response.sendStatus(500);
    } else {
      response.sendStatus(200);
    }
  });
});

/* // HTTPSをNode.jsでやる場合はここのコメントを外します
var options = {
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem')
};

var server = https.createServer(options, app).listen(app.get('port'), function(){
  console.log('Node app is running on port', app.get('port'));
});
*/

// HTTPSをnginxに任せる場合は、ここのコメントを外します
var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


// session.ioサーバー起動
sio(server);
