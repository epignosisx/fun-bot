import {IItinerarySailing} from "./results-reducer"

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

export interface ISailingData {
    itinCode: string;
    itineraryName: string;
    sailingDate: string;
    duration: number;
    sailingId: string;
    metacode: string;
    rateCode: string;
    destCode: string;
    destName: string;
    shipCode: string;
    price: number;
    departurePortName: string;
}

export function flattenSailings(sailings: IItinerarySailing[]): ISailingData[] {
    return sailings.map(s => {
        let sailingDate = formatDate(s.sailing.departureDate);
        let itinName = formatItineraryName(s.itinerary.dur, s.itinerary.departurePortName, s.itinerary.regionName, s.room.metacode, s.room.price, false, s.sailing.departureDate);
        return {
            itinCode: s.itinerary.id.split("_")[0],
            sailingDate: s.sailing.departureDate,
            duration: s.itinerary.dur,
            sailingId: s.sailing.sailingId,
            metacode: s.room.metacode,
            price: s.room.price,
            rateCode: s.room.rateCode,
            destCode: s.itinerary.regionCode,
            destName: s.itinerary.regionName,
            shipCode: s.itinerary.shipCode,
            itineraryName: itinName,
            departurePortName: s.itinerary.departurePortName
        };
    });
}

export function formatItineraryName(dur: number, departurePortName: string, regionName: string, metacode: string, price: number, includesTax: boolean, sailDate8601: string): string {
    let sailingDate = formatDate(sailDate8601);
    let priceText = "$" + price;
    if(includesTax) {
        priceText += " including taxes";
    }
    let itinName = [
        dur,
        "days from",
        departurePortName.split(",")[0],
        "to",
        regionName,
        formatStateroomType(metacode),
        "for",
        "$" + priceText,
        "on",
        sailingDate
    ].join(" ");

    return itinName;
}

function formatStateroomType(metacode: string) {
    switch(metacode) {
        case "IS":
            return "in an interior stateroom";
        case "OS":
            return "in an ocean view stateroom";
        case "OB":
            return "in a balcony stateroom";
        case "SU":
            return "in a suite";
        default:
            throw "Unknown metacode: " + metacode;
    }
}

function formatDate(iso8601: string) {
    let date = new Date(iso8601);
    const month = date.getUTCMonth();
    const monthName = monthNames[month];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return monthName + " " + day + ", " + year;
}