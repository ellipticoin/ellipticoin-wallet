const ALGORYTHMS = {
  ecdsa: -7,
};
async function createPublicKey(
  name = "none",
  displayName = "None",
  algorythm = "ecdsa"
) {
  return (
    await navigator.credentials.create({
      publicKey: {
        challenge: Uint8Array.from([0]),
        rp: {
          name: document.title,
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array([0]),
          name,
          displayName,
        },
        pubKeyCredParams: [{ alg: ALGORYTHMS[algorythm], type: "public-key" }],
      },
    })
  ).rawId;
}
async function sign(publicKey) {
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: Uint8Array.from([0]),
      allowCredentials: [
        {
          id: publicKey,
          type: "public-key",
        },
      ],
    },
  });
  return assertion.response.signature;
}
