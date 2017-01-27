import * as request from 'request';
import * as c from './constants';

export interface ICookie {
  name: string;
  value: string;
}

export interface IAntiforgeryData {
  token: string;
  cookie: ICookie
}

function getAntiforgeryCookie(url: string, cookieJar: request.CookieJar): any {
  const pattern = "AspNetCore.Antiforgery";
  var cookies = <any>cookieJar.getCookies(url);
  var cookieValue = cookies.find((n: any) => n.key.indexOf(pattern) > -1);
  return cookieValue;
}

export function getAntiforgeryData(callback: (data: IAntiforgeryData) => void) {
  var j = request.jar();
  var url = `${c.CARNIVAL_BASE_URL}/payment/antiforgerytoken`;
  request.post({ url: url, jar: j }, function (error: any, response: any, body: any) {
    var json = JSON.parse(body);
    var cookie = getAntiforgeryCookie(url, j);

    const data: IAntiforgeryData = {
      token: json.requestToken,
      cookie: {
        name: cookie.key,
        value: cookie.value
      }
    };

    callback(data);
  });
}