import CurrentMinerContext from "./CurrentMinerContext";
import HostContext from "./HostContext";
import { signTransaction, useLocalStorage } from "./helpers";
import { useGetNextNonce } from "./queries";
import { gql, useMutation } from "@apollo/client";
import cbor from "cbor";
import { useContext, useMemo } from "react";
import nacl from "tweetnacl";

const POST_TRASACTION = gql`
  mutation($transaction: Bytes!) {
    postTransaction(transaction: $transaction) {
      id
      blockNumber
      returnValue
    }
  }
`;
export function usePostTransfer() {
  return usePostTransaction({ contract: "Token", functionName: "transfer" });
}
export function usePostTransaction({ contract, functionName }) {
  const currentMiner = useContext(CurrentMinerContext)[0];
  const setHost = useContext(HostContext)[1];
  const [secretKey] = useLocalStorage(
    "secretKey",
    () => nacl.sign.keyPair().secretKey
  );
  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
  const [postTransaction, { loading }] = useMutation(POST_TRASACTION, {
    refetchQueries: ["tokens", "issuanceRewards", "liquidityTokens"],
    awaitRefetchQueries: true,
    update(cache, { data: { postTransaction } }) {
      cache.modify({
        fields: {
          nonce(nonce = -1) {
            return (parseInt(nonce) + 1).toString();
          },
        },
      });
    },
  });
  const { data: { nextNonce } = { nextNonce: 0 } } = useGetNextNonce();

  const postTransactionFn = async (...args) => {
    setHost(currentMiner);
    let transaction = signTransaction(
      {
        nonce: parseInt(nextNonce),
        sender: Array.from(publicKey),
        contract,
        function: functionName,
        arguments: args,
      },
      Buffer.from(secretKey)
    );
    return new Promise((resolve, reject) => {
      (async () => {
        let {
          data: { postTransaction: postTransactionResult },
          loading,
          error,
        } = await postTransaction({
          variables: {
            transaction: transaction.toString("base64"),
          },
        });
        if (!loading) {
          if (error) reject(error);
          const returnValueMap = cbor.decode(
            Buffer.from(postTransactionResult.returnValue, "base64")
          );
          const returnValue =
            returnValueMap && returnValueMap.hasOwnProperty("Ok")
              ? returnValueMap.Ok
              : returnValueMap;
          resolve({
            ...postTransactionResult,
            returnValue,
          });
        }
      })();
    });
  };
  return [postTransactionFn, { loading }];
}
