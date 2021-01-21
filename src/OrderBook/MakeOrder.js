import { TokenAmountInput, TokenSelect } from "../Inputs";
import { useState } from "react";
import Select from "react-select";
import { usePostTransaction } from "../mutations";
import { actions } from "ellipticoin";
import { ORDER_TYPES } from ".";
import { Form, Collapse, Button } from "react-bootstrap";

export default function MakeOrder(props) {
  const { tokens, address, onHide } = props;
  const [orderType, setOrderType] = useState(0);
  const [token, setToken] = useState(tokens[0]);
  const [amount, setAmount] = useState();
  const [price, setPrice] = useState();
  const [createOrder] = usePostTransaction(actions.CreateOrder, address);
  const handleCreateLimitOrder = async (e) => {
    e.preventDefault();
    let result = await createOrder(
      ORDER_TYPES[orderType],
      amount,
      token.address,
      price
    );

    if (result) {
      alert(result);
    } else {
      onHide();
    }
  };
  return (
    <Form
      noValidate
      className="p-2"
      autoComplete="off"
      onSubmit={(evt) => handleCreateLimitOrder(evt)}
    >
      <h1>Create an Limit Order</h1>
      <Form.Group className="basic">
        <Form.Label>Order Type</Form.Label>
        <Select
          styles={{
            menu: (provided, state) => ({
              ...provided,
              color: "#000",
              zIndex: 3,
            }),
          }}
          onChange={({ value }) => setOrderType(value)}
          defaultValue={{ value: 0, label: ORDER_TYPES[0] }}
          options={ORDER_TYPES.map((tradeType, index) => ({
            value: index,
            label: tradeType,
          }))}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Form.Label>Token</Form.Label>
        <TokenSelect onChange={setToken} tokens={tokens} />
      </Form.Group>
      <Form.Group className="basic">
        <div className="labels">
          <Form.Label>Amount</Form.Label>
        </div>
        <TokenAmountInput
          value={amount}
          onChange={(value) => setAmount(value)}
          placeholder="0.0"
        />
      </Form.Group>
      <Form.Group className="basic">
        <div className="labels">
          <Form.Label>Price</Form.Label>
        </div>
        <TokenAmountInput
          value={price}
          onChange={(value) => {
            setPrice(value);
          }}
          placeholder="0.0"
          options={{
            prefix: "$ ",
            signBeforePrefix: true,
          }}
        />
      </Form.Group>
      <Form.Group className="basic">
        <Button
          type="submit"
          className="btn btn-lg btn-primary"
          variant="contained"
          color="primary"
        >
          Create Order
        </Button>
      </Form.Group>
    </Form>
  );
}
