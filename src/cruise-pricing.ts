import * as request from "request"
import * as c from "./constants"
import * as moment from "moment"
import "moment-timezone"

const META_PRICE_URL = c.CARNIVAL_BASE_URL + "/cruisepricing/api/cruisepricing/meta";
const BOOKING_URL = c.CARNIVAL_BASE_URL + "/cruisepricing/api/cruisepricing/booking"
export interface IPricingRequest {
    numberOfGuests: number;
    duration: number;
    sailDate: string;
    sailingId: string;
    shipCode: string;
    metaCode: string;
}

export interface IPricingResponse {
    
}

interface IPricingApiResponse {
    metaPrices: IMetaPrice[]
}

interface IMetaPrice {
    code: string;//SU, IS, etc
    stateroomTypePrices: IStateroomTypePrice[];
}

export interface IStateroomTypePrice {
    code: string; //meta subcategory
    isGtee: boolean;
    metaCode: string;
    price: number;
    rateCode: string;
    taxesAndFees: number;
}

export function price(priceRequest: IPricingRequest, callback: (result: IStateroomTypePrice) => void) {
    let apiRequest = {
        cabinQualifiers: [
            { 
                isMilitary: false,
                isPastGuest: false,
                isSenior: false,
                numberOfGuests: priceRequest.numberOfGuests,
                pastGuestNumber: "",
                stateOfResidency: c.PERSON_STATE
            }
        ],
        durationDays: 4,
        sailDate: moment(priceRequest.sailDate).tz("America/New_York").format('MMDDYYYY'),
        sailingId: priceRequest.sailingId,
        shipCode: priceRequest.shipCode
    };

    const requestOptions: request.CoreOptions = {
        json: true,
        body: apiRequest,
        method: "POST",
    };

    request(META_PRICE_URL, requestOptions, (err: any, response: any, body: any) => {
        let apiResponse: IPricingApiResponse = JSON.parse(body);
        console.info("MetaPrice response", apiResponse);
        let metaPrice: IMetaPrice = apiResponse.metaPrices.filter(n => n.code === priceRequest.metaCode)[0];
        let lowestPrice: IStateroomTypePrice = metaPrice.stateroomTypePrices[0];
        console.info("MetaPrice lowest price", lowestPrice);

        booking({
            durationDays: priceRequest.duration,
            metaCode: priceRequest.metaCode,
            numberOfGuests: priceRequest.numberOfGuests,
            rateCode: lowestPrice.rateCode,
            sailDate: priceRequest.sailDate,
            sailingId: priceRequest.sailingId,
            shipCode: priceRequest.shipCode,
            stateroomTypeCode: lowestPrice.code
        })

        callback(lowestPrice);
    });
}

interface IBookingRequest {
    numberOfGuests: number;
    metaCode: string;
    rateCode: string;
    stateroomTypeCode: string;//VISUNB
    durationDays: number;
    sailDate: string;//11-26-2018
    sailingId: string;
    shipCode: string;
}

interface IBookingApiResponse {

}

interface IBookingCabinApiResponse {
    courtesyHoldOptionDate: string;
    selections: {
        categoryCode: string;
        deckCode: string;
        forcePrepaidGratuities: boolean;
        isGtee: false;
        locationCode: string;
        metaCode: string;
        pricePerPerson: {
            price: number;
            taxesAndFees: number;
        },
        rateCode: string;
        roomNumber: string;
        stateroomTypeCode: string; //VISUNB
        stateroomTypeMetaCode: string;//SU
        stateroomTypeTitle: string; //Junior Suite
        totals: {
            depositAmount: number;
            depositAvailable: boolean;
            depositDueDate: string;
            finalPaymentDate: string;
            guestPrices: {
                cruiseAmount: number;
                gratuityAmount: number;
                insuranceAmount: number;
                taxesAmount: number;
                totalAmount: number;
            }[];
            onboardCreditAmount: number;
            totalCabinAmount: number;
            totalTaxAndFees: number;
        },
        upgradeCode: string;
    };
    options: {
        decks: {
            available: boolean;
            code: string; //9
            deckNumber: string; //9
            name: string; //Lido
            pricePerPerson: {price: number; taxesAndFees: number;};
        }[];
        locations: {
            code: string;//F
            name: string;//F
            pricePerPerson: {price: number; taxesAndFees: number;};
        }[];
        rooms: {
            code: string; //StateroomNumber
        }[];
    }
}

export interface IBookingResponse {
    deckCode: string;
    locationCode: string;
    categoryCode: string;
    upgradeCode: string;
    depositAmount: number;
    finalPaymentAmount: number;
    isGratuitiesRequired: boolean;
    stateroomNumber: string;
    stateroomTypeCode: string;
    guestPrices: {
        cruiseAmount: number;
        gratuityAmount: number;
        insuranceAmount: number;
        taxesAmount: number;
        totalAmount: number;
    }[];
}

export function booking(bookingRequest: IBookingRequest) {
    let apiRequest: any = {
        cabinholdaction: "hold",
        requestType: "FullBookingWithAlternatives",
        cabins: [
            {
                qualifiers: {
                    countryCode: "US",
                    isMilitary: false,
                    isPastGuest: false,
                    isSenior: false,
                    numberOfGuests: bookingRequest.numberOfGuests,
                    pastGuestNumber: "",
                    stateOfResidency: c.PERSON_STATE
                },
                selections: {
                    deckCode: null,
                    locationCode: null,
                    metaCode: bookingRequest.metaCode,
                    rateCode: bookingRequest.rateCode,
                    roomNumber: null,
                    stateroomTypeCode: bookingRequest.stateroomTypeCode
                }
            }
        ],
        sailing: {
            durationDays: bookingRequest.durationDays,
            sailDate: moment(bookingRequest.sailDate).tz("America/New_York").format('MM-DD-YYYY'),
            sailingId: bookingRequest.sailingId,
            shipCode: bookingRequest.shipCode
        }
    };

    const options: request.CoreOptions = {
        method: "POST",
        json: true,
        body: apiRequest
    };

    request(BOOKING_URL, options, (err: any, res: any, body: any) => {
        const apiResponse = JSON.parse(body);
        //TODO: to be continued
    });
}

function iso8601toMMddyyyy(value: string) {
    return moment(value).tz("America/New_York").format('MMDDYYYY');
}