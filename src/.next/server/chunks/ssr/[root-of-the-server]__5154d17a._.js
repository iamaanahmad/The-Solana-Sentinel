module.exports = {

"[externals]/child_process [external] (child_process, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}}),
"[externals]/util [external] (util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[project]/src/app/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ [{"6013ecdbfbdac36cd2f76b33e6e289628385837e17":"analyzeToken"},"",""] */ __turbopack_context__.s({
    "analyzeToken": (()=>analyzeToken)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/ai/flows/summarize-risk-factors'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
// Promisify the exec function to use it with async/await
const execPromise = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"]);
const TokenSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(32, {
    message: 'Invalid Solana address.'
}).max(44, {
    message: 'Invalid Solana address.'
});
/**
 * Fetches on-chain token data from the Helius API.
 * @param tokenAddress The Solana token address.
 * @returns A promise that resolves to the on-chain analysis data.
 */ async function fetchOnChainData(tokenAddress) {
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        throw new Error("Helius API key is not configured in environment variables.");
    }
    const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    try {
        const [assetResponse, largestAccountsResponse, tokenSupplyResponse] = await Promise.all([
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'solana-sentinel-asset',
                    method: 'getAsset',
                    params: {
                        id: tokenAddress
                    }
                })
            }),
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'solana-sentinel-holders',
                    method: 'getTokenLargestAccounts',
                    params: [
                        tokenAddress
                    ]
                })
            }),
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'solana-sentinel-supply',
                    method: 'getTokenSupply',
                    params: [
                        tokenAddress
                    ]
                })
            })
        ]);
        if (!assetResponse.ok || !largestAccountsResponse.ok || !tokenSupplyResponse.ok) {
            const errorBody = await assetResponse.text();
            console.error("Helius API Error Body:", errorBody);
            throw new Error(`Helius API call failed with status ${assetResponse.status}`);
        }
        const assetData = await assetResponse.json();
        const largestAccountsData = await largestAccountsResponse.json();
        const tokenSupplyData = await tokenSupplyResponse.json();
        if (assetData.error || largestAccountsData.error || tokenSupplyData.error) {
            throw new Error(`Helius API returned an error: ${assetData.error?.message || largestAccountsData.error?.message || tokenSupplyData.error?.message}`);
        }
        // --- Data Parsing Logic ---
        const { result: assetResult } = assetData;
        const { result: largestAccountsResult } = largestAccountsData;
        const { result: tokenSupplyResult } = tokenSupplyData;
        // 1. Basic Info & Authorities
        const tokenName = assetResult.content?.metadata?.name || 'Unknown Token';
        const tokenSymbol = assetResult.content?.metadata?.symbol || '???';
        const mintAuthorityRenounced = assetResult.ownership?.mint_authority === null;
        const freezeAuthorityRenounced = assetResult.ownership?.freeze_authority === null;
        // 2. Holder Concentration
        let top10HolderConcentrationPercent = 0;
        const totalSupply = parseFloat(tokenSupplyResult.value.amount);
        if (totalSupply > 0 && largestAccountsResult.value.length > 0) {
            const top10Holders = largestAccountsResult.value.slice(0, 10);
            const top10Supply = top10Holders.reduce((acc, holder)=>acc + parseFloat(holder.amount), 0);
            top10HolderConcentrationPercent = top10Supply / totalSupply * 100;
        }
        // 3. Deployer LP Holdings (Placeholder)
        // TODO: This is a highly complex calculation that requires analyzing transaction history
        // to find the original liquidity provision transaction from the deployer.
        // For now, we use a random value as a placeholder.
        const deployerLpConcentrationPercent = Math.random() * 40; // 0% to 40%
        return {
            tokenName,
            tokenSymbol,
            mintAuthorityRenounced,
            freezeAuthorityRenounced,
            top10HolderConcentrationPercent,
            deployerLpConcentrationPercent
        };
    } catch (error) {
        console.error("Error fetching from Helius:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch on-chain data from Helius: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching from Helius.");
    }
}
/**
 * Triggers a sentiment analysis job on the Nosana Network.
 * @param tokenSymbol The token symbol to analyze.
 * @returns A promise that resolves to the sentiment analysis results.
 */ async function fetchSentimentAnalysis(tokenSymbol) {
    const NOSANA_JOB_ID = process.env.NOSANA_JOB_ID;
    if (!NOSANA_JOB_ID || NOSANA_JOB_ID === 'your-sentiment-job-id') {
        console.warn("Nosana Job ID is not configured. Falling back to mock sentiment data.");
        return generateMockSentiment();
    }
    try {
        // 1. Trigger the job.
        const runCommand = `nosana job run --input '{"symbol": "${tokenSymbol}"}' ${NOSANA_JOB_ID}`;
        console.log(`Executing Nosana command: ${runCommand}`);
        const { stdout: runStdout } = await execPromise(runCommand);
        const runResult = JSON.parse(runStdout);
        const jobId = runResult.job.id;
        console.log(`Started Nosana job with ID: ${jobId}`);
        // 2. Poll for the result. This is a simplified polling mechanism.
        let jobResult;
        for(let i = 0; i < 15; i++){
            await new Promise((resolve)=>setTimeout(resolve, 5000)); // Wait 5s
            const resultCommand = `nosana job result ${jobId}`;
            console.log(`Polling for result with command: ${resultCommand}`);
            const { stdout: resultStdout } = await execPromise(resultCommand);
            const parsedResult = JSON.parse(resultStdout);
            if (parsedResult.job.state === 'Completed') {
                // The result from the Nosana job is often a stringified JSON in stdout,
                // so it might need to be parsed twice.
                jobResult = JSON.parse(parsedResult.result.stdout);
                console.log("Nosana job completed.", jobResult);
                break;
            }
        }
        if (!jobResult) {
            throw new Error("Nosana job did not complete in time.");
        }
        // --- Data Parsing Logic ---
        // Assumes your Nosana job returns an object like:
        // { "compound": 0.88, "summary": "Overwhelmingly Positive" }
        return {
            compoundScore: jobResult.compound,
            humanReadableSummary: jobResult.summary
        };
    } catch (error) {
        console.warn("Could not execute Nosana CLI. This may be because it is not installed or configured. Falling back to mock sentiment data.", error);
        return generateMockSentiment();
    }
}
async function generateMockSentiment() {
    await new Promise((resolve)=>setTimeout(resolve, 1500)); // Simulate network delay
    const sentimentScore = Math.random() * 2 - 1; // -1 to 1
    let humanReadableSummary;
    if (sentimentScore > 0.6) {
        humanReadableSummary = 'Overwhelmingly Positive';
    } else if (sentimentScore > 0.2) {
        humanReadableSummary = 'Positive';
    } else if (sentimentScore < -0.6) {
        humanReadableSummary = 'Highly Negative';
    } else if (sentimentScore < -0.2) {
        humanReadableSummary = 'Negative';
    } else {
        humanReadableSummary = 'Mixed';
    }
    return {
        compoundScore: sentimentScore,
        humanReadableSummary
    };
}
async function analyzeToken(prevState, formData) {
    const tokenAddress = formData.get('tokenAddress');
    const validation = TokenSchema.safeParse(tokenAddress);
    if (!validation.success) {
        return {
            report: null,
            error: validation.error.errors[0].message
        };
    }
    try {
        // Step 1: Fetch live on-chain data from Helius
        const onChainData = await fetchOnChainData(validation.data);
        // Step 2: Trigger sentiment analysis on Nosana
        const sentimentAnalysis = await fetchSentimentAnalysis(onChainData.tokenSymbol);
        const onChainAnalysis = {
            mintAuthorityRenounced: onChainData.mintAuthorityRenounced,
            freezeAuthorityRenounced: onChainData.freezeAuthorityRenounced,
            top10HolderConcentrationPercent: onChainData.top10HolderConcentrationPercent,
            deployerLpConcentrationPercent: onChainData.deployerLpConcentrationPercent
        };
        // Step 3: Calculate the Holistic Score
        let score = 100;
        if (!onChainAnalysis.mintAuthorityRenounced) score -= 30;
        if (!onChainAnalysis.freezeAuthorityRenounced) score -= 20;
        if (onChainAnalysis.top10HolderConcentrationPercent > 40) score -= 25;
        else if (onChainAnalysis.top10HolderConcentrationPercent > 20) score -= 15;
        if (onChainAnalysis.deployerLpConcentrationPercent > 20) score -= 20;
        if (sentimentAnalysis.humanReadableSummary.includes('Negative')) score -= 20;
        if (sentimentAnalysis.humanReadableSummary.includes('Positive')) score += 5;
        const sentinelScore = Math.max(0, Math.min(100, Math.round(score)));
        // Step 4: Generate the AI Summary
        const aiInput = {
            tokenName: onChainData.tokenName,
            tokenSymbol: onChainData.tokenSymbol,
            sentinelScore: sentinelScore,
            onChainMetrics: onChainAnalysis,
            sentimentAnalysis: sentimentAnalysis
        };
        const aiResult = await summarizeRiskFactors(aiInput);
        // Step 5: Assemble the final report
        const report = {
            tokenAddress: validation.data,
            tokenName: aiInput.tokenName,
            tokenSymbol: aiInput.tokenSymbol,
            sentinelScore,
            aiAnalysis: aiResult,
            onChainAnalysis,
            sentimentAnalysis
        };
        return {
            report,
            error: null
        };
    } catch (e) {
        console.error(e);
        return {
            report: null,
            error: e.message || 'An unexpected error occurred during analysis.'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    analyzeToken
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(analyzeToken, "6013ecdbfbdac36cd2f76b33e6e289628385837e17", null);
}}),
"[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
;
}}),
"[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6013ecdbfbdac36cd2f76b33e6e289628385837e17": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["analyzeToken"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6013ecdbfbdac36cd2f76b33e6e289628385837e17": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6013ecdbfbdac36cd2f76b33e6e289628385837e17"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/src/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx", "default");
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__5154d17a._.js.map