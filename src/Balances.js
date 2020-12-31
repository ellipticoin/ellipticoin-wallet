import { BASE_FACTOR, USD } from "./constants";
import { findToken, Value, tokenTicker, Price } from "./helpers";
import { default as React } from "react";

export default function Balances(props) {
  const { tokens, totalBalance } = props;

  return (
    <div className="section mt-2">
      <div className="section-heading">
        <h2 className="title">Your Balances</h2>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col" className="text-right">
                  Number of Tokens
                </th>
                <th scope="col" className="text-right">
                  Price
                </th>
                <th scope="col" className="text-right">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id}>
                  <th scope="row">{findToken(token).name}</th>
                  <td className="text-right">
                    <Value>{token.balance}</Value>
                  </td>
                  <td className="text-right">
                    <Price>{token.price}</Price>
                  </td>
                  <td className="text-right text-primary">
                    <Value token={USD}>
                      {(token.balance * token.price) / BASE_FACTOR}
                    </Value>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total: <Value token={USD}>{totalBalance}</Value>
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
