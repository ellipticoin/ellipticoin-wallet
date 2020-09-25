import nacl from "tweetnacl";
import { default as cbor } from "cbor";
import { default as Sign1 } from "./Sign1";
import { ALGORITHMS, HEADER_PARAMETERS } from "./constants.js";

export default class Ed25519Signer {
  protectedHeaders = new Map([
    [HEADER_PARAMETERS.ALG, ALGORITHMS.EdDSA],
    [HEADER_PARAMETERS.CONTENT_TYPE, 0],
  ]);
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
          encodeMap(this.protectedHeaders),
          encodeMap(new Map()),
          message,
        ]),
        this.secretKey
      )
      .slice(0, 64);
    return new Sign1(
      this.protectedHeaders,
      unprotectedHeaders,
      message,
      signature
    );
  }
}
function encodeMap(map) {
  if (map.size === 0) {
    return new Buffer.from([]);
  } else {
    return cbor.encode(map);
  }
}
