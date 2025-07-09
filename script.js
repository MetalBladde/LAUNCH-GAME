// DOM elements
const screenElements = {
  menu: document.getElementById('menu-screen'),
  characterSelect: document.getElementById('character-select-screen'),
  battle: document.getElementById('battle-screen'),
  gameOver: document.getElementById('game-over-screen')
};

const battlePhases = {
  moveSelection: document.getElementById('move-selection'),
  rhythmPhase: document.getElementById('rhythm-phase'),
  roundEnd: document.getElementById('round-end')
};

// Audio elements
const bgMusic = document.getElementById('bgm');
const hitSound = document.getElementById('hit-sound');
const successSound = document.getElementById('success-sound');
const damageSound = document.getElementById('damage-sound');
const victorySound = document.getElementById('victory-sound');
const defeatSound = document.getElementById('defeat-sound');
const selectSound = document.getElementById('select-sound');
const buttonSound = document.getElementById('button-sound');
const opponentTurnSound = document.getElementById('opponent-turn-sound');

// Game variables
let selectedCharacter = null;
let selectedMoves = [];
let currentMoveIndex = 0;
let animationFrameId = null;
let isTrackComplete = false;
let notes = [];
let startTime = 0;
let trackTime = 0;
let keyPressed = null;

// Constants for rhythm game
const TRACK_WIDTH = 600;
const TRACK_HEIGHT = 120;
const NOTE_SIZE = 60;
const NOTE_SPEED = 5; // Base speed in pixels per frame
const PERFECT_ZONE_SIZE = 100; // Increased from 70 to make it easier to hit
const TARGET_ZONE_X = TRACK_WIDTH - 100;

// Initialize game
function initializeGame() {
  // Set up event listeners
  document.getElementById('start-button').addEventListener('click', startGame);
  document.getElementById('tutorial-button').addEventListener('click', showTutorial);
  document.getElementById('back-button').addEventListener('click', hideTutorial);
  document.getElementById('select-character-button').addEventListener('click', selectCharacter);
  document.getElementById('confirm-moves-button').addEventListener('click', confirmMoves);
  document.getElementById('next-round-button').addEventListener('click', startNextRound);
  document.getElementById('continue-button').addEventListener('click', () => {
    // Reset moves and start another rhythm sequence
    gameState.player.resetMoves();
    gameState.opponent.resetMoves();
    showBattlePhase('moveSelection');
    loadMoves();
  });
  document.getElementById('play-again-button').addEventListener('click', playAgain);
  document.getElementById('main-menu-button').addEventListener('click', returnToMenu);

  // Set up keyboard event listener for rhythm game
  window.addEventListener('keydown', handleKeyDown);

  // Load characters into the character selection screen
  loadCharacters();

  // Initialize background music
  bgMusic.volume = 0.3;

  // Show the menu screen
  showScreen('menu');
}

// Show the tutorial panel
function showTutorial() {
  document.getElementById('tutorial').classList.remove('hidden');
}

// Hide the tutorial panel
function hideTutorial() {
  document.getElementById('tutorial').classList.add('hidden');
}

// Start a new game
function startGame() {
  // Play background music
  bgMusic.play().catch(error => console.log("Audio couldn't autoplay:", error));

  // Move to character selection screen
  showScreen('characterSelect');
}

