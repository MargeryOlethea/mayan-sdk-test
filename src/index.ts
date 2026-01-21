import {
  fetchQuote,
  swapFromSolana,
  Quote,
  SolanaTransactionSigner,
} from "@mayanfinance/swap-sdk";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import * as dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();
const SOLANA_RPC =
  process.env.SOLANA_RPC_ENDPOINT || "https://api.mainnet-beta.solana.com";
const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY!;
const SIGNER_KEYPAIR = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

function signTransaction(trx: Transaction): Promise<Transaction>;
function signTransaction(
  trx: VersionedTransaction
): Promise<VersionedTransaction>;
function signTransaction(
  trx: Transaction | VersionedTransaction
): Promise<Transaction | VersionedTransaction> {
  if (trx instanceof VersionedTransaction) {
    trx.sign([SIGNER_KEYPAIR]);
    return Promise.resolve(trx); // Return VersionedTransaction
  } else {
    trx.partialSign(SIGNER_KEYPAIR);
    return Promise.resolve(trx); // Return Transaction
  }
}
async function performSolanaSwap() {
  const connection = new Connection(SOLANA_RPC, "confirmed");

  const originWalletAddress = SIGNER_KEYPAIR.publicKey.toBase58();
  const destinationWalletAddress = SIGNER_KEYPAIR.publicKey.toBase58();

  // Check balances
  const walletPubkey = new PublicKey(originWalletAddress);
  const solBalance = await connection.getBalance(walletPubkey);
  console.log("SOL Balance:", solBalance / 1e9, "SOL");

  const usdcMint = new PublicKey(
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  );
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    walletPubkey,
    { mint: usdcMint }
  );

  if (tokenAccounts.value.length > 0) {
    const balance =
      tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    console.log("USDC Balance:", balance, "USDC");
  }

  // Fetch quote
  console.log("\nFetching quote for cross-chain swap...");
  const quotes = await fetchQuote({
    fromChain: "solana",
    toChain: "solana",
    fromToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC on Solana
    toToken: "0x0000000000000000000000000000000000000000", // SOL on Solana
    amount: 5000000, // 5 USDC (6 decimals)
    slippageBps: "auto",
  });

  if (!quotes || quotes.length === 0) {
    throw new Error("No quotes available");
  }

  const bestQuote: Quote = quotes[0];

  // Execute swap
  console.log("\nExecuting swap...");

  try {
    const swapResult = await swapFromSolana(
      bestQuote,
      originWalletAddress,
      destinationWalletAddress,
      null,
      signTransaction,
      connection
    );

    const txSignature = swapResult.signature;

    console.log("\n✓ Swap transaction sent!");
    console.log("Signature:", txSignature);
    console.log(`View on Solscan: https://solscan.io/tx/${txSignature}`);
    console.log(
      `Track your swap at: https://explorer.mayan.finance/swap/${txSignature}`
    );

    return txSignature;
  } catch (error: any) {
    console.error("\n❌ Swap failed:", error.message);
    if (error.logs) {
      console.error("\nTransaction logs:");
      error.logs.forEach((log: string) => console.error(log));
    }
    throw error;
  }
}

performSolanaSwap();
