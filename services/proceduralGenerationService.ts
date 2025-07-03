import { LevelGenerationResponse, ProceduralMonster } from '../types';
import { generateLevelWithAI } from './geminiService';

// Fallback static generation logic
const themes = {
    locations: ["Crypt", "Cavern", "Dungeon", "Catacombs", "Lair", "Forge", "Mines", "Sewers", "Sanctum", "Ruin"],
    descriptors: ["Forgotten", "Cursed", "Whispering", "Sunken", "Burning", "Frozen", "Haunted", "Shadowy"],
    inhabitants: ["Goblins", "Skeletons", "the Fire Lord", "the Slime King", "Lost Souls", "Mad Dwarves", "Giant Spiders", "the Blind Cult"],
    bossArenas: ["Throne Room", "Sacrificial Chamber", "Infernal Core", "Glacial Tomb", "Primal Nest"],
    bossTitles: ["the Undying", "the All-Consuming", "of the Abyss", "the Ageless", "the Chaos-Bringer"],
};

const monsterTemplates = {
    goblin: { names: ["Snitch", "Grub", "Stabber", "Piker"], descriptors: ["Grimy", "Sneaky", "Frenzied", "Cowardly"] },
    skeleton: { names: ["Archer", "Warrior", "Mage", "Guard"], descriptors: ["Brittle", "Ancient", "Hollow", "Restless"] },
    slime: { names: ["Ooze", "Jelly", "Glob", "Puddle"], descriptors: ["Corrosive", "Bubbling", "Amorphous", "Glistening"] },
    bat: { names: ["Screecher", "Cavern", "Vampire", "Blood"], descriptors: ["Giant", "Diseased", "Nocturnal", "Fanged"] },
    orc: { names: ["Berserker", "Smasher", "Chieftain", "Scout"], descriptors: ["Savage", "Armored", "Brutish", "Green-skinned"] },
    undead: { names: ["Zombie", "Ghoul", "Wraith", "Specter"], descriptors: ["Mindless", "Moaning", "Spectral", "Rotting"] },
    beast: { names: ["Cave Bear", "Dire Wolf", "Rock Lizard", "Giant Rat"], descriptors: ["Ferocious", "Giant", "Monstrous", "Rabid"] },
    demon: { names: ["Imp", "Fiend", "Spined Devil", "Quasit"], descriptors: ["Lesser", "Flaming", "Shadow", "Cackling"] },
};

type MonsterSpriteType = keyof typeof monsterTemplates;
const spriteTypes = Object.keys(monsterTemplates) as MonsterSpriteType[];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateFallbackContent = (isBossLevel: boolean): LevelGenerationResponse => {
    console.warn(`Falling back to static procedural generation. Boss level: ${isBossLevel}`);
    
    if (isBossLevel) {
        const arena = getRandomElement(themes.bossArenas);
        const title = getRandomElement(themes.bossTitles);
        const theme = `The ${arena} of ${title}`;
        
        const spriteType = getRandomElement(spriteTypes);
        const monsterName = `${spriteType.charAt(0).toUpperCase() + spriteType.slice(1)} Lord ${title}`;
        const description = `The ultimate guardian of this domain. It radiates immense power.`;

        const monsters: ProceduralMonster[] = [{
            name: monsterName,
            spriteType,
            description,
            isBoss: true
        }];

        return { theme, monsters };
    }

    const location = getRandomElement(themes.locations);
    const descriptor = getRandomElement(themes.descriptors);
    const inhabitant = getRandomElement(themes.inhabitants);
    const theme = `The ${descriptor} ${location} of ${inhabitant}`;

    const chosenSpriteTypes = new Set<MonsterSpriteType>();
    while (chosenSpriteTypes.size < 2) {
        chosenSpriteTypes.add(getRandomElement(spriteTypes));
    }

    const monsters: ProceduralMonster[] = Array.from(chosenSpriteTypes).map(spriteType => {
        const template = monsterTemplates[spriteType];
        const monsterNamePart = getRandomElement(template.names);
        const monsterDescriptor = getRandomElement(template.descriptors);

        const name = `${monsterDescriptor} ${spriteType.charAt(0).toUpperCase() + spriteType.slice(1)} ${monsterNamePart}`;
        const description = `A ${monsterDescriptor.toLowerCase()} ${spriteType} that roams these halls.`;

        return {
            name,
            spriteType,
            description,
        };
    });

    return { theme, monsters };
};


export const generateLevelContent = async (isBossLevel: boolean): Promise<LevelGenerationResponse> => {
    try {
        const aiResponse = await generateLevelWithAI(isBossLevel);
        return aiResponse;
    } catch (error: any) {
        // This robust error handling gracefully catches issues from the API proxy
        // (like quota limits, server errors, or network issues) and falls back.
        const isQuotaError = error?.error?.status === 'RESOURCE_EXHAUSTED' || error?.error?.code === 429;
        
        if (isQuotaError) {
            console.warn(
                "AI quota has been reached. This is normal after many uses.\n" +
                "The game will now use its built-in generator, so the adventure continues!"
            );
        } else {
            console.error("An unexpected AI error occurred, using fallback content.", error);
        }
        
        return generateFallbackContent(isBossLevel);
    }
};
