import { Alert } from "react-bootstrap";
import {
  formatToken,
  formatAddress,
  formatBigInt,
  actions as msActions,
} from "ellipticoin";
import { ethers } from "ethers";

const { hexlify } = ethers.utils;
export default function Action(props) {
  const { action } = props;

  return (
    <Alert variant="primary mb-1">
      <ActionSwitch>{action}</ActionSwitch>
    </Alert>
  );
}

export function ActionSwitch({ children }) {
  switch (Object.keys(children)[0]) {
    case "Pay":
      return Pay(...Object.values(children)[0]);
    case "CreateOrder":
      return CreateOrder(...Object.values(children)[0]);
    case "AddLiquidity":
      return AddLiquidity(...Object.values(children)[0]);
    default:
      return null;
  }
}

function Pay(recipient, amount, token) {
  return `Pay ${formatAddress(
    Buffer.from(recipient).toString("base64")
  )} ${formatBigInt(amount)} ${formatToken(
    Buffer.from(token).toString("base64")
  )}
  `;
}

function CreateOrder(type, amount, token, price) {
  return `Create a limit order to ${type} ${formatBigInt(amount)} ${formatToken(
    Buffer.from(token).toString("base64")
  )} for $${formatBigInt(price)} each`;
}

function AddLiquidity(amount, token) {
  return `Add ${formatBigInt(amount)} ${formatToken(
    Buffer.from(token).toString("base64")
  )} to the liquidity pool`;
}
