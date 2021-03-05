import CurrentMinerContext from "./CurrentMinerContext";
import HostContext from "./HostContext";
import {
  signTransaction,
  useLocalStorage,
  concatTypedArrays,
  formatBigInt,
} from "./helpers";
import { useGetNextTransactionNumber } from "./queries";
import { gql, useMutation } from "@apollo/client";
import cbor from "cbor";
import { useContext, useMemo, useEffect } from "react";
import nacl from "tweetnacl";
import { ethers } from "ethers";
import { useWeb3 } from "./web3";
import { useEthereumAccounts } from "./ethereum";
import { NETWORK_ID, TOKEN_META_DATA } from "./constants";
import { Transaction, actions } from "ellipticoin";

const { arrayify, hexlify, getAddress } = ethers.utils;

const POST_TRASACTION = gql`
  mutation($transaction: Bytes!) {
    postTransaction(transaction: $transaction)
  }
`;

export function useSignAndMigrate({ setMigrated, address }) {
  const [migrate] = usePostTransaction(actions.Migrate, address);
  const [_, accounts] = useEthereumAccounts();
  return async (secretKey) => {
    const publicKey = Buffer.from(
      nacl.sign.keyPair.fromSecretKey(secretKey).publicKey
    );
    let legacySignature = nacl
      .sign(ethers.utils.arrayify(accounts[0]), Buffer.from(secretKey))
      .slice(0, 64);
    const result = await migrate(publicKey, legacySignature);
    if (result !== null) {
      alert(result);
    }
  };
}
export function usePostTransaction(actionType, address) {
  const refetchQueriesByActionType = {
    CreateProposal: ["proposals"],
    Vote: ["proposals"],
  };
  const currentMiner = useContext(CurrentMinerContext)[0];
  const setHost = useContext(HostContext)[1];
  const [postTransaction, { loading }] = useMutation(POST_TRASACTION, {
    refetchQueries: [
      "tokens",
      "issuanceRewards",
      "liquidityTokens",
      "nextTransactionNumber",
      "pendingRedemptionRequests",
      ...(refetchQueriesByActionType[actionType.name] || []),
    ],
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
  const {
    data: { nextTransactionNumber } = { nextTransactionNumber: 1 },
  } = useGetNextTransactionNumber(address);
  const accounts = useEthereumAccounts();

  const postTransactionFn = async (...args) => {
    setHost(currentMiner);

    const action = new actionType(...args);
    const transaction = new Transaction({
      networkId: NETWORK_ID,
      transactionNumber: nextTransactionNumber,
      action,
    });
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [address, transaction.toSignatureString()],
      from: address,
    });
    const encodedTransaction = cbor.encodeOne(transaction, {
      collapseBigIntegers: true,
    });

    const signedTransaction = cbor.encodeOne(
      [transaction, Array.from(arrayify(signature))],
      { collapseBigIntegers: true }
    );
    console.log("here");
    return new Promise((resolve, reject) => {
      (async () => {
        let {
          data: { postTransaction: postTransactionResult },
          loading,
          error,
        } = await postTransaction({
          variables: {
            transaction: signedTransaction.toString("base64"),
          },
        });
        if (!loading) {
          console.log("here 2");
          if (error) reject(error);
          console.log(postTransactionResult);
          resolve(postTransactionResult);
        }
      })();
    });
  };
  return [postTransactionFn, { loading }];
}
