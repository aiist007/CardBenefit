import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { jsonToToon } from '@/utils/toon';

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
    'Upgrade-Insecure-Requests': '1',
};

function cleanHtml(html: string): string {
    return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
        .replace(/<(?:p|div|li|tr|br|h[1-6]|section|span)\b[^>]*>/gim, "\n") // Preserve structure
        .replace(/<[^>]+>/g, " ")
        .replace(/[ \t]+/g, " ") // Keep only one space, but allow newlines
        .replace(/\n\s*\n+/g, "\n\n") // Collapse multiple newlines
        .trim();
}

async function fetchPageContent(url: string, timeoutMs: number = 8000): Promise<{ text: string, images: string[] }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            headers: COMMON_HEADERS,
            signal: controller.signal
        });
        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`Sub-page fetch blocked (403): ${url}`);
                return { text: '', images: [] };
            }
            return { text: '', images: [] };
        }
        const html = await response.text();

        // Extract images - WeChat uses data-src for lazy loading
        const imgRegex = /<img\s+(?:[^>]*?\s+)?(?:src|data-src)="([^"]*)"/gim;
        const images = new Set<string>();
        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
            const src = imgMatch[1];
            try {
                const imgUrl = new URL(src, url).href;
                // Basic filter: skip icons, svg, data urls, trackers
                if (!src.includes('data:') && !src.endsWith('.svg') && !src.includes('pixel') && !src.includes('tracker') && !src.includes('qrcode')) {
                    images.add(imgUrl);
                }
            } catch (e) { }
        }

        return {
            text: cleanHtml(html),
            images: Array.from(images).slice(0, 5) // Limit to top 5 images per page
        };
    } catch (err) {
        console.warn(`Fetch failed for sub-page ${url}:`, err);
        return { text: '', images: [] };
    } finally {
        clearTimeout(timeoutId);
    }
}

