import { BASE_FACTOR, TOKENS } from "./constants";
import { Button, Form, Modal } from "react-bootstrap";
import { Exchange } from "ec-client";
import React from "react";
import { tokenToString } from "./helpers";

export default function ManageLiquidity(props) {
  const { show, setShow, ellipticoin } = props;
  const [inputAmount, setInputAmount] = React.useState("");
  const [inputToken, setInputToken] = React.useState(TOKENS[0]);
  const [outputToken, setOutputToken] = React.useState(TOKENS[0]);
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
  const exchange = async (evt) => {
    evt.preventDefault();
    const exchange = new Exchange(ellipticoin);
    await exchange.swap(
      inputToken,
      outputToken,
      Math.floor(parseFloat(inputAmount) * BASE_FACTOR)
    );
    // const response = await pool.create(
    //   Math.floor(parseFloat(inputAmount) * BASE_FACTOR),
    //   Math.floor(parseFloat(initialPrice) * BASE_FACTOR)
    // );
    // if (response.return_value.Ok) {
    //   setBalance(response.return_value.Ok);
    // }
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
                onSubmit={(evt) => exchange(evt)}
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
