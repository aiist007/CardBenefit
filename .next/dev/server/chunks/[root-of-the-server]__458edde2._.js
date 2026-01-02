module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/parse/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
;
const COMMON_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not A(Bit:Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
};
function cleanHtml(html) {
    return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "").replace(/<(?:p|div|li|tr|br|h[1-6]|section|span)\b[^>]*>/gim, "\n") // Preserve structure
    .replace(/<[^>]+>/g, " ").replace(/[ \t]+/g, " ") // Keep only one space, but allow newlines
    .replace(/\n\s*\n+/g, "\n\n") // Collapse multiple newlines
    .trim();
}
async function fetchPageContent(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            headers: COMMON_HEADERS,
            signal: controller.signal
        });
        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`Sub-page fetch blocked (403): ${url}`);
                return {
                    text: '',
                    images: []
                };
            }
            return {
                text: '',
                images: []
            };
        }
        const html = await response.text();
        // Extract images - WeChat uses data-src for lazy loading
        const imgRegex = /<img\s+(?:[^>]*?\s+)?(?:src|data-src)="([^"]*)"/gim;
        const images = new Set();
        let imgMatch;
        while((imgMatch = imgRegex.exec(html)) !== null){
            const src = imgMatch[1];
            try {
                const imgUrl = new URL(src, url).href;
                // Basic filter: skip icons, svg, data urls, trackers
                if (!src.includes('data:') && !src.endsWith('.svg') && !src.includes('pixel') && !src.includes('tracker') && !src.includes('qrcode')) {
                    images.add(imgUrl);
                }
            } catch (e) {}
        }
        return {
            text: cleanHtml(html),
            images: Array.from(images).slice(0, 5) // Limit to top 5 images per page
        };
    } catch (err) {
        console.warn(`Fetch failed for sub-page ${url}:`, err);
        return {
            text: '',
            images: []
        };
    } finally{
        clearTimeout(timeoutId);
    }
}
async function imageUrlToBase64(url) {
    try {
        if (url.startsWith('data:')) {
            return url;
        }
        const response = await fetch(url, {
            headers: COMMON_HEADERS
        });
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get('content-type') || 'image/jpeg';
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${mimeType};base64,${base64}`;
    } catch (e) {
        console.warn(`Failed to convert image: ${url}`, e);
        return null;
    }
}
function tryRepairJson(json) {
    let repaired = json.trim();
    // 1. Handle unclosed quotes (truncated strings)
    let inString = false;
    let escaped = false;
    let quoteChar = '"';
    for(let i = 0; i < repaired.length; i++){
        const char = repaired[i];
        if (char === '\\' && !escaped) {
            escaped = true;
            continue;
        }
        if (char === '"' && !escaped) {
            inString = !inString;
        }
        escaped = false;
    }
    if (inString) {
        repaired += '"';
    }
    // 2. Remove trailing comma if it's there after closing a quote or just at the end
    repaired = repaired.trim();
    if (repaired.endsWith(',')) {
        repaired = repaired.slice(0, -1);
    }
    // 3. Balance braces and brackets
    const stack = [];
    // Re-scan to ensure we have the correct state after potentially adding a quote
    inString = false;
    escaped = false;
    for(let i = 0; i < repaired.length; i++){
        const char = repaired[i];
        if (char === '\\' && !escaped) {
            escaped = true;
            continue;
        }
        if (char === '"' && !escaped) {
            inString = !inString;
        }
        escaped = false;
        if (!inString) {
            if (char === '{') stack.push('}');
            if (char === '[') stack.push(']');
            if (char === '}' || char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
            }
        }
    }
    // Add missing closers in reverse order
    while(stack.length > 0){
        repaired += stack.pop();
    }
    return repaired;
}
async function POST(req) {
    try {
        const { text, url, screenshot, constraints, benefits, cardName: defaultCardName } = await req.json();
        let contentToParse = text || '';
        let imageUrls = [];
        // Check if we are in "Command Mode" (modifying existing data)
        const isCommandMode = !!(benefits && constraints && !url && !screenshot && !text);
        if (isCommandMode) {
            contentToParse = `[AI COMMAND MODE - MANIPULATING EXISTING DATA]
User Command: ${constraints}

Current Benefits List:
${JSON.stringify(benefits, null, 2)}`;
        } else if (url) {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 15000);
            try {
                const mainUrl = new URL(url);
                const response = await fetch(url, {
                    headers: COMMON_HEADERS,
                    signal: controller.signal
                });
                if (!response.ok) {
                    if (response.status === 403) {
                        console.warn('Standard fetch blocked (403). Browser fallback is currently disabled.');
                        throw new Error('Target website blocked access (403) and advanced browser parsing is disabled.');
                    } else {
                        throw new Error(`Server returned ${response.status} ${response.statusText}`);
                    }
                } else {
                    const mainHtml = await response.text();
                    const mainContent = cleanHtml(mainHtml);
                    const isImageFile = (url)=>/\.(jpg|jpeg|png|webp|heic|heif)$/i.test(url.split('?')[0]);
                    const imgRegex = /<img\s+(?:[^>]*?\s+)?(?:src|data-src)="([^"]*)"/gim;
                    let imgMatch;
                    while((imgMatch = imgRegex.exec(mainHtml)) !== null){
                        try {
                            const src = imgMatch[1];
                            const imgUrl = new URL(src, url).href;
                            if (!src.includes('data:') && isImageFile(imgUrl) && !src.includes('icon') && !src.includes('qrcode')) {
                                imageUrls.push(imgUrl);
                            }
                        } catch (e) {}
                    }
                    const isWeChat = mainUrl.hostname === 'mp.weixin.qq.com';
                    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gim;
                    const links = new Set();
                    let match;
                    while((match = linkRegex.exec(mainHtml)) !== null){
                        const href = match[1];
                        try {
                            const absoluteUrl = new URL(href, url);
                            const isSameDomain = absoluteUrl.hostname === mainUrl.hostname;
                            const isRelevant = /detail|benefit|terms|rule|rights|权益|详情|规则|条款/i.test(href);
                            // For WeChat, sub-pages are usually other articles, so we skip them to avoid context pollution
                            if (isSameDomain && isRelevant && absoluteUrl.href !== mainUrl.href && !isWeChat) {
                                links.add(absoluteUrl.href);
                            }
                        } catch (e) {}
                    }
                    const subPagesToFetch = Array.from(links).slice(0, 3);
                    const subPagesData = await Promise.all(subPagesToFetch.map((link)=>fetchPageContent(link)));
                    const validSubTexts = subPagesData.map((d)=>d.text).filter((t)=>t.length > 0);
                    subPagesData.forEach((d)=>{
                        imageUrls.push(...d.images);
                    });
                    contentToParse = `[Main Page Content]\n${mainContent}\n\n` + validSubTexts.map((c, i)=>`[Sub-page Content]\n${c}`).join('\n\n');
                }
                imageUrls = Array.from(new Set(imageUrls)).slice(0, 10);
                contentToParse = contentToParse.substring(0, 150000);
            } catch (err) {
                console.error('URL Fetch Error:', err);
                if (!text) throw err;
            } finally{
                clearTimeout(timeoutId);
            }
        }
        if (!contentToParse && !screenshot) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No content to parse'
            }, {
                status: 400
            });
        }
        if (!contentToParse && screenshot) {
            contentToParse = "[Visual content provided in screenshot]";
        }
        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'API Key (GOOGLE_AI_STUDIO_API_KEY) not configured.'
            }, {
                status: 500
            });
        }
        // Initialize OpenAI client with nebula proxy
        const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
            apiKey: apiKey,
            baseURL: 'https://llm.ai-nebula.com/v1'
        });
        const systemPrompt = `你是一个专业的信用卡权益分析专家。
你的任务是提取提供的文本或图片中${constraints ? `符合以下要求的` : `**所有的**`}信用卡权益信息。

**核心规则：**
1. ${constraints ? `优先遵循提取要求：${constraints}` : `穷举提取：必须抓取到最后。不要遗漏任何一个银行或平台的活动。`}
2. 结构化输出：必须返回 JSON 格式，包含 "benefits" 数组。
3. 字段要求（必须严格遵守以下字段名）：
   - title: 权益名称。
   - bank: 银行名称（如果是京东、支付宝等平台活动，银行填“京东”或“支付宝”）。
   - cardName: 信用卡名称（如果未指定，填“全量信用卡”；严禁使用斜杠“/”）。
   - category: 必须是 [Travel, Dining, Shopping, Insurance, Lifestyle, Vehicle, Health, Other] 之一。
   - description: 权益详细内容描述。
   - validity: 有效期/活动时间（如：2024-01-01至2024-03-31，或“每月一次”）。**必须仔细提取，不要遗漏。**
   - value: 权益价值（如：50元立减金、10倍积分、免费洗车等）。**必须仔细提取。**
   - usageCondition: 使用条件/达标条件（如：消费满1000元，或直接领取）。
   - terms: 细则/名额限制（如：每日限1000名，每人限领一次）。

**分类对应表：**
- Travel: 出行、住宿、接送机、贵宾厅
- Dining: 餐饮、美食、咖啡、外卖
- Shopping: 购物、电商、超市、支付优惠
- Insurance: 保险、延误险、意外险
- Lifestyle: 生活服务、视听会员、运动、娱乐
- Vehicle: 加油、洗车、停车、代驾
- Health: 体检、挂号、洁牙
- Other: 积分、还款、红包、其它

**补充说明：**
- 如果某个字段在原文中完全没有提及，请返回空字符串 "" 或 null，不要编造，但要尽可能从上下文推断（如从活动规则中推断出有效期）。
- description 应该包含该权益的完整介绍，而 value 应该提炼出最核心的价值点。

注意：内容可能较长，请确保${constraints ? `按要求精准提取` : `提取每一个被提到的活动`}。特别注意提取“有效期”、“价值”和“名额限制”等关键信息。`;
        const userPrompt = constraints ? `请根据以下材料，按提取要求“${constraints}”来提取信用卡权益。` : `请从提供的材料中提取所有的信用卡权益。不要遗漏任何活动项。`;
        let allExtractedBenefits = [];
        if (isCommandMode) {
            // --- AI COMMAND MODE: DIRECT DATA MANIPULATION ---
            const commandSystemPrompt = `你是一个专业的信用卡数据管理助手。
你的任务是根据用户的指令对提供的信用卡权益列表进行【外科手术式】的增、删、改操作。

**核心规则：**
1. 你必须返回一个包含三个列表的 JSON 对象：
   - "added": [新权益对象1, ...] (如果是新增，包含生成的随机 UUID id)
   - "updated": [包含原有ID且有修改的权益对象1, ...] (如果是修改)
   - "deleted": ["ID1", "ID2", ...] (如果要删除)
2. 保持数据格式（title, bank, cardName, category, description, validity, value, usageCondition, terms）。
3. 准确执行指令：${constraints}

**输出格式：**
必须返回一个 JSON 对象，结构如下：
{
  "added": [],
  "updated": [],
  "deleted": []
}`;
            const response = await callAiWithContent(openai, commandSystemPrompt, contentToParse, []);
            // Check if the response follows the changeset structure
            let changeset = {
                added: [],
                updated: [],
                deleted: []
            };
            if (response && !Array.isArray(response) && (response.added || response.updated || response.deleted)) {
                changeset = {
                    added: Array.isArray(response.added) ? response.added.map((b)=>({
                            ...b,
                            id: b.id || crypto.randomUUID()
                        })) : [],
                    updated: Array.isArray(response.updated) ? response.updated : [],
                    deleted: Array.isArray(response.deleted) ? response.deleted : []
                };
            } else if (Array.isArray(response)) {
                // Backward compatibility: if AI returned an array, treat it as 'added'
                changeset.added = response.map((b)=>({
                        ...b,
                        id: b.id || crypto.randomUUID()
                    }));
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                isCommandMode: true,
                changeset
            });
        } else {
            // --- EXTRACTION MODE: PARSING NEW CONTENT ---
            // 1. Process Text Content (Split if too long)
            if (contentToParse && contentToParse.trim().length > 0) {
                // Split content into chunks of ~12000 chars (expanded for better context)
                const chunkSize = 12000;
                const chunks = [];
                for(let i = 0; i < contentToParse.length; i += chunkSize){
                    chunks.push(contentToParse.substring(i, i + chunkSize));
                }
                for (const chunk of chunks){
                    const response = await callAiWithContent(openai, systemPrompt, userPrompt + `\n\nContent Chunk:\n${chunk}`, []);
                    allExtractedBenefits = [
                        ...allExtractedBenefits,
                        ...response
                    ];
                }
            }
            // 2. Process Images (if any)
            const allImageUrls = Array.from(new Set([
                ...imageUrls,
                ...screenshot ? [
                    screenshot
                ] : []
            ]));
            if (allImageUrls.length > 0) {
                for (const url of allImageUrls){
                    const base64 = await imageUrlToBase64(url);
                    if (!base64) continue;
                    const response = await callAiWithContent(openai, systemPrompt, userPrompt, [
                        base64
                    ]);
                    allExtractedBenefits = [
                        ...allExtractedBenefits,
                        ...response
                    ];
                }
            }
            // 3. Deduplicate only for EXTRACTION mode
            const uniqueBenefits = [];
            const seen = new Set();
            allExtractedBenefits.forEach((b)=>{
                const key = `${b.bank}-${b.title}`.toLowerCase().trim();
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueBenefits.push(b);
                }
            });
            allExtractedBenefits = uniqueBenefits;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            benefits: allExtractedBenefits
        });
    } catch (error) {
        console.error('API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function callAiWithContent(openai, systemPrompt, userPrompt, imageBase64s) {
    const messages = [
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: userPrompt + `\n\nReturn EXACTLY a JSON object with a "benefits" key containing the array.`
                }
            ]
        }
    ];
    imageBase64s.forEach((dataUrl)=>{
        messages[1].content.push({
            type: "image_url",
            image_url: {
                url: dataUrl,
                detail: "high"
            }
        });
    });
    let responseText = '';
    for(let attempt = 1; attempt <= 2; attempt++){
        try {
            const response = await openai.chat.completions.create({
                model: "gemini-3-flash-preview",
                messages: messages,
                response_format: {
                    type: "json_object"
                },
                max_tokens: 8192,
                temperature: 0.1
            });
            responseText = response.choices[0].message.content || '';
            if (responseText) break;
        } catch (e) {
            if (attempt === 2) throw e;
        }
    }
    if (!responseText) return [];
    try {
        let jsonToParse = responseText;
        if (jsonToParse.includes('```')) {
            const match = jsonToParse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) jsonToParse = match[1];
        }
        const firstBrace = jsonToParse.indexOf('{');
        const lastBrace = jsonToParse.lastIndexOf('}');
        let candidateJson = jsonToParse;
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            candidateJson = jsonToParse.substring(firstBrace, lastBrace + 1);
        }
        try {
            const parsed = JSON.parse(candidateJson);
            // If it's a changeset (has added/updated/deleted), return the whole object
            if (!Array.isArray(parsed) && (parsed.added || parsed.updated || parsed.deleted)) {
                return parsed;
            }
            // Otherwise follow existing logic
            return Array.isArray(parsed) ? parsed : parsed.benefits || [];
        } catch (e) {
            const startFromBrace = jsonToParse.indexOf('{');
            if (startFromBrace !== -1) {
                const repaired = tryRepairJson(jsonToParse.substring(startFromBrace));
                const parsed = JSON.parse(repaired);
                if (!Array.isArray(parsed) && (parsed.added || parsed.updated || parsed.deleted)) {
                    return parsed;
                }
                return Array.isArray(parsed) ? parsed : parsed.benefits || [];
            }
            throw e;
        }
    } catch (error) {
        console.error('Failed to parse AI response part:', error);
        return [];
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__458edde2._.js.map