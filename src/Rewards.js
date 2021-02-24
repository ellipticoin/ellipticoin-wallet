import { usePostTransaction } from "./mutations";
import { value } from "./helpers";
import { MNS } from "./constants";
import { useGetIssuanceRewards } from "./queries";
import { useRef } from "react";
import chaChing from "./chaching.wav";
import { actions } from "ellipticoin";

export default function Rewards(props) {
  const { address } = props;
  const { data: { issuanceRewards } = 0n } = useGetIssuanceRewards(address);
  const chaChingRef = useRef();
  const [harvest] = usePostTransaction(actions.Harvest, address);
  const handleHarvest = async function () {
    await harvest();
    chaChingRef.current.currentTime = 0;
    await chaChingRef.current.play();
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
            <audio ref={chaChingRef} preload="true">
              <source src={chaChing} />
            </audio>
            Harvest
          </button>
          <div className="title">Mature Liquidity Rewards</div>
          <div className="value text-success">
            {value(issuanceRewards, MNS.address)}
          </div>
        </div>
      </div>
    </div>
  );
}
