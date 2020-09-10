import { BASE_FACTOR, BLOCK_TIME, Ellipticoin, blockReward } from "ec-client";
import { fetchIssuanceRewards, fetchPools, fetchTokens } from "./App.js";

import { ArrowRight } from "react-feather";
import React from "react";
import { formatTokenBalance } from "./helpers";
import useSound from "use-sound";

const SECONDS_PER_DAY = 86400;

export default function Rewards(props) {
  const {
    blockNumber,
    issuanceRewards,
    setTokens,
    setPools,
    publicKey,
    setIssuanceRewards,
    ec,
  } = props;
  const [playChaChing] = useSound("/chaching.wav");
  const harvest = async function () {
    playChaChing();
    let ellipticoin = new Ellipticoin(ec);
    await ellipticoin.harvest();
    setTokens(await fetchTokens(ec, publicKey));
    setPools(await fetchPools(ec, publicKey));
    setIssuanceRewards(await fetchIssuanceRewards(ec, publicKey));

  };
  return (
    <div className="section">
      <div className="row mt-2">
        <div className="col-6">
          <div className="stat-box">
            <button
              type="button"
              onClick={() => harvest()}
              style={{ float: "right" }}
              className="btn btn-success btn-lg mr-1"
            >
              Harvest
              <ArrowRight size={18} className="ml-1" />
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
