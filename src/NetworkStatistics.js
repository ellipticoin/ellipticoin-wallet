import LockedValue from "./LockedValue.js";
import { default as React } from "react";
import { ChevronLeft } from "react-feather";

export default function NetworkStatistics(props) {
  const { onHide, tokens } = props;
  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Network Statistics</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <LockedValue tokens={tokens} />
      </div>
    </>
  );
}
