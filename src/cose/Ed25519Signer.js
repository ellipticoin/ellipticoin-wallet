import { default as Sign1 } from "./Sign1";
import { ALGORITHMS, HEADER_PARAMETERS } from "./constants.js";
import { default as cbor } from "cbor";
import nacl from "tweetnacl";

const PROTECTED_HEADERS = new Map([
  [HEADER_PARAMETERS.ALG, ALGORITHMS.EdDSA],
  [HEADER_PARAMETERS.CONTENT_TYPE, 0],
]);
export default class Ed25519Signer {
  constructor(kid, secretKey) {
    this.kid = kid;
    this.secretKey = secretKey;
  }

  sign(message) {
    const unprotectedHeaders = new Map([[HEADER_PARAMETERS.KID, this.kid]]);
    let signature = nacl
      .sign(
        cbor.encode([
          "Signature1",
          encodeMap(PROTECTED_HEADERS),
          encodeMap(new Map()),
          message,
        ]),
        this.secretKey
      )
      .slice(0, 64);
    return new Sign1(PROTECTED_HEADERS, unprotectedHeaders, message, signature);
  }
}
function encodeMap(map) {
  if (map.size === 0) {
    return new Buffer.from([]);
  } else {
    return cbor.encode(map);
  }
}
