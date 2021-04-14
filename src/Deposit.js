import { ethers } from "ethers";
import { useState, useEffect, useRef, useMemo } from "react";
import Button from "react-bootstrap/Button";
import { ChevronLeft } from "react-feather";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import TokenSelect from "./Inputs/TokenSelect.js";
import { usePendingRedeemRequests } from "./queries";
import { sendETH, sendTokens } from "./ethereum";
import { usePostTransaction } from "./mutations";
import { value } from "./helpers";
import { actions } from "ellipticoin";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "./Inputs/TokenAmountInput.js";
import {
  BASE_FACTOR,
  BRIDGE_TOKENS,
  TOKEN_METADATA,
  ETH_BRIDGE_ADDRESS,
  WETH,
} from "./constants";
import { useBridge } from "./queries";

const { arrayify, hexlify, parseUnits } = ethers.utils;

export default function Deposit(props) {
  const { onHide } = props;
  const [value, setValue] = useState(0n);
  const [token, setToken] = useState(BRIDGE_TOKENS[0]);
  const [loading, setLoading] = useState(false);
  const bridge = useBridge();
  const handleDeposit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      if (token.address === WETH.address) {
        await sendETH({
          to: "ellipticoin.eth",
          value,
        });
      } else {
        await sendTokens({
          token: token.address,
          to: "ellipticoin.eth",
          value,
        });
      }
      onHide();
      setLoading(false);
    } catch (err) {
      if (err.message) alert(err.message)
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="appHeader no-border transparent position-absolute">
        <div className="left">
          <ChevronLeft onClick={() => onHide()} />
        </div>
        <div className="pageTitle"></div>
        <div className="right"></div>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <div className="section text-center">
          <h1>Deposit</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              <Form
                noValidate
                className="mt-2"
                autoComplete="off"
                onSubmit={(e) => handleDeposit(e)}
              >
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>

                  <TokenSelect
                    tokens={BRIDGE_TOKENS}
                    onChange={(token) => setToken(token)}
                    token={token}
                  />
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <TokenAmountInput
                    onChange={(value) => setValue(value)}
                    state={value}
                    placeholder="Amount"
                  />
                </Form.Group>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn btn-lg btn-block btn-primary my-3"
                  variant="contained"
                  color="primary"
                >
                  {loading ? (
                    <Spinner size="md" animation="border" />
                  ) : (
                    "Deposit"
                  )}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