async function imageUrlToBase64(url: string): Promise<string | null> {
    try {
        if (url.startsWith('data:')) {
            return url;
        }

        const response = await fetch(url, { headers: COMMON_HEADERS });
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

function tryRepairJson(json: string): string {
    let repaired = json.trim();

    // 1. Handle unclosed quotes (truncated strings)
    let inString = false;
    let escaped = false;
    let quoteChar = '"';

    for (let i = 0; i < repaired.length; i++) {
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
    const stack: string[] = [];
    // Re-scan to ensure we have the correct state after potentially adding a quote
    inString = false;
    escaped = false;

    for (let i = 0; i < repaired.length; i++) {
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
    while (stack.length > 0) {
        repaired += stack.pop();
    }

    return repaired;
}

export async function POST(req: NextRequest) {
    try {
        const { text, url, screenshot, constraints, benefits, cardName: defaultCardName } = await req.json();
        let contentToParse = text || '';
        let imageUrls: string[] = [];

        // Check if we are in "Command Mode" (modifying existing data)
        const isCommandMode = !!(benefits && constraints && !url && !screenshot && !text);

        if (isCommandMode) {
            const toonBenefits = jsonToToon(benefits);
            console.log(`[TOON] Converted benefits list to TOON. Tokens reduced.`);

            contentToParse = `[AI COMMAND MODE - MANIPULATING EXISTING DATA]
User Command: ${constraints}

Current Benefits List (TOON Format):
${toonBenefits}`;
        } else if (url) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

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

                    const isImageFile = (url: string) => /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(url.split('?')[0]);

                    const imgRegex = /<img\s+(?:[^>]*?\s+)?(?:src|data-src)="([^"]*)"/gim;
                    let imgMatch;
                    while ((imgMatch = imgRegex.exec(mainHtml)) !== null) {
                        try {
                            const src = imgMatch[1];
                            const imgUrl = new URL(src, url).href;
                            if (!src.includes('data:') && isImageFile(imgUrl) && !src.includes('icon') && !src.includes('qrcode')) {
                                imageUrls.push(imgUrl);
                            }
                        } catch (e) { }
                    }

                    const isWeChat = mainUrl.hostname === 'mp.weixin.qq.com';

                    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gim;
                    const links = new Set<string>();
                    let match;
                    while ((match = linkRegex.exec(mainHtml)) !== null) {
                        const href = match[1];
                        try {
                            const absoluteUrl = new URL(href, url);
                            const isSameDomain = absoluteUrl.hostname === mainUrl.hostname;
                            const isRelevant = /detail|benefit|terms|rule|rights|权益|详情|规则|条款/i.test(href);

                            // For WeChat, sub-pages are usually other articles, so we skip them to avoid context pollution
                            if (isSameDomain && isRelevant && absoluteUrl.href !== mainUrl.href && !isWeChat) {
                                links.add(absoluteUrl.href);
                            }
                        } catch (e) { }
                    }

                    const subPagesToFetch = Array.from(links).slice(0, 3);
                    const subPagesData = await Promise.all(
                        subPagesToFetch.map(link => fetchPageContent(link))
                    );

                    const validSubTexts = subPagesData.map(d => d.text).filter(t => t.length > 0);
                    subPagesData.forEach(d => {
                        imageUrls.push(...d.images);
                    });

                    contentToParse = `[Main Page Content]\n${mainContent}\n\n` +
                        validSubTexts.map((c, i) => `[Sub-page Content]\n${c}`).join('\n\n');
                }

                imageUrls = Array.from(new Set(imageUrls)).slice(0, 10);
                contentToParse = contentToParse.substring(0, 150000);
            } catch (err: any) {
                console.error('URL Fetch Error:', err);
                if (!text) throw err;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        if (!contentToParse && !screenshot) {
            return NextResponse.json({ error: 'No content to parse' }, { status: 400 });
        }

        if (!contentToParse && screenshot) {
            contentToParse = "[Visual content provided in screenshot]";
        }

        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key (GOOGLE_AI_STUDIO_API_KEY) not configured.' }, { status: 500 });
        }

        // Initialize OpenAI client with nebula proxy
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
        });

        // Load custom parsing rules from Agent Skill library
        const rulesPath = path.join(process.cwd(), 'src/data/parsing_rules.md');
        let extractionRules = '';
        try {
            if (fs.existsSync(rulesPath)) {
                extractionRules = fs.readFileSync(rulesPath, 'utf8');
            } else {
                console.warn('Parsing rules file not found at:', rulesPath);
            }
        } catch (e) {
            console.error('Failed to load parsing rules:', e);
        }

        // Use a robust fallback if rules failed to load
        const defaultRules = `你是一个专业的信用卡权益分析专家。
提取字段包括：title, bank, cardName, category, description, validity, value, usageCondition, terms。
分类必须限定为：Travel, Dining, Shopping, Insurance, Lifestyle, Vehicle, Health, AnnualFee, Other。
特别注意：积分相关归类为 Travel，年费相关归类为 AnnualFee。`;

        const systemPrompt = `${extractionRules || defaultRules}

${constraints ? `[提取目标/约束条件]:
${constraints}` : '你的任务是尽可能准确、全面地提取提供的文本或图片中的所有信用卡权益。'}

**技能自我进化规则 (IMPORTANT):**
1. 如果在提取过程中发现了新的规律（如：特定银行的积分比例、新的价值映射建议、复杂的表格处理技巧），请在返回的 JSON 中增加 "newRulesSuggested" 字段。
2. 该字段应该是 Markdown 格式的列表项，例如："- 汇丰奖励钱 (RC) 通常等同于港币价值。"。
3. 如果没有发现新规律，该字段返回 null。

请务必输出包含 "benefits" 数组${!isCommandMode ? '和可选的 "newRulesSuggested" 字符串' : ''}的 JSON 对象。`;

        const userPrompt = constraints
            ? `请根据以下材料，按提取要求“${constraints}”来提取信用卡权益。`
            : `请从提供的材料中提取所有的信用卡权益。不要遗漏任何活动项。`;

        let allExtractedBenefits: any[] = [];

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

**TOON 格式说明：**
输入的权益列表采用了 TOON (Token-Oriented Object Notation) 格式以节省 Token。
- FIELDS 行定义了字段顺序。
- DATA 下方每一行代表一个对象，以 "|" 为分隔符。

