import React from "react";
import { formatCurrency } from "./helpers";

export default function Total(props) {
  const { total } = props;
  return (
    <div className="balance">
      <div className="left">
        <span className="title">Total Balance</span>
        <h1 className="total">{formatCurrency(total)}</h1>
      </div>
    </div>
  );
}
