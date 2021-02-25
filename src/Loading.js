import loading from "./loading.svg";
export default function Loading(props) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="d-flex align-content-center flex-wrap"
      style={{
        minHeight: "100vh",
        height: "100%",
        width: "100%",
        backgroundColor: "#2196f3",
      }}
    >
      <img style={{ height: "270px", margin: "auto" }} src={loading}></img>
    </div>
  );
}
