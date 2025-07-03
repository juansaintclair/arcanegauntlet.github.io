
import { createClient } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!process.env.AG_KV_REST_API_URL || !process.env.AG_KV_REST_API_TOKEN) {
        return res.status(500).json({ error: "Database not configured. Environment variables AG_KV_REST_API_URL and AG_KV_REST_API_TOKEN are missing." });
    }

    const kv = createClient({
        url: process.env.AG_KV_REST_API_URL,
        token: process.env.AG_KV_REST_API_TOKEN,
    });

    if (req.method === 'POST') {
        try {
            const { name, floor, time } = req.body;

            if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 20) {
                return res.status(400).json({ error: 'Invalid name provided. Must be 3-20 characters.' });
            }
            if (!floor || typeof floor !== 'number' || floor < 1) {
                return res.status(400).json({ error: 'Invalid floor provided.' });
            }
            if (time === undefined || typeof time !== 'number' || time < 0) {
                return res.status(400).json({ error: 'Invalid time provided.' });
            }

            const id = `${name.trim()}-${Date.now()}`;
            const createdAt = Date.now();
            const entry = { id, name: name.trim(), floor, time, createdAt };

            // A high score is better. Higher floor is better. Lower time is better.
            const MAX_TIME = 9999999;
            const score = floor * 10000000 + (MAX_TIME - time);

            await kv.zadd('leaderboard', { score, member: JSON.stringify(entry) });
            // Keep the leaderboard to a reasonable size
            await kv.zremrangebyrank('leaderboard', 0, -1001);

            return res.status(201).json({ success: true, entry });
        } catch (error) {
            console.error('Leaderboard POST Error:', error);
            return res.status(500).json({ error: 'Internal Server Error.' });
        }
    }

    if (req.method === 'GET') {
        try {
            // Fetch top 50 scores, from highest to lowest
            const entries = await kv.zrange('leaderboard', 0, 49, { rev: true });
            return res.status(200).json(entries);
        } catch (error) {
            console.error('Leaderboard GET Error:', error);
            return res.status(500).json({ error: 'Internal Server Error.' });
        }
    }

    // Handler for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send(null);
    }

    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
