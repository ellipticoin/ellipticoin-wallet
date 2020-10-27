import { default as React, useState } from "react";
import { BASE_FACTOR } from "../constants";
import { Form } from "react-bootstrap";
export default function TokenAmountInput(props) {
  const { onChange, currency } = props;
  const [textValue, setTextValue] = useState("");
  const handleOnChange = ({ target }) => {
    let { groups } = /\$?(?<number>[\d,]*)?(?<decimal>\.\d{0,6})?/.exec(
      target.value
    );
    if (!groups.number & !groups.decimal) {
      return setTextValue("");
    }
    const intValue = parseInt((groups.number || "0").replaceAll(",", ""));
    const floatValue = parseFloat(groups.decimal || "0");
    const total = BASE_FACTOR * intValue + BASE_FACTOR * floatValue;
    if (isNaN(total)) {
      onChange(null);
    } else {
      onChange(total);
    }
    const numberFormat =
      currency === "USD"
        ? {
            style: "currency",
            currency: "USD",
            currencyDisplay: "narrowSymbol",
          }
        : {};
    let formattedNumber = new Intl.NumberFormat("en-US", numberFormat)
      .format(intValue)
      .replace(/(\.|,)00$/g, "");
    setTextValue(formattedNumber + (groups.decimal || ""));
  };
  return (
    <Form.Control {...props} onChange={handleOnChange} value={textValue} />
  );
}