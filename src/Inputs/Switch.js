export default function Switch(props) {
  const { checked, setChecked } = props;
  return (
    <div className="custom-control custom-switch">
      <input
        type="checkbox"
        className="custom-control-input"
        id="customSwitch4"
        onChange={() => setChecked(!checked)}
        checked={checked}
      />
      <label className="custom-control-label" htmlFor="customSwitch4"></label>
    </div>
  );
}
