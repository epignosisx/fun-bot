import { ApiAiAssistant } from "actions-on-google"
import * as c from "./constants"
import { ISailingData, formatItineraryName } from "./sailing-flattener"
import { price, IBookingResponse } from "./cruise-pricing"
import { checkIfAvailable, CourtesyHoldAvailabilityRequest, CourtesyHoldAvailabilityResponse } from "./courtesy-hold"

export function pickASailing(assistant: ApiAiAssistant) {
    const choice = parseInt(<string>assistant.getArgument("Number"), 10);
    const sailings: ISailingData[] = assistant.data[c.SAILINGS_DATA];
    if (choice < 1 || choice > sailings.length) {
        assistant.setContext(c.PICK_SAILING_CONTEXT);
        assistant.ask("What choice do you want? For example,you can say: Number 2");
        return;
    }
    processSailingPick(assistant, choice, sailings);
}

export function proceedWithSailing(assistant: ApiAiAssistant) {
    const sailings: ISailingData[] = assistant.data[c.SAILINGS_DATA];
    const choice = <string>assistant.getArgument("YesNo");
    if (choice == "Y"){
        processSailingPick(assistant, 1, sailings);
    }else {
        assistant.tell("Ups you broke my heart, please start again.");
    }
}

function processSailingPick(assistant: ApiAiAssistant, choice: number, sailings: ISailingData[]) {
    const selectedSailing: ISailingData = sailings[choice - 1];
    const numberOfGuests: number = assistant.data[c.NUMBER_OF_GUESTS_DATA];
    const priceRequest = {
        duration: selectedSailing.duration,
        metaCode: selectedSailing.metacode,
        numberOfGuests: numberOfGuests,
        sailDate: selectedSailing.sailingDate,
        sailingId: selectedSailing.sailingId,
        shipCode: selectedSailing.shipCode
    };
    console.info("Price Request", priceRequest);
    price(priceRequest, (result: IBookingResponse) => {
        //make CH availability call
        const chRequest = createCourtesyHoldRequest(selectedSailing, result);
        checkIfAvailable(chRequest, (availability: CourtesyHoldAvailabilityResponse) => {
            if (!availability.available) {
                throw "Courtesy hold not available!";
            }

            let totalPrice = 0;
            result.guestPrices.forEach((g => totalPrice += g.totalAmount));
            const itinName = formatItineraryName(
                selectedSailing.duration,
                selectedSailing.departurePortName,
                selectedSailing.destName,
                selectedSailing.metacode,
                totalPrice,
                true,
                selectedSailing.sailingDate
            );

            assistant.data[c.CABIN_DATA] = result;
            assistant.data[c.COURTESY_HOLD_DATA] = availability;
            assistant.data[c.SELECTED_SAILING_DATA] = selectedSailing;
            assistant.setContext(c.GET_DATE_OF_BIRTH_CONTEXT);
            assistant.ask(`Great! So I have you down for: ${itinName}. ${c.PERSON_NAME}. We can hold your stateroom for ${availability.depositHours} hours.I'll just need a bit more of information. What's your date of birth?`);
            return;
        });
    });
}

function createCourtesyHoldRequest(selectedSailing: ISailingData, result: IBookingResponse) {
    var chRequest = new CourtesyHoldAvailabilityRequest();
    chRequest.itineraryCode = selectedSailing.itinCode;
    chRequest.metaCode = selectedSailing.metacode;
    chRequest.numberOfCabins = 1;
    chRequest.optionDate = result.optionDate;
    chRequest.rank = 100;
    chRequest.rateCode = selectedSailing.rateCode;
    chRequest.sailingDate = selectedSailing.sailingDate;
    chRequest.shipCode = selectedSailing.shipCode;
    chRequest.stateroomTypeCode = result.stateroomTypeCode || "";
    return chRequest;
}