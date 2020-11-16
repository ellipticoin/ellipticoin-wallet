import { LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { useLocalStorage } from "./helpers";
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import nacl from "tweetnacl";

export const GET_TOKENS = gql`
  query tokens($tokenIds: [TokenId!]!, $address: Bytes!) {
    tokens(tokenIds: $tokenIds, address: $address) {
      id
      issuer
      balance
      price
      totalSupply
    }
  }
`;
export const GET_LIQUIDITY_TOKENS = gql`
  query liquidityTokens($tokenIds: [TokenId!]!, $address: Bytes!) {
    liquidityTokens(tokenIds: $tokenIds, address: $address) {
      id
      issuer
      price
      balance
      shareOfPool
      totalSupply
      totalPoolSupply
    }
  }
`;

export const GET_CURRENT_BLOCK = gql`
  query currentBlock {
    currentBlock {
      number
    }
  }
`;

export const GET_ISSUANCE_REWARDS = gql`
  query issuanceRewards($address: Bytes!) {
    issuanceRewards(address: $address)
  }
`;

const GET_NEXT_NONCE = gql`
  query nextNonce($address: Bytes!) {
    nextNonce(address: $address)
  }
`;


const GET_TRANSACTIONS_BY_CONTRACT_FUNCTION = gql`
  query transactionsByContractFunction($senderAddress: Bytes!, $contractName: String!, $functionName: String!, $page: U64!, $pageSize: U64!) {
    transactionsByContractFunction(senderAddress: $senderAddress, contractName: $contractName, functionName: $functionName, page: $page, pageSize: $pageSize) {
      id,
      networkId,
      blockNumber,
      position,
      contract,
      sender,
      nonce,
      function,
      arguments,
      returnValue,
      raw
    }
  }
`;

export function useGetTokens() {
  const publicKey = usePublicKey();
  return useQuery(GET_TOKENS, {
    variables: {
      tokenIds: TOKENS.map(encodeToken),
      address: publicKey.toString("base64"),
    },
  });
}

export function usePublicKey() {
  const [secretKey] = useLocalStorage("secretKey");
  return useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
}

export function useGetLiquidityTokens() {
  const publicKey = usePublicKey();
  return useQuery(GET_LIQUIDITY_TOKENS, {
    variables: {
      tokenIds: LIQUIDITY_TOKENS.map(encodeToken),
      address: publicKey.toString("base64"),
    },
  });
}

export function useGetCurrentBlock() {
  return useQuery(GET_CURRENT_BLOCK);
}

export function useGetIssuanceRewards() {
  const publicKey = usePublicKey()
  return useQuery(GET_ISSUANCE_REWARDS, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
}

export function useGetNextNonce() {
  const publicKey = usePublicKey();
  return useQuery(GET_NEXT_NONCE, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
}

export function useGetTransactionsByContractFunction(contractName, functionName, page = 0, pageSize = 100) {
  const publicKey = usePublicKey();
  return useQuery(GET_TRANSACTIONS_BY_CONTRACT_FUNCTION, {
    variables: {
      senderAddress: publicKey.toString("base64"),
      contractName,
      functionName,
      page: page.toString(),
      pageSize: pageSize.toString()
    },
  });
}

export function encodeToken({ id, issuer }) {
  return {
    id: id.toString("base64"),
    issuer,
  };
}
