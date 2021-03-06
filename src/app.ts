import * as express from "express";
import * as bodyParser from "body-parser";
import { ApiAiAssistant } from "actions-on-google";
import { cruiseSearch, ICruiseSearchRequest, ICruiseSearchResponse } from "./cruise-search";
import { reduceResultsTest, reduceResults } from "./results-reducer";
import { flattenSailings, ISailingData } from "./sailing-flattener"
import { bookACruise } from "./intent-book-a-cruise"
import { pickASailing, proceedWithSailing } from "./intent-pick-a-sailing";
import { findCruiseDeals, pickCruiseDeal } from "./intent-cruise-deals";
import { getDob } from "./intent-get-dob"
import { getPhoneNumber } from "./intent-get-phone-number"
import * as c from "./constants"
import * as zillow from "./zillow";
import * as ch from "./courtesy-hold";
import * as payment from "./payment";
import * as path from "path";

process.env.DEBUG = 'actions-on-google:*';

const app = express();
app.set('port', (process.env.PORT || 8080));
app.use('/images', express.static(path.join(__dirname, '/static/images')));
app.use(bodyParser.json({ type: 'application/json' }));

app.get("/", (req: express.Request, res: express.Response) => {
    var body = "<img style='max-width: 200px; max-height: 200px;' src='/images/fun-bot-logo.png' />";
    body += "<h1>Hi, I am your friendly Fun Bot, here to help you with Carnival Cruise Line bookings.</h1>";
    res.send(body);
});

app.get("/search", (req: express.Request, res: express.Response) => {
    // cruiseSearch({
    //     dest: "BH"
    // }, (results: any) => {
    //     res.send(results);
    // });

    const data = reduceResultsTest();
    res.send(data);
});

app.post("/", (req: express.Request, res: express.Response) => {
    //console.log('headers: ' + JSON.stringify(req.headers));
    console.log('body: ' + JSON.stringify(req.body));

    const assistant = new ApiAiAssistant({ request: req, response: res });

    let actionMap = new Map();
    actionMap.set(c.BOOK_A_CRUISE_INTENT, bookACruise);
    actionMap.set(c.PICK_A_SAILING_INTENT, pickASailing);
    actionMap.set(c.PROCEED_WITH_SAILING_CONTEXT, proceedWithSailing);
    actionMap.set(c.INTENT_FIND_CRUISE_DEAL, findCruiseDeals);
    actionMap.set(c.INTENT_PICK_CRUISE_DEAL, pickCruiseDeal);
    actionMap.set(c.GET_DOB_INTENT, getDob);
    actionMap.set(c.GET_PHONE_NUMBER_INTENT, getPhoneNumber);

    try {
        assistant.handleRequest(actionMap);
    } catch (err) {
        console.error(`Error handling request: ${JSON.stringify(err)}`);
        assistant.tell("Something blew up in our side, please start over.");
    }
});

// Start the server
var server = app.listen(app.get('port'), function () {
    console.log('App listening on port %s', server.address().port);
    console.log('Press Ctrl+C to quit.');
});