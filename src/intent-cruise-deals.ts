import { ApiAiAssistant } from "actions-on-google";
import * as ch from "./courtesy-hold";
import * as c from "./constants";

export function findCruiseDeals(assistant: ApiAiAssistant) {
  ch.getCruiseDeals(function (cruiseDeals) {
    if (cruiseDeals && cruiseDeals.deals && cruiseDeals.deals.length > 0) {
      const question = formatQuestion(cruiseDeals.deals);
      assistant.data[c.DEALS_DATA] = cruiseDeals.deals;
      assistant.setContext(c.INTENT_PICK_CRUISE_DEAL);
      assistant.ask(question);
    } 
  });
}

export function pickCruiseDeal(assistant: ApiAiAssistant){
  const deals = assistant.data[c.DEALS_DATA] as ch.CruiseDeal[];
  const choice = parseInt(<string>assistant.getArgument("Number"), 10);
  const deal = deals[choice - 1];
  
  var response = "Great choice, "
  response += "we have great destinations like Bahamas, Caribbean, Mexico, Alaska, Hawaii, Bermuda, Canada, New England and Panama Canal. "
  response += "Where would you like to visit?" 
  
  assistant.data[c.RATE_CODES] = deal.rateCodes;
  assistant.setContext(c.BOOK_A_CRUISE_INTENT);
  assistant.tell(response);
}

function formatQuestion(deals: ch.CruiseDeal[]): string {
  var text = `We found ${deals.length} great deals for you. `;
  text += deals.map((n, i) => `Number ${i + 1}: ${n.description}. `).join(", ");
  text += ". What choice did you like?";
  return text;
}