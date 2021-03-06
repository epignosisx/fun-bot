import * as request from "request";

const url = "https://www.carnival.com/bookingengine/api/search";

export interface ICruiseSearchRequest {
    dest?: string;
    embkPortCode?: string;
    dateRange?: string;
    passThroughPort?: string[];
    ship?: string;
    rateCodes?: string[];
    numberOfGuests?: number;
}

export interface ICruiseSearchResponse {
    results: {
        itineraries: IItinerary[]
    }
}

export interface IItinerary {
    dur: number;
    departurePortName: string;
    shipCode: string;
    shipName: string;
    regionName: string;
    regionCode: string;
    id: string; //BAD_MIA_VI_3_Fri
    sailings: ISailing[];
}

export interface ISailing {
    departureDate: string;
    arrivalDate: string;
    sailingId: string;
    rooms: {
        interior: IRoom;
        oceanview: IRoom;
        balcony: IRoom;
        suite: IRoom;
    }
}

export interface IRoom {
    metacode: string;
    price: number;
    rateCode: string;
    soldOut: boolean;
}

function toQs(params: ICruiseSearchRequest): string {
    var arr = ["exclDetails=false", "layout=grid", "numChildren=0", "pageNumber=1", "pageSize=8", "showBest=true", "sort=FromPrice", "useSuggestions=false"];
    if(params.dest) {
        arr.push("dest=" + encodeURIComponent(params.dest));
    }
    if(params.embkPortCode) {
        arr.push("port=" + encodeURIComponent(params.embkPortCode));
    }
    if(params.passThroughPort) {
        const ptPorts = params.passThroughPort.join(",");
        arr.push("ptPort=" + encodeURIComponent(ptPorts));
    }
    if(params.ship) {
        arr.push("shipCode=" + encodeURIComponent(params.ship));
    }
    if(params.rateCodes) {
        const ptRateCodes = params.rateCodes.join(",");
        arr.push("rateCode=" + encodeURIComponent(ptRateCodes));
    }
    if(params.dateRange) {
        const ranges = parseDateRange(params.dateRange);
        arr.push("datFrom=" + encodeURIComponent(ranges.from));
        arr.push("datTo=" + encodeURIComponent(ranges.to));
    }
    if(params.numberOfGuests) {
        arr.push("numAdults=" + params.numberOfGuests);
    }
    return arr.join("&");
}

function parseDateRange(dateRange: string): {from: string; to: string;} {
    const ranges = dateRange.split("/");
    const from = parseYearAndMonth(ranges[0]);
    const to = parseYearAndMonth(ranges[1]);
    return {from: from, to: to};
}

function parseYearAndMonth(value: string) {
    const parts = value.split("-");//2017-02-01
    return parts[1] + parts[0]; //MMyyyy
}

export function cruiseSearch(params: ICruiseSearchRequest, callback: (result: any) => void) {
    const qs: string = toQs(params);
    console.info("Querystring: " + qs);
    const searchUrl = url + "?" + qs;
    request.get(searchUrl, (error, response, body) => {
        const searchResponse: ICruiseSearchResponse = JSON.parse(body);
        console.log("Cruise Search response. Itineraries found: ", searchResponse.results.itineraries.length);
        callback(searchResponse);
    });
}
