import btcLogo from "./BTC-logo.png";
import ethLogo from "./ETH-logo.png";
import { BTC, USD, WETH, BASE_FACTOR } from "./constants";
import { formatCurrency, formatTokenBalance } from "./helpers";
import { find, sumBy } from "lodash";
import { default as React, useMemo } from "react";

export default function LockedValue(props) {
  const { tokens } = props;
  const weth = useMemo(() => find(tokens, ["id", WETH.id]), [tokens]);

  const btc = useMemo(() => find(tokens, ["id", BTC.id]), [tokens]);
  const usd = useMemo(() => find(tokens, ["id", USD.id]), [tokens]);
  const totalLockedValue = useMemo(
    () =>
      sumBy([weth, btc, usd], (token) => {
        return (
          (parseInt(token.totalSupply) * parseInt(token.price) || 0) /
          BASE_FACTOR
        );
      }),
    [btc, usd, weth]
  );

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
                        {formatTokenBalance(btc.totalSupply)} BTC
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          (btc.totalSupply * btc.price) / BASE_FACTOR
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
                        {formatTokenBalance(weth.totalSupply)} ETH
                      </td>
                      <td className="text-right">
                        {" "}
                        {formatCurrency(
                          (weth.totalSupply * weth.price) / BASE_FACTOR
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>US Dollar</td>
                      <td className="text-right">
                        {" "}
                        {formatTokenBalance(usd.totalSupply)} USD
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          (usd.totalSupply * usd.price) / BASE_FACTOR
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th colspan="2">Total Locked Value</th>
                      <th className="value text-success text-right">
                        {formatCurrency(totalLockedValue)}
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