// Load all playable characters
function loadCharacters() {
  const characterGrid = document.getElementById('character-grid');
  characterGrid.innerHTML = '';
  
  const playableCharacters = getPlayableCharacters();
  
  playableCharacters.forEach(character => {
    const characterCard = document.createElement('div');
    characterCard.className = 'character-card';
    characterCard.dataset.characterId = character.id;
    
    // Create the character card content
    const cardHeader = document.createElement('div');
    cardHeader.className = 'character-card-header';
    cardHeader.innerHTML = `
      <h3>${character.name}</h3>
      <span>${character.type.charAt(0).toUpperCase() + character.type.slice(1)}</span>
    `;
    
    const description = document.createElement('p');
    description.textContent = character.description;
    
    // Create character icon with sprite support
    const characterIcon = document.createElement('div');
    characterIcon.className = `character-icon ${character.themeColor}`;
    
    // Check if character has a custom sprite
    if (character.customSprite) {
      // Create an img element for the sprite
      const spriteImg = document.createElement('img');
      spriteImg.src = character.customSprite;
      spriteImg.alt = character.name;
      spriteImg.className = 'character-sprite';
      characterIcon.appendChild(spriteImg);
      
      // Create a div for the symbol that will overlay the sprite
      const symbolDiv = document.createElement('div');
      symbolDiv.className = 'icon-symbol';
      symbolDiv.textContent = character.symbol;
      characterIcon.appendChild(symbolDiv);
    } else {
      // No sprite, just show the symbol
      characterIcon.textContent = character.symbol;
    }
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'character-stats';
    statsDiv.innerHTML = `
      <div>HP: ${character.health}</div>
      <div>ATK: ${character.attack}</div>
      <div>DEF: ${character.defense}</div>
      <div>SPD: ${character.speed}</div>
    `;
    
    // Append all elements to the card
    characterCard.appendChild(cardHeader);
    characterCard.appendChild(description);
    characterCard.appendChild(characterIcon);
    characterCard.appendChild(statsDiv);
    
    characterCard.addEventListener('click', () => {
      // Remove selection from all cards
      document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Add selection to clicked card
      characterCard.classList.add('selected');
      
      // Enable select button
      document.getElementById('select-character-button').disabled = false;
      
      // Store selected character
      selectedCharacter = character;
    });
    
    characterGrid.appendChild(characterCard);
  });
}

// Select a character and start the game
function selectCharacter() {
  if (!selectedCharacter) return;
  
  // Initialize game state with selected character
  gameState.initializeGame(selectedCharacter.id);
  
  // Update battle UI
  updateBattleUI();
  
  // Show battle screen with move selection phase
  showScreen('battle');
  showBattlePhase('moveSelection');
  
  // Load available moves
  loadMoves();
}

// Load moves for the selected character
function loadMoves() {
  const movesGrid = document.getElementById('available-moves-grid');
  movesGrid.innerHTML = '';
  
  // Reset selected moves
  selectedMoves = [];
  document.getElementById('selected-count').textContent = '0';
  updateSelectedMovesDisplay();
  document.getElementById('confirm-moves-button').disabled = true;
  
  // Get moves for the character
  const characterMoves = getMovesForCharacter(gameState.player.character.id);
  
  characterMoves.forEach(move => {
    const moveCard = document.createElement('div');
    moveCard.className = 'move-card';
    moveCard.dataset.moveId = move.id;
    
    moveCard.innerHTML = `
      <div class="move-card-header">
        <h3>${move.name}</h3>
        <div class="move-icon ${move.themeColor}">${move.symbol}</div>
      </div>
      <p class="move-description">${move.description}</p>
      <div class="move-stats">
        <div>Type: <span class="highlight">${move.type}</span></div>
        <div>Power: <span class="highlight">${move.basePower}</span></div>
        <div>Speed: <span class="highlight">${move.speedModifier.toFixed(1)}x</span></div>
        <div>Cooldown: <span class="highlight">${move.cooldown} turns</span></div>
      </div>
      <div class="move-pattern">
        <div class="move-pattern-label">Rhythm Pattern:</div>
        <div class="pattern-display">
          ${move.getPatternDisplay().map(arrow => `<div class="pattern-arrow">${arrow}</div>`).join('')}
        </div>
      </div>
    `;
    
    moveCard.addEventListener('click', () => {
      toggleMoveSelection(move, moveCard);
    });
    
    movesGrid.appendChild(moveCard);
  });
}

// Toggle move selection
function toggleMoveSelection(move, moveCard) {
  const isMoveSelected = selectedMoves.findIndex(m => m.id === move.id) !== -1;
  
  if (isMoveSelected) {
    // If already selected, remove it
    selectedMoves = selectedMoves.filter(m => m.id !== move.id);
    moveCard.classList.remove('selected');
  } else if (selectedMoves.length < 3) {
    // If not selected and we have less than 3, add it
    selectedMoves.push(move);
    moveCard.classList.add('selected');
  }
  
  // Update selected moves display
  document.getElementById('selected-count').textContent = selectedMoves.length;
  updateSelectedMovesDisplay();
  
  // Enable/disable confirm button
  document.getElementById('confirm-moves-button').disabled = selectedMoves.length !== 3;
}

// Update the display of selected moves
function updateSelectedMovesDisplay() {
  const moveSlotsContainer = document.getElementById('selected-moves-display');
  const moveSlots = moveSlotsContainer.children;
  
  for (let i = 0; i < 3; i++) {
    const move = selectedMoves[i];
    const slot = moveSlots[i];
    
    if (move) {
      slot.className = 'move-slot';
      slot.innerHTML = `
        <div class="move-icon ${move.themeColor}">${move.symbol}</div>
        <span>${move.name}</span>
      `;
    } else {
      slot.className = 'move-slot empty';
      slot.textContent = 'Empty';
    }
  }
}

