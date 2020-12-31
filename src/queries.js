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
      balance
      price
      totalSupply
      poolSupplyOfToken
      poolSupplyOfBaseToken
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
  query transactionsByContractFunction(
    $senderAddress: Bytes!
    $contractName: String!
    $functionName: String!
    $page: U64!
    $pageSize: U64!
  ) {
    transactionsByContractFunction(
      senderAddress: $senderAddress
      contractName: $contractName
      functionName: $functionName
      page: $page
      pageSize: $pageSize
    ) {
      id
      networkId
      blockNumber
      position
      contract
      sender
      nonce
      function
      arguments
      returnValue
      raw
    }
  }
`;

export function useGetTokens() {
  const publicKey = usePublicKey();
  let { data: { tokens } = { tokens: TOKENS }, error } = useQuery(GET_TOKENS, {
    variables: {
      tokenIds: TOKENS.map(encodeToken),
      address: publicKey.toString("base64"),
    },
  });
  tokens = tokens.map((token) => ({
    ...token,
    balance: BigInt(token.balance),
    price: BigInt(token.price || 0),
    totalSupply: BigInt(token.totalSupply),
  }));
  return { data: { tokens }, error };
}

export function useGetLiquidityTokens() {
  const publicKey = usePublicKey();
  let { data: { liquidityTokens } = { liquidityTokens: [] }, error } = useQuery(
    GET_LIQUIDITY_TOKENS,
    {
      variables: {
        tokenIds: LIQUIDITY_TOKENS.map(encodeToken),
        address: publicKey.toString("base64"),
      },
    }
  );

  liquidityTokens = liquidityTokens
    .map((liquidityToken) => ({
      ...liquidityToken,
      balance: BigInt(liquidityToken.balance),
      price: BigInt(liquidityToken.price),
      totalSupply: BigInt(liquidityToken.totalSupply),
      poolSupplyOfToken: BigInt(liquidityToken.poolSupplyOfToken),
      poolSupplyOfBaseToken: BigInt(liquidityToken.poolSupplyOfBaseToken),
    }))
    .filter((liquidityToken) => liquidityToken.balance !== 0n);

  return { data: { liquidityTokens }, error };
}

export function usePublicKey() {
  const [secretKey] = useLocalStorage("secretKey");
  return useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
}

export function useGetCurrentBlock() {
  return useQuery(GET_CURRENT_BLOCK);
}

export function useGetIssuanceRewards() {
  const publicKey = usePublicKey();
  let { data: { issuanceRewards } = 0n } = useQuery(GET_ISSUANCE_REWARDS, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
  issuanceRewards = BigInt(issuanceRewards || 0);

  return { data: { issuanceRewards } };
}

export function useGetNextNonce() {
  const publicKey = usePublicKey();
  return useQuery(GET_NEXT_NONCE, {
    variables: {
      address: publicKey.toString("base64"),
    },
  });
}

export function useGetTransactionsByContractFunction(
  contractName,
  functionName,
  page = 0,
  pageSize = 100
) {
  const publicKey = usePublicKey();
  return useQuery(GET_TRANSACTIONS_BY_CONTRACT_FUNCTION, {
    variables: {
      senderAddress: publicKey.toString("base64"),
      contractName,
      functionName,
      page: page.toString(),
      pageSize: pageSize.toString(),
    },
  });
}

export function encodeToken({ id, issuer }) {
  return {
    id: id.toString("base64"),
    issuer,
  };
}
