<<<<<<< HEAD
import TokenAmountInput from "./inputs/TokenAmountInput";
=======
import TokenAmountInput from "./Inputs/TokenAmountInput";
>>>>>>> @{-1}
import { BASE_FACTOR, TOKENS } from "./constants";
import { tokenToString } from "./helpers";
import { usePostTransaction } from "./mutations";
import base64url from "base64url";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";

export default function Send(props) {
  const { show, setShow, setHost } = props;
  const [amount, setAmount] = React.useState(
    // "1"
    ""
  );
  const [toAddress, setToAddress] = React.useState(
    // "jLs9_OvUYqOzGiTzVcRLB3laE3Hp8CZIpdRB5lqrSew"
    // "JZoYzwPNn_k82INoA-auebXqRvZwBWiqYUKLMWUpXCQ"
    ""
  );
  const [token, setToken] = React.useState(TOKENS[0]);
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };
  const send = async (event) => {
    event.preventDefault();
    postTransfer(
      [{ Contract: token.issuer }, Array.from(Buffer.from(token.id, "base64"))],
      base64url.toBuffer(toAddress),
      Number(amount)
    );
    setShow(false);
  };

  const [postTransfer] = usePostTransaction(
    {
      contract: "Token",
      functionName: "transfer",
    },
    setHost
  );
  return (
    <Modal show={show} className="action-sheet" onHide={() => setShow(false)}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Send</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <Form noValidate autoComplete="off" onSubmit={(evt) => send(evt)}>
                <Form.Group className="basic">
                  <Form.Label>Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleTokenChange(event.target.value);
                    }}
                    value={tokenToString(token)}
                    custom
                  >
                    {TOKENS.map((token) => (
                      <option key={token.name} value={tokenToString(token)}>
                        {token.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="basic">
                  <Form.Label>To Address</Form.Label>
                  <Form.Control
                    onChange={(event) => setToAddress(event.target.value)}
                    value={toAddress}
                    placeholder="To Address"
                  />
                </Form.Group>

                <Form.Group className="basic">
                  <Form.Label>Amount</Form.Label>
                  <TokenAmountInput
                    onChange={(state) => setAmount(state)}
                    state={amount}
                    currency={token.name}
                    placeholder="Amount"
                  />
                </Form.Group>
                <Button
                  type="submit"
                  className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                  variant="contained"
                  color="primary"
                >
                  Send
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