// Confirm move selection and start rhythm phase
function confirmMoves() {
  if (selectedMoves.length !== 3) return;
  
  // Update game state with selected moves
  gameState.selectPlayerMoves(selectedMoves.map(move => move.id));
  gameState.selectOpponentMoves();
  
  // Reset current move index
  currentMoveIndex = 0;
  
  // Start the rhythm phase
  showBattlePhase('rhythmPhase');
  
  // Start countdown before rhythm game
  startRhythmCountdown();
}

// Start countdown before rhythm game
function startRhythmCountdown() {
  const countdownElement = document.getElementById('countdown');
  const countdownSound = document.getElementById('countdown-sound');
  countdownElement.textContent = '3';
  countdownElement.classList.remove('hidden');
  
  let count = 3;
  countdownSound.play(); // Play initial countdown sound
  
  const countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval);
      countdownElement.classList.add('hidden');
      startRhythmGame();
    } else {
      countdownElement.textContent = count;
      countdownSound.currentTime = 0;
      countdownSound.play(); // Play sound for each number
    }
  }, 1000);
}

// Start the rhythm game for the current move
function startRhythmGame() {
  // Get current move
  const currentMove = gameState.player.selectedMoves[currentMoveIndex];
  
  // Update move name display
  document.getElementById('current-move-name').textContent = currentMove.name;
  
  // Initialize rhythm game variables
  isTrackComplete = false;
  notes = currentMove.notes.map((note, index) => ({
    id: index,
    direction: note.direction,
    position: 0,
    hit: false,
    missed: false,
    timing: note.timing
  }));
  
  // Set up canvas
  const canvas = document.getElementById('rhythm-canvas');
  const ctx = canvas.getContext('2d');
  
  // Set start time
  startTime = Date.now();
  trackTime = 0;
  
  // Start animation loop
  animationFrameId = requestAnimationFrame(animateRhythmGame);
}

