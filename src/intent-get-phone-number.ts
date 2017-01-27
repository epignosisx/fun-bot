import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"

export function getDob(assistant: ApiAiAssistant) {
    const phone = parseInt(<string>assistant.getArgument("PhoneNumber"), 10);
    assistant.data[c.PHONE_DATA] = phone;
    //assistant.setContext(c.GET_PHONE_NUMBER_CONTEXT);
    assistant.tell("Alright, we have put a hold on your cabin for 24 hours. You will receive an email shortly with more details.");
}