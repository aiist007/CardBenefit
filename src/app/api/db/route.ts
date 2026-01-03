import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { jsonToToon, toonToJson } from '@/utils/toon';

const execAsync = promisify(exec);

const DB_PATH = path.join(process.cwd(), 'data', 'benefits.toon');
const LEGACY_JSON_PATH = path.join(process.cwd(), 'data', 'benefits.json');
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');

// Initialize DB and Folders if not exists
async function initDb() {
    try {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.access(DB_PATH);
    } catch {
        // Try migration from legacy JSON
        try {
            await fs.access(LEGACY_JSON_PATH);
            const jsonData = await fs.readFile(LEGACY_JSON_PATH, 'utf-8');
            const benefits = JSON.parse(jsonData);
            const toonData = jsonToToon(benefits);
            await fs.writeFile(DB_PATH, toonData);
            console.log('Migration from JSON to TOON successful.');
        } catch (e) {
            // No legacy file, create empty TOON
            await fs.writeFile(DB_PATH, jsonToToon([]));
        }
    }

    try {
        await fs.mkdir(BACKUPS_DIR, { recursive: true });
    } catch (e) { }
}

async function manageBackups() {
    try {
        const files = await fs.readdir(BACKUPS_DIR);
        const backupFiles = files
            .filter(f => f.startsWith('benefits_') && (f.endsWith('.toon') || f.endsWith('.json')))
            .map(f => ({ name: f, time: fs.stat(path.join(BACKUPS_DIR, f)).then(s => s.mtimeMs) }));

        const resolvedFiles = await Promise.all(backupFiles.map(async f => ({ name: f.name, time: await f.time })));
        resolvedFiles.sort((a, b) => b.time - a.time);

        // Keep only top 5
        if (resolvedFiles.length > 5) {
            for (let i = 5; i < resolvedFiles.length; i++) {
                await fs.unlink(path.join(BACKUPS_DIR, resolvedFiles[i].name));
            }
        }
    } catch (e) {
        console.error('Backup management failed:', e);
    }
}

async function gitCommitData() {
    try {
        const timestamp = new Date().toLocaleString('zh-CN');
        await execAsync(`git add data/benefits.toon`);
        // Use a simple commit message, avoid quotes issues with shell
        await execAsync(`git commit -m "Auto-backup (TOON): Data updated at ${timestamp}"`);
        console.log('Git auto-commit successful');
    } catch (e) {
        // This might fail if no changes were made, which is fine
        console.warn('Git auto-commit skipped or failed:', (e as Error).message);
    }
}

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        if (type === 'backups') {
            const files = await fs.readdir(BACKUPS_DIR);
            const backupFiles = files
                .filter(f => f.startsWith('benefits_') && (f.endsWith('.toon') || f.endsWith('.json')));

            const details = await Promise.all(backupFiles.map(async f => {
                const stats = await fs.stat(path.join(BACKUPS_DIR, f));
                return { name: f, time: stats.mtimeMs, size: stats.size };
            }));

            details.sort((a, b) => b.time - a.time);
            return NextResponse.json(details);
        }

        if (type === 'backup') {
            const name = searchParams.get('name');
            if (!name) return NextResponse.json({ error: 'Missing backup name' }, { status: 400 });

            const backupPath = path.join(BACKUPS_DIR, name);
            // Safety check: ensure the file is within the backups directory
            if (!backupPath.startsWith(BACKUPS_DIR)) {
                return NextResponse.json({ error: 'Invalid backup path' }, { status: 403 });
            }

            const data = await fs.readFile(backupPath, 'utf-8');
            if (name.endsWith('.toon')) {
                return NextResponse.json(toonToJson(data));
            }
            return NextResponse.json(JSON.parse(data));
        }

        const data = await fs.readFile(DB_PATH, 'utf-8');
        return NextResponse.json(toonToJson(data));
    } catch (error) {
        console.error('Database read error:', error);
        return NextResponse.json({ error: 'Failed to read database' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await initDb();
        const benefits = await req.json();

        // 1. Create a Snapshot before writing
        try {
            const currentContent = await fs.readFile(DB_PATH, 'utf-8');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(BACKUPS_DIR, `benefits_${timestamp}.toon`);
            await fs.writeFile(backupPath, currentContent);
            await manageBackups();
        } catch (e) {
            console.warn('Backup creation failed, but proceeding with save:', e);
        }

        // 2. Write new data (TOON format)
        const toonData = jsonToToon(benefits);
        await fs.writeFile(DB_PATH, toonData);

        // 3. Git Auto-Commit (Background-ish)
        gitCommitData().catch(e => console.error('Background Git commit failed:', e));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database write error:', error);
        return NextResponse.json({ error: 'Failed to write database' }, { status: 500 });
    }
}
