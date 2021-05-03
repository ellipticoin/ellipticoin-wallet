import { ethers } from "ethers";
import { useState, useEffect, useRef, useMemo, useContext } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import TokenSelect from "../Inputs/TokenSelect.js";
import { usePendingRedeemRequests } from "../queries";
import { sendETH, sendTokens } from "../ethereum";
import { usePostTransaction } from "../mutations";
import { actions, BRIDGE_ADDRESS, SAFE_ADDRESS } from "ellipticoin";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "../Inputs/TokenAmountInput.js";
import {
  BASE_FACTOR,
  BRIDGE_TOKENS,
  TOKEN_METADATA,
  ETH_BRIDGE_ADDRESS,
  WETH,
} from "../constants";
import { useGetBlockchainState } from "../queries";
import SettingsContext from "../SettingsContext";

const { arrayify, hexlify, parseUnits } = ethers.utils;

export default function DepositForm(props) {
  const { onHide, tokens } = props;
  const [value, setValue] = useState(0n);
  const [depositToSafe, setDepositToSafe] = useState(false);
  const [token, setToken] = useState(tokens[0]);
  const [loading, setLoading] = useState(false);
  const { investorModeEnabled } = useContext(SettingsContext);
  const underlyingValue = useMemo(() => (value * token.underlyingExchangeRate) / BASE_FACTOR);
  const bridgeContractAddress = useMemo(() =>
    depositToSafe ? SAFE_ADDRESS : BRIDGE_ADDRESS
  );
  const handleDeposit = async (evt) => {
    evt.preventDefault();
    setLoading(true);

    try {
      if (token.address === WETH.address) {
        await sendETH({
          to: bridgeContractAddress,
          value,
        });
      } else {
        await sendTokens({
          token: token.address,
          to: bridgeContractAddress,
          value: underlyingValue,
        });
      }
      onHide();
      setLoading(false);
    } catch (err) {
      if (err.message) alert(err.message);
      setLoading(false);
    }
  };
  return (
    <Form
      noValidate
      className="mt-2"
      autoComplete="off"
      onSubmit={(e) => handleDeposit(e)}
    >
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>
        <TokenSelect
          tokens={tokens}
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
      {investorModeEnabled && (
        <Form.Group className="basic">
          <Form.Check
            checked={depositToSafe}
            onChange={({ target: checked }) => setDepositToSafe(checked)}
            type="checkbox"
            label="Deposit Directly To Safe"
          />
        </Form.Group>
      )}
      <Button
        type="submit"
        disabled={loading}
        className="btn btn-lg btn-block btn-primary my-3"
        variant="contained"
        color="primary"
      >
        {loading ? <Spinner size="md" animation="border" /> : "Deposit"}
      </Button>
    </Form>
  );
}
