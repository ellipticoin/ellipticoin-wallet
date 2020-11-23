import Switch from "./Inputs/Switch";
import { default as React } from "react";
import { ChevronLeft } from "react-feather";

export default function Settings(props) {
  const { onHide, investorModeEnabled, setInvestorModeEnabled } = props;
  return (
    <>
      <div className="appHeader">
        <div className="left">
          <button className="headerButton goBack">
            <ChevronLeft onClick={() => onHide()} />
          </button>
        </div>
        <h2 className="mt-2 mb-0">Settings</h2>
      </div>
      <div id="appCapsule" className="p2 mt-1">
        <div className="listview-title mt-1">General</div>
        <ul className="listview image-listview text inset">
          <li>
            <div className="item">
              <div className="in">
                <div>
                  Investor Mode
                  <div className="text-muted">
                    Enable features that are tailored to seasoned crypto
                    investors.
                  </div>
                </div>
                <Switch
                  checked={investorModeEnabled}
                  setChecked={setInvestorModeEnabled}
                />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}
