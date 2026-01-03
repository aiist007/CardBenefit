import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { jsonToToon } from '@/utils/toon';

export async function POST(req: NextRequest) {
    try {
        const { messages, contextBenefits } = await req.json();

        const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
        });

        // Construct the system message with database context (TOON Format to save tokens)
        const contextString = jsonToToon(contextBenefits);

        const systemContent = `你是一个专业的信用卡权益助手。你可以基于用户已有的信用卡权益数据库来回答问题。
            
**当前数据库信息 (TOON 格式):**
输入的权益列表采用了 TOON (Token-Oriented Object Notation) 格式以节省 Token。
- FIELDS 行定义了字段顺序。
- DATA 下方每一行代表一个对象，以 "|" 为分隔符。

${contextString}

**对话规则：**
1. **优先基于数据库：** 优先基于上述数据库信息回答。如果数据库中有相关卡片的权益，请详细列出。
2. **补充网上搜索：** 如果数据库中没有相关信息，或者信息不全，请基于你作为 AI 的通用知识（模拟网上搜索总结）来补充。对于主流银行（如招商、工商、建行等）的经典卡片（如经典白、百夫长等），你应该能给出准确的权益总结。
3. **结合实际建议：** 给出如何最大化利用这些权益的建议（例如：消费达标、生日倍数积分等）。
4. **输出排版：** 使用清晰的 Markdown 格式排版。
   - 使用 **加粗** 突出银行、卡片和关键金额。
   - 使用 ### 标题分隔不同银行或分类。
   - 使用无序列表 - 列出具体权益。
   - 使用表格展示对比信息（如多张卡的同类权益对比）。
5. 回答要简洁、专业、条理清晰。`;

        const systemMessage = {
            role: "system",
            content: systemContent
        };

        // Combine system message with conversation history (last 8-10 turns managed by frontend)
        const fullMessages = [systemMessage, ...messages];

        const response = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 2000,
        });

        return NextResponse.json({
            content: response.choices[0].message.content
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
