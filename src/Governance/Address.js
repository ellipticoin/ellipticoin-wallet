import { ethers } from "ethers";
const { arrayify, hexlify, getAddress } = ethers.utils;
const KNOWN_ADDRESSES = {
  "0x1d6bb7047fd6e47a935d816297e0b4f9113ed023": "Mason Fischer",
};
export default function Address(props) {
  const { children, address } = props;
  const displayAddress =
    KNOWN_ADDRESSES[hexlify(children)] || getAddress(hexlify(children));
  return (
    <>
      {displayAddress}
      {hexlify(children) === address ? ` (You)` : null}
    </>
  );
}
