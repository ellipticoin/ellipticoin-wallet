import { USD, TOKEN_METADATA } from "../constants";
import { BASE_FACTOR, DAO_ADDRESS } from "ellipticoin";
import {
  value,
  value2,
  Value,
  formatBigInt,
  formatPercentage,
} from "../helpers";
import { useGetTokens } from "../queries";
export default function Treasury(props) {
  const {
    data: { tokens } = { tokens: TOKENS },
    loading: tokensLoading,
    error: tokenError,
  } = useGetTokens(Buffer.from(DAO_ADDRESS, "base64"));
  const totalBalance = tokens.reduce((sum, token) => {
    const price = token.address === USD.address ? BASE_FACTOR : token.price;
    let total = (token.balance * price) / BASE_FACTOR;
    return sum + total;
  }, 0n);
  return (
    <>
      <div className="listview-title mt-2">Treasury</div>
      <div className="card mx-2">
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
              {tokens
                .filter(({ balance }) => balance > 0n)
                .map((token) => (
                  <tr key={token.address}>
                    <th scope="row">{TOKEN_METADATA[token.address].name}</th>
                    <td className="text-right">
                      {formatBigInt(token.balance)}
                    </td>
                    <td className="text-right">
                      {token.address === USD.address
                        ? "$ 1.00"
                        : value(token.price, USD.address, {
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
    </>
  );
}
