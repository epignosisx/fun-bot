"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var actions_on_google_1 = require("actions-on-google");
process.env.DEBUG = 'actions-on-google:*';
var app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({ type: 'application/json' }));
app.get("/", function (req, res) {
    res.send("Hello world!");
});
app.post("/", function (req, res) {
    console.log('headers: ' + JSON.stringify(req.headers));
    console.log('body: ' + JSON.stringify(req.body));
    var assistant = new actions_on_google_1.ApiAiAssistant({ request: req, response: res });
    var actionMap = new Map();
    actionMap.set("carnival.book", bookCruiseIntent);
    assistant.handleRequest(actionMap);
});
// Start the server
var server = app.listen(app.get('port'), function () {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});
function bookCruiseIntent(assistant) {
    assistant.tell("Webhook response!");
}
//# sourceMappingURL=app.js.map