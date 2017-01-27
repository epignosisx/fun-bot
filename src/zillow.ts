import * as request from 'request';
import * as lru from 'lru-cache';
var xpath = require('xpath');
var xmldom = require('xmldom');

var base_url = "http://www.zillow.com/webservice"
var zwsid = "X1-ZWz19ee5et9tzf_17jma";

var cache = lru(50);

function getPropertyId(xml: string) {
  var document = new xmldom.DOMParser().parseFromString(xml);
  var zpid = xpath.select("//response/results/result/zpid/text()", document).toString();
  return zpid;
}

function parseEstimate(xml: string) {
  var document = new xmldom.DOMParser().parseFromString(xml);
  var estimate = xpath.select("//zestimate/amount/text()", document).toString();
  try {
    estimate = Number(estimate);
  } catch (err) {
    console.warn(`Estimate ${estimate} was not a number.`);
    estimate = 0;
  }
  return estimate;
}

function getEstimate(key: string, zpid: string, callback: (estimate: Number) => void) {
  var url = `${base_url}/GetZestimate.htm?zws-id=${zwsid}&zpid=${zpid}`;
  request(url, function (error: any, response: any, body: any) {
    var estimate = parseEstimate(body);
    cache.set(key, estimate);
    console.info('stored estimate in cache');
    callback(estimate);
  });
}

export function getPropertyEstimateByCityAndState(address: string, city: string, state: string, callback: (estimate: Number) => void) {
  var key = address + city + state;
  var estimate = cache.get(key) as Number;
  if (estimate) {
    callback(estimate);
  } else {
    var url = `${base_url}/GetSearchResults.htm?zws-id=${zwsid}&address=${address}&citystatezip=${city},${state}`;
    request.get(url, function (error: any, response: any, body: any) {
      var zpid = getPropertyId(body);
      getEstimate(key, zpid, callback);
    });
  }
}

export function getPropertyEstimate(address: string, zip: string, callback: (estimate: Number) => void) {
  var key = address + zip;
  var estimate = cache.get(key) as Number;
  if (estimate != undefined) {
    console.info('retrieved estimate from cache');
    callback(estimate);
  } else {
    var url = `${base_url}/GetSearchResults.htm?zws-id=${zwsid}&address=${address}&citystatezip=${zip}`;
    request.get(url, function (error: any, response: any, body: any) {
      var zpid = getPropertyId(body);
      getEstimate(key, zpid, callback);
    });
  }
}
