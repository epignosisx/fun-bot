import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"

export function getDob(assistant: ApiAiAssistant) {
    console.info("Get DOB intent");
    let date = <string>assistant.getArgument("Date");
    assistant.data[c.DOB_DATA] = date;
    assistant.setContext(c.GET_PHONE_NUMBER_CONTEXT);
    assistant.ask("Ok. What's your phone number?");
}