import TokenAmountInput from "./Inputs/TokenAmountInput";
import { BASE_FACTOR, TOKENS } from "./constants";
import { tokenToString, encodeAddress } from "./helpers";
import { usePostTransaction } from "./mutations";
import base64url from "base64url";
import { ethers } from "ethers";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { actions } from "ellipticoin";

const { arrayify } = ethers.utils;

export default function Send(props) {
  const { show, setShow, setHost, address } = props;
  const [amount, setAmount] = useState(
    12345n * BASE_FACTOR
    // ""
  );
  const [toAddress, setToAddress] = useState(
    "0x1D6bB7047Fd6e47a935D816297e0b4f9113ed023"
  );
  const [token, setToken] = useState(TOKENS[0]);
  const [postTransfer] = usePostTransaction(actions.Transfer, address);
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };
  const send = async (event) => {
    event.preventDefault();
    const result = await postTransfer(amount, token.address, toAddress);
    if (result == null) {
      setShow(false);
    } else {
      console.log(result);
    }
  };

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
