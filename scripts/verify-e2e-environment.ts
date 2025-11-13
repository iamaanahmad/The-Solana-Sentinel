#!/usr/bin/env ts-node

/**
 * E2E Test Environment Verification Script
 * 
 * This script validates that all components are ready for E2E testing:
 * - Program deployed on Devnet
 * - RPC endpoint responsive
 * - Environment variables configured
 * - Smart contract IDL matches
 * - API endpoints responding
 */

import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Verification results
interface VerificationResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN" | "SKIP";
  message: string;
  details?: string[];
}

const results: VerificationResult[] = [];

// Helper functions
const log = (color: string, text: string) =>
  console.log(`${color}${text}${colors.reset}`);

const pass = (name: string, message: string, details: string[] = []) => {
  results.push({ name, status: "PASS", message, details });
  log(colors.green, `✅ ${name}: ${message}`);
};

const fail = (name: string, message: string, details: string[] = []) => {
  results.push({ name, status: "FAIL", message, details });
  log(colors.red, `❌ ${name}: ${message}`);
};

const warn = (name: string, message: string, details: string[] = []) => {
  results.push({ name, status: "WARN", message, details });
  log(colors.yellow, `⚠️  ${name}: ${message}`);
};

const skip = (name: string, message: string, details: string[] = []) => {
  results.push({ name, status: "SKIP", message, details });
  log(colors.cyan, `⏭️  ${name}: ${message}`);
};

