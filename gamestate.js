// Game phases
const GamePhase = {
  MENU: 'menu',
  CHARACTER_SELECTION: 'character_selection',
  MOVE_SELECTION: 'move_selection',
  RHYTHM_PHASE: 'rhythm_phase',
  ATTACK_PHASE: 'attack_phase',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

// Player class to track character, health, and moves
class Player {
  constructor(character) {
    this.character = character;
    this.currentHealth = character ? character.health : 0;
    this.selectedMoves = [];
    this.moveResults = [];
    this.roundsWon = 0;
  }

  // Reset player's moves for next round
  resetMoves() {
    this.selectedMoves = [];
    this.moveResults = [];
  }
  
  // Check if player is defeated (health at 0)
  isDefeated() {
    return this.currentHealth <= 0;
  }

  // Set player's health to full
  resetHealth() {
    this.currentHealth = this.character.health;
  }
}

// Game state class
class GameState {
  constructor() {
    this.phase = GamePhase.MENU;
    this.currentRound = 1;
    this.maxRounds = 10; // 9 regular rounds + 1 boss round
    this.player = new Player(null);
    this.opponent = new Player(null);
    this.isBossRound = false;
    this.winner = null;
  }

  // Initialize a new game with the selected character
  initializeGame(playerCharacterId) {
    const playerCharacter = getCharacterById(playerCharacterId);
    if (!playerCharacter) {
      throw new Error(`Invalid character ID: ${playerCharacterId}`);
    }
    
    // For the first round, select a random non-boss opponent
    const availableOpponents = Array.from(
      { length: 9 },
      (_, i) => i + 1
    ).filter(id => id !== playerCharacterId);
    
    const opponentId = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
    const opponentCharacter = getCharacterById(opponentId);
    
    if (!opponentCharacter) {
      throw new Error(`Invalid opponent ID: ${opponentId}`);
    }
    
    this.phase = GamePhase.MOVE_SELECTION;
    this.currentRound = 1;
    this.isBossRound = false;
    this.winner = null;
    
    this.player = new Player(playerCharacter);
    this.opponent = new Player(opponentCharacter);
    
    return this;
  }

  // Select moves for the player
  selectPlayerMoves(moveIds) {
    const selectedMoves = moveIds.map(id => getMoveById(id)).filter(Boolean);
    this.player.selectedMoves = selectedMoves;
    this.player.moveResults = [];
    
    return this;
  }

  // Select moves for the AI opponent
  selectOpponentMoves() {
    const opponentMoves = [];
    const availableMoves = this.opponent.character.specialMoves
      .map(id => getMoveById(id))
      .filter(Boolean);
    
    // AI selects 3 random moves from available moves
    while (opponentMoves.length < 3 && availableMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      opponentMoves.push(availableMoves[randomIndex]);
      availableMoves.splice(randomIndex, 1);
    }
    
    this.opponent.selectedMoves = opponentMoves;
    this.opponent.moveResults = [];
    this.phase = GamePhase.RHYTHM_PHASE;
    
    return this;
  }

  // Record the results of a move for the player
  recordPlayerMoveResult(moveIndex, success, timing) {
    const move = this.player.selectedMoves[moveIndex];
    if (!move) return this;
    
    const damage = this.calculateDamage(move, timing, this.player.character, this.opponent.character);
    
    const moveResults = [...this.player.moveResults];
    moveResults[moveIndex] = { moveId: move.id, success, timing, damage };
    
    this.player.moveResults = moveResults;
    
    return this;
  }

  // Generate AI opponent move results
  generateOpponentMoveResults() {
    const moveResults = this.opponent.selectedMoves.map(move => {
      // Boss has higher success rate
      const successChance = this.opponent.character.isBoss ? 0.9 : 0.7;
      const success = Math.random() < successChance;
      
      // Generate a random timing, biased towards better timing for the boss
      const baseTimingMin = this.opponent.character.isBoss ? 70 : 50;
      const timing = baseTimingMin + Math.floor(Math.random() * (100 - baseTimingMin));
      
      const damage = this.calculateDamage(move, timing, this.opponent.character, this.player.character);
      
      return { moveId: move.id, success, timing, damage };
    });
    
    this.opponent.moveResults = moveResults;
    
    return this;
  }

  // Calculate damage based on move power, timing, and character stats
  calculateDamage(move, timing, attacker, defender) {
    if (timing < 20) return 0; // Minimum timing required
    
    // Base damage is move power multiplied by attacker's attack stat
    let baseDamage = move.basePower * (attacker.attack / 10);
    
    // Apply timing multiplier (50% - 100% based on timing)
    const timingMultiplier = 2 + (timing / 200);
    baseDamage *= timingMultiplier;
    
    // Apply defender's defense reduction
    const defenseMultiplier = 1 - (defender.defense / 20);
    baseDamage *= defenseMultiplier;
    
    // For defense moves, reduce the damage (they're more about reducing incoming damage)
    if (move.type === 'defense') {
      baseDamage *= 0.6;
    }
    
    // For special moves, increase the damage
    if (move.type === 'special') {
      baseDamage *= 1.5;
    }
    
    // Apply a small random factor (±10%)
    const randomFactor = 1 + (Math.random() * 0.5);
    baseDamage *= randomFactor;
    
    // Ensure damage is at least 1
    return Math.max(1, Math.round(baseDamage));
  }

  // Process the results of all moves and update health
  processRoundResults() {
    const playerResults = this.player.moveResults;
    const opponentResults = this.opponent.moveResults;
    
    // Calculate total damage from successful moves
    const playerTotalDamage = playerResults
      .filter(result => result && result.success)
      .reduce((sum, result) => sum + result.damage, 0);
    
    const opponentTotalDamage = opponentResults
      .filter(result => result && result.success)
      .reduce((sum, result) => sum + result.damage, 0);
    
    // Calculate player's defense bonus from defensive moves
    const playerDefenseBonus = playerResults
      .filter(result => result && result.success && 
              this.player.selectedMoves[playerResults.indexOf(result)]?.type === "defense")
      .reduce((bonus, result) => bonus + 0.15, 0); // Each successful defense move reduces damage by 15%
    
    const adjustedOpponentDamage = Math.max(0, opponentTotalDamage * (1 - playerDefenseBonus));
    
    // Apply damage to health
    this.player.currentHealth = Math.max(0, this.player.currentHealth - adjustedOpponentDamage);
    this.opponent.currentHealth = Math.max(0, this.opponent.currentHealth - playerTotalDamage);
    
    // Determine round winner - now you must defeat the opponent to win the round
    if (this.player.currentHealth === 0 && this.opponent.currentHealth === 0) {
      // Draw - no one gets a point
    } else if (this.player.currentHealth === 0) {
      this.opponent.roundsWon++;
    } else if (this.opponent.currentHealth === 0) {
      this.player.roundsWon++;
    }
    // If neither health is at 0, the round continues - no winner yet
    
    // Determine if the game is over
    const isGameOver = this.player.roundsWon >= 5 || this.opponent.roundsWon >= 5;
    
    // Determine overall winner
    if (isGameOver) {
      this.winner = this.player.roundsWon > this.opponent.roundsWon ? 'player' : 'opponent';
    }
    
    this.phase = isGameOver ? GamePhase.GAME_OVER : GamePhase.ROUND_END;
    
    return this;
  }

  // Start the next round
  startNextRound() {
    this.currentRound++;
    
    // Regular game has 10 rounds, with the 10th being the boss round
    // After that, we enter endless mode
    const inEndlessMode = this.currentRound > this.maxRounds;
    this.isBossRound = this.currentRound === this.maxRounds;
    
    // If it's the boss round, replace the opponent with the boss
    if (this.isBossRound) {
      const bossCharacter = getBossCharacter();
      this.opponent = new Player(bossCharacter);
      this.opponent.roundsWon = this.opponent.roundsWon; // Maintain rounds won
    } 
    // If we're in endless mode, create progressively harder opponents
    else if (inEndlessMode) {
      // For endless mode, choose a random opponent but make them stronger
      const availableOpponents = Array.from(
        { length: 9 },
        (_, i) => i + 1
      ).filter(id => id !== this.player.character.id);
      
      const opponentId = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
      const opponentCharacter = getCharacterById(opponentId);
      
      if (opponentCharacter) {
        // Create a copy of the character and scale up stats for endless mode
        const endlessCharacter = { ...opponentCharacter };
        const endlessMultiplier = 2 + ((this.currentRound - this.maxRounds) * 0.1); // 10% stronger per level
        
        endlessCharacter.health = Math.round(endlessCharacter.health * endlessMultiplier);
        endlessCharacter.attack = Math.round(endlessCharacter.attack * endlessMultiplier);
        endlessCharacter.defense = Math.round(endlessCharacter.defense * endlessMultiplier);
        endlessCharacter.name = `Enhanced ${endlessCharacter.name}`;
        
        const roundsWon = this.opponent.roundsWon;
        this.opponent = new Player(endlessCharacter);
        this.opponent.roundsWon = roundsWon; // Maintain rounds won
      }
    } 
    // Regular rounds with normal opponents
    else {
      // For regular rounds, choose a new random opponent
      const availableOpponents = Array.from(
        { length: 9 },
        (_, i) => i + 1
      ).filter(id => id !== this.player.character.id && id !== this.opponent.character.id);
      
      const opponentId = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
      const opponentCharacter = getCharacterById(opponentId);
      
      if (opponentCharacter) {
        const roundsWon = this.opponent.roundsWon;
        this.opponent = new Player(opponentCharacter);
        this.opponent.roundsWon = roundsWon; // Maintain rounds won
      }
    }
    
    // Reset player's health and moves
    this.player.resetHealth();
    this.player.resetMoves();
    
    this.phase = GamePhase.MOVE_SELECTION;
    
    return this;
  }
}

// Create a global game state instance
const gameState = new GameState();