// Animate the rhythm game
function animateRhythmGame() {
  const currentMove = gameState.player.selectedMoves[currentMoveIndex];
  const canvas = document.getElementById('rhythm-canvas');
  const ctx = canvas.getContext('2d');
  
  // Update timing
  const now = Date.now();
  trackTime = now - startTime;
  
  // Move notes based on elapsed time and note timing
  notes = notes.map(note => {
    if (note.hit || note.missed) return note;
    
    // Find this note's timing from the move pattern
    const noteTiming = currentMove.notes.find((_, idx) => idx === note.id)?.timing || 0;
    
    // Calculate position based on timing
    // For notes that should appear later, keep them at 0 position
    if (trackTime < noteTiming) {
      return { ...note, position: 0 };
    }
    
    // Once note's time has come, move it according to speed
    const timeElapsedSinceNoteStart = trackTime - noteTiming;
    const speed = NOTE_SPEED * currentMove.speedModifier;
    const newPosition = (timeElapsedSinceNoteStart / 20) * speed;
    
    // Check if the note was missed (went past the target zone)
    if (newPosition > TARGET_ZONE_X + PERFECT_ZONE_SIZE / 2 + NOTE_SIZE && !note.hit) {
      return { ...note, position: newPosition, missed: true };
    }
    
    return { ...note, position: newPosition };
  });
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw track background
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw target zone
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(TARGET_ZONE_X - PERFECT_ZONE_SIZE/2, 0, PERFECT_ZONE_SIZE, TRACK_HEIGHT);
  
  // Draw perfect hit line
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(TARGET_ZONE_X, 0);
  ctx.lineTo(TARGET_ZONE_X, TRACK_HEIGHT);
  ctx.stroke();
  
  // Draw notes
  notes.forEach(note => {
    if (note.hit || note.missed) return;
    
    // Calculate y position based on direction
    let yPos = 0;
    let noteColor = "";
    
    switch (note.direction) {
      case "up":
        noteColor = "#FF5555";
        yPos = 10;
        break;
      case "down":
        noteColor = "#55FF55";
        yPos = 70;
        break;
      case "left":
        noteColor = "#5555FF";
        yPos = 40;
        break;
      case "right":
        noteColor = "#FFFF55";
        yPos = 40;
        break;
    }
    
    // Draw the note
    ctx.fillStyle = noteColor;
    ctx.fillRect(note.position, yPos, NOTE_SIZE, NOTE_SIZE);
    
    // Draw the arrow indicator on the note
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let arrowSymbol = "";
    
    switch (note.direction) {
      case "up": arrowSymbol = "↑"; break;
      case "down": arrowSymbol = "↓"; break;
      case "left": arrowSymbol = "←"; break;
      case "right": arrowSymbol = "→"; break;
    }
    
    ctx.fillText(arrowSymbol, note.position + NOTE_SIZE / 2, yPos + NOTE_SIZE / 2);
  });
  
  // Check if all notes are either hit or missed
  const allNotesProcessed = notes.every(note => note.hit || note.missed);
  if (allNotesProcessed && !isTrackComplete) {
    // Calculate success rate
    const hitNotes = notes.filter(note => note.hit).length;
    const totalNotes = notes.length;
    const successRate = hitNotes / totalNotes;
    
    // Track is complete, calculate overall result
    isTrackComplete = true;
    
    // Wait a moment to show final feedback
    setTimeout(() => {
      // Calculate average timing of successful hits
      const hitNotesList = notes.filter(note => note.hit);
      const avgTiming = hitNotesList.length > 0
        ? hitNotesList.reduce((sum, note) => sum + calculateTimingScore(note.position), 0) / hitNotesList.length
        : 0;
      
      // Record the result in game state
      gameState.recordPlayerMoveResult(currentMoveIndex, successRate >= 0.5, avgTiming);
      
      // Move to next move or end rhythm phase
      if (currentMoveIndex >= 2) {
        // Show opponent's turn message
        const feedbackEl = document.getElementById('feedback-text');
        feedbackEl.textContent = "Opponent's turn...";
        feedbackEl.style.color = "#ff9800";
        feedbackEl.classList.remove('hidden');
        
        // Play opponent turn sound
        opponentTurnSound.currentTime = 0;
        opponentTurnSound.play().catch(error => console.log("Audio couldn't play:", error));
        
        // Generate opponent results
        setTimeout(() => {
          // Hide the message
          feedbackEl.classList.add('hidden');
          
          // Generate opponent results and process round
          gameState.generateOpponentMoveResults();
          gameState.processRoundResults();
          
          // Show results with damage animation
          showRoundResults();
        }, 2000);
      } else {
        // Move to next move in sequence
        currentMoveIndex++;
        startRhythmCountdown();
      }
    }, 1000);
  }
  
  // Continue animation if not complete
  if (!isTrackComplete) {
    animationFrameId = requestAnimationFrame(animateRhythmGame);
  }
}

// Calculate timing score based on distance from target
function calculateTimingScore(position) {
  // Calculate center position of the note
  const noteCenter = position + (NOTE_SIZE / 2);
  const distanceFromTarget = Math.abs(noteCenter - TARGET_ZONE_X);
  
  // More forgiving timing score calculation
  return Math.max(0, 100 - (distanceFromTarget / (PERFECT_ZONE_SIZE / 2)) * 80);
}

