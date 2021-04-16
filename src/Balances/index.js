import { useContext } from "react";
import USDBalance from "./USDBalance";
import { BASE_FACTOR, USD, TOKEN_METADATA } from "../constants";
import {
  value,
  value2,
  Value,
  formatBigInt,
  formatPercentage,
} from "../helpers";

export default function Balances(props) {
  const { tokens } = props;

  const totalBalance = tokens.reduce((sum, token) => {
    const price = token.address === USD.address ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);

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
                <tr key={token.address}>
                  <th scope="row">{TOKEN_METADATA[token.address].name}</th>
                  <td className="text-right">{formatBigInt(token.balance)}</td>
                  <td className="text-right">
                    {value(token.price, USD.address, {
                      showCurrency: true,
                      decimals: 2,
                    })}
                  </td>
                  <td className="text-right text-primary">
                    {value(
                      (token.balance * token.price) / BASE_FACTOR,
                      USD.address,
                      { showCurrency: true }
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="5" className="text-right text-primary">
                  <strong>
                    Total:{" "}
                    {value(totalBalance, USD.address, { showCurrency: true })}
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