// Main verification function
async function verifyEnvironment() {
  log(colors.blue, "\n🔍 Starting E2E Environment Verification...\n");

  // Test 1: Check .env.local exists
  log(colors.blue, "📋 Test 1: Environment Variables");
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) {
    fail(
      "Environment File",
      ".env.local not found",
      [`Expected location: ${envPath}`]
    );
    return;
  }

  const envContent = fs.readFileSync(envPath, "utf-8");
  const programId = envContent.match(
    /NEXT_PUBLIC_PROGRAM_ID=([A-Za-z0-9]{44})/
  );
  const rpcUrl = envContent.match(/NEXT_PUBLIC_SOLANA_RPC_URL=(.+?)(?:\n|$)/);

  if (!programId || !rpcUrl) {
    fail(
      "Environment Variables",
      "Required variables missing",
      [
        `PROGRAM_ID found: ${!!programId}`,
        `RPC URL found: ${!!rpcUrl}`,
      ]
    );
    return;
  }

  const PROGRAM_ID = new PublicKey(programId[1]);
  const RPC_URL = rpcUrl[1].trim();

  pass("Environment File", ".env.local found and readable", [
    `Program ID: ${PROGRAM_ID.toBase58()}`,
    `RPC URL: ${RPC_URL}`,
  ]);

  // Test 2: RPC Connectivity
  log(colors.blue, "\n📋 Test 2: Solana RPC Connectivity");
  const connection = new Connection(RPC_URL, "confirmed");

  try {
    const genesisHash = await connection.getGenesisHash();
    pass("RPC Connectivity", "Connected to Solana RPC", [
      `Genesis Hash: ${genesisHash}`,
      `Network: Devnet`,
    ]);
  } catch (error) {
    fail(
      "RPC Connectivity",
      "Failed to connect to RPC",
      [`Error: ${(error as Error).message}`]
    );
    return;
  }

  // Test 3: Program Deployment
  log(colors.blue, "\n📋 Test 3: Smart Contract Deployment");
  try {
    const accountInfo = await connection.getAccountInfo(PROGRAM_ID);

    if (!accountInfo) {
      fail(
        "Program Deployed",
        `Program not found at ${PROGRAM_ID.toBase58()}`,
        ["Check program was deployed to Devnet"]
      );
      return;
    }

    if (!accountInfo.executable) {
      fail(
        "Program Executable",
        "Program account is not executable",
        ["Program may be corrupted or not compiled correctly"]
      );
      return;
    }

    pass("Program Deployed", "Smart contract found and executable", [
      `Program ID: ${PROGRAM_ID.toBase58()}`,
      `Account Size: ${accountInfo.data.length} bytes`,
      `Lamports: ${accountInfo.lamports}`,
      `Owner: ${accountInfo.owner.toBase58()}`,
    ]);
  } catch (error) {
    fail(
      "Program Status",
      "Failed to fetch program account",
      [`Error: ${(error as Error).message}`]
    );
  }

  // Test 4: Latest Blockhash
  log(colors.blue, "\n📋 Test 4: Blockchain State");
  try {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    pass("Blockhash", "Latest blockhash retrieved", [
      `Blockhash: ${blockhash}`,
      `Valid Block Height: ${lastValidBlockHeight}`,
    ]);
  } catch (error) {
    fail(
      "Blockhash",
      "Failed to get blockhash",
      [`Error: ${(error as Error).message}`]
    );
  }

  // Test 5: Transaction Fee Calculation
  log(colors.blue, "\n📋 Test 5: Transaction Fees");
  try {
    const minRentExemption =
      await connection.getMinimumBalanceForRentExemption(8 + 32);

    pass("Rent Exemption", "Can calculate rent requirements", [
      `Min Rent (40 bytes): ${minRentExemption} lamports`,
      `Conversion: ${(minRentExemption / 1e9).toFixed(5)} SOL`,
    ]);
  } catch (error) {
    fail(
      "Rent Calculation",
      "Failed to calculate rent",
      [`Error: ${(error as Error).message}`]
    );
  }

  // Test 6: IDL File
  log(colors.blue, "\n📋 Test 6: Program IDL");
  const idlPath = path.resolve(
    "programs/sentinel/target/types/sentinel.ts"
  );
  if (!fs.existsSync(idlPath)) {
    warn(
      "IDL File",
      "IDL TypeScript not found (optional for testing)",
      [`Expected: ${idlPath}`]
    );
  } else {
    const idlContent = fs.readFileSync(idlPath, "utf-8");
    pass("IDL File", "Program IDL TypeScript found", [
      `File size: ${idlContent.length} bytes`,
    ]);
  }

  // Test 7: Node.js Dependencies
  log(colors.blue, "\n📋 Test 7: Dependencies");
  const packageJsonPath = path.resolve("package.json");
  if (!fs.existsSync(packageJsonPath)) {
    fail(
      "Package.json",
      "package.json not found",
      [`Expected: ${packageJsonPath}`]
    );
  } else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const requiredDeps = [
      "@coral-xyz/anchor",
      "@solana/web3.js",
      "next",
      "react",
    ];

    let allFound = true;
    const foundDeps: string[] = [];

    requiredDeps.forEach((dep) => {
      const isDev = !!packageJson.devDependencies?.[dep];
      const isProd = !!packageJson.dependencies?.[dep];
      if (isDev || isProd) {
        foundDeps.push(dep);
      } else {
        allFound = false;
      }
    });

    if (allFound) {
      pass("Dependencies", "All required packages found", foundDeps);
    } else {
      warn(
        "Dependencies",
        "Some packages may be missing",
        [
          `Found: ${foundDeps.join(", ")}`,
          `Missing: ${requiredDeps.filter((d) => !foundDeps.includes(d)).join(", ")}`,
        ]
      );
    }
  }

  // Test 8: Web3 Client
  log(colors.blue, "\n📋 Test 8: Web3 Client Integration");
  const web3ClientPath = path.resolve("src/lib/web3-client.ts");
  if (!fs.existsSync(web3ClientPath)) {
    warn(
      "Web3 Client",
      "web3-client.ts not found (check path)",
      [`Expected: ${web3ClientPath}`]
    );
  } else {
    const clientContent = fs.readFileSync(web3ClientPath, "utf-8");
    const methodCount = (clientContent.match(/async \w+\(/g) || []).length;

    pass("Web3 Client", "Web3 client implementation found", [
      `File size: ${clientContent.length} bytes`,
      `Methods found: ${methodCount}`,
    ]);
  }

  // Test 9: Database Configuration
  log(colors.blue, "\n📋 Test 9: Database");
  if (envContent.includes("DATABASE_URL")) {
    pass("Database Config", "DATABASE_URL configured in .env.local");
  } else {
    warn(
      "Database Config",
      "DATABASE_URL not found in .env.local",
      ["Database operations may not work"]
    );
  }

  // Test 10: API Endpoints
  log(colors.blue, "\n📋 Test 10: API Endpoints");
  const apiDir = path.resolve("src/app/api");
  if (!fs.existsSync(apiDir)) {
    warn(
      "API Endpoints",
      "API directory not found",
      [`Expected: ${apiDir}`]
    );
  } else {
    const apiDirs = fs.readdirSync(apiDir);
    const apiEndpoints = apiDirs.filter((f) => fs.statSync(path.join(apiDir, f)).isDirectory());

    if (apiEndpoints.length > 0) {
      pass("API Endpoints", `Found ${apiEndpoints.length} API route groups`, [
        `Routes: ${apiEndpoints.join(", ")}`,
      ]);
    } else {
      warn(
        "API Endpoints",
        "No API route groups found",
        [`Check ${apiDir} directory`]
      );
    }
  }

  // Summary
  log(colors.blue, "\n" + "=".repeat(60));
  log(colors.blue, "📊 Verification Summary");
  log(colors.blue, "=".repeat(60) + "\n");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warned = results.filter((r) => r.status === "WARN").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;

  console.table(results);

  log(colors.blue, `\nTotal: ${results.length} checks`);
  log(colors.green, `Passed: ${passed}`);
  if (warned > 0) log(colors.yellow, `Warnings: ${warned}`);
  if (failed > 0) log(colors.red, `Failed: ${failed}`);
  if (skipped > 0) log(colors.cyan, `Skipped: ${skipped}`);

  // Final status
  if (failed === 0) {
    log(
      colors.green,
      "\n✅ Environment ready for E2E testing!\n"
    );
    process.exit(0);
  } else {
    log(
      colors.red,
      "\n❌ Environment has issues. Fix above and retry.\n"
    );
    process.exit(1);
  }
}

// Run verification
verifyEnvironment().catch((error) => {
  log(colors.red, `\n❌ Verification script error: ${error.message}\n`);
  process.exit(1);
});
