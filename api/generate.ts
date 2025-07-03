// This is a Vercel Serverless Function that acts as a secure proxy.
// It will be accessible at the path /api/generate

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// This function will be executed on the server, not in the browser.
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Your secret API key is read from the server's environment variables.
    // It is NEVER exposed to the client.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured on the server.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { prompt } = await request.json();
        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is missing in the request body.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 1,
                topP: 0.95,
            },
        });

        // Return the generated text in a JSON object
        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e: any) {
        console.error("Error in API proxy:", e);
        // Forward the error structure if possible for client-side handling (like quota errors)
        const errorBody = e.error || { message: 'An internal server error occurred.' };
        const status = e.status || 500;
        return new Response(JSON.stringify({ error: errorBody }), {
            status: status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
