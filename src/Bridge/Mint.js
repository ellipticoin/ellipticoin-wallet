import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { value } from "../helpers";
import { sendETH, sendTokens } from "../ethereum";
import TokenSelect from "../Inputs/TokenSelect.js";
import TokenAmountInput from "../Inputs/TokenAmountInput.js";
import { ArrowDown } from "react-feather";
import Spinner from "react-bootstrap/Spinner";
import { useBridge } from "../queries";
import {
  USD,
  BASE_FACTOR,
  BRIDGE_TOKENS,
  TOKEN_METADATA,
  ETH_BRIDGE_ADDRESS,
  WETH,
} from "../constants";

export default function Mint(props) {
  const { onHide } = props;
  const [amount, setAmount] = useState(0n);
  const [token, setToken] = useState(BRIDGE_TOKENS[0]);
  const [loading, setLoading] = useState(false);
  const bridge = useBridge();
  const mint = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      if (token.address === WETH.address) {
        await sendETH({
          to: "ellipticoin.eth",
          value: parseUnits((Number(amount) / Number(BASE_FACTOR)).toString()),
        });
      } else {
        await sendTokens({
          token: token.address,
          to: "ellipticoin.eth",
          value: Number(amount) / Number(BASE_FACTOR),
        });
      }
      onHide();
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  return (
    <Form
      noValidate
      className="mt-2"
      autoComplete="off"
      onSubmit={(evt) => mint(evt)}
    >
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>
        <TokenSelect
          tokens={BRIDGE_TOKENS}
          nameProperty={"ethName"}
          onChange={(token) => setToken(token)}
          token={token}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Amount</Form.Label>
        <TokenAmountInput
          disabled={loading}
          onChange={(amount) => setAmount(amount)}
          placeholder="Amount"
        />
      </Form.Group>

      <div className="row justify-content-md-center mt-1">
        <ArrowDown />
      </div>
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>
        <div className="mt-1">{token.name}</div>
        <hr className="mt-0" />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Amount</Form.Label>
        <div className="mt-1">
          {value(amount)}
        </div>
        <hr className="mt-0" />
      </Form.Group>
      {token.address == USD.address ? (
        <Form.Group className="basic">
          <Form.Label>Underlying Amount</Form.Label>
          <div className="mt-1">
            <Value token={USD}>{amount}</Value>
          </div>
          <hr className="mt-0" />
        </Form.Group>
      ) : null}
      <Button
        type="submit"
        disabled={loading}
        className="btn btn-lg btn-block btn-primary mr-1 mb-1"
        variant="contained"
        color="primary"
      >
        {loading ? <Spinner size="md" animation="border" /> : "Mint"}
      </Button>
    </Form>
  );
}
