import { BASE_FACTOR, BLOCK_TIME, blockReward } from "ec-client";

import React from "react";
import { formatTokenBalance } from "./helpers";
import { useGetIssuanceRewards } from "./queries";
import { usePostTransaction } from "./mutations";

const SECONDS_PER_DAY = 86400;

export default function Rewards(props) {
  const { blockNumber } = props;
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
              {formatTokenBalance(issuanceRewards)} ELC
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="stat-box">
            <div className="title">Total Network Issuance per Day</div>
            <div className="value text-success">
              {formatTokenBalance(
                blockReward(blockNumber) *
                  (SECONDS_PER_DAY / BLOCK_TIME) *
                  BASE_FACTOR
              )}{" "}
              ELC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
