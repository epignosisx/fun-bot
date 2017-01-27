import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"

export function getDob(assistant: ApiAiAssistant) {
    const date = parseInt(<string>assistant.getArgument("Date"), 10);
    assistant.data[c.DOB_DATA] = date;
    assistant.setContext(c.GET_PHONE_NUMBER_CONTEXT);
    assistant.ask("Finally, what's your phone number?");
}