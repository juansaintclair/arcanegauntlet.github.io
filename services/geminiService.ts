import { LevelGenerationResponse } from '../types';

// This list ensures the AI generates monsters for which we have sprites.
const monsterSpriteTypes = [
    'goblin', 'skeleton', 'slime', 'bat', 'orc', 'undead', 'beast', 'demon'
];

const generateBossPrompt = `
Generate a theme for a dungeon level that is a boss arena, and a single, powerful boss monster for a fantasy roguelike game.
Give the boss an epic name and a fitting description.
The boss's 'spriteType' MUST be one of the following: ${monsterSpriteTypes.join(', ')}.

Provide the response as a JSON object with this exact structure:
{
  "theme": "string",
  "monsters": [
    { "name": "string", "spriteType": "string", "description": "string", "isBoss": true }
  ]
}

Example:
{
  "theme": "The Obsidian Throne Room",
  "monsters": [
    {
      "name": "Gorgon, the Stone-Hearted King",
      "spriteType": "demon",
      "description": "A colossal demon king whose gaze turns heroes to dust. He sits imóvel on a throne of black glass.",
      "isBoss": true
    }
  ]
}
`;

const generateStandardPrompt = `
Generate a unique and imaginative theme for a new dungeon level for a fantasy roguelike game.
Also, create two distinct monster types that would inhabit this level.
The monster's 'spriteType' MUST be one of the following: ${monsterSpriteTypes.join(', ')}.

Provide the response as a JSON object with this exact structure:
{
  "theme": "string",
  "monsters": [
    { "name": "string", "spriteType": "string", "description": "string" },
    { "name": "string", "spriteType": "string", "description": "string" }
  ]
}
`;


export const generateLevelWithAI = async (isBossLevel: boolean): Promise<LevelGenerationResponse> => {
    const prompt = isBossLevel ? generateBossPrompt : generateStandardPrompt;
    
    try {
        const proxyResponse = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        const data = await proxyResponse.json();

        if (!proxyResponse.ok) {
            console.error("API Proxy Error:", data.error);
            // Re-throw in a format the calling service expects
            throw { error: data.error };
        }

        const text = data.text;
        if (!text) {
             throw new Error("Invalid response from API proxy: missing text.");
        }

        let jsonStr = text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr) as LevelGenerationResponse;

        // Validation logic remains the same
        if (
            !parsedData.theme ||
            !Array.isArray(parsedData.monsters) ||
            parsedData.monsters.length < 1 ||
            !parsedData.monsters.every(m => m.name && m.spriteType && m.description && monsterSpriteTypes.includes(m.spriteType))
        ) {
            console.error("AI response validation failed. Structure is incorrect.", parsedData);
            throw new Error("Invalid data structure from AI.");
        }
        
        if (isBossLevel && (!parsedData.monsters[0].isBoss || parsedData.monsters.length !== 1)) {
            console.error("AI response for boss level is invalid.", parsedData);
            throw new Error("Invalid boss data from AI.");
        }

        return parsedData;

    } catch(e) {
        console.error("Failed to generate level content with AI:", e);
        // The calling function will handle this error and use a fallback.
        throw e;
    }
};
