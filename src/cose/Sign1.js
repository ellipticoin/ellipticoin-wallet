import { default as cbor, Tagged } from "cbor";

const TAG_ID = 18;

export default class Sign1 {
  constructor(protectedHeaders, unprotectedHeaders, message, signature) {
    this.protectedHeaders = protectedHeaders;
    this.unprotectedHeaders = unprotectedHeaders;
    this.message = message;
    this.signature = signature;
  }
  encodeCBOR(encoder) {
    const tagged = new Tagged(TAG_ID, [
      cbor.encode(this.protectedHeaders),
      this.unprotectedHeaders,
      this.message,
      this.signature,
    ]);
    return encoder.pushAny(tagged);
  }
}
