import { useState, useEffect } from "react";
import { MS, WETH, BASE_FACTOR } from "./constants";
import { Form, Button } from "react-bootstrap";
import { sendTokens, sendETH } from "./ethereum";
import { ethers } from "ethers";
import TokenSelect from "./Inputs/TokenSelect.js";
import TokenAmountInput from "./Inputs/TokenAmountInput.js";

export default function Deposit(props) {
  const { tokens } = props;
  const [value, setValue] = useState(0n);
  const [token, setToken] = useState(WETH);
  const [loading, setLoading] = useState(false);
  const mint = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      if (token.address === WETH.address) {
        await sendETH({
          to: "ellipticoin.eth",
          value: value,
        });
      } else {
        await sendTokens({
          token: token.address,
          to: "ellipticoin.eth",
          value: value,
        });
      }
      setLoading(false);
    } catch (error) {
      if (error.message) alert(error.message);

      setLoading(false);
    }
  };
  if (tokens.length === 0) return null;

  return (
    <div className="wallet-footer">
      <div className="w-100">
        <h2 className="text-center">Deposit</h2>
        <div className="text-center muted">
          Start Trading and Earning Interest
        </div>
        <Form
          noValidate
          className="mt-2"
          autoComplete="off"
          onSubmit={(evt) => mint(evt)}
        >
          <Form.Group className="basic">
            <Form.Label>Token</Form.Label>
            <TokenSelect
              tokens={tokens.filter((token) => token.address !== MS.address)}
              onChange={(token) => setToken(token)}
              defaultValue={WETH}
              token={token}
            />
          </Form.Group>
          <Form.Group className="basic">
            <Form.Label>Amount</Form.Label>
            <TokenAmountInput
              disabled={loading}
              onChange={(value) => setValue(value)}
              placeholder="Amount"
            />
            <Button type="submit" className="btn mt-2 btn-lg btn-primary">
              Deposit
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}
