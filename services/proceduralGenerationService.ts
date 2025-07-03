import { LevelGenerationResponse, ProceduralMonster } from '../types';

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

const generateProceduralContent = (isBossLevel: boolean): LevelGenerationResponse => {
    console.log(`Using procedural generation. Boss level: ${isBossLevel}`);
    
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


export const generateLevelContent = (isBossLevel: boolean): LevelGenerationResponse => {
    // The AI call has been removed. We now directly and reliably call the procedural generator.
    return generateProceduralContent(isBossLevel);
};
