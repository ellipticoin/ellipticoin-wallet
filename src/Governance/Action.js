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
    <Alert variant="primary">
      {{
        Pay: pay(...Object.values(action)[0]),
      }[Object.keys(action)[0]] || null}
    </Alert>
  );
}

function pay(recipient, amount, token) {
  return `Pay ${formatAddress(
    Buffer.from(recipient).toString("base64")
  )} ${formatBigInt(amount)} ${formatToken(
    Buffer.from(token).toString("base64")
  )}
  `;
}
