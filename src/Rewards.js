import React from "react";
import { formatCurrency, formatTokenBalance } from "./helpers";
import { useGetIssuanceRewards } from "./queries";
import { usePostTransaction } from "./mutations";

export default function Rewards(props) {
  const { totalLockedValue } = props;
  const { data: { issuanceRewards } = 0 } = useGetIssuanceRewards();
  const [harvest] = usePostTransaction({
    contract: "Ellipticoin",
    functionName: "harvest",
  });
  const handleHarvest = async function () {
    const chaChing = new Audio("/chaching.wav");
    chaChing.play();
    await harvest();
  };
  return (
    <div className="section">
      <div className="row mt-2">
        <div className="col-6">
          <div className="stat-box">
            <button
              type="button"
              onClick={() => handleHarvest()}
              style={{ float: "right" }}
              className="btn btn-success btn-lg mr-1"
            >
              Harvest
            </button>
            <div className="title">Mature Liquidity Rewards</div>
            <div className="value text-success">
              {formatTokenBalance(issuanceRewards)}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-box">
            <div className="title">Network Total Locked Value</div>
            <div className="value text-success">
              {formatCurrency(totalLockedValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
