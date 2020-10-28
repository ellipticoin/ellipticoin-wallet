import { default as React } from "react";
import { Form } from "react-bootstrap";
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
        <option key={token.name} value={token.id}>
          {nameProperty === "ethName" ? token.ethName : token.name}
        </option>
      ))}
    </Form.Control>
  );
}
