// Define character types and their theme colors
const characterTypes = {
  fire: { 
    color: 'fire-theme', 
    image: 'Assets/fire.jpg'  // Path now points to your assets folder
  },
  water: { 
    color: 'water-theme', 
    image: 'Assets/water.png' 
  },
  earth: { 
    color: 'earth-theme', 
    image: 'Assets/earth.png' 
  },
  wind: { 
    color: 'wind-theme', 
    image: 'Assets/wind.png' 
  },
  electric: { 
    color: 'electric-theme', 
    image: 'Assets/electric.png' 
  },
  nature: { 
    color: 'nature-theme', 
    image: 'Assets/nature.png' 
  },
  ice: { 
    color: 'ice-theme', 
    image: 'Assets/ice.png' 
  },
  shadow: { 
    color: 'shadow-theme', 
    image: 'Assets/shadow.png' 
  },
  light: { 
    color: 'light-theme', 
    image: 'Assets/light.png' 
  },
  boss: { 
    color: 'boss-theme', 
    image: 'Assets/boss.png' 
  }
};
  
  // Character stats
  class CharacterStats {
    constructor(id, name, health, attack, defense, speed, isUnlocked, isBoss, type, specialMoves, description, customSprite = null) {
      this.id = id;
      this.name = name;
      this.health = health;
      this.attack = attack;
      this.defense = defense;
      this.speed = speed;
      this.isUnlocked = isUnlocked;
      this.isBoss = isBoss;
      this.type = type;
      this.specialMoves = specialMoves;
      this.description = description;
      this.customSprite = customSprite; // URL or data URL for custom sprite image
    }
  
    // Get character theme color class
    get themeColor() {
      return characterTypes[this.type].color;
    }
  
    // Get character icon symbol
    get symbol() {
      return characterTypes[this.type].symbol;
    }
  }
  
  // Define all characters
  const characters = [
    new CharacterStats(
      1,
      "Pyro",
      100,
      9,
      5,
      7,
      true,
      false,
      "fire",
      [1, 5, 9],
      "A fiery panda with powerful flame attacks.",
      "Assets/fire.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      2,
      "Crocs",
      90,
      7,
      8,
      8,
      true,
      false,
      "water",
      [2, 6, 10],
      "A fluid crocodile who specializes in water techniques.",
      "Assets/water.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      3,
      "Terra",
      120,
      10,
      9,
      4,
      true,
      false,
      "earth",
      [3, 7, 11],
      "A solid earth-wielder with high defense and strength.",
      "Assets/earth.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      4,
      "Aero",
      80,
      6,
      5,
      10,
      true,
      false,
      "wind",
      [4, 8, 12],
      "The fastest falcon who uses wind to dodge and attack.",
      "Assets/wind.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      5,
      "Bolt",
      85,
      8,
      6,
      9,
      true,
      false,
      "electric",
      [13, 17, 21],
      "A shocking fox with unpredictable electric attacks.",
      "Assets/electric.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      6,
      "Flora",
      95,
      7,
      7,
      7,
      true,
      false,
      "nature",
      [14, 18, 22],
      "A natural badger who uses plants and vines in battle.",
      "Assets/nature.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      7,
      "Froxy",
      110,
      8,
      8,
      5,
      true,
      false,
      "ice",
      [15, 19, 23],
      "A cold kitsune who freezes opponents with ice techniques.",
      "Assets/ice.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      8,
      "Shade",
      90,
      9,
      6,
      8,
      true,
      false,
      "shadow",
      [16, 20, 24],
      "A mysterious panther who uses shadow powers.",
      "Assets/shadow.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      9,
      "Lux",
      100,
      8,
      7,
      8,
      true,
      false,
      "light",
      [25, 26, 27],
      "An eye-catching butterfly who harnesses the power of light.",
      "Assets/light.jpg"  // Relative path to your image
    ),
    new CharacterStats(
      10,
      "Chronos",
      150,
      12,
      10,
      6,
      false,
      true,
      "boss",
      [28, 29, 30],
      "The master of time and space, a formidable final boss.",
      "Assets/boss.jpg"  // Relative path to your image
    ),
  ];
  
  // Helper function to get character by ID
  function getCharacterById(id) {
    return characters.find(character => character.id === id);
  }
  
  // Helper function to get playable characters (excluding boss)
  function getPlayableCharacters() {
    return characters.filter(character => character.isUnlocked && !character.isBoss);
  }
  
  // Helper function to get boss character
  function getBossCharacter() {
    return characters.find(character => character.isBoss);
  }