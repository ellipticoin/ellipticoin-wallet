import { formatCurrency } from "./helpers";
import React from "react";

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
