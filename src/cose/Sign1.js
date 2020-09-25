import { default as cbor, Tagged } from "cbor";

export default class Sign1 {
  TAG_ID = 18;
  constructor(protectedHeaders, unprotectedHeaders, message, signature) {
    this.protectedHeaders = protectedHeaders;
    this.unprotectedHeaders = unprotectedHeaders;
    this.message = message;
    this.signature = signature;
  }
  encodeCBOR(encoder) {
    const tagged = new Tagged(this.TAG_ID, [
      cbor.encode(this.protectedHeaders),
      this.unprotectedHeaders,
      this.message,
      this.signature,
    ]);
    return encoder.pushAny(tagged);
  }
}
