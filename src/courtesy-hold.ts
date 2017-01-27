import * as request from 'request';
import * as qs from 'qs';
import * as async from 'async';
import * as c from './constants';
import * as lru from 'lru-cache';

var cheerio = require('cheerio');

var cache = lru(50);

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
  var url = `${c.CARNIVAL_BASE_URL}/bookingengine/api/booking/courtesyhold/config?` + req.toQueryString();
  console.info("Courtesy hold request", url);
  request.get(url, function (error: any, response: any, body: any) {
    var info = JSON.parse(body);
    var result = new CourtesyHoldAvailabilityResponse(info.depositHours, (info.depositHours > 0), info.token);
    // console.log(`Courtesy Hold Availability Response: ${JSON.stringify(result)}`);
    callback(result);
  });
};

export function getCruiseDeals(callback: (deals: CruiseDealsResponse) => void) {
  var key = 'cruise-deals';
  var cruiseDeals = cache.get(key) as CruiseDealsResponse;
  if (cruiseDeals != undefined) {
    console.info('retrieved cruise deals from cache');
    callback(cruiseDeals);
  } else {
    request(`${c.CARNIVAL_BASE_URL}/service/CruiseDealsPagePersonalizer.aspx`, function (error: any, response: any, body: any) {
      let $ = cheerio.load(body);
      var limitedTimeOffersHtml = $('div[data-section="ad-category-container"]').first().find('.ccl-tout-front');
      var result = new CruiseDealsResponse();

      for (let i in limitedTimeOffersHtml) {
        if (Number(i) > 1) { break; }
        var $front = $(limitedTimeOffersHtml[i]);
        var deal = new CruiseDeal();
        var description = $front.text();
        deal.description = description.trim().replace(/[\r\n]/g, ', ').replace(/\*/g, '');
        deal.url = c.CARNIVAL_BASE_URL + $front.parent().find('.ccl-tout-back > a').attr('href');
        result.deals.push(deal);
      }

      async.each(result.deals, function (deal, inner_callback) {
        request(deal.url, function (error: any, response: any, body: any) {
          let $ = cheerio.load(body);
          var json = JSON.parse($('#hdnInitialData').val());
          deal.rateCodes = json.rateCodes;
          inner_callback();
        });
      }, function (err) {
        if (err) {
          console.error(`Error occurred processing deals: ${JSON.stringify(err)}`)
        } else {
          cache.set(key, result);
          console.info('stored cruise deals in cache');
          callback(result);
        }
      });
    });
  }
};
