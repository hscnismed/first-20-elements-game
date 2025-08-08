
const elements = [
    { name: "Hydrogen", symbol: "H" },
    { name: "Helium", symbol: "He" },
    { name: "Lithium", symbol: "Li" },
    { name: "Beryllium", symbol: "Be" },
    { name: "Boron", symbol: "B" },
    { name: "Carbon", symbol: "C" },
    { name: "Nitrogen", symbol: "N" },
    { name: "Oxygen", symbol: "O" },
    { name: "Fluorine", symbol: "F" },
    { name: "Neon", symbol: "Ne" },
    { name: "Sodium", symbol: "Na" },
    { name: "Magnesium", symbol: "Mg" },
    { name: "Aluminum", symbol: "Al" },
    { name: "Silicon", symbol: "Si" },
    { name: "Phosphorus", symbol: "P" },
    { name: "Sulfur", symbol: "S" },
    { name: "Chlorine", symbol: "Cl" },
    { name: "Argon", symbol: "Ar" },
    { name: "Potassium", symbol: "K" },
    { name: "Calcium", symbol: "Ca" }
];

let state = {
    player1Score: 0,
    player2Score: 0,
    currentPlayer: 1,
    questionsCovered: [],
    unansweredQuestions: [],
    currentQuestion: null,
    timer: 20,
    timerInterval: null,
    isStealTurn: false,
    stealPlayer: null,
    isPaused: false // <- add this
};

const startPage = document.getElementById('start-page');
const gamePage = document.getElementById('game-page');
const winPage = document.getElementById('win-page');
const startButton = document.getElementById('start-button');
const resetGameButton = document.getElementById('reset-button');
const resetWinPageButton = document.getElementById('reset-win-page-button');
const guessButton = document.getElementById('guess-button');
const stealButton = document.getElementById('steal-button');
const skipButton = document.getElementById('skip-button');
const guessInput = document.getElementById('guess-input');
const scoreP1Display = document.getElementById('score-p1');
const scoreP2Display = document.getElementById('score-p2');
const timerDisplay = document.getElementById('timer-display');
const questionText = document.getElementById('question-text');
const winMessage = document.getElementById('win-message');
const finalScoreP1 = document.getElementById('final-score-p1');
const finalScoreP2 = document.getElementById('final-score-p2');

const saveState = () => {
    localStorage.setItem('gameState', JSON.stringify(state));
};

const loadState = () => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        state = JSON.parse(savedState);
        if (state.questionsCovered.length < elements.length) {
            return true;
        }
    }
    return false;
};

const updateUI = () => {
    scoreP1Display.textContent = state.player1Score;
    scoreP2Display.textContent = state.player2Score;
    guessInput.value = '';
    guessInput.focus();
    if (state.currentQuestion) {
        const questionPrompt = state.currentQuestion.type === 'name' ? state.currentQuestion.element.symbol : state.currentQuestion.element.name;

        if (state.isStealTurn) {
            questionText.innerHTML = `Player ${state.stealPlayer}'s turn to steal.<br><br>What is the ${state.currentQuestion.type} for ${questionPrompt}?`;
        } else {
            questionText.innerHTML = `Player ${state.currentPlayer}'s turn.<br><br>What is the ${state.currentQuestion.type} for ${questionPrompt}?`;
        }
        guessInput.placeholder = `Enter the ${state.currentQuestion.type}...`;
    }
    timerDisplay.textContent = state.timer;
    if (state.isStealTurn) {
        guessButton.classList.add('hidden');
        stealButton.classList.remove('hidden');
        skipButton.classList.remove('hidden');
    } else {
        guessButton.classList.remove('hidden');
        stealButton.classList.add('hidden');
        skipButton.classList.add('hidden');
    }
};

const startTimer = (initialTime) => {
    clearInterval(state.timerInterval);
    state.timer = initialTime;
    timerDisplay.textContent = state.timer;
    state.timerInterval = setInterval(() => {
        state.timer--;
        timerDisplay.textContent = state.timer;

        // Add red color if timer is 10 or less
        if (state.timer <= 10) {
            timerDisplay.classList.add('timer-warning');
        } else {
            timerDisplay.classList.remove('timer-warning');
        }

        if (state.timer <= 0) {
            clearInterval(state.timerInterval);
            handleTimeout();
        }
    }, 1000);

};

