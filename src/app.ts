import * as express from "express";
import * as bodyParser from "body-parser";
import { ApiAiAssistant } from "actions-on-google";
import {cruiseSearch, ICruiseSearchRequest, ICruiseSearchResponse} from "./cruise-search";
import {reduceResultsTest, reduceResults} from "./results-reducer";
import {flattenSailings, ISailingData} from "./sailing-flattener"

process.env.DEBUG = 'actions-on-google:*';

const app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({ type: 'application/json' }));

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello world!" + new Date());
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
    makeCruiseSearch(assistant);

    assistant.tell("Webhook response!!");
}

function makeCruiseSearch(assistant: ApiAiAssistant) {
    const dest = <string>assistant.getArgument("Destination");
    const dateRange = <string>assistant.getArgument("SailingDateRange");
    const passThruPorts = <string[]>assistant.getArgument("PassThruPorts");
    const shipCode = <string>assistant.getArgument("Ship");
    const embkPortCode = <string>assistant.getArgument("EmbarkationPort") || "MIA";

    var searchRequest: ICruiseSearchRequest = {
        dest: dest,
        dateRange: dateRange,
        passThroughPort: passThruPorts,
        ship: shipCode,
        embkPortCode: embkPortCode
    };

    cruiseSearch(searchRequest, (response: ICruiseSearchResponse) => {
        const sailings = reduceResults(response, {metacode: "SU"});
        const sailingsData: ISailingData[] = flattenSailings(sailings);


    });
}

// function formatSailingResponse(sailingsData: ISailingData[], assistant: ApiAiAssistant) {
//     assistant.ask("We found these itinearies: ")
// }