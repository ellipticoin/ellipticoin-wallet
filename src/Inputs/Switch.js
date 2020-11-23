import { default as React } from "react";

export default function Switch(props) {
  const { checked, setChecked } = props;
  return (
    <div className="custom-control custom-switch">
      <input
        type="checkbox"
        className="custom-control-input"
        id="customSwitch4"
        onClick={() => setChecked(!checked)}
        checked={checked}
      />
      <label className="custom-control-label" for="customSwitch4"></label>
    </div>
  );
}
