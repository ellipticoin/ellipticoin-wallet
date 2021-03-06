import { useState, useEffect } from "react";
import { MS, WETH, BASE_FACTOR } from "./constants";
import { Form, Button } from "react-bootstrap";
import { sendTokens, sendETH } from "./ethereum";
import { ethers } from "ethers";
import TokenSelect from "./Inputs/TokenSelect.js";
import TokenAmountInput from "./Inputs/TokenAmountInput.js";

export default function AddLiquidity(props) {
  const { setShowPage } = props;

  return (
    <div className="section mt-4">
      <h2 className="text-center">Add Liquidity</h2>
      <div className="text-center muted">
        Add liquidity to start earning Moonshine tokens
      </div>
      <Button
        type="submit"
        style={{ display: "block" }}
        className="btn mt-2 btn-lg btn-primary w-50 mx-auto"
        onClick={() => setShowPage("ManageLiquidity")}
      >
        Add Liquidity
      </Button>
    </div>
  );
}
