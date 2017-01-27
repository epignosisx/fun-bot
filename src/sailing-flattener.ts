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
    shipCode: string;
    price: number;
}

export function flattenSailings(sailings: IItinerarySailing[]): ISailingData[] {
    return sailings.map(s => {
        let sailingDate = formatDate(s.sailing.departureDate);
        let itinName = [
            s.itinerary.dur,
            "days from",
            s.itinerary.departurePortName.split(",")[0],
            "to",
            s.itinerary.regionName,
            formatStateroomType(s.room.metacode),
            "for",
            "$" + s.room.price,
            "on",
            sailingDate
        ].join(" ");
        return {
            itinCode: s.itinerary.id.split("_")[0],
            sailingDate: s.sailing.departureDate,
            duration: s.itinerary.dur,
            sailingId: s.sailing.sailingId,
            metacode: s.room.metacode,
            price: s.room.price,
            rateCode: s.room.rateCode,
            destCode: s.itinerary.regionCode,
            shipCode: s.itinerary.shipCode,
            itineraryName: itinName
        };
    });
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