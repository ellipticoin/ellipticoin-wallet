import Spinner from "react-bootstrap/Spinner";
import TokenAmountInput from "./Inputs/TokenAmountInput.js";
import TokenSelect from "./Inputs/TokenSelect.js";
import { Form, Button } from "react-bootstrap";
import { MS, WETH, BASE_FACTOR } from "./constants";
import { ethers } from "ethers";
import { sendTokens, sendETH } from "./ethereum";
import { useState, useEffect } from "react";

export default function Deposit(props) {
  const { tokens } = props;
  const [value, setValue] = useState(0n);
  const [token, setToken] = useState(WETH);
  const [loading, setLoading] = useState(false);
  const handleDeposit = async (evt) => {
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
          value: Number(value) / Number(BASE_FACTOR),
        });
      }
      setLoading(false);
    } catch (error) {
      if (error.message) alert(error.message);

      setLoading(false);
    }
  };

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
          onSubmit={(evt) => handleDeposit(evt)}
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
              {loading ? <Spinner size="md" animation="border" /> : "Deposit"}
            </Button>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}
