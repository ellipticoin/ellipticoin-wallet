import btcLogo from "./BTC-logo.png";
import ethLogo from "./ETH-logo.png";
import { BASE_FACTOR, BTC, USD, WETH, MS, TOKEN_META_DATA } from "./constants";
import { value } from "./helpers";
import { find, sumBy } from "lodash";
import { useMemo } from "react";

export default function LockedValue(props) {
  const { tokens } = props;
  const weth = useMemo(() => find(tokens, ["address", WETH.address]), [tokens]);

  const btc = useMemo(() => find(tokens, ["address", BTC.address]), [tokens]);
  const usd = useMemo(() => find(tokens, ["address", USD.address]), [tokens]);
  const totalLockedValue = tokens.reduce((sum, token) => {
    if (token.address.toString("hex") === MS.address.toString("hex"))
      return sum;
    const price =
      token.address.toString("hex") === USD.toString("hex")
        ? BASE_FACTOR
        : token.price;
    let total = (token.totalSupply * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);
  return (
    <div className="section mt-2">
      <div className="row">
        <div className="card col col-6">
          <div className="card-body">
            <div className="section-heading">
              <h2 className="title">Locked Value</h2>
            </div>
            <div className="row mt-2">
              <div className="table-responsive">
                <table className="table rounded">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Amount in USD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <img
                          alt="BTC Logo"
                          src={btcLogo}
                          style={{
                            width: "16px",
                            verticalAlign: "middle",
                            padding: "0px",
                          }}
                        />{" "}
                        Bitcoin{" "}
                      </td>
                      <td className="text-right">
                        {" "}
                        {value(btc.totalSupply, BTC.address)}
                      </td>
                      <td className="text-right">
                        {value(
                          (btc.totalSupply * btc.price) / BASE_FACTOR,
                          BTC.address
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img
                          alt="ETH Logo"
                          src={ethLogo}
                          style={{
                            width: "18px",
                            verticalAlign: "middle",
                            padding: "2px",
                          }}
                        />
                        Ethereum
                      </td>
                      <td className="text-right">
                        {" "}
                        {value(weth.totalSupply, WETH.address)}
                      </td>
                      <td className="text-right">
                        {" "}
                        {value(
                          (weth.totalSupply * weth.price) / BASE_FACTOR,
                          WETH.address
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>US Dollar</td>
                      <td className="text-right">
                        {" "}
                        <Value token={USD}>{usd.totalSupply}</Value>
                      </td>
                      <td className="text-right">
                        <Value token={USD}>{usd.totalSupply}</Value>
                      </td>
                    </tr>
                    <tr>
                      <th colspan="2">Total Locked Value</th>
                      <th className="value text-success text-right">
                        {value(totalLockedValue, USD.address)}
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
