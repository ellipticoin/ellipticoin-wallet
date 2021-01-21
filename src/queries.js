import { LIQUIDITY_TOKENS, TOKENS } from "./constants.js";
import { ethers } from "ethers";
import { gql, useQuery } from "@apollo/client";
import BridgeABI from "./BridgeABI.json";
import { useEthereumAccounts } from "./ethereum";
import { useMemo } from "react";
import cbor from "cbor";

const { arrayify, hexlify } = ethers.utils;

const GET_STATE = gql`
  query state {
    state {
      bridgeAddress
      blockNumber
      baseToken
    }
  }
`;
export const GET_TOKENS = gql`
  query tokens($tokens: [Address!]!, $address: Address!) {
    tokens(tokens: $tokens, address: $address) {
      address
      interestRate
      balance
      price
      totalSupply
    }
  }
`;
export const GET_LIQUIDITY_TOKENS = gql`
  query liquidityTokens($tokens: [Address!]!, $address: Address!) {
    liquidityTokens(tokens: $tokens, address: $address) {
      tokenAddress
      balance
      totalSupply
      poolSupplyOfToken
      poolSupplyOfBaseToken
    }
  }
`;

export const GET_BLOCK_NUMBER = gql`
  query blockNumber {
    blockNumber
  }
`;

export const GET_ISSUANCE_REWARDS = gql`
  query issuanceRewards($address: Bytes!) {
    issuanceRewards(address: $address)
  }
`;

const GET_NEXT_TRANSACTION_NUMBER = gql`
  query nextTransactionNumber($address: Bytes!) {
    nextTransactionNumber(address: $address)
  }
`;

const GET_PENDING_REDEEM_REQUESTS = gql`
  query pendingRedeemRequests($address: Bytes!) {
    pendingRedeemRequests(address: $address) {
      id
      sender
      token
      amount
      expirationBlockNumber
      signature
    }
  }
`;

const GET_BRIDGE = gql`
  query bridge {
    bridge {
      address
      signers
    }
  }
`;

export const GET_PROPOSALS = gql`
  query proposals {
    proposals {
      id
      title
      subtitle
      content
      actions
      votes {
        voter
        weight
        choice
      }
      result
    }
  }
`;

export const GET_ORDERS = gql`
  query orders {
    orders {
      id
      orderType
      amount
      token
      price
    }
  }
`;

export function useGetState(apolloClient) {
  const {
    data: { bridge, baseToken, blockNumber } = {
      bridge: { address: null },
      baseToken: { exchangeRate: null, apy: null },
    },
  } = useQuery(GET_STATE, { client: apolloClient });
  let bridgeContract;
  if (bridge.address) {
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    bridgeContract = new ethers.Contract(
      hexlify(Buffer.from(bridge.address, "base64")),
      BridgeABI,
      signer
    );
  }

  return {
    bridgeContract,
    baseToken,
    blockNumber,
  };
}

export function useGetTokens(address) {
  const accounts = useEthereumAccounts();
  let { data: { tokens } = { tokens: [] }, error } = useQuery(GET_TOKENS, {
    variables: {
      tokens: TOKENS.map(({ address }) => address.toString("base64")),
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });
  tokens = tokens.map((token) => ({
    ...token,
    balance: BigInt(token.balance),
    price: BigInt(token.price || 0),
    interestRate: token.interestRate && BigInt(token.interestRate),
    totalSupply: BigInt(token.totalSupply),
  }));
  return { data: { tokens }, error };
}

export function useGetLiquidityTokens(address) {
  let { data: { liquidityTokens } = { liquidityTokens: [] }, error } = useQuery(
    GET_LIQUIDITY_TOKENS,
    {
      variables: {
        tokens: LIQUIDITY_TOKENS.map(({ address }) =>
          address.toString("base64")
        ),
        address: Buffer.from(arrayify(address)).toString("base64"),
      },
    }
  );
  liquidityTokens = liquidityTokens.map((liquidityToken) => ({
    ...liquidityToken,
    balance: BigInt(liquidityToken.balance),
    totalSupply: BigInt(liquidityToken.totalSupply),
    poolSupplyOfToken: BigInt(liquidityToken.poolSupplyOfToken),
    poolSupplyOfBaseToken: BigInt(liquidityToken.poolSupplyOfBaseToken),
  }));

  return { data: { liquidityTokens }, error };
}

export function usePublicKey() {
  const [secretKey] = useLocalStorage("secretKey");
  return useMemo(
    () => Buffer.from(nacl.sign.keyPair.fromSecretKey(secretKey).publicKey),
    [secretKey]
  );
}

export function useGetBlockNumber() {
  const { data: { blockNumber } = { blockNumber: null } } = useQuery(
    GET_BLOCK_NUMBER
  );
  return blockNumber ? BigInt(blockNumber) : null;
}
export function useGetIssuanceRewards(address) {
  let { data: { issuanceRewards } = 0n } = useQuery(GET_ISSUANCE_REWARDS, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });
  issuanceRewards = BigInt(issuanceRewards || 0);

  return { data: { issuanceRewards } };
}

export function useGetNextTransactionNumber(address) {
  const result = useQuery(GET_NEXT_TRANSACTION_NUMBER, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });

  return {
    ...result,
    data: {
      ...result.data,
      nextTransactionNumber:
        (result.data && parseInt(result.data.nextTransactionNumber)) || 0,
    },
  };
}

export function useBridge() {
  const {
    data: { bridge } = { bridge: { address: null, signers: [] } },
  } = useQuery(GET_BRIDGE);
  if (bridge.address) {
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    return new ethers.Contract(
      hexlify(Buffer.from(bridge.address, "base64")),
      BridgeABI,
      signer
    );
  }
}

export function usePendingRedeemRequests(address) {
  const result = useQuery(GET_PENDING_REDEEM_REQUESTS, {
    variables: {
      address: Buffer.from(arrayify(address)).toString("base64"),
    },
  });

  return {
    ...result,
    data: {
      ...result.data,
      nextTransactionNumber:
        (result.data && parseInt(result.data.nextTransactionNumber)) || 0,
    },
  };
}

export function useGetProposals() {
  const { data: { proposals } = { proposals: [] } } = useQuery(GET_PROPOSALS);
  return proposals.map((proposal) => ({
    ...proposal,
    actions: proposal.actions.map((action) =>
      cbor.decode(Buffer.from(action, "base64"))
    ),
    votes: proposal.votes.map((vote) => ({
      ...vote,
      voter: Buffer.from(vote.voter, "base64"),
      weight: BigInt(vote.weight),
    })),
    id: Number(proposal.id),
  }));
}

export function useGetOrders() {
  const { data: { orders } = { orders: [] } } = useQuery(GET_ORDERS);
  return orders.map((order) => ({
    ...order,
    amount: BigInt(order.amount),
    price: BigInt(order.price),
    id: Number(order.id),
  }));
}