const startNewTurn = () => {
    if (state.questionsCovered.length >= elements.length) {
        state.isPaused = false;
        pauseButton.textContent = 'Pause';
        endGame();
        return;
    }

    let availableQuestions = elements.filter(el => !state.questionsCovered.includes(el.name));
    if (state.unansweredQuestions.length > 0) {
        availableQuestions = state.unansweredQuestions.concat(availableQuestions);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionElement = availableQuestions[randomIndex];
    state.currentQuestion = {
        element: questionElement,
        type: Math.random() > 0.5 ? 'name' : 'symbol'
    };

    state.unansweredQuestions = state.unansweredQuestions.filter(q => q.name !== questionElement.name);
    state.isStealTurn = false;
    updateUI();
    startTimer(20);
    saveState();
};

const handleGuess = () => {
    const input = guessInput.value.trim();
    if (!input) return;

    let isCorrect = false;
    if (state.currentQuestion.type === 'name') {
        isCorrect = input.toLowerCase() === state.currentQuestion.element.name.toLowerCase();
    } else {
        // Symbols are case-sensitive
        isCorrect = input === state.currentQuestion.element.symbol;
    }

    if (isCorrect) {
        state[`player${state.currentPlayer}Score`]++;
        state.questionsCovered.push(state.currentQuestion.element.name);
        clearInterval(state.timerInterval);
        alert(`Correct! Player ${state.currentPlayer} gets a point.`);
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        startNewTurn();
    } else {
        alert("Incorrect answer. Next player can steal.");
        startStealTurn();
    }
    saveState();
};

const startStealTurn = () => {
    
    clearInterval(state.timerInterval);
    state.isStealTurn = true;
    state.stealPlayer = state.currentPlayer === 1 ? 2 : 1;
    updateUI();
    startTimer(20);
    saveState();
    state.isPaused = false;
    pauseButton.textContent = 'Pause';
};

const handleSteal = () => {
    const input = guessInput.value.trim();
    if (!input) return;

    let isCorrect = false;
    if (state.currentQuestion.type === 'name') {
        isCorrect = input.toLowerCase() === state.currentQuestion.element.name.toLowerCase();
    } else {
        isCorrect = input === state.currentQuestion.element.symbol;
    }

    if (isCorrect) {
        state[`player${state.stealPlayer}Score`]++;
        state.questionsCovered.push(state.currentQuestion.element.name);
        clearInterval(state.timerInterval);
        alert(`Steal successful! Player ${state.stealPlayer} gets a point.`);
        state.currentPlayer = state.stealPlayer;
        startNewTurn();
    } else {
        alert("Incorrect steal. Moving to next question.");
        state.unansweredQuestions.push(state.currentQuestion.element);
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        startNewTurn();
    }
    saveState();
};

const handleSkip = () => {
    alert("Steal skipped. Moving to next question.");
    state.unansweredQuestions.push(state.currentQuestion.element);
    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    startNewTurn();
    saveState();
};

const handleTimeout = () => {
    if (state.isStealTurn) {
        alert("Time's up for the steal. Moving to next question.");
        state.unansweredQuestions.push(state.currentQuestion.element);
        state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
        startNewTurn();
    } else {
        alert(`Time's up for Player ${state.currentPlayer}. Next player can steal.`);
        startStealTurn();
    }
    saveState();
};

const endGame = () => {
    clearInterval(state.timerInterval);
    gamePage.classList.add('hidden');
    winPage.classList.remove('hidden');
    finalScoreP1.textContent = state.player1Score;
    finalScoreP2.textContent = state.player2Score;
    if (state.player1Score > state.player2Score) {
        winMessage.textContent = "Player 1 Wins!";
    } else if (state.player2Score > state.player1Score) {
        winMessage.textContent = "Player 2 Wins!";
    } else {
        winMessage.textContent = "It's a Tie!";
    }
    localStorage.removeItem('gameState');
};

const resetGame = () => {
    clearInterval(state.timerInterval);
    localStorage.removeItem('gameState');
    state = {
        player1Score: 0,
        player2Score: 0,
        currentPlayer: 1,
        questionsCovered: [],
        unansweredQuestions: [],
        currentQuestion: null,
        timer: 20,
        timerInterval: null,
        isStealTurn: false,
        stealPlayer: null
    };
    startPage.classList.remove('hidden');
    gamePage.classList.add('hidden');
    winPage.classList.add('hidden');
};

startButton.addEventListener('click', () => {
    startPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    if (loadState()) {
        alert("Game state restored from last session. Timer set to 10s.");
        updateUI();
        startTimer(10);
    } else {
        startNewTurn();
    }
});

guessButton.addEventListener('click', handleGuess);
stealButton.addEventListener('click', handleSteal);
skipButton.addEventListener('click', handleSkip);
resetGameButton.addEventListener('click', resetGame);
resetWinPageButton.addEventListener('click', resetGame);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (state.isStealTurn) {
            handleSteal();
        } else {
            handleGuess();
        }
    }
});

const pauseButton = document.getElementById('pause-button');
pauseButton.addEventListener('click', () => {
    if (state.isPaused) {
        // Resume
        startTimer(state.timer); // resume with remaining time
        pauseButton.textContent = 'Pause';
        state.isPaused = false;
    } else {
        // Pause
        clearInterval(state.timerInterval);
        pauseButton.textContent = 'Resume';
        state.isPaused = true;
    }
    saveState();
});


window.addEventListener('beforeunload', () => {
    if (gamePage.classList.contains('hidden') === false) {
        saveState();
    }
});