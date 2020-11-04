import { default as React } from "react";
import { Form } from "react-bootstrap";
import { tokenName } from "../helpers";
export default function TokenSelect(props) {
  const { onChange, token, tokens, nameProperty } = props;
  const handleTokenChange = (tokenId) => {
    const token = tokens.find((token) => token.id === tokenId);
    onChange(token);
  };
  return (
    <Form.Control
      as="select"
      onChange={(event) => {
        handleTokenChange(event.target.value);
      }}
      value={token.id}
      custom
    >
      {tokens.map((token) => (
        <option key={token.id} value={token.id}>
          {nameProperty === "ethName" ? token.ethName : tokenName(token)}
        </option>
      ))}
    </Form.Control>
  );
}