// Handle keyboard input for rhythm game
function handleKeyDown(event) {
  // Only track arrow keys for rhythm game
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) || 
      gameState.phase !== GamePhase.RHYTHM_PHASE || 
      isTrackComplete) {
    return;
  }
  
  event.preventDefault();
  
  // Find the first non-hit, non-missed note
  const activeNoteIndex = notes.findIndex(note => !note.hit && !note.missed);
  if (activeNoteIndex === -1) return;
  
  const activeNote = notes[activeNoteIndex];
  
  // Check if the pressed key matches the note direction
  const isCorrectKey = 
    (event.key === "ArrowUp" && activeNote.direction === "up") ||
    (event.key === "ArrowDown" && activeNote.direction === "down") ||
    (event.key === "ArrowLeft" && activeNote.direction === "left") ||
    (event.key === "ArrowRight" && activeNote.direction === "right");
  
  if (isCorrectKey) {
    // Calculate timing accuracy based on center of the note
    const noteCenter = activeNote.position + (NOTE_SIZE / 2);
    const distanceFromTarget = Math.abs(noteCenter - TARGET_ZONE_X);
    const timing = calculateTimingScore(noteCenter);
    
    // Expanded target zone to make it easier to hit - include the whole note instead of just position
    const noteLeft = activeNote.position;
    const noteRight = activeNote.position + NOTE_SIZE;
    const targetLeft = TARGET_ZONE_X - PERFECT_ZONE_SIZE / 2;
    const targetRight = TARGET_ZONE_X + PERFECT_ZONE_SIZE / 2;
    
    // Consider a hit if any part of the note is in the target zone
    const isInTargetZone = 
      (noteLeft <= targetRight && noteRight >= targetLeft);
    
    const feedbackElement = document.getElementById('feedback-text');
    
    if (isInTargetZone) {
      // Update the note status
      notes[activeNoteIndex].hit = true;
      
      // Play success sound
      successSound.currentTime = 0;
      successSound.play().catch(error => console.log("Audio couldn't play:", error));
      
      // Show feedback
      feedbackElement.classList.remove('hidden');
      if (timing > 90) {
        feedbackElement.textContent = "PERFECT!";
        feedbackElement.style.color = "#ffeb3b";
      } else if (timing > 70) {
        feedbackElement.textContent = "GREAT!";
        feedbackElement.style.color = "#4caf50";
      } else if (timing > 50) {
        feedbackElement.textContent = "GOOD!";
        feedbackElement.style.color = "#2196f3";
      } else {
        feedbackElement.textContent = "OK!";
        feedbackElement.style.color = "#9e9e9e";
      }
    } else {
      // Missed
      notes[activeNoteIndex].missed = true;
      
      // Play hit sound
      hitSound.currentTime = 0;
      hitSound.play().catch(error => console.log("Audio couldn't play:", error));
      
      // Show feedback
      feedbackElement.classList.remove('hidden');
      feedbackElement.textContent = "MISS!";
      feedbackElement.style.color = "#f44336";
    }
    
    // Hide feedback after a short time
    setTimeout(() => {
      feedbackElement.classList.add('hidden');
    }, 500);
  }
}

// Show round results
function showRoundResults() {
  // Update UI to show round results
  showBattlePhase('roundEnd');
  
  // Display round message
  const playerResults = gameState.player.moveResults;
  const opponentResults = gameState.opponent.moveResults;
  
  // Calculate total damage
  const playerDamage = playerResults.reduce((sum, result) => sum + (result.success ? result.damage : 0), 0);
  const opponentDamage = opponentResults.reduce((sum, result) => sum + (result.success ? result.damage : 0), 0);
  
  // Add shake animation to health bars if damage was dealt
  if (playerDamage > 0) {
    const opponentHealthBar = document.querySelector('#opponent-health .health-fill');
    opponentHealthBar.classList.remove('shake');
    void opponentHealthBar.offsetWidth; // Trigger reflow to restart animation
    opponentHealthBar.classList.add('shake');
    
    // Play damage sound
    damageSound.currentTime = 0;
    damageSound.play().catch(error => console.log("Audio couldn't play:", error));
  }
  
  if (opponentDamage > 0) {
    const playerHealthBar = document.querySelector('#player-health .health-fill');
    playerHealthBar.classList.remove('shake');
    void playerHealthBar.offsetWidth; // Trigger reflow to restart animation
    playerHealthBar.classList.add('shake');
    
    // Play damage sound
    damageSound.currentTime = 0;
    damageSound.play().catch(error => console.log("Audio couldn't play:", error));
  }
  
  let message = "";

  // Check if opponent's health is 0 - defeat required to win
  const isOpponentDefeated = gameState.opponent.currentHealth === 0;
  const isPlayerDefeated = gameState.player.currentHealth === 0;
  
  if (isOpponentDefeated) {
    message = `Victory! You defeated the opponent! Dealt ${playerDamage} damage.`;
  } else if (isPlayerDefeated) {
    alert = `Defeat! Your health reached zero.`;
  } else {
    // Neither is defeated yet
    message = `Round continues! You dealt ${playerDamage} damage. Opponent has ${gameState.opponent.currentHealth} health left.`;
  }
  
  document.getElementById('round-message').textContent = message;
  
  // Display player move results
  const playerResultsList = document.getElementById('player-results');
  playerResultsList.innerHTML = '';
  
  playerResults.forEach((result, index) => {
    const move = gameState.player.selectedMoves[index];
    const listItem = document.createElement('li');
    listItem.className = 'move-result';
    
    listItem.innerHTML = `
      <span class="${result.success ? 'result-success' : 'result-failure'}">
        ${result.success ? "✓" : "✗"}
      </span>
      <span>${move.name}</span>
      <span>${result.success ? `(${result.damage} dmg)` : "(missed)"}</span>
    `;
    
    playerResultsList.appendChild(listItem);
  });
  
  // Display opponent move results
  const opponentResultsList = document.getElementById('opponent-results');
  opponentResultsList.innerHTML = '';
  
  opponentResults.forEach((result, index) => {
    const move = gameState.opponent.selectedMoves[index];
    const listItem = document.createElement('li');
    listItem.className = 'move-result';
    
    listItem.innerHTML = `
      <span class="${result.success ? 'result-success' : 'result-failure'}">
        ${result.success ? "✓" : "✗"}
      </span>
      <span>${move.name}</span>
      <span>${result.success ? `(${result.damage} dmg)` : "(missed)"}</span>
    `;
    
    opponentResultsList.appendChild(listItem);
  });
  
  // Update battle UI
  updateBattleUI();
  
  // Check if game is over
  if (gameState.phase === GamePhase.GAME_OVER) {
    // Hide next round button
    document.getElementById('next-round-button').classList.add('hidden');
    
    // Show game over screen after a delay
    setTimeout(() => {
      showGameOverScreen();
    }, 3000);
  } else if (gameState.opponent.currentHealth === 0) {
    // Opponent defeated - show next round button
    document.getElementById('next-round-button').classList.remove('hidden');
  } else {
    // Opponent not yet defeated - hide next round button, show continue button
    document.getElementById('next-round-button').classList.add('hidden');
    
    // Show the continue button that's already in the HTML
    const continueButton = document.getElementById('continue-button');
    continueButton.classList.remove('hidden');
    
    // Add click handler
    continueButton.onclick = () => {
      // Reset moves and start another rhythm sequence
      gameState.player.resetMoves();
      gameState.opponent.resetMoves();
      showBattlePhase('moveSelection');
      loadMoves();
    };
  }
}

