import { useContext } from "react";
import { BASE_FACTOR } from "ellipticoin";
import { numberWithCommas } from "./helpers";
export default function TotalBalance(props) {
  const { children } = props;
  // const { cDAIExchangeRate } = useContext(CompoundContext);
  const cDAIExchangeRate = 1;
  if (!cDAIExchangeRate) return null;
  const value = ((Number(children) * cDAIExchangeRate) / Number(BASE_FACTOR))
    .toFixed(6)
    .toString();
  const number = value.substring(0, value.length - 4);
  const smallDecimals = value.substring(value.length - 4, value.length);
  return (
    <>
      $ {numberWithCommas(number)}
      <span style={{ color: "#958d9e", fontSize: "14px" }}>
        {smallDecimals}
      </span>{" "}
      USD
    </>
  );
}
