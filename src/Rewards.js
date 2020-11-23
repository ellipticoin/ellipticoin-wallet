import { formatTokenBalance } from "./helpers";
import { usePostTransaction } from "./mutations";
import { useGetIssuanceRewards } from "./queries";
import React from "react";

export default function Rewards(props) {
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
    <div className="row mt-2 mb-2">
      <div className="col-4">
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
    </div>
  );
}
