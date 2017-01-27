import * as request from "request"
import * as c from "./constants"
import {IBookingResponse} from "./cruise-pricing"
import { CourtesyHoldAvailabilityResponse } from "./courtesy-hold"
import {ISailingData} from "./sailing-flattener"
import {IProfileResponse} from "./profile"

const CREATE_CH_URL = c.CARNIVAL_BASE_URL + "/payment/bookings/courtesyhold";
const CONFIRMATION_URL = c.CARNIVAL_BASE_URL + "/BookingEngine/Booking/StandaloneConfirmation?t=ch&n=1&0bk="

export interface ICreateChApiResponse {
    cabinResults: {
        bookingNumber: string;
        bookingResult: string;
    }[];
}

export function createCourtesyHold(
    booking: IBookingResponse, 
    ch: CourtesyHoldAvailabilityResponse, 
    sailing: ISailingData, 
    profile: IProfileResponse,
    callback: (result: ICreateChApiResponse) => void) {

    var apiRequest = {
        courtesyHoldOption: {
            depositHours: ch.depositHours,
            optionDate: booking.optionDate,
            token: ch.token
        },
        sailing: {
            durationDays: sailing.duration,
            embkPortCode: sailing.departurePortCode,
            itinCode: sailing.itinCode,
            sailDate: sailing.sailingDate,
            sailingEventCode: "",
            shipCode: sailing.shipCode,
            subRegionCode: sailing.destCode
        },
        staterooms: [
            {
                categoryCode: booking.categoryCode,
                deckCode: booking.deckCode,
                depositAmount: booking.depositAmount,
                finalPaymentDate: booking.finalPaymentDate,
                guests: booking.guestPrices.map((n,i) => {
                    return {
                        countryCode: profile.countryCode,
                        cruiseAmount: n.cruiseAmount,
                        dobDay: i == 0 ? profile.dobDay : null,
                        dobMonth: i == 0 ? profile.dobMonth : null,
                        dobYear: i == 0 ? profile.dobYear : null,
                        emailAddress: i == 0 ? profile.email : null,
                        firstName: i == 0 ? profile.firstName : null,
                        lastName: i == 0 ? profile.lastName : null,
                        gender: i == 0 ? profile.gender : null,
                        gratuityAmount: n.gratuityAmount,
                        insuranceAmount: n.insuranceAmount,
                        isInsuranceSelected: false,
                        isPrepaidGratuitiesSelected: false,
                        loyaltyNumber: i == 0 ? profile.loyaltyNumber : null,
                        phoneAreaCode: i == 0 ? profile.phoneAreaCode : null,
                        phoneCountryCode: i == 0 ? profile.phoneCountryCode : null,
                        phoneNumber: i == 0 ? profile.phoneNumber : null,
                        specialServicesSelected: [],
                        taxAmount: n.taxesAmount
                    };
                }),
                isGratuitiesRequired: booking.isGratuitiesRequired || false,
                locationCode: booking.locationCode,
                qualifiers: {
                    countryOfResidency: "US",
                    stateOfResidency: c.PERSON_STATE
                },
                rateCode: sailing.rateCode,
                stateroomMetaCode: sailing.metacode,
                stateroomNumber: booking.stateroomNumber,
                stateroomTypeCode: booking.stateroomTypeCode,
                upgradeCode: booking.upgradeCode
            }
        ]
    };
    
    var options: request.CoreOptions = {
        json: true,
        body: apiRequest,
        method: "POST",
        headers: {
            "RequestVerificationToken": c.AntiForgeryTokenRequest,
            "Cookie": c.AntiForgeryCookie + "; " + profile.authCookie + "; ASP.NET_SessionId=usp3zqkfvqlltum0i1haqa4t"
        }
    };

    console.info("Create CH api request", JSON.stringify(apiRequest));
    request(CREATE_CH_URL, options, (err: any, res: any, apiResponse: ICreateChApiResponse) => {
        console.info("Create CH api response", apiResponse);
        const booknum = apiResponse.cabinResults[0].bookingNumber;

        var options: request.CoreOptions = {
            method: "GET",
            headers: {
                "RequestVerificationToken": c.AntiForgeryTokenRequest,
                "Cookie": c.AntiForgeryCookie + "; " + profile.authCookie + "; ASP.NET_SessionId=usp3zqkfvqlltum0i1haqa4t"
            }
        };
        const confUrl = CONFIRMATION_URL + booknum;
        console.info("Confirmation url", confUrl)
        request(confUrl, options, (err2: any, res2: any, body: any)=> {
            console.info("Confirmation page loaded!", body);
            callback(apiResponse);
        });
    });
}
