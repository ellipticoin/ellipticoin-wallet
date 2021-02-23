import { ethRequestAccounts } from "./ethereum";
import Button from "react-bootstrap/Button";

export default function UnlockMetamask(props) {
  console.log("UnlockMetamask");
  return (
    <div
      className="d-flex align-content-center flex-wrap"
      style={{ height: "100%" }}
    >
      <Button
        onClick={() => ethRequestAccounts()}
        style={{ margin: "auto" }}
        class="align-self-center"
      >
        Unlock Metamask
      </Button>
    </div>
  );
}
