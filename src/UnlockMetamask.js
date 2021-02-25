import { ethRequestAccounts } from "./ethereum";
import { useEthereumAccounts } from "./ethereum";
import Button from "react-bootstrap/Button";
import InstallMetamask from "./InstallMetamask";

export default function UnlockMetamask(props) {
  const [loadingEthereumAcccounts, ethereumAcccounts] = useEthereumAccounts();
  if (loadingEthereumAcccounts) return null;

  return window.ethereum ? (
    <div
      className="d-flex align-content-center flex-wrap"
      style={{ height: "100%" }}
    >
      <Button
        onClick={() => ethRequestAccounts()}
        style={{ margin: "auto" }}
        className="align-self-center"
      >
        Unlock Metamask
      </Button>
    </div>
  ) : (
    <InstallMetamask />
  );
}
