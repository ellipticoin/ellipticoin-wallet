import { TOKEN_METADATA } from "../constants";
import Select from "react-select";

export default function TokenSelect(props) {
  const { onChange, tokens, nameProperty, disabledTokens } = props;
  const defaultValue = props.defaultValue || tokens[0];
  const options = tokens.map((token) => ({
    value: token,
    label:
      nameProperty === "ethName"
        ? token.ethName
        : TOKEN_METADATA[token.address.toString("base64")].name,
    disabled: (disabledTokens || [])
      .map((token) => token.address)
      .includes(token.address),
  }));
  return (
    <Select
      styles={{ menu: (provided, state) => ({ ...provided, color: "#000" }) }}
      onChange={({ value }) => onChange(value)}
      isOptionDisabled={(option) => option.disabled}
      defaultValue={{
        label:
          nameProperty === "ethName"
            ? defaultValue.ethName
            : defaultValue &&
              TOKEN_METADATA[defaultValue.address.toString("base64")].name,
        value: defaultValue,
      }}
      options={options}
    />
  );
}
