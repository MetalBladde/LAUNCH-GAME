// Types of moves
const MoveType = {
    ATTACK: "attack",
    DEFENSE: "defense",
    SPECIAL: "special"
  };
  
  // Arrow directions
  const ArrowDirection = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
  };
  
  // Define Move class
  class Move {
    constructor(id, name, type, basePower, notes, description, cooldown, speedModifier, element) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.basePower = basePower;
      this.notes = notes; // Array of {direction, timing} objects
      this.description = description;
      this.cooldown = cooldown;
      this.speedModifier = speedModifier;
      this.element = element;
    }
  
    // Get theme color class for the move
    get themeColor() {
      return `${this.element}-theme`;
    }
  
    // Get the symbol for the move based on type and element
    get symbol() {
      const symbols = {
        attack: {
          fire: "🔥",
          water: "💧",
          earth: "🪨",
          wind: "💨",
          electric: "⚡",
          nature: "🌿",
          ice: "❄️",
          shadow: "👤",
          light: "✨",
          boss: "👑"
        },
        defense: {
          fire: "🛡️",
          water: "🛡️",
          earth: "🛡️",
          wind: "🛡️",
          electric: "🛡️",
          nature: "🛡️",
          ice: "🛡️",
          shadow: "🛡️",
          light: "🛡️",
          boss: "🛡️"
        },
        special: {
          fire: "💥",
          water: "🌊",
          earth: "🏔️",
          wind: "🌪️",
          electric: "⚡",
          nature: "🌲",
          ice: "❄️",
          shadow: "🌑",
          light: "☀️",
          boss: "⏱️"
        }
      };
      
      return symbols[this.type][this.element] || "❓";
    }
  
    // Return a visual representation of the note pattern
    getPatternDisplay() {
      return this.notes.map(note => {
        switch(note.direction) {
          case ArrowDirection.UP: return "↑";
          case ArrowDirection.DOWN: return "↓";
          case ArrowDirection.LEFT: return "←";
          case ArrowDirection.RIGHT: return "→";
          default: return "?";
        }
      });
    }
  }
  
  // Define all moves
  const moves = [
    // Basic Moves (available to all characters)
    new Move(
      1,
      "Flame Strike",
      MoveType.ATTACK,
      8,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 500 },
        { direction: ArrowDirection.DOWN, timing: 1000 }
      ],
      "A fiery attack that deals moderate damage.",
      0,
      1.0,
      "fire"
    ),
    new Move(
      2,
      "Water Pulse",
      MoveType.ATTACK,
      7,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 500 },
        { direction: ArrowDirection.LEFT, timing: 1000 }
      ],
      "A pulsing water attack with moderate damage.",
      0,
      1.1,
      "water"
    ),
    new Move(
      3,
      "Boulder Crush",
      MoveType.ATTACK,
      10,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 600 },
        { direction: ArrowDirection.UP, timing: 1200 }
      ],
      "A powerful but slow earth attack.",
      1,
      0.8,
      "earth"
    ),
    new Move(
      4,
      "Wind Slice",
      MoveType.ATTACK,
      6,
      [
        { direction: ArrowDirection.RIGHT, timing: 0 },
        { direction: ArrowDirection.LEFT, timing: 400 },
        { direction: ArrowDirection.RIGHT, timing: 800 }
      ],
      "A quick wind attack that can be used frequently.",
      0,
      1.3,
      "wind"
    ),
    // Defensive Moves
    new Move(
      5,
      "Flame Shield",
      MoveType.DEFENSE,
      5,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.UP, timing: 500 }
      ],
      "Creates a shield of fire that reduces incoming damage.",
      1,
      1.0,
      "fire"
    ),
    new Move(
      6,
      "Water Barrier",
      MoveType.DEFENSE,
      6,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 500 }
      ],
      "Forms a water barrier that absorbs damage.",
      1,
      1.0,
      "water"
    ),
    new Move(
      7,
      "Stone Wall",
      MoveType.DEFENSE,
      8,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 600 },
        { direction: ArrowDirection.LEFT, timing: 1200 }
      ],
      "Creates a solid wall of stone for strong protection.",
      2,
      0.8,
      "earth"
    ),
    new Move(
      8,
      "Wind Deflection",
      MoveType.DEFENSE,
      4,
      [
        { direction: ArrowDirection.RIGHT, timing: 0 },
        { direction: ArrowDirection.LEFT, timing: 300 }
      ],
      "Uses wind to deflect incoming attacks. Quick but less powerful.",
      0,
      1.4,
      "wind"
    ),
    // Special Moves - Fire
    new Move(
      9,
      "Inferno Blast",
      MoveType.SPECIAL,
      12,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 400 },
        { direction: ArrowDirection.DOWN, timing: 800 },
        { direction: ArrowDirection.LEFT, timing: 1200 }
      ],
      "A devastating fire attack that deals massive damage.",
      3,
      0.9,
      "fire"
    ),
    // Special Moves - Water
    new Move(
      10,
      "Tsunami Wave",
      MoveType.SPECIAL,
      11,
      [
        { direction: ArrowDirection.RIGHT, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 400 },
        { direction: ArrowDirection.LEFT, timing: 800 },
        { direction: ArrowDirection.LEFT, timing: 1200 }
      ],
      "Summons a massive wave that crashes into the opponent.",
      2,
      0.9,
      "water"
    ),
    // Special Moves - Earth
    new Move(
      11,
      "Seismic Slam",
      MoveType.SPECIAL,
      14,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 500 },
        { direction: ArrowDirection.UP, timing: 1000 },
        { direction: ArrowDirection.UP, timing: 1500 }
      ],
      "Slams the ground to create a devastating earthquake.",
      3,
      0.7,
      "earth"
    ),
    // Special Moves - Wind
    new Move(
      12,
      "Cyclone Strike",
      MoveType.SPECIAL,
      10,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.UP, timing: 300 },
        { direction: ArrowDirection.RIGHT, timing: 600 },
        { direction: ArrowDirection.DOWN, timing: 900 }
      ],
      "Creates a cyclone that hits multiple times.",
      2,
      1.2,
      "wind"
    ),
    // Special Moves - Electric
    new Move(
      13,
      "Thunder Strike",
      MoveType.ATTACK,
      9,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 400 },
        { direction: ArrowDirection.UP, timing: 800 }
      ],
      "A powerful electric strike that can paralyze the opponent.",
      1,
      1.1,
      "electric"
    ),
    // Additional moves
    new Move(
      14,
      "Vine Whip",
      MoveType.ATTACK,
      7,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 400 },
        { direction: ArrowDirection.LEFT, timing: 800 }
      ],
      "Strikes with vines for moderate damage.",
      0,
      1.0,
      "nature"
    ),
    new Move(
      15,
      "Frost Bite",
      MoveType.ATTACK,
      8,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 500 },
        { direction: ArrowDirection.UP, timing: 1000 }
      ],
      "A freezing attack that slows the opponent.",
      1,
      0.9,
      "ice"
    ),
    new Move(
      16,
      "Shadow Strike",
      MoveType.ATTACK,
      8,
      [
        { direction: ArrowDirection.RIGHT, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 400 },
        { direction: ArrowDirection.LEFT, timing: 800 }
      ],
      "A strike from the shadows that's hard to predict.",
      1,
      1.1,
      "shadow"
    ),
    new Move(
      17,
      "Lightning Shield",
      MoveType.DEFENSE,
      5,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 400 }
      ],
      "Creates an electric barrier that can shock attackers.",
      1,
      1.2,
      "electric"
    ),
    new Move(
      18,
      "Thorny Armor",
      MoveType.DEFENSE,
      6,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 500 }
      ],
      "Covers in thorns that damage attackers.",
      1,
      0.9,
      "nature"
    ),
    new Move(
      19,
      "Ice Armor",
      MoveType.DEFENSE,
      7,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.UP, timing: 500 }
      ],
      "Forms a layer of ice that reduces damage.",
      1,
      0.9,
      "ice"
    ),
    new Move(
      20,
      "Shadow Veil",
      MoveType.DEFENSE,
      5,
      [
        { direction: ArrowDirection.RIGHT, timing: 0 },
        { direction: ArrowDirection.LEFT, timing: 400 }
      ],
      "Creates a veil of shadows that makes attacks miss.",
      1,
      1.1,
      "shadow"
    ),
    new Move(
      21,
      "Thunder Storm",
      MoveType.SPECIAL,
      12,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.LEFT, timing: 300 },
        { direction: ArrowDirection.DOWN, timing: 600 },
        { direction: ArrowDirection.RIGHT, timing: 900 }
      ],
      "Summons a storm of lightning for heavy damage.",
      3,
      1.0,
      "electric"
    ),
    new Move(
      22,
      "Natural Fury",
      MoveType.SPECIAL,
      11,
      [
        { direction: ArrowDirection.DOWN, timing: 0 },
        { direction: ArrowDirection.LEFT, timing: 400 },
        { direction: ArrowDirection.UP, timing: 800 },
        { direction: ArrowDirection.RIGHT, timing: 1200 }
      ],
      "Unleashes nature's fury in an explosive attack.",
      2,
      0.9,
      "nature"
    ),
    new Move(
      23,
      "Blizzard",
      MoveType.SPECIAL,
      13,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.UP, timing: 400 },
        { direction: ArrowDirection.DOWN, timing: 800 },
        { direction: ArrowDirection.DOWN, timing: 1200 }
      ],
      "Summons a freezing blizzard for heavy damage.",
      3,
      0.8,
      "ice"
    ),
    new Move(
      24,
      "Void Collapse",
      MoveType.SPECIAL,
      12,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 350 },
        { direction: ArrowDirection.LEFT, timing: 700 },
        { direction: ArrowDirection.RIGHT, timing: 1050 }
      ],
      "Collapses shadows into a void for massive damage.",
      3,
      1.0,
      "shadow"
    ),
    new Move(
      25,
      "Solar Beam",
      MoveType.ATTACK,
      9,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 500 },
        { direction: ArrowDirection.DOWN, timing: 1000 }
      ],
      "Fires a concentrated beam of solar energy.",
      1,
      0.9,
      "light"
    ),
    new Move(
      26,
      "Light Shield",
      MoveType.DEFENSE,
      6,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.UP, timing: 500 }
      ],
      "Creates a barrier of light that reduces damage.",
      1,
      1.0,
      "light"
    ),
    new Move(
      27,
      "Solar Flare",
      MoveType.SPECIAL,
      12,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 400 },
        { direction: ArrowDirection.LEFT, timing: 800 },
        { direction: ArrowDirection.DOWN, timing: 1200 }
      ],
      "Unleashes a blinding flare of solar energy.",
      2,
      1.0,
      "light"
    ),
    // Boss Special Moves
    new Move(
      28,
      "Time Stop",
      MoveType.SPECIAL,
      15,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.RIGHT, timing: 300 },
        { direction: ArrowDirection.DOWN, timing: 600 },
        { direction: ArrowDirection.LEFT, timing: 900 },
        { direction: ArrowDirection.UP, timing: 1200 }
      ],
      "Freezes time to deliver a devastating attack.",
      3,
      1.0,
      "boss"
    ),
    new Move(
      29,
      "Reality Warp",
      MoveType.SPECIAL,
      16,
      [
        { direction: ArrowDirection.LEFT, timing: 0 },
        { direction: ArrowDirection.UP, timing: 250 },
        { direction: ArrowDirection.RIGHT, timing: 500 },
        { direction: ArrowDirection.DOWN, timing: 750 },
        { direction: ArrowDirection.LEFT, timing: 1000 },
        { direction: ArrowDirection.UP, timing: 1250 }
      ],
      "Warps reality to hit from multiple angles at once.",
      4,
      0.9,
      "boss"
    ),
    new Move(
      30,
      "Dimensional Collapse",
      MoveType.SPECIAL,
      20,
      [
        { direction: ArrowDirection.UP, timing: 0 },
        { direction: ArrowDirection.DOWN, timing: 300 },
        { direction: ArrowDirection.LEFT, timing: 600 },
        { direction: ArrowDirection.RIGHT, timing: 900 },
        { direction: ArrowDirection.UP, timing: 1200 },
        { direction: ArrowDirection.DOWN, timing: 1500 }
      ],
      "Collapses dimensions to deal catastrophic damage.",
      5,
      0.7,
      "boss"
    )
  ];
  
  // Helper function to get move by ID
  function getMoveById(id) {
    return moves.find(move => move.id === id);
  }
  
  // Helper function to get moves for a character
  function getMovesForCharacter(characterId) {
    const character = getCharacterById(characterId);
    if (!character) return [];
    
    // Return the special moves for this character
    return character.specialMoves.map(moveId => getMoveById(moveId)).filter(Boolean);
  }