// Start the next round
function startNextRound() {
  gameState.startNextRound();
  updateBattleUI();
  showBattlePhase('moveSelection');
  loadMoves();
  
  // Make sure to hide the Continue button between rounds
  document.getElementById('continue-button').classList.add('hidden');
}

// Update battle UI elements
function updateBattleUI() {
  const { player, opponent, currentRound, maxRounds, isBossRound } = gameState;
  
  // Update player info
  document.getElementById('player-name').textContent = player.character.name;
  
  // Get player icon element
  const playerIcon = document.getElementById('player-icon');
  playerIcon.className = `character-icon ${player.character.themeColor}`;
  playerIcon.innerHTML = ''; // Clear previous content
  
  // Check if character has custom sprite
  if (player.character.customSprite) {
    // Create an img element for the sprite
    const spriteImg = document.createElement('img');
    spriteImg.src = player.character.customSprite;
    spriteImg.alt = player.character.name;
    spriteImg.className = 'character-sprite';
    playerIcon.appendChild(spriteImg);
    
    // Create a div for the symbol that will overlay the sprite
    const symbolDiv = document.createElement('div');
    symbolDiv.className = 'icon-symbol';
    symbolDiv.textContent = player.character.symbol;
    playerIcon.appendChild(symbolDiv);
  } else {
    // No sprite, just show the symbol
    playerIcon.textContent = player.character.symbol;
  }
  
  // Update player health
  const playerHealthFill = document.querySelector('#player-health .health-fill');
  const playerHealthPercent = (player.currentHealth / player.character.health) * 100;
  playerHealthFill.style.width = `${playerHealthPercent}%`;
  
  // Update player rounds
  const playerRounds = document.getElementById('player-rounds');
  playerRounds.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const marker = document.createElement('div');
    marker.className = i < player.roundsWon ? 'round-marker won' : 'round-marker';
    playerRounds.appendChild(marker);
  }
  
  // Update opponent info
  document.getElementById('opponent-name').textContent = opponent.character.name;
  
  // Get opponent icon element
  const opponentIcon = document.getElementById('opponent-icon');
  opponentIcon.className = `character-icon ${opponent.character.themeColor}`;
  opponentIcon.innerHTML = ''; // Clear previous content
  
  // Check if character has custom sprite
  if (opponent.character.customSprite) {
    // Create an img element for the sprite
    const spriteImg = document.createElement('img');
    spriteImg.src = opponent.character.customSprite;
    spriteImg.alt = opponent.character.name;
    spriteImg.className = 'character-sprite';
    opponentIcon.appendChild(spriteImg);
    
    // Create a div for the symbol that will overlay the sprite
    const symbolDiv = document.createElement('div');
    symbolDiv.className = 'icon-symbol';
    symbolDiv.textContent = opponent.character.symbol;
    opponentIcon.appendChild(symbolDiv);
  } else {
    // No sprite, just show the symbol
    opponentIcon.textContent = opponent.character.symbol;
  }
  
  // Update opponent health
  const opponentHealthFill = document.querySelector('#opponent-health .health-fill');
  const opponentHealthPercent = (opponent.currentHealth / opponent.character.health) * 100;
  opponentHealthFill.style.width = `${opponentHealthPercent}%`;
  
  // Update opponent rounds
  const opponentRounds = document.getElementById('opponent-rounds');
  opponentRounds.innerHTML = '';
  
  for (let i = 0; i < 5; i++) {
    const marker = document.createElement('div');
    marker.className = i < opponent.roundsWon ? 'round-marker won' : 'round-marker';
    opponentRounds.appendChild(marker);
  }
  
  // Update round info
  const roundDisplay = document.getElementById('round-display');
  if (currentRound > maxRounds) {
    // We're in endless mode
    roundDisplay.textContent = `Round ${currentRound}/∞`;
  } else {
    roundDisplay.textContent = `Round ${currentRound}/${maxRounds}`;
  }
  
  // Show/hide boss indicator
  const bossIndicator = document.getElementById('boss-indicator');
  if (isBossRound) {
    document.querySelector('.battle-header').classList.add('glow-effect');
  } else {
    document.querySelector('.battle-header').classList.remove('glow-effect');
  }
}

