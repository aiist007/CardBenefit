import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const DB_PATH = path.join(process.cwd(), 'data', 'benefits.json');
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');

// Initialize DB and Folders if not exists
async function initDb() {
    try {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify([], null, 2));
    }

    try {
        await fs.mkdir(BACKUPS_DIR, { recursive: true });
    } catch (e) { }
}

async function manageBackups() {
    try {
        const files = await fs.readdir(BACKUPS_DIR);
        const backupFiles = files
            .filter(f => f.startsWith('benefits_') && f.endsWith('.json'))
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

export async function GET(req: NextRequest) {
    try {
        await initDb();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');

        if (type === 'backups') {
            const files = await fs.readdir(BACKUPS_DIR);
            const backupFiles = files
                .filter(f => f.startsWith('benefits_') && f.endsWith('.json'));

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
            return NextResponse.json(JSON.parse(data));
        }

        const data = await fs.readFile(DB_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(data));
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
            const backupPath = path.join(BACKUPS_DIR, `benefits_${timestamp}.json`);
            await fs.writeFile(backupPath, currentContent);
            await manageBackups();
        } catch (e) {
            console.warn('Backup creation failed, but proceeding with save:', e);
        }

        // 2. Write new data
        await fs.writeFile(DB_PATH, JSON.stringify(benefits, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database write error:', error);
        return NextResponse.json({ error: 'Failed to write database' }, { status: 500 });
    }
}
