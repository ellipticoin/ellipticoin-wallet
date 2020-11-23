import { BASE_FACTOR } from "../constants";
import { formatBigNumAsText } from "./helpers";
import { BigInt } from "jsbi";
import { default as React, useMemo } from "react";
import { Form } from "react-bootstrap";

export default function TokenAmountInput(props) {
  const { onChange, currency, state } = props;

  const handleOnChange = ({ target }) => {
    const inputText = target.value;
    let { groups } = /\$?(?<number>[\d,]*)?(?<decimal>\.\d{0,6})?/.exec(
      inputText
    );
    if (!groups.number && !groups.decimal) {
      if (!inputText) {
        onChange({ value: null, formattedText: "" });
      } else {
        onChange(state);
      }
      return;
    }
    const intValue = parseInt((groups.number || "0").replaceAll(",", ""));
    const floatValue =
      groups.decimal === "." ? 0 : parseFloat(groups.decimal || "0");
    const total = BASE_FACTOR * intValue + BASE_FACTOR * floatValue;

    const bigNum = isNaN(total) ? null : new BigInt(total);

    let text = inputText;
    if (bigNum) {
      text = formatBigNumAsText(bigNum, currency);
      if (groups.decimal === ".") {
        text += ".";
      }
    }

    onChange({ value: bigNum, formattedText: text });
  };

  const textValue = useMemo(() => {
    if (state.value && state.formattedText) {
      return state.formattedText;
    } else if (state.value) {
      return formatBigNumAsText(state.value);
    }

    return "";
  }, [state]);

  return (
    <Form.Control {...props} onChange={handleOnChange} value={textValue} />
  );
}
