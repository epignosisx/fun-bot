import * as request from 'request';
import * as qs from 'qs';
import * as async from 'async';
var cheerio = require('cheerio');

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

export class CruiseDeal {
  description: string;
  url: string;
  rateCodes: string[];
}

export class CruiseDealsResponse {
  deals: CruiseDeal[];
  constructor() {
    this.deals = [];
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

export function getCruiseDeals(callback: (deals: CruiseDealsResponse) => void) {
  request(`${base_url}/service/CruiseDealsPagePersonalizer.aspx`, function (error: any, response: any, body: any) {
    let $ = cheerio.load(body);
    var limitedTimeOffersHtml = $('div[data-section="ad-category-container"]').first().find('.ccl-tout-front');
    var result = new CruiseDealsResponse();

    for (let i in limitedTimeOffersHtml) {
      if (Number(i) > 1) { break; }
      var $front = $(limitedTimeOffersHtml[i]);
      var deal = new CruiseDeal();
      var description = $front.text();
      deal.description = description.trim().replace(/[\r\n]/g, ', ').replace(/\*/g,'');
      deal.url = base_url + $front.parent().find('.ccl-tout-back > a').attr('href');
      result.deals.push(deal);
    }

    async.each(result.deals, function (deal, inner_callback) {
      request(deal.url, function (error: any, response: any, body: any) {
        let $ = cheerio.load(body);
        var json = JSON.parse($('#hdnInitialData').val());
        deal.rateCodes = json.rateCodes;
        inner_callback();
      });
    }, function(err){
      if (err){
        console.error(`Error occurred processing deals: ${JSON.stringify(err)}`)
      } else {
        callback(result);
      }
    });
  });
};
