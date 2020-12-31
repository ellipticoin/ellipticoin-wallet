import btcLogo from "./BTC-logo.png";
import ethLogo from "./ETH-logo.png";
import { BASE_FACTOR, BTC, USD, WETH } from "./constants";
import { Value, findToken } from "./helpers";
import { find, sumBy } from "lodash";
import { default as React, useMemo } from "react";

export default function LockedValue(props) {
  const { tokens } = props;
  const weth = useMemo(() => find(tokens, ["id", WETH.id]), [tokens]);

  const btc = useMemo(() => find(tokens, ["id", BTC.id]), [tokens]);
  const usd = useMemo(() => find(tokens, ["id", USD.id]), [tokens]);
  const totalLockedValue = tokens.reduce((sum, token) => {
    if (findToken(token).name === "Ellipticoin") return sum;
    const price = findToken(token).name === "USD" ? BASE_FACTOR : token.price;
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
                        <Value token={BTC}>{btc.totalSupply}</Value>
                      </td>
                      <td className="text-right">
                        <Value token={BTC}>
                          {(btc.totalSupply * btc.price) / BASE_FACTOR}
                        </Value>
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
                        <Value token={WETH}>{weth.totalSupply}</Value>
                      </td>
                      <td className="text-right">
                        {" "}
                        <Value token={WETH}>
                          {(weth.totalSupply * weth.price) / BASE_FACTOR}
                        </Value>
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
                        <Value token={USD}>{totalLockedValue}</Value>
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
