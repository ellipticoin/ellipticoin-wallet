import { ethers } from "ethers";
import { useState, useEffect, useRef, useMemo } from "react";
import Button from "react-bootstrap/Button";
import { ChevronLeft } from "react-feather";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import TokenSelect from "./Inputs/TokenSelect.js";
import { usePendingRedeemRequests } from "./queries";
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
import { useGetBlockchainState } from "./queries";

const { arrayify, hexlify } = ethers.utils;

export default function Withdraw(props) {
  const { tokens, onHide, address } = props;
  const {
    data: { pendingRedeemRequests = [] },
  } = usePendingRedeemRequests(address);
  const [withdrawlValue, setWithdrawlValue] = useState(0n);
  const [token, setToken] = useState(tokens[0]);
  const { bridgeContract } = useGetBlockchainState();
  const isInitialMount = useRef(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (
      isInitialMount.current &&
      pendingRedeemRequests &&
      bridgeContract &&
      pendingRedeemRequests.length
    ) {
      pendingRedeemRequests.map(completeWithdraw);
      isInitialMount.current = false;
    }
  });
  useEffect(() => {
    if (!isInitialMount.current && pendingRedeemRequests.length == 0) {
      setLoading(false);
    }
  });
  const [
    createWithdrawRequest,
    { loading: createWithdrawRequestLoading },
  ] = usePostTransaction(actions.CreateRedeemRequest, address);
  const completeWithdraw = async (pendingRedemption) => {
    setLoading(true);
    const tx = await bridgeContract.redeem(
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
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const result = await createWithdrawRequest(
      Number(withdrawlValue),
      token.address
    );
    if (result == null) {
    } else {
      alert(result);
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
          <h1>Withdraw</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              {pendingRedeemRequests.length ? (
                <div>
                  <p>
                    Please confirm the Ethereum transaction to complete redeem.
                    Request will expire in 10 blocks and your tokens will be
                    refunded
                  </p>
                  .
                  {pendingRedeemRequests.map((pendingRedeemRequest) => (
                    <div key={pendingRedeemRequest.id}>
                      <Button
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          margin: "auto",
                        }}
                        onClick={() => completeWithdraw(pendingRedeemRequest)}
                      >
                        Retry redeem of{" "}
                        {value(BigInt(pendingRedeemRequest.amount))}{" "}
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
                  onSubmit={(e) => handleWithdraw(e)}
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
                      onChange={(withdrawlValue) => setWithdrawlValue(withdrawlValue)}
                      state={withdrawlValue}
                      currency={token.name}
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
                      "Withdraw"
                    )}
                  </Button>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
