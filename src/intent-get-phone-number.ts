import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"
import { createProfile, IProfileRequest, IProfileResponse } from "./profile"

export function getPhoneNumber(assistant: ApiAiAssistant) {
    const phone = <string>assistant.getArgument("Number");
    const dob: string = assistant.data[c.DOB_DATA];

    const date = new Date();
    const profileRequest: IProfileRequest = {
        firstName: c.PERSON_NAME,
        lastName: c.PERSON_LAST_NAME,
        email: `epignosisx+${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}@gmail.com`,
        phoneNumber: phone,
        dob: dob,
        gender: "M"
    };

    createProfile(profileRequest, (result: IProfileResponse) => {
        console.info("Profile created!", result.loyaltyNumber);
        assistant.tell("Alright, we have put a hold on your cabin for 24 hours. You will receive an email shortly with more details.");
    });
}