// Show game over screen
function showGameOverScreen() {
  const { player, opponent, winner, currentRound, isBossRound } = gameState;
  const playerWon = winner === 'player';
  const beatTheBoss = playerWon && isBossRound;
  
  // Show game over screen
  showScreen('gameOver');
  
  // Play victory/defeat sound
  if (playerWon) {
    victorySound.currentTime = 0;
    victorySound.play().catch(error => console.log("Audio couldn't play:", error));
  } else {
    defeatSound.currentTime = 0;
    defeatSound.play().catch(error => console.log("Audio couldn't play:", error));
  }
  
  // Update header
  const gameOverHeader = document.getElementById('game-over-header');
  const gameOverTitle = document.getElementById('game-over-title');
  const gameOverSubtitle = document.getElementById('game-over-subtitle');
  
  gameOverHeader.className = playerWon ? 'victory-header' : 'defeat-header';
  
  if (beatTheBoss) {
    gameOverTitle.textContent = "CHAMPION!";
    gameOverSubtitle.textContent = "You defeated all opponents including the boss!";
  } else if (playerWon) {
    gameOverTitle.textContent = "VICTORY!";
    gameOverSubtitle.textContent = "You won the match!";
  } else {
    gameOverTitle.textContent = "DEFEAT!";
    gameOverSubtitle.textContent = "Better luck next time!";
  }
  
  // Update fighter info
  const playerFinalIcon = document.getElementById('player-final-icon');
  playerFinalIcon.className = `character-icon large ${player.character.themeColor}`;
  playerFinalIcon.innerHTML = '';

  // Check if player character has custom sprite
  if (player.character.customSprite) {
    // Create an img element for the sprite
    const spriteImg = document.createElement('img');
    spriteImg.src = player.character.customSprite;
    spriteImg.alt = player.character.name;
    spriteImg.className = 'character-sprite';
    playerFinalIcon.appendChild(spriteImg);
    
    // Create a div for the symbol that will overlay the sprite
    const symbolDiv = document.createElement('div');
    symbolDiv.className = 'icon-symbol';
    symbolDiv.textContent = player.character.symbol;
    playerFinalIcon.appendChild(symbolDiv);
  } else {
    // No sprite, just show the symbol
    playerFinalIcon.textContent = player.character.symbol;
  }
  
  document.getElementById('player-final-name').textContent = player.character.name;
  document.getElementById('player-final-rounds').textContent = player.roundsWon;
  
  // Update opponent info
  const opponentFinalIcon = document.getElementById('opponent-final-icon');
  opponentFinalIcon.className = `character-icon large ${opponent.character.themeColor}`;
  opponentFinalIcon.innerHTML = '';
  
  // Check if opponent character has custom sprite
  if (opponent.character.customSprite) {
    // Create an img element for the sprite
    const spriteImg = document.createElement('img');
    spriteImg.src = opponent.character.customSprite;
    spriteImg.alt = opponent.character.name;
    spriteImg.className = 'character-sprite';
    opponentFinalIcon.appendChild(spriteImg);
    
    // Create a div for the symbol that will overlay the sprite
    const symbolDiv = document.createElement('div');
    symbolDiv.className = 'icon-symbol';
    symbolDiv.textContent = opponent.character.symbol;
    opponentFinalIcon.appendChild(symbolDiv);
  } else {
    // No sprite, just show the symbol
    opponentFinalIcon.textContent = opponent.character.symbol;
  }
  
  document.getElementById('opponent-final-name').textContent = opponent.character.name;
  document.getElementById('opponent-final-rounds').textContent = opponent.roundsWon;
  
  // Update match summary
  document.getElementById('final-round').textContent = currentRound;
  document.getElementById('player-character-used').textContent = player.character.name;
  
  const bossDefeated = document.getElementById('boss-defeated');
  const endlessModeButton = document.getElementById('endless-mode-button');
  
  if (beatTheBoss) {
    // Show boss defeated message
    bossDefeated.classList.remove('hidden');
    document.getElementById('boss-name').textContent = opponent.character.name;
    
    // Make the endless mode button visible if player defeated the boss
    endlessModeButton.classList.remove('hidden');
    
    // Add onclick handler for endless mode
    endlessModeButton.onclick = () => {
      // Start endless mode - game continues with increasingly difficult opponents
      // The startNextRound function will handle creating stronger opponents
      gameState.startNextRound();
      
      // Return to battle screen
      showScreen('battle');
      showBattlePhase('moveSelection');
      
      // Update UI to show endless mode
      updateBattleUI();
      loadMoves();
    };
  } else {
    bossDefeated.classList.add('hidden');
    endlessModeButton.classList.add('hidden');
  }
  
  // Update final message
  const finalMessage = document.getElementById('final-message');
  if (playerWon) {
    finalMessage.className = 'final-message success';
    finalMessage.textContent = beatTheBoss 
      ? "Congratulations on becoming the Rhythm Fighting Champion! Ready for Endless Mode?" 
      : "Well done! Continue your journey to face the boss!";
  } else {
    finalMessage.className = 'final-message failure';
    finalMessage.textContent = "Your rhythm fighting journey ends here... for now.";
  }
}

