import { base, arbitrum } from "viem/chains";
import { parseUnits, type Address } from "viem";

/**
 * CAMELOT CONFIGURATION
 *
 * This section contains information that Camelot already has in its UI.
 */

// Input amount to be used for bridge transaction.
// The amount is scaled to the inputToken's decimals (6 decimals for USDC).
const inputAmount = parseUnits("3", 6);

// Destination chain where funds are received and the Camelot swap is made.
const destinationChain = arbitrum;

// Token used as input for the Camelot swap on the destination chain.
const camelotTokenIn = {
  address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
  decimals: 6,
};

// Token used as output for the Camelot swap on the destination chain.
const camelotTokenOut = {
  address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address,
  decimals: 18,
};

/**
 * ACROSS CONFIGURATION
 *
 * This section contains new parameters to use for Across.
 */

// Origin chain where the Across deposit is made by the user.
const originChain = base;

// Origin deposit token used for the Across deposit.
// This should be the same asset (USDC, WETH, WBTC, etc.) as the Camelot origin token.
const originDepositToken = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  decimals: 6,
};

export {
  inputAmount,
  originChain,
  destinationChain,
  originDepositToken,
  camelotTokenIn,
  camelotTokenOut,
};
