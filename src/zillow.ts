import * as request from "request";
var xpath = require('xpath');
var xmldom = require('xmldom');

var base_url = "http://www.zillow.com/webservice"
var zwsid = "X1-ZWz19ee5et9tzf_17jma";

function getPropertyId(xml: string) {
  var document = new xmldom.DOMParser().parseFromString(xml);
  // console.log(xml);
  var zpid = xpath.select("//response/results/result/zpid/text()", document).toString();
  console.log(`ZPID: ${zpid}`);
  return zpid;
}

function parseEstimate(xml: string) {
  var document = new xmldom.DOMParser().parseFromString(xml);
  // console.log(xml);
  var estimate = xpath.select("//zestimate/amount/text()", document).toString();
  try {
    estimate = Number(estimate);
  } catch (err) {
    console.warn(`Estimate ${estimate} was not a number.`);
    estimate = 0;
  }
  console.log(`Estimate ${estimate}`);
  return estimate;
}

function getEstimate(zpid: string, callback: (estimate: number) => void) {
  var url = `${base_url}/GetZestimate.htm?zws-id=${zwsid}&zpid=${zpid}`;
  request(url, function (error: any, response: any, body: any) {
    var estimate = parseEstimate(body);
    callback(estimate);
  });
}

export function getPropertyEstimateByCityAndState(address: string, city: string, state: string, callback: (estimate: number) => void) {
  var url = `${base_url}/GetSearchResults.htm?zws-id=${zwsid}&address=${address}&citystatezip=${city},${state}`;
  console.info('Zillow: getSearchResultsByCityAndState');
  request.get(url, function (error: any, response: any, body: any) {
    var zpid = getPropertyId(body);
    getEstimate(zpid, callback);
  });
}

export function getPropertyEstimate(address: string, zip: string, callback: (estimate: number) => void) {
  var url = `${base_url}/GetSearchResults.htm?zws-id=${zwsid}&address=${address}&citystatezip=${zip}`;
  console.info('Zillow: getSearchResults');
  request.get(url, function (error: any, response: any, body: any) {
    var zpid = getPropertyId(body);
    getEstimate(zpid, callback);
  });
}