**输出格式：**
必须返回一个 JSON 对象，结构如下：
{
  "added": [],
  "updated": [],
  "deleted": []
}`;

            const response = await callAiWithContent(openai, commandSystemPrompt, contentToParse, []);

            // Check if the response follows the changeset structure
            let changeset = { added: [], updated: [], deleted: [] };
            if (response && !Array.isArray(response) && (response.added || response.updated || response.deleted)) {
                changeset = {
                    added: Array.isArray(response.added) ? (response.added as any[]).map(b => ({ ...b, id: b.id || crypto.randomUUID() })) : [],
                    updated: Array.isArray(response.updated) ? response.updated : [],
                    deleted: Array.isArray(response.deleted) ? response.deleted : []
                };
            } else if (Array.isArray(response)) {
                // Backward compatibility: if AI returned an array, treat it as 'added'
                changeset.added = response.map(b => ({ ...b, id: b.id || crypto.randomUUID() }));
            }

            return NextResponse.json({
                success: true,
                isCommandMode: true,
                changeset
            });

        } else {
            // --- EXTRACTION MODE: PARSING NEW CONTENT ---
            // 1. Process Text Content (Split if too long)
            let allNewRules: string[] = [];
            if (contentToParse && contentToParse.trim().length > 0) {
                // Split content into chunks of ~12000 chars
                const chunkSize = 12000;
                const chunks = [];
                for (let i = 0; i < contentToParse.length; i += chunkSize) {
                    chunks.push(contentToParse.substring(i, i + chunkSize));
                }

                for (const chunk of chunks) {
                    const result = await callAiWithContent(openai, systemPrompt, userPrompt + `\n\nContent Chunk:\n${chunk}`, []);
                    const benefits = Array.isArray(result.benefits) ? result.benefits : [];
                    allExtractedBenefits = [...allExtractedBenefits, ...benefits];
                    if (result.newRulesSuggested) allNewRules.push(result.newRulesSuggested);
                }
            }

            // 2. Process Images (if any)
            const allImageUrls = Array.from(new Set([...imageUrls, ...(screenshot ? [screenshot] : [])]));
            if (allImageUrls.length > 0) {
                for (const url of allImageUrls) {
                    const base64 = await imageUrlToBase64(url);
                    if (!base64) continue;

                    const result = await callAiWithContent(openai, systemPrompt, userPrompt, [base64]);
                    const benefits = Array.isArray(result.benefits) ? result.benefits : [];
                    allExtractedBenefits = [...allExtractedBenefits, ...benefits];
                    if (result.newRulesSuggested) allNewRules.push(result.newRulesSuggested);
                }
            }

            // 3. Persist new rules if found
            if (allNewRules.length > 0) {
                const uniqueNewRules = Array.from(new Set(allNewRules));
                const newRulesContent = `\n\n## 动态习得规则 (${new Date().toLocaleDateString()})\n${uniqueNewRules.join('\n')}`;
                try {
                    fs.appendFileSync(rulesPath, newRulesContent);
                    console.log('Saved new rules to skill library.');
                } catch (e) {
                    console.error('Failed to save rules:', e);
                }
            }

            // 3. Deduplicate only for EXTRACTION mode
            const uniqueBenefits: any[] = [];
            const seen = new Set();
            allExtractedBenefits.forEach(b => {
                const key = `${b.bank}-${b.title}`.toLowerCase().trim();
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueBenefits.push(b);
                }
            });
            allExtractedBenefits = uniqueBenefits;
        }

        return NextResponse.json({ benefits: allExtractedBenefits });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function callAiWithContent(openai: OpenAI, systemPrompt: string, userPrompt: string, imageBase64s: string[]): Promise<any> {
    const messages: any[] = [
        { role: "system", content: systemPrompt },
        {
            role: "user",
            content: [
                { type: "text", text: userPrompt + `\n\nReturn EXACTLY a JSON object with a "benefits" key containing the array.` }
            ]
        }
    ];

    imageBase64s.forEach(dataUrl => {
        messages[1].content.push({
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" }
        });
    });

    let responseText = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model: "gemini-3-flash-preview",
                messages: messages,
                response_format: { type: "json_object" },
                max_tokens: 8192,
                temperature: 0.1,
            });
            responseText = response.choices[0].message.content || '';
            if (responseText) break;
        } catch (e) {
            if (attempt === 2) throw e;
        }
    }

    if (!responseText) return { benefits: [] };

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
            return JSON.parse(candidateJson);
        } catch (e) {
            const startFromBrace = jsonToParse.indexOf('{');
            if (startFromBrace !== -1) {
                const repaired = tryRepairJson(jsonToParse.substring(startFromBrace));
                return JSON.parse(repaired);
            }
            throw e;
        }
    } catch (error) {
        console.error('Failed to parse AI response part:', error);
        return { benefits: [] };
    }
}
