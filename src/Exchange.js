import { BASE_FACTOR, TOKENS } from "./constants";
import { Button, Form, Modal } from "react-bootstrap";
import { encodeToken, tokenToString } from "./helpers";

import React from "react";
import { usePostTransaction } from "./mutations";

export default function ManageLiquidity(props) {
  const { show, setShow } = props;
  const [inputAmount, setInputAmount] = React.useState("");
  const [inputToken, setInputToken] = React.useState(TOKENS[0]);
  const [outputToken, setOutputToken] = React.useState(TOKENS[0]);
  const [swap] = usePostTransaction({
    contract: "Exchange",
    functionName: "swap",
  });
  const clearForm = () => {
    setInputAmount("");
  };
  const handleInputTokenChange = (tokenString) => {
    const inputToken = TOKENS.find(
      (token) => tokenToString(token) === tokenString
    );
    setInputToken(inputToken);
  };
  const handleOutputTokenChange = (tokenString) => {
    const outputToken = TOKENS.find(
      (token) => tokenToString(token) === tokenString
    );
    setOutputToken(outputToken);
  };
  const handleSwap = async (evt) => {
    evt.preventDefault();
    console.log(inputToken);
    const response = await swap(
      encodeToken(inputToken),
      encodeToken(outputToken),
      Math.floor(parseFloat(inputAmount) * BASE_FACTOR)
    );
    console.log(response);
    setShow(false);
    clearForm();
  };
  return (
    <Modal show={show} className="action-sheet" onHide={() => setShow(false)}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Exchange</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <Form
                noValidate
                autoComplete="off"
                onSubmit={(evt) => handleSwap(evt)}
              >
                <Form.Group className="basic">
                  <Form.Label>Input Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleInputTokenChange(event.target.value);
                    }}
                    value={tokenToString(inputToken)}
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
                  <Form.Label>Output Token</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(event) => {
                      handleOutputTokenChange(event.target.value);
                    }}
                    value={tokenToString(outputToken)}
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
                  <Form.Label>Input Amount</Form.Label>
                  <Form.Control
                    onChange={(event) => setInputAmount(event.target.value)}
                    value={inputAmount}
                    placeholder="Amount"
                  />
                </Form.Group>
                <Button
                  type="submit"
                  className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                  variant="contained"
                  color="primary"
                >
                  Exchange
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
