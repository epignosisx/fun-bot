import * as express from "express";
import * as bodyParser from "body-parser";
import { ApiAiAssistant } from "actions-on-google";

process.env.DEBUG = 'actions-on-google:*';

const app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({ type: 'application/json' }));

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello world!" + new Date());
});

app.post("/", (req: express.Request, res: express.Response) => {
    console.log('headers: ' + JSON.stringify(req.headers));
    console.log('body: ' + JSON.stringify(req.body));

    const assistant = new ApiAiAssistant({ request: req, response: res });

    let actionMap = new Map();
    actionMap.set("carnival.book", bookCruiseIntent);

    assistant.handleRequest(actionMap);
});

// Start the server
var server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});

function bookCruiseIntent(assistant: ApiAiAssistant){
    assistant.tell("Webhook response!!");
}