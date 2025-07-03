
import { kv } from '@vercel/kv';

export default async function handler(req: Request) {
    // Vercel Hobby plan doesn't support blocking Edge functions, 
    // so we need to check for the KV_URL to ensure KV is available.
    if (!process.env.KV_URL) {
        return new Response(JSON.stringify({ error: "KV store is not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (req.method === 'POST') {
        try {
            const { name, floor, time } = await req.json();

            if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 20) {
                return new Response(JSON.stringify({ error: 'Invalid name provided. Must be 3-20 characters.' }), { status: 400 });
            }
            if (!floor || typeof floor !== 'number' || floor < 1) {
                return new Response(JSON.stringify({ error: 'Invalid floor provided.' }), { status: 400 });
            }
            if (time === undefined || typeof time !== 'number' || time < 0) {
                return new Response(JSON.stringify({ error: 'Invalid time provided.' }), { status: 400 });
            }
            
            const id = `${name.trim()}-${Date.now()}`;
            const createdAt = Date.now();

            const entry = { id, name: name.trim(), floor, time, createdAt };
            
            const MAX_TIME = 9999999; 
            const score = floor * 10000000 + (MAX_TIME - time);

            await kv.zadd('leaderboard', { score, member: JSON.stringify(entry) });
            // Keep the leaderboard trimmed to the top 1000 to manage storage
            await kv.zremrangebyrank('leaderboard', 0, -1001);

            return new Response(JSON.stringify({ success: true, entry }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Leaderboard POST Error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error.' }), { status: 500 });
        }
    }

    if (req.method === 'GET') {
        try {
            const entries = await kv.zrange('leaderboard', 0, 49, { rev: true });
            const leaderboard = entries.map(entry => JSON.parse(entry as string));

            return new Response(JSON.stringify(leaderboard), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Leaderboard GET Error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error.' }), { status: 500 });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}