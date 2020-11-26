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
      onChange({ value: null, formattedText: "" });
      return;
    }
    const intValue = parseInt((groups.number || "0").replaceAll(",", ""));
    const floatValue =
      groups.decimal === "." ? 0 : parseFloat(groups.decimal || "0");
    const total = BASE_FACTOR * intValue + BASE_FACTOR * floatValue;

    const bigNum = isNaN(total) ? null : new BigInt(total);

    let text = inputText;
    if (bigNum && !/^\$?0?\.0+$/.test(text)) {
      text = formatBigNumAsText(bigNum, currency);
      let split = text.split(".");
      if (
        groups.decimal !== undefined &&
        (split.length < 2 || split[1].length < groups.decimal.length - 1)
      ) {
        text = split[0] + groups.decimal;
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
