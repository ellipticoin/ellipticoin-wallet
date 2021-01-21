import { BASE_FACTOR } from "../constants";
import { stringToBigInt } from "../helpers";
import { useState, useRef, forwardRef } from "react";
import { Form } from "react-bootstrap";
import NumberFormat from "react-number-format";
import Cleave from "cleave.js/react";

export default forwardRef((props, ref) => {
  const { value, onChange, options } = props;
  return (
    <Cleave
      className="form-control"
      ref={ref}
      placeholder="0.0"
      options={{
        ...options,
        numeral: true,
        numeralDecimalScale: 6,
        numeralThousandsGroupStyle: "thousand",
      }}
      onChange={(event) => {
        onChange(
          BigInt(
            Math.round(
              Number(event.target.rawValue.replace(/^[^\d\.]+/g, "")) *
                Number(BASE_FACTOR)
            ) || 0
          )
        );
      }}
    ></Cleave>
  );
});
// };
