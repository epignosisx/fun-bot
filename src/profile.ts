import * as request from "request"
import * as c from "./constants"

const CREATE_PROFILE_URL = c.CARNIVAL_BASE_URL + "/payment/bookings/guest/create"

export interface IProfileRequest {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    dob: string;
    phoneNumber: string;
}

export interface IProfileResponse {
    authCookie: string;
    loyaltyNumber: string;
    countryCode: string;
    dobDay: number;
    dobMonth: number;
    dobYear: number;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    phoneCountryCode: string;
    phoneAreaCode: string;
    phoneNumber: string;
}

export function createProfile(profileRequest: IProfileRequest, callback: (result: IProfileResponse) => void) {

    const dobParts = (profileRequest.dob || "1986-03-11").split("-");
    const phoneCountryCode = "1";
    const phoneAreaCode = profileRequest.phoneNumber.substring(0, 3);
    const phoneNumber = profileRequest.phoneNumber.substring(3);

    var apiRequest = {
        firstName: profileRequest.firstName,
        lastName: profileRequest.lastName,
        email: profileRequest.email,
        dobYear: parseInt(dobParts[0], 10),
        dobMonth: parseInt(dobParts[1], 10),
        dobDay: parseInt(dobParts[2], 10),
        countryOfResidency: "US",
        acceptOffers: false,
        gender: "M",
        phoneCountryCode: phoneCountryCode,
        phoneAreaCode: phoneAreaCode,
        phoneNumber: phoneNumber
    };

    //{"firstName":"Alex","lastName":"Gil","email":"epignosisx@gmail.com","dobDay":11,"dobMonth":3,"dobYear":1986,"acceptOffers":true,"countryOfResidency":"US","gender":"M","phoneAreaCode":"305","phoneCountryCode":"1","phoneNumber":"5595135"}
    var options: request.CoreOptions = {
        json: true,
        body: apiRequest,
        method: "POST",
        headers: {
            "RequestVerificationToken": c.AntiForgeryTokenRequest,
            "Cookie": c.AntiForgeryCookie
        }
    };

    console.info("Create Profile api request", apiRequest);
    request(CREATE_PROFILE_URL, options, (err: any, res: any, responseApi: {loyaltyNumber: string}) => {
        console.log("Create profile api response", responseApi);
        const authCookieValue = extractAuthCookie(res.headers["set-cookie"]);
        var profileResponse: IProfileResponse = {
            authCookie: authCookieValue,
            loyaltyNumber: responseApi.loyaltyNumber,
            firstName: apiRequest.firstName,
            lastName: apiRequest.lastName,
            email: apiRequest.email,
            dobDay: apiRequest.dobDay,
            dobMonth: apiRequest.dobMonth,
            dobYear: apiRequest.dobYear,
            countryCode: apiRequest.countryOfResidency,
            gender: apiRequest.gender,
            phoneAreaCode: apiRequest.phoneAreaCode,
            phoneCountryCode: apiRequest.phoneCountryCode,
            phoneNumber: apiRequest.phoneNumber
        };
        callback(profileResponse)
    });
}

function extractAuthCookie(cookieHeader: string[]): string {
    const authCookieName = ".ASPXAUTH=";
    let authCookie = cookieHeader.filter(n => n.indexOf(authCookieName) >= 0)[0];
    let firstPiece = authCookie.split(";")[0].trim();
    console.info("Auth cookie value", firstPiece);
    return firstPiece;
}