import { BASE_FACTOR } from "../constants";
import { stringToBigInt } from "../helpers";
import { default as React, useState, useRef } from "react";
import { Form } from "react-bootstrap";
import NumberFormat from "react-number-format";
import Cleave from "cleave.js/react";

export default React.forwardRef((props, ref) => {
  const { value, onChange } = props;
  return (
    <Cleave
      className="form-control"
      ref={ref}
      placeholder="0.0"
      options={{
        numeral: true,
        numeralDecimalScale: 6,
        numeralThousandsGroupStyle: "thousand",
      }}
      onChange={(event) => {
        props.onChange(
          BigInt(Number(event.target.cleaveRawValue) * Number(BASE_FACTOR) || 0)
        );
      }}
    ></Cleave>
  );
});
