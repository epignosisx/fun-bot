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

interface IStateroomTypePrice {
    code: string; //meta subcategory
    isGtee: boolean;
    metaCode: string;
    price: number;
    rateCode: string;
    taxesAndFees: number;
}

export function price(priceRequest: IPricingRequest, callback: (result: IBookingResponse) => void) {
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
        durationDays: priceRequest.duration,
        sailDate: moment(priceRequest.sailDate).tz("America/New_York").format('MMDDYYYY'),
        sailingId: priceRequest.sailingId,
        shipCode: priceRequest.shipCode
    };

    const requestOptions: request.CoreOptions = {
        json: true,
        body: apiRequest,
        method: "POST",
    };

    console.info("Pricing api request", apiRequest);
    request(META_PRICE_URL, requestOptions, (err: any, response: any, apiResponse: IPricingApiResponse) => {
        console.info("Pricing api response", apiResponse);
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
        }, (bookingResponse: IBookingResponse) => {
            callback(bookingResponse);
        });
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
    cabins: IBookingCabinApiResponse[];
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
    optionDate: string;
    guestPrices: {
        cruiseAmount: number;
        gratuityAmount: number;
        insuranceAmount: number;
        taxesAmount: number;
        totalAmount: number;
    }[];
}

function booking(bookingRequest: IBookingRequest, callback: (response: IBookingResponse) => void) {
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

    console.info("Booking api request", apiRequest);
    request(BOOKING_URL, options, (err: any, res: any, apiResponse: IBookingApiResponse) => {
        console.info("Booking api response", apiResponse);
        const cabin = apiResponse.cabins[0];
        const deck = cabin.options.decks.filter(n => n.available)[0];
        const location = cabin.options.locations[0];
        let bookingResponse: IBookingResponse = {
            optionDate: cabin.courtesyHoldOptionDate,
            categoryCode: cabin.selections.categoryCode,
            deckCode: deck ? deck.code : null,
            locationCode: location ? location.code : null,
            depositAmount: cabin.selections.totals.depositAmount,
            finalPaymentAmount: cabin.selections.totals.totalCabinAmount + cabin.selections.totals.totalTaxAndFees,
            isGratuitiesRequired: cabin.selections.forcePrepaidGratuities,
            stateroomNumber: cabin.options.rooms[0].code,
            stateroomTypeCode: cabin.selections.stateroomTypeCode,
            upgradeCode: cabin.selections.upgradeCode,
            guestPrices: cabin.selections.totals.guestPrices.map(g =>  { 
                return {
                    cruiseAmount: g.cruiseAmount,
                    gratuityAmount: g.gratuityAmount,
                    insuranceAmount: g.insuranceAmount,
                    taxesAmount: g.taxesAmount,
                    totalAmount: g.totalAmount
                };
            })
        };
        console.info("Booking response", bookingResponse);
        callback(bookingResponse);
    });
}