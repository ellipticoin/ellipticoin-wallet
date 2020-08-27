import { Button, Form, Modal, InputGroup } from "react-bootstrap";

import React from "react";
import { TOKENS, BASE_FACTOR } from "./constants";
import { Pool } from "ec-client";
import { tokenToString } from "./helpers";

export default function Send(props) {
  const { show, setShow, ellipticoin, setBalance, blockHash } = props;
  const [reserveAmount, setReserveAmount] = React.useState("");
  const [initialPrice, setInitialPrice] = React.useState("");
  const [token, setToken] = React.useState(TOKENS[0]);
  const [pool, setPool] = React.useState(new Pool(ellipticoin));
  React.useEffect(() => {
    (async () => {
      const pool = await ellipticoin.getPool(token);
      setPool(pool);
    })();
  }, [ellipticoin, token, blockHash]);
  const clearForm = () => {
    setReserveAmount("");
    setInitialPrice("");
  };
  const handleTokenChange = (tokenString) => {
    const token = TOKENS.find((token) => tokenToString(token) === tokenString);
    setToken(token);
  };
  const createPool = async (evt) => {
    evt.preventDefault();
    const response = await pool.create(
      Math.floor(parseFloat(reserveAmount) * BASE_FACTOR),
      Math.floor(parseFloat(initialPrice) * BASE_FACTOR)
    );
    if (response.return_value.Ok) {
      setBalance(response.return_value.Ok);
    }
    setShow(false);
    clearForm();
  };
  return (
    <Modal show={show} className="action-sheet" onHide={() => setShow(false)}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Provide Liquidity</h5>
          </div>
          <div className="modal-body">
            <div className="action-sheet-content">
              <Form
                noValidate
                autoComplete="off"
                onSubmit={(evt) => createPool(evt)}
              >
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
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    onChange={(event) => setReserveAmount(event.target.value)}
                    value={reserveAmount}
                    placeholder="Amount"
                  />
                </Form.Group>
                {pool.exists() ? null : (
                  <Form.Group className="basic">
                    <Form.Label>Initial Price</Form.Label>
                    {pool.exists() ? (
                      <Form.Control
                        onChange={(event) =>
                          setInitialPrice(event.target.value)
                        }
                        value={initialPrice}
                        placeholder="Initial Price"
                      />
                    ) : (
                      <InputGroup className="mb-3">
                        <Form.Control
                          onChange={(event) =>
                            setInitialPrice(event.target.value)
                          }
                          value={initialPrice}
                          placeholder="Inital Price"
                        />
                        <InputGroup.Append>
                          <InputGroup.Text id="basic-addon2">
                            x {reserveAmount} = {reserveAmount * initialPrice}{" "}
                            DAI
                          </InputGroup.Text>
                        </InputGroup.Append>
                      </InputGroup>
                    )}
                  </Form.Group>
                )}
                {pool.exists() ? (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                    variant="contained"
                    color="primary"
                  >
                    Add Liquidity
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="btn btn-lg btn-block btn-primary mr-1 mb-1"
                    variant="contained"
                    color="primary"
                  >
                    Create Pool
                  </Button>
                )}
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
