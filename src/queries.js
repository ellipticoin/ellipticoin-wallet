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
  query next_nonce($address: Bytes!) {
    nextNonce(address: $address)
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
  const [secretKey] = useLocalStorage(
    "secretKey",
    () => nacl.sign.keyPair().secretKey
  );
  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
  return useQuery(GET_ISSUANCE_REWARDS, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
}

export function useGetNextNonce() {
  const [secretKey] = useLocalStorage(
    "secretKey",
    () => nacl.sign.keyPair().secretKey
  );
  const publicKey = useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
  return useQuery(GET_NEXT_NONCE, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
}

export function encodeToken({ id, issuer }) {
  return {
    id: id.toString("base64"),
    issuer,
  };
}
