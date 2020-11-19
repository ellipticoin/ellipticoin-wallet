import { tokenName } from "../helpers";
import { find } from "lodash";
import { default as React } from "react";
import { Form } from "react-bootstrap";
import Select from "react-select";

export default function TokenSelect(props) {
  const {
    onChange,
    token,
    tokens,
    nameProperty,
    disabledTokens,
    defaultValue,
  } = props;
  const options = tokens.map((token) => ({
    value: token,
    label: nameProperty === "ethName" ? token.ethName : tokenName(token),
    disabled: [disabledTokens || []]
      .map((token) => token.id)
      .includes(token.id),
  }));
  // const handleTokenChange = (tokenId) => {
  //   const token = tokens.find((token) => token.id === tokenId);
  //   onChange(token);
  // };
  return (
    <Select
      styles={{ menu: (provided, state) => ({ ...provided, color: "#000" }) }}
      onChange={({ value }) => onChange(value)}
      isOptionDisabled={(option) => option.disabled}
      defaultValue={{
        label:
          nameProperty === "ethName"
            ? defaultValue.ethName
            : tokenName(defaultValue),
        value: defaultValue,
      }}
      options={options}
    />
  );
}
// <Form.Control
//   as="select"
//   onChange={(event) => {
//     handleTokenChange(event.target.value);
//   }}
//   value={token.id}
//   custom
// >
//   {tokens.map((token) => (
//     <option key={token.id} value={token.id}>
//       {nameProperty === "ethName" ? token.ethName : tokenName(token)}
//     </option>
//   ))}
// </Form.Control>