// Play again (restart the game)
function playAgain() {
  // Reset game state
  gameState.phase = GamePhase.CHARACTER_SELECTION;
  selectedCharacter = null;
  
  // Show character selection screen
  showScreen('characterSelect');
  
  // Enable select character button
  document.getElementById('select-character-button').disabled = true;
  
  // Reset character selection
  document.querySelectorAll('.character-card').forEach(card => {
    card.classList.remove('selected');
  });
}

// Return to main menu
function returnToMenu() {
  // Reset game state
  gameState.phase = GamePhase.MENU;
  selectedCharacter = null;
  
  // Stop any ongoing animations
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Show menu screen
  showScreen('menu');
  
  // Hide tutorial if it's showing
  hideTutorial();
}

// Show a specific screen
function showScreen(screenName) {
  // Hide all screens
  Object.values(screenElements).forEach(element => {
    element.classList.remove('active');
  });
  
  // Show the requested screen
  screenElements[screenName].classList.add('active');
  
  // Update game state phase
  switch (screenName) {
    case 'menu':
      gameState.phase = GamePhase.MENU;
      break;
    case 'characterSelect':
      gameState.phase = GamePhase.CHARACTER_SELECTION;
      break;
    case 'gameOver':
      gameState.phase = GamePhase.GAME_OVER;
      break;
  }
}

// Show a specific battle phase
function showBattlePhase(phaseName) {
  // Hide all battle phases
  Object.values(battlePhases).forEach(element => {
    element.classList.add('hidden');
  });
  
  // Show the requested phase
  battlePhases[phaseName].classList.remove('hidden');
  
  // Update game state phase
  switch (phaseName) {
    case 'moveSelection':
      gameState.phase = GamePhase.MOVE_SELECTION;
      break;
    case 'rhythmPhase':
      gameState.phase = GamePhase.RHYTHM_PHASE;
      break;
    case 'roundEnd':
      gameState.phase = GamePhase.ROUND_END;
      break;
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initializeGame);