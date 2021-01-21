import { ethers } from "ethers";
import { useState, useEffect, useRef, useMemo } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import TokenSelect from "../Inputs/TokenSelect.js";
import { usePostTransaction } from "../mutations";
import { value } from "../helpers";
import { actions } from "ellipticoin";
import { ArrowDown } from "react-feather";
import TokenAmountInput from "../Inputs/TokenAmountInput.js";
import {
  BASE_FACTOR,
  BRIDGE_TOKENS,
  TOKEN_METADATA,
  ETH_BRIDGE_ADDRESS,
  WETH,
} from "../constants";
import { useBridge } from "../queries";

const { arrayify, hexlify } = ethers.utils;

export default function Redeem(props) {
  const { tokens, onHide, address } = props;
  const [amount, setAmount] = useState("");
  const [redeemToken, setOutboundToken] = useState(BRIDGE_TOKENS[0]);
  const bridge = useBridge();
  const isInitialMount = useRef(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (
      isInitialMount.current &&
      pendingRedeemRequests &&
      pendingRedeemRequests.length
    ) {
      pendingRedeemRequests.map(completeRedeem);
      isInitialMount.current = false;
    }
  });
  useEffect(() => {
    if (!isInitialMount.current && pendingRedeemRequests.length == 0) {
      setLoading(false);
    }
  });
  const userTokenBalance = useMemo(() => {
    return tokens.find((token) => token.address === redeemToken.address)
      .balance;
  }, [tokens, redeemToken]);
  const [
    createRedeemRequest,
    { loading: createRedeemRequestLoading },
  ] = usePostTransaction(actions.CreateRedeemRequest, address);
  const completeRedeem = async (pendingRedemption) => {
    setLoading(true);
    // let tx = await bridge.undoTransactions(1);
    // await tx.wait();
    const tx = await bridge.redeem(
      pendingRedemption.amount,
      hexlify(arrayify(Buffer.from(pendingRedemption.token, "base64"))),
      pendingRedemption.expirationBlockNumber,
      pendingRedemption.id,
      hexlify(arrayify(Buffer.from(pendingRedemption.signature, "base64"))),
      0
    );
    await tx.wait();
    setLoading(false);
    onHide();
  };
  const handleRedeem = async (e) => {
    e.preventDefault();
    const result = await createRedeemRequest(
      Number(amount),
      redeemToken.address
    );
    if (result == null) {
    } else {
      alert(result);
    }
  };

  return pendingRedeemRequests.length ? (
    <div>
      <p>
        Please confirm the Ethereum transaction to complete redeem. Request will
        expire in 10 blocks and your tokens will be refunded
      </p>
      .
      {pendingRedeemRequests.map((pendingRedeemRequest) => (
        <div>
          <Button onClick={() => completeRedeem(pendingRedeemRequest)}>
            Retry redeem {value(BigInt(pendingRedeemRequest.amount))}{" "}
            {TOKEN_METADATA[pendingRedeemRequest.token].ticker}
          </Button>
        </div>
      ))}
    </div>
  ) : (
    <Form
      noValidate
      className="mt-2"
      autoComplete="off"
      onSubmit={(e) => handleRedeem(e)}
    >
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>

        <TokenSelect
          tokens={BRIDGE_TOKENS}
          onChange={(token) => setOutboundToken(token)}
          token={redeemToken}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Amount</Form.Label>
        <TokenAmountInput
          onChange={(amount) => setAmount(amount)}
          state={amount}
          currency={redeemToken.name}
          placeholder="Amount"
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Your Balance</Form.Label>
        <span className={amount > userTokenBalance ? "text-danger" : ""}>
          <Value>{userTokenBalance}</Value>
        </span>
      </Form.Group>
      <div className="row justify-content-md-center mt-1">
        <ArrowDown />
      </div>
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>
        <div className="mt-1">{redeemToken.ethName}</div>
        <hr className="mt-0" />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Amount</Form.Label>
        <div className="mt-1">{amount || "Amount"}</div>
        <hr className="mt-0" />
      </Form.Group>
      <Button
        type="submit"
        disabled={loading}
        className="btn btn-lg btn-block btn-primary mr-1 mb-1"
        variant="contained"
        color="primary"
      >
        {loading ? <Spinner size="md" animation="border" /> : "Redeem"}
      </Button>
    </Form>
  );
}
