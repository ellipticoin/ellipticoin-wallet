import { useGetOrders } from "../queries";
import { usePostTransaction } from "../mutations";
import { actions } from "ellipticoin";
import { TOKEN_METADATA, USD, DAI, BASE_FACTOR } from "../constants";
import { Button } from "react-bootstrap";
import { value, price } from "../helpers";

export default function MakeOrder(props) {
  const { tokens, address, onHide } = props;
  const orders = useGetOrders();
  const [fillOrder] = usePostTransaction(actions.FillOrder, address);
  const handleFillOrder = async (e, order) => {
    e.preventDefault();
    let result = await fillOrder(
      order.id,
      order.orderType,
      order.token,
      order.amount,
      order.price
    );

    if (result) {
      alert(result);
    } else {
      onHide();
    }
  };

  return (
    <div className="card table-responsive p-2">
      <table className="table rounded">
        <thead>
          <tr>
            <th scope="col">Order Type</th>
            <th scope="col">Token</th>
            <th scope="col" className="text-right">
              Amount
            </th>
            <th scope="col" className="text-right">
              Price Per Token
            </th>
            <th scope="col" className="text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr>
              <td>{order.orderType}</td>
              <td>{TOKEN_METADATA[order.token].name}</td>
              <td className="text-right">{value(order.amount, order.token)}</td>
              <td className="text-right">
                {value(order.price, DAI.address, {
                  showCurrency: true,
                  decimals: 2,
                })}
              </td>
              <td className="text-right">
                {value(
                  (Number(order.amount) * Number(order.price)) /
                    Number(BASE_FACTOR),
                  DAI.address,
                  { showCurrency: true, decimals: 2 }
                )}
              </td>
              <td className="text-right">
                <Button
                  onClick={(event) => handleFillOrder(event, order)}
                  className={`btn-${
                    order.orderType == "Buy" ? "primary" : "success"
                  }`}
                >
                  {order.orderType == "Buy" ? "Sell" : "Buy"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
