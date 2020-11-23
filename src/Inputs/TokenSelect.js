import { tokenName } from "../helpers";
import { default as React } from "react";
import Select from "react-select";

export default function TokenSelect(props) {
  const { onChange, tokens, nameProperty, disabledTokens } = props;
  const defaultValue = props.defaultValue || tokens[0];
  const options = tokens.map((token) => ({
    value: token,
    label: nameProperty === "ethName" ? token.ethName : tokenName(token),
    disabled: (disabledTokens || [])
      .map((token) => token.id)
      .includes(token.id),
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
            : tokenName(defaultValue),
        value: defaultValue,
      }}
      options={options}
    />
  );
}
