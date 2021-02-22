import { useContext, useMemo } from "react";
import CopyButton from "./Inputs/CopyButton.js";
import { USD } from "./constants";
import { ethers } from "ethers";
import base64url from "base64url";
import CompoundContext from "./CompoundContext";
import TotalBalance from "./TotalBalance";
const { getAddress } = ethers.utils;

export default function ActionsHeader(props) {
  const { usdBalance, totalBalance, address } = props;
  const { cDAIAPY } = useContext(CompoundContext);
  const blendedAPY = useMemo(() => {
    return totalBalance
      ? (Number(usdBalance) * cDAIAPY) / Number(totalBalance)
      : null;
  });

  return (
    <div className="actions-top">
      <div className="row">
        <div className="col-lg-8 col-md-12">
          <span className="title">Your Address</span>
          <div className="your-address">
            <CopyButton content={address}>
              <h1>{getAddress(address)}</h1>
            </CopyButton>
          </div>
        </div>
        <div className="col-lg-4 col-md-12 total-balance align-self-end">
          <div>
            Total Balance{" "}
            {blendedAPY ? `(earning ${blendedAPY.toFixed(2)}% APY)`: null}
          </div>
          <div>
            <h1>
              <TotalBalance>{totalBalance}</TotalBalance>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
