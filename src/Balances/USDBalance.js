import { usePostTransaction } from "../mutations";
import { value } from "../helpers";
import { MS } from "../constants";
import { useGetIssuanceRewards } from "../queries";
import { useRef } from "react";
import { actions } from "ellipticoin";

export default function USDBalance(props) {
  const { address, setShowPage } = props;
  return (
    <div className="card p-2 mb-2">
      <div className="row mt-2 mb-2">
        <div className="col-12">
          <button
            style={{ float: "right" }}
            onClick={() => setShowPage("ManageLiquidity")}
            className="btn btn-success btn-lg mr-1"
          >
            Deposit
          </button>
          <button
            type="button"
            style={{ float: "right" }}
            className="btn btn-danger btn-lg mr-1"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
// <div className="font-weight-bold title">USD Balance</div>
// <div className="font-weight-bold value text-success">
//   $100
// </div>
