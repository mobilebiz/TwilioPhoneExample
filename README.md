# TwilioPhoneExample

A barebones Node.js app using [Express 4](http://expressjs.com/).

## Quick Start on your server.

Make sure you have [Node.js](http://nodejs.org/) installed.

### STEP 1. Clone source from GitHub.
```sh
$ git clone git@github.com:mobilebiz/TwilioPhoneExample.git # or clone your own fork
$ cd TwilioPhoneExample
$ npm install
```

### STEP 2. Edit config/default.json.
1. hostname（ Edit your server url. ex. https://www.hoge.com ）
2. twilio.server（ Edit your server name. ex. www.hoge.com ）
3. twilio.SID（ Edit your Twilio SID. ）
4. twilio.Token（ Edit your Twilio Token. ）
5. twilio.From（ Edit your Twilio number for calling. ex.+815012345678 ）

### STEP 3. Get start.

```sh
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

### STEP 4. Access via your browser.

Access url is http://www.hoge.com/ (Replace your server name.)
