import * as request from 'request';
import * as qs from 'qs';

var base_url = "https://www.carnival.com";

export class CourtesyHoldAvailabilityRequest {
  optionDate: string;
  numberOfCabins: number;
  metaCode: string;
  itineraryCode: string;
  rateCode: string;
  sailingDate: string;
  shipCode: string;
  stateroomTypeCode: string;
  rank: number;
  toQueryString() {
    return qs.stringify(this);
  }
}

export class CourtesyHoldAvailabilityResponse {
  depositHours: number;
  available: boolean;
  token: string;
  constructor(depositHours: number, available: boolean, token: string) {
    this.depositHours = depositHours;
    this.available = available;
    this.token = token;
  }
}

export function checkIfAvailable(req: CourtesyHoldAvailabilityRequest, callback: (availability: CourtesyHoldAvailabilityResponse) => void) {
  var url = `${base_url}/bookingengine/api/booking/courtesyhold/config?` + req.toQueryString();
  request.get(url, function (error: any, response: any, body: any) {
    var info = JSON.parse(body);
    var result = new CourtesyHoldAvailabilityResponse(info.depositHours, (info.depositHours > 0), info.token);
    // console.log(`Courtesy Hold Availability Response: ${JSON.stringify(result)}`);
    callback(result);
  });
};