import { ApiAiAssistant } from "actions-on-google";
import {cruiseSearch, ICruiseSearchRequest, ICruiseSearchResponse} from "./cruise-search";
import {reduceResultsTest, reduceResults} from "./results-reducer";
import {flattenSailings, ISailingData} from "./sailing-flattener"
import * as zillow from "./zillow";
import * as ch from "./courtesy-hold";
import * as c from "./constants"

export function bookACruise(assistant: ApiAiAssistant) {
    makeCruiseSearch(assistant);
}

function makeCruiseSearch(assistant: ApiAiAssistant) {
    const dest = <string>assistant.getArgument("Destination");
    const dateRange = <string>assistant.getArgument("SailingDateRange");
    const passThruPorts = <string[]>assistant.getArgument("PassThruPorts");
    const shipCode = <string>assistant.getArgument("Ship");
    const numberOfGuests = parseInt(<string>assistant.getArgument("NumberOfGuests"), 10);
    const embkPortCode = <string>assistant.getArgument("EmbarkationPort") || "MIA";

    var searchRequest: ICruiseSearchRequest = {
        dest: dest,
        dateRange: dateRange,
        passThroughPort: passThruPorts,
        ship: shipCode,
        embkPortCode: embkPortCode,
        numberOfGuests: numberOfGuests
    };

    cruiseSearch(searchRequest, (response: ICruiseSearchResponse) => {
        const sailings = reduceResults(response, {metacode: "SU"});
        const sailingsData: ISailingData[] = flattenSailings(sailings);
        const question = formatResponse(sailingsData);
        console.info(question, sailingsData);
        assistant.data[c.SAILINGS_DATA] = sailingsData;
        assistant.data[c.NUMBER_OF_GUESTS_DATA] = numberOfGuests;
        assistant.setContext(c.PICK_SAILING_CONTEXT);
        assistant.ask(question);
    });
}

function formatResponse(sailingsData: ISailingData[]) {
    let text = `We have found ${sailingsData.length} great sailings. `;

    text += sailingsData.map((n, i) => `Number ${i+1}: ${n.itineraryName}. `).join("");
    text += "What choice did you like?";
    return text;
}