import { jsonToToon, estimateTokenSaving } from '../src/utils/toon';
import fs from 'fs';
import path from 'path';

async function test() {
    console.log('--- TOON Conversion Test ---');

    const sampleData = [
        {
            "title": "境内机场接送服务",
            "bank": "兴业",
            "cardName": "兴业银行美国运通白金信用卡（悠系列）",
            "category": "Travel",
            "description": "每计积分长假年度内提供4次境内指定城市机场免费接送服务，涵盖北京、上海、广州、深圳等主流城市。",
            "validity": "每计积分长假年度",
            "value": "4次境内免费接送",
            "usageCondition": "持卡人使用",
            "terms": "涵盖北京、上海、广州、深圳等主流城市",
            "id": "4752f9ab-4e53-4ea5-bcbb-bd47e374887e",
            "isCompleted": true
        },
        {
            "title": "免费专业体检",
            "bank": "兴业",
            "cardName": "兴业银行美国运通白金信用卡（悠系列）",
            "category": "Health",
            "description": "每年提供1次免费专业体检服务。",
            "validity": "每年",
            "value": "1次免费专业体检",
            "usageCondition": "可转让给直系亲属使用",
            "terms": "",
            "id": "bdef011e-daca-4e0b-b231-d82d950f7253"
        }
    ];

    const jsonStr = JSON.stringify(sampleData, null, 2);
    const toonStr = jsonToToon(sampleData);

    console.log('JSON Length:', jsonStr.length);
    console.log('TOON Length:', toonStr.length);
    console.log('TOON Output:\n', toonStr);

    const saving = estimateTokenSaving(jsonStr, toonStr);
    console.log(`Estimated Character Saving: ${saving.savingPercent}%`);

    if (toonStr.includes('FIELDS') && toonStr.includes('DATA')) {
        console.log('✅ Conversion successful!');
    } else {
        console.log('❌ Conversion failed!');
    }
}

test();
