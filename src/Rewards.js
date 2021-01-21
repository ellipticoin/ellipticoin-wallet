import { usePostTransaction } from "./mutations";
import { value } from "./helpers";
import { MS } from "./constants";
import { useGetIssuanceRewards } from "./queries";
import { useRef } from "react";
import chaChing from "./chaching.wav";
import { actions } from "ellipticoin";

export default function Rewards(props) {
  const { address, setShowPage } = props;
  const { data: { issuanceRewards } = 0n } = useGetIssuanceRewards(address);
  const chaChingRef = useRef();
  const [harvest] = usePostTransaction(actions.Harvest, address);
  const handleHarvest = async function () {
    await harvest();
    chaChingRef.current.currentTime = 0;
    await chaChingRef.current.play();
  };
  return (
    <div className="card p-2 mb-2">
      <div className="row mt-2 mb-2">
        <div className="d-flex col-12">
          <button
            type="button"
            onClick={() => handleHarvest()}
            className="btn btn-success btn-lg mr-2"
          >
            <audio ref={chaChingRef} preload="true">
              <source src={chaChing} />
            </audio>
            Harvest
          </button>
          <div>
            <div className="font-weight-bold title">
              Mature Liquidity Rewards
            </div>
            <div className="font-weight-bold value text-success">
              {value(issuanceRewards, MS.address)}
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              style={{ float: "right" }}
              onClick={() => setShowPage("AddLiquidity")}
              className="btn btn-primary btn-lg mr-1"
            >
              Add Liquidity
            </button>
            <button
              type="button"
              style={{ float: "right" }}
              onClick={() => setShowPage("RemoveLiquidity")}
              className="btn btn-danger btn-lg mr-1"
            >
              Remove Liquidity
            </button>
          </div>
        </div>
      </div>
    </div>
    // <div className="row mt-2 mb-2">
    //   <div className="col-12">
    //     <div>
    //       <button
    //         type="button"
    //         onClick={() => handleHarvest()}
    //         className="btn btn-success btn-lg mr-1"
    //       >
    //         <audio ref={chaChingRef} preload="true">
    //           <source src={chaChing} />
    //         </audio>
    //         Harvest
    //       </button>
    //       <div className="title">Mature Liquidity Rewards</div>
    //       <div className="value text-success">
    //         {value(issuanceRewards, MS.address)}
    //       </div>
    //     </div>
    //     <div>
    //       <button
    //         style={{ float: "right" }}
    //         onClick={() => setShowPage("ManageLiquidity")}
    //         className="btn btn-primary btn-lg mr-1"
    //       >
    //         Manage Liquidity
    //       </button>
    //     </div>
    //   </div>
    // </div>
  );
}
