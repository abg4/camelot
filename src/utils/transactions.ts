import { type Address, type Chain } from "viem";
import axios from "axios";
import { encodeFunctionData, parseAbiItem } from "viem/utils";
import { CAMELOT_API_URL, MULTICALL_HANDLER_ADDRESS } from "./constants.js";
import { logger } from "./logger.js";
import BigNumber from "bignumber.js";

// Function to generate the calldata for the approve function
export function generateApproveCallData(spender: Address, amount: bigint) {
  // Generate the calldata for the approve function
  const approveCallData = encodeFunctionData({
    abi: [parseAbiItem("function approve(address spender, uint256 value)")],
    args: [spender, amount],
  });

  return approveCallData;
}

// Generates the swap call data for Camelot swap
export async function generateSwapCallData(
  amount: string,
  tokenIn: { address: Address; decimals: number },
  tokenOut: { address: Address; decimals: number },
  recipient: Address,
  chain: Chain,
  initialQuote: boolean
) {
  try {
    // Gets camelot quote using Paraswap API to replicate the Camelot Frontend
    const quoteRequest = await axios.get(`${CAMELOT_API_URL}/prices`, {
      params: {
        network: chain.id,
        srcToken: tokenIn.address,
        srcDecimals: tokenIn.decimals,
        destToken: tokenOut.address,
        destDecimals: tokenOut.decimals,
        side: "SELL",
        srcTokenDexTransferFee: 0,
        destTokenDexTransferFee: 0,
        amount: amount,
        includeDEXS: "CamelotV3",
        maxImpact: 1,
        userAddress: MULTICALL_HANDLER_ADDRESS,
        partner: "Camelot",
      },
    });

    const priceRoute = quoteRequest.data.priceRoute;
    if (!priceRoute) {
      throw new Error("No quote data returned");
    }

    const slippage = 0.3;
    const minAmount = new BigNumber(priceRoute.destAmount)
      .times(1 - slippage / 100)
      .toFixed(0);

    const calldata = await axios.post(
      `${CAMELOT_API_URL}/transactions/${chain.id}`,
      {
        priceRoute: priceRoute,
        srcToken: tokenIn.address,
        srcDecimals: tokenIn.decimals,
        destToken: tokenOut.address,
        destDecimals: tokenOut.decimals,
        srcAmount: amount,
        destAmount: minAmount,
        userAddress: MULTICALL_HANDLER_ADDRESS,
        partner: "Camelot",
        receiver: recipient,
        ignoreChecks: true,
      }
    );

    const calldataResponse = calldata.data;
    if (!calldataResponse) {
      throw new Error("No calldata data returned");
    }

    logger.json(initialQuote ? "Initial swap data: " : "Updated swap data: ", {
      inputToken: tokenIn,
      outputToken: tokenOut,
      amount: amount,
      priceImpact: priceRoute.priceImpact,
      to: priceRoute.to,
      callData: calldataResponse.callData,
      value: calldataResponse.value,
    });

    return {
      to: calldataResponse.to,
      transaction: calldataResponse.data,
    };
  } catch (error) {
    console.error("Error generating swap call data:", error);
    throw error;
  }
}
