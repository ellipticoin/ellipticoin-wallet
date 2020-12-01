import { BASE_FACTOR } from "../constants";

export class InputState {
  constructor(value, currency) {
    this.value = value;
    if (!!value) {
      this.formattedText = formatBigNumAsText(value, currency);
    } else {
      this.formattedText = "";
    }
  }
}

export const formatBigNumAsText = (num, currency) => {
  let decimalValue = (num % BASE_FACTOR) / BASE_FACTOR;
  let intValue = num / BASE_FACTOR - decimalValue;
  const numberFormat =
    currency === "USD"
      ? {
          style: "currency",
          currency: "USD",
          currencyDisplay: "symbol",
        }
      : {};

  let decimalText =
    decimalValue === 0 ? "" : decimalValue.toString().substring(1);

  let text = new Intl.NumberFormat("en-US", numberFormat)
    .format(intValue)
    .replace(/(\.|,)00$/g, "");

  return text + decimalText;
};
