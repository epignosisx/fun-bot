import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"
import { createProfile, IProfileRequest, IProfileResponse } from "./profile"
import {IBookingResponse} from "./cruise-pricing"
import { createCourtesyHold, ICreateChApiResponse } from "./book"
import { CourtesyHoldAvailabilityResponse } from "./courtesy-hold"
import {ISailingData} from "./sailing-flattener"

export function getPhoneNumber(assistant: ApiAiAssistant) {
    let phone = <string>assistant.getArgument("Number");
    if(!/^\d{10}$/.test(phone)){
        phone = "3055591234";
    }
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

        const cabin: IBookingResponse = assistant.data[c.CABIN_DATA];
        const ch: CourtesyHoldAvailabilityResponse = assistant.data[c.COURTESY_HOLD_DATA];
        const sailing: ISailingData = assistant.data[c.SELECTED_SAILING_DATA];

        createCourtesyHold(cabin, ch, sailing, result, (result: ICreateChApiResponse) => {
            const spelledOutBookingNumber = result.cabinResults[0].bookingNumber.split("").join(" ");
            assistant.tell(`Alright, we have put a hold on your cabin for ${ch.depositHours} hours. Your booking number is ${spelledOutBookingNumber}. You will receive an email shortly with more details.`);
        });
    });
}