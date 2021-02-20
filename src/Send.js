import TokenAmountInput from "./Inputs/TokenAmountInput";
import TokenSelect from "./Inputs/TokenSelect";
import { BASE_FACTOR, TOKENS } from "./constants";
import { usePostTransaction } from "./mutations";
import base64url from "base64url";
import { ethers } from "ethers";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { actions } from "ellipticoin";

const { arrayify } = ethers.utils;

export default function Send(props) {
  const { show, setShow, setHost, address, tokens } = props;
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();
  const [token, setToken] = useState(tokens[0]);
  const [postTransfer] = usePostTransaction(actions.Transfer, address);
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };

  const clearForm = () => {
    setAmount(0);
    setToAddress(null);
    setToken(tokens[0]);
  };

  const send = async (event) => {
    event.preventDefault();
    const result = await postTransfer(amount, token.address, toAddress);
    if (result == null) {
      clearForm();
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
                  <TokenSelect
                    tokens={tokens}
                    onChange={(token) => setToken(token)}
                    token={token}
                  />
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
