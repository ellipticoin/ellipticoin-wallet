import { usePostTransaction } from "./mutations";
import { Value } from "./helpers";
import { ELC } from "./constants";
import { useGetIssuanceRewards } from "./queries";
import React from "react";
import useSound from "use-sound";
import chaChing from "./chaching.wav";

export default function Rewards(props) {
  const { data: { issuanceRewards } = 0n } = useGetIssuanceRewards();
  const [harvest] = usePostTransaction({
    contract: "Ellipticoin",
    functionName: "harvest",
  });
  const [playChaChing] = useSound(chaChing);
  const handleHarvest = async function () {
    playChaChing();

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
            <Value token={ELC}>{issuanceRewards}</Value>
          </div>
        </div>
      </div>
    </div>
  );
}
