import { ChevronLeft } from "react-feather";
import DepositForm from "./DepositForm.js";

export default function Deposit(props) {
  const { onHide, tokens } = props;

  return (
    <div className="section">
      <div className="appHeader no-border transparent position-absolute">
        <div className="left">
          <ChevronLeft onClick={() => onHide()} />
        </div>
        <div className="pageTitle"></div>
        <div className="right"></div>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <div className="section text-center">
          <h1>Deposit</h1>
        </div>
        <div className="row justify-content-md-center">
          <div className="card col col-8">
            <div className="card-body">
              <DepositForm onHide={onHide} tokens={tokens} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
