import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"
import {ISailingData} from "./sailing-flattener"
import {checkIfAvailable, CourtesyHoldAvailabilityRequest} from "./courtesy-hold"

export function pickASailing(assistant: ApiAiAssistant) {
    const choice = parseInt(<string>assistant.getArgument("Number"), 10);
    const sailings: ISailingData[] = assistant.data[c.SAILINGS_DATA];
    if(choice < 1 || choice > sailings.length) {
        assistant.setContext(c.PICK_SAILING_CONTEXT);
        assistant.ask("What choice do you want? For example,you can say: Number 2");
        return;
    }
    const selectedSailing: ISailingData = sailings[choice - 1];

    //checkIfAvailable(new CourtesyHoldAvailabilityRequest())

    assistant.data[c.SELECTED_SAILING_DATA] = selectedSailing;
    assistant.setContext(c.GET_DATE_OF_BIRTH_CONTEXT);
    assistant.ask(`Great! So I have you down for: ${selectedSailing.itineraryName}. ${c.PERSON_NAME}, I'll just need a few more information to hold your stateroom. What's your date of birth?`);
}