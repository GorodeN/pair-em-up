import GameLogic from './game-logic.js';
import Notifications from './notifications.js';
import SoundManager from './sound-manager.js';

class PairEmUpGame {
  constructor() {
    this.screens = {};
    this.currentScreen = null;
    this.gameLogic = null;
    this.timer = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.notifications = new Notifications();
    this.soundManager = new SoundManager();
    this.eraserMode = false;
    this.gameResults = [];
    this.currentResultsTab = 'time';
    this.init();
  }

  init() {
    this.createScreens();
    this.showScreen('start');
    this.loadSettings();
    this.loadGameResults();
    this.checkSavedGame();

    window.addEventListener('beforeunload', () => {
      this.autoSaveGame();
    });

    document.addEventListener(
      'click',
      async () => {
        await this.soundManager.unlock();
      },
      { once: false }
    );
  }

  createScreens() {
    this.createStartScreen();
    this.createGameScreen();
    this.createSettingsScreen();
    this.createResultsScreen();
  }

  createStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.className = 'start-screen';
    startScreen.id = 'startScreen';
    startScreen.innerHTML = `
      <h1 class="start-screen__title">Pair 'em Up</h1>
      <p class="start-screen__author">
        Created by <a href="https://github.com/GorodeN" target="_blank">@GorodeN</a>
      </p>
      <div class="start-screen__modes">
        <button class="start-screen__mode-button" data-mode="classic">Classic</button>
        <button class="start-screen__mode-button" data-mode="random">Random</button>
        <button class="start-screen__mode-button" data-mode="chaotic">Chaotic</button>
      </div>
      <button class="start-screen__continue-button" id="continueButton" disabled>Continue Game</button>
      <div class="start-screen__actions">
        <button class="start-screen__settings-button" id="settingsButton">Settings</button>
        <button class="start-screen__results-button" id="resultsButton">Results</button>
      </div>
    `;

    document.body.appendChild(startScreen);
    this.screens.start = startScreen;
    this.addStartScreenEventListeners();
  }

  createGameScreen() {
    const gameScreen = document.createElement('div');
    gameScreen.className = 'game-screen hidden';
    gameScreen.id = 'gameScreen';
    gameScreen.innerHTML = `
    <div class="game-screen__header">
      <div class="game-screen__info">
        <div class="game-screen__mode"><span id="currentMode">-</span></div>
        <div class="game-screen__score">Score: <span id="currentScore">0</span>/100</div>
        <div class="game-screen__timer">Time: <span id="gameTimer">00:00</span></div>
      </div>
      <div class="game-screen__controls">
        <button id="resetButton" title="Reset"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
</svg></button>
        <button id="saveButton" title="Save"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-save" viewBox="0 0 16 16">
  <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 9.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
</svg></button>
        <button id="gameSettingsButton" title="Settings"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
</svg></button>
        <button id="menuButton" title="Menu"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M2 13.5V7h1v6.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V7h1v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5zm11-11V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
  <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
</svg></button>
      </div>
    </div>
    
    <div class="game-screen__progress">
      <div class="progress-bar">
        <div class="progress-bar__fill" id="progressBar" style="width: 0%"></div>
      </div>
    </div>

    <div class="game-screen__grid" id="gameGrid">
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px;">
        Select a game mode to start
      </div>
    </div>
    
    <div class="game-screen__assists">
      <button class="assist-button" data-assist="hints" id="hintsButton" title="Hints">
        <span class="assist-button__text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
</svg></span>
        <span class="assist-button__counter" id="hintsCounter">∞</span>
      </button>
      <button class="assist-button" data-assist="revert" id="revertButton" title="Revert">
        <span class="assist-button__text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"/>
</svg></span>
        <span class="assist-button__counter" id="revertCounter">∞</span>
      </button>
      <button class="assist-button" data-assist="addNumbers" id="addNumbersButton" title="Add Numbers">
        <span class="assist-button__text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
</svg></span>
        <span class="assist-button__counter" id="addNumbersCounter">10</span>
      </button>
      <button class="assist-button" data-assist="shuffle" id="shuffleButton" title="Shuffle">
        <span class="assist-button__text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shuffle" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"/>
  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
</svg></span>
        <span class="assist-button__counter" id="shuffleCounter">5</span>
      </button>
      <button class="assist-button" data-assist="eraser" id="eraserButton" title="Erase">
        <span class="assist-button__text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eraser" viewBox="0 0 16 16">
  <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414l-3.879-3.879zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z"/>
</svg></span>
        <span class="assist-button__counter" id="eraserCounter">5</span>
      </button>
    </div>
  `;

    document.body.appendChild(gameScreen);
    this.screens.game = gameScreen;
    this.addGameScreenEventListeners();
  }

  createSettingsScreen() {
    const settingsScreen = document.createElement('div');
    settingsScreen.className = 'settings-screen hidden';
    settingsScreen.id = 'settingsScreen';
    settingsScreen.innerHTML = `
      <div class="settings-screen__content">
        <h2 class="settings-screen__title">Settings</h2>
        
        <div class="settings-screen__section">
          <h3 class="settings-screen__section-title">Appearance</h3>
          
          <div class="settings-screen__option">
            <span class="settings-screen__option-label">Theme</span>
            <select class="settings-screen__select" id="themeSelect">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div class="settings-screen__section">
          <h3 class="settings-screen__section-title">Sound</h3>
          
          <div class="settings-screen__option">
            <span class="settings-screen__option-label">Enable Sounds</span>
            <label class="settings-screen__toggle">
              <input type="checkbox" id="soundToggle">
              <span class="settings-screen__slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-screen__section">
          <h3 class="settings-screen__section-title">Game</h3>
          
          <div class="settings-screen__option">
            <span class="settings-screen__option-label">Auto-save</span>
            <label class="settings-screen__toggle">
              <input type="checkbox" id="autoSaveToggle" checked>
              <span class="settings-screen__slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-screen__buttons">
          <button class="settings-screen__button settings-screen__button--secondary" id="closeSettingsButton">
            Close
          </button>
          <button class="settings-screen__button settings-screen__button--primary" id="saveSettingsButton">
            Save Settings
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(settingsScreen);
    this.screens.settings = settingsScreen;
    this.addSettingsScreenEventListeners();
  }

  createResultsScreen() {
    const resultsScreen = document.createElement('div');
    resultsScreen.className = 'results-screen hidden';
    resultsScreen.id = 'resultsScreen';
    resultsScreen.innerHTML = `
      <div class="results-screen__content">
        <h2 class="results-screen__title">Game Results</h2>
        
        <div class="results-screen__tabs">
          <button class="results-screen__tab results-screen__tab--active" data-tab="time">
            Best Time
          </button>
          <button class="results-screen__tab" data-tab="best">
            Best Scores
          </button>
        </div>

        <div id="resultsContent">
        </div>

        <div class="results-screen__buttons">
          <button class="results-screen__button results-screen__button--secondary" id="clearResultsButton">
            Clear History
          </button>
          <button class="results-screen__button results-screen__button--primary" id="closeResultsButton">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(resultsScreen);
    this.screens.results = resultsScreen;
    this.addResultsScreenEventListeners();
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      if (screen.id !== 'settingsScreen' && screen.id !== 'resultsScreen') {
        screen.classList.add('hidden');
      }
    });

    if (screenName === 'settings' || screenName === 'results') {
      return;
    }

    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
      this.currentScreen = screenName;
    }
  }

  showModal(modalName) {
    if (this.screens[modalName]) {
      this.screens[modalName].classList.remove('hidden');
    }
  }

  hideModal(modalName) {
    if (this.screens[modalName]) {
      this.screens[modalName].classList.add('hidden');
    }
  }

  addStartScreenEventListeners() {
    const startScreen = this.screens.start;

    const modeButtons = startScreen.querySelectorAll(
      '.start-screen__mode-button'
    );
    modeButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        this.soundManager.playButtonClick();
        this.startNewGame(mode);
      });
    });

    const continueButton = startScreen.querySelector('#continueButton');
    continueButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.continueGame();
    });

    const settingsButton = startScreen.querySelector('#settingsButton');
    settingsButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.showSettings();
    });

    const resultsButton = startScreen.querySelector('#resultsButton');
    resultsButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.showResults();
    });
  }

  addGameScreenEventListeners() {
    const gameScreen = this.screens.game;

    const resetButton = gameScreen.querySelector('#resetButton');
    resetButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.resetGame();
    });

    const saveButton = gameScreen.querySelector('#saveButton');
    saveButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.saveGame();
    });

    const settingsButton = gameScreen.querySelector('#gameSettingsButton');
    settingsButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.showSettings();
    });

    const menuButton = gameScreen.querySelector('#menuButton');
    menuButton.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.returnToMenu();
    });

    const assistButtons = gameScreen.querySelectorAll('.assist-button');
    assistButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        this.soundManager.playButtonClick();
        const assist = e.target.closest('.assist-button').dataset.assist;
        this.useAssist(assist);
      });
    });
  }

  addSettingsScreenEventListeners() {
    const settingsScreen = this.screens.settings;

    const closeButton = settingsScreen.querySelector('#closeSettingsButton');
    closeButton.addEventListener('click', () => {
      this.hideSettings();
    });

    const saveButton = settingsScreen.querySelector('#saveSettingsButton');
    saveButton.addEventListener('click', () => {
      this.saveSettings();
    });

    settingsScreen.addEventListener('click', (e) => {
      if (e.target === settingsScreen) {
        this.hideSettings();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !settingsScreen.classList.contains('hidden')) {
        this.hideSettings();
      }
    });
  }

  addResultsScreenEventListeners() {
    const resultsScreen = this.screens.results;

    const closeButton = resultsScreen.querySelector('#closeResultsButton');
    closeButton.addEventListener('click', () => {
      this.hideResults();
    });

    const clearButton = resultsScreen.querySelector('#clearResultsButton');
    clearButton.addEventListener('click', () => {
      this.clearGameResults();
    });

    const tabs = resultsScreen.querySelectorAll('.results-screen__tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchResultsTab(tabName);
      });
    });

    resultsScreen.addEventListener('click', (e) => {
      if (e.target === resultsScreen) {
        this.hideResults();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !resultsScreen.classList.contains('hidden')) {
        this.hideResults();
      }
    });
  }

  startNewGame(mode) {
    this.gameLogic = new GameLogic(mode);
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.eraserMode = false;
    this.startTimer();
    this.showScreen('game');
    this.renderGameGrid();
    this.updateGameInfo();
    this.updateAssistButtons();

    this.soundManager.playGameStart();
    this.notifications.show(`Started new game in ${mode} mode`, 'info');
  }

  renderGameGrid() {
    const gameGrid = this.screens.game.querySelector('#gameGrid');
    gameGrid.innerHTML = '';

    const gameState = this.gameLogic.getGameState();

    gameState.grid.forEach((number, index) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = index;

      if (number === null) {
        cell.classList.add('grid-cell--empty');
        cell.textContent = '';
      } else {
        cell.textContent = number;

        cell.addEventListener('click', () => {
          if (this.eraserMode) {
            this.handleEraserClick(index);
          } else {
            this.handleCellClick(index);
          }
        });
      }

      if (gameState.selectedCells.includes(index)) {
        cell.classList.add('grid-cell--selected');
      }

      if (this.eraserMode && number !== null) {
        cell.classList.add('grid-cell--erasable');
      }

      gameGrid.appendChild(cell);
    });

    if (this.eraserMode) {
      gameGrid.classList.add('game-screen__grid--eraser-mode');
    } else {
      gameGrid.classList.remove('game-screen__grid--eraser-mode');
    }
  }

  handleCellClick(index) {
    if (!this.gameLogic) return;

    const result = this.gameLogic.selectCell(index);

    if (result.type === 'select') {
      this.soundManager.playSelect();
      this.renderGameGrid();
    } else if (result.type === 'deselect') {
      this.soundManager.playDeselect();
      this.renderGameGrid();
    } else if (result.type === 'reset') {
      this.renderGameGrid();
    } else if (result.type === 'valid') {
      this.soundManager.playValidPair();
      this.renderGameGrid();
      this.updateGameInfo();
      this.updateAssistButtons();
      this.showPairSuccess(result.points);

      if (this.gameLogic.checkWinCondition()) {
        this.winGame();
      } else if (this.gameLogic.checkLoseCondition()) {
        this.loseGame();
      }
    } else if (result.type === 'invalid') {
      this.soundManager.playInvalidPair();
      this.renderGameGrid();
      this.showPairError();
      setTimeout(() => {
        this.gameLogic.selectedCells = [];
        this.renderGameGrid();

        if (this.gameLogic.checkLoseCondition()) {
          this.loseGame();
        }
      }, 1000);
    }
  }

  handleEraserClick(index) {
    if (!this.gameLogic || !this.eraserMode) return;

    if (this.gameLogic.erase(index)) {
      this.soundManager.playAssistUse();
      this.renderGameGrid();
      this.updateAssistButtons();
      this.notifications.show('Number erased', 'success');

      const assistInfo = this.gameLogic.getAssistInfo().eraser;
      if (!assistInfo.available) {
        this.deactivateEraserMode();
      }
    } else {
      this.notifications.show('Eraser limit reached', 'warning');
      this.deactivateEraserMode();
    }
  }

  updateGameInfo() {
    if (!this.gameLogic) return;

    const scoreElement = this.screens.game.querySelector('#currentScore');
    const modeElement = this.screens.game.querySelector('#currentMode');

    scoreElement.textContent = this.gameLogic.score;
    modeElement.textContent =
      this.gameLogic.mode.charAt(0).toUpperCase() +
      this.gameLogic.mode.slice(1);

    this.updateProgressBar();

    const currentRows = Math.ceil(
      this.gameLogic.grid.length / this.gameLogic.gridColumns
    );
    if (currentRows >= 45) {
      const rowsLeft = this.gameLogic.maxRows - currentRows;
      if (rowsLeft <= 5) {
        this.notifications.show(
          `Warning: Only ${rowsLeft} lines left before grid limit!`,
          'warning',
          3000
        );
      }
    }

    const hasValidPairs = this.gameLogic.hasValidPairs();
    const hasAssists = this.gameLogic.hasAvailableAssists();

    if (!hasValidPairs && !hasAssists) {
      this.notifications.show(
        'Warning: No valid moves left and no assists available! Game will end.',
        'warning',
        3000
      );

      setTimeout(() => {
        if (this.gameLogic.checkLoseCondition()) {
          this.loseGame();
        }
      }, 100);
    } else if (!hasValidPairs && hasAssists) {
      this.notifications.show(
        'No valid moves left! Use your remaining assists.',
        'info',
        3000
      );
    }
  }

  updateAssistButtons() {
    if (!this.gameLogic) return;

    const assistInfo = this.gameLogic.getAssistInfo();

    Object.keys(assistInfo).forEach((assist) => {
      const button = document.getElementById(`${assist}Button`);
      const counter = document.getElementById(`${assist}Counter`);
      const info = assistInfo[assist];

      if (button && counter) {
        if (info.limit === Infinity) {
          counter.textContent = '∞';
        } else {
          counter.textContent = info.limit - info.used;

          if (info.limit - info.used <= 2) {
            counter.style.color = '#ff6b6b';
            counter.style.fontWeight = 'bold';
          } else {
            counter.style.color = '';
            counter.style.fontWeight = '';
          }
        }

        if (assist === 'revert') {
          button.disabled = !info.available;
        } else {
          button.disabled = !info.available;
        }

        if (button.disabled) {
          button.classList.add('assist-button--disabled');
        } else {
          button.classList.remove('assist-button--disabled');
        }
      }
    });

    const eraserButton = document.getElementById('eraserButton');
    if (eraserButton) {
      if (this.eraserMode) {
        eraserButton.classList.add('assist-button--active');
      } else {
        eraserButton.classList.remove('assist-button--active');
      }
    }
  }

  useAssist(assist) {
    if (!this.gameLogic) return;

    const assistInfo = this.gameLogic.getAssistInfo()[assist];
    if (!assistInfo.available && assist !== 'eraser') {
      this.notifications.show(`${assist} is not available!`, 'warning');
      return;
    }

    switch (assist) {
      case 'hints':
        this.useHints();
        break;
      case 'revert':
        this.useRevert();
        break;
      case 'addNumbers':
        this.useAddNumbers();
        break;
      case 'shuffle':
        this.useShuffle();
        break;
      case 'eraser':
        this.toggleEraserMode();
        break;
      default:
        this.notifications.show(`Unknown assist: ${assist}`, 'error');
    }
  }

  useHints() {
    const count = this.gameLogic.countValidMoves();
    let displayCount = count.toString();
    if (count > 5) {
      displayCount = '5+';
    }
    this.gameLogic.assistUses.hints++;
    this.soundManager.playAssistUse();
    this.notifications.show(`Available moves: ${displayCount}`, 'info');
    this.updateAssistButtons();
  }

  useRevert() {
    if (this.gameLogic.revert()) {
      this.soundManager.playAssistUse();
      this.renderGameGrid();
      this.updateGameInfo();
      this.updateAssistButtons();
      this.notifications.show('Last move reverted', 'success');
    } else {
      this.notifications.show('No moves to revert', 'warning');
    }
  }

  useAddNumbers() {
    if (
      this.gameLogic.assistUses.addNumbers >=
      this.gameLogic.assistLimits.addNumbers
    ) {
      this.notifications.show('Add Numbers limit reached', 'warning');
      return;
    }

    const willExceedLimit = this.willAddNumbersExceedLimit();

    if (willExceedLimit) {
      this.loseGame();
      return;
    }

    if (this.gameLogic.addNumbers()) {
      this.soundManager.playAssistUse();
      this.renderGameGrid();
      this.updateAssistButtons();
      this.notifications.show('Numbers added to grid', 'success');

      if (this.gameLogic.checkWinCondition()) {
        this.winGame();
      } else if (this.gameLogic.checkLoseCondition()) {
        this.loseGame();
      }
    } else {
      this.notifications.show('Cannot add numbers at this time', 'warning');
    }
  }

  willAddNumbersExceedLimit() {
    if (!this.gameLogic) return false;

    const currentGridLength = this.gameLogic.grid.length;
    const gridColumns = this.gameLogic.gridColumns;
    const maxRows = this.gameLogic.maxRows;

    const maxPossibleNumbers = maxRows * gridColumns - currentGridLength;

    let numbersToAdd = 0;

    switch (this.gameLogic.mode) {
      case 'classic':
        numbersToAdd = Math.min(9, maxPossibleNumbers);
        break;
      case 'random':
        numbersToAdd = Math.min(9, maxPossibleNumbers);
        break;
      case 'chaotic': {
        const currentNumbersCount = this.gameLogic.grid.filter(
          (num) => num !== null
        ).length;
        numbersToAdd = Math.min(currentNumbersCount, maxPossibleNumbers);
        break;
      }
    }

    if (numbersToAdd <= 0) return false;

    const newTotalNumbers = currentGridLength + numbersToAdd;
    const newRows = Math.ceil(newTotalNumbers / gridColumns);

    return newRows >= maxRows;
  }

  useShuffle() {
    if (this.gameLogic.shuffle()) {
      this.soundManager.playAssistUse();
      this.renderGameGrid();
      this.updateAssistButtons();
      this.notifications.show('Grid shuffled', 'success');
    } else {
      this.notifications.show('Shuffle limit reached', 'warning');
    }
  }

  toggleEraserMode() {
    if (this.eraserMode) {
      this.deactivateEraserMode();
    } else {
      this.activateEraserMode();
    }
  }

  activateEraserMode() {
    const assistInfo = this.gameLogic.getAssistInfo().eraser;
    if (!assistInfo.available) {
      this.notifications.show('Eraser limit reached', 'warning');
      return;
    }

    this.eraserMode = true;
    this.renderGameGrid();
    this.updateAssistButtons();
    this.notifications.show(
      'Click on any number to erase it. Click Eraser button again to cancel.',
      'info',
      5000
    );
  }

  deactivateEraserMode() {
    this.eraserMode = false;
    this.renderGameGrid();
    this.updateAssistButtons();
  }

  showPairSuccess(points) {
    this.notifications.show(`Valid pair. +${points} points`, 'success');
  }

  showPairError() {
    this.notifications.show('Invalid pair. Try again.', 'error');
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateTimer();
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimer() {
    const timerElement = this.screens.game.querySelector('#gameTimer');
    const minutes = Math.floor(this.elapsedTime / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  winGame() {
    this.stopTimer();
    const finalTime = this.screens.game.querySelector('#gameTimer').textContent;
    this.saveGameResult(true, finalTime);

    localStorage.removeItem('pairEmUpSavedGame');
    this.checkSavedGame();

    this.soundManager.playWin();
    this.notifications.show(
      `Congratulations! You won with ${this.gameLogic.score} points in ${finalTime}!`,
      'success',
      5000
    );
    setTimeout(() => {
      this.returnToMenu();
    }, 3000);
  }

  loseGame() {
    this.stopTimer();
    const finalTime = this.screens.game.querySelector('#gameTimer').textContent;
    this.saveGameResult(false, finalTime);

    let loseMessage = 'Game over ';
    if (this.gameLogic.checkGridLimit()) {
      loseMessage += 'Grid limit (50 lines) reached.';
    } else {
      loseMessage += 'No valid moves available and all assists used.';
    }

    localStorage.removeItem('pairEmUpSavedGame');
    this.checkSavedGame();

    this.soundManager.playLose();
    this.notifications.show(loseMessage, 'error', 5000);
    setTimeout(() => {
      this.returnToMenu();
    }, 3000);
  }

  checkSavedGame() {
    const savedGame = localStorage.getItem('pairEmUpSavedGame');
    const continueButton = this.screens.start?.querySelector('#continueButton');

    if (savedGame && continueButton) {
      try {
        const gameState = JSON.parse(savedGame);

        if (gameState.logic && gameState.logic.grid) {
          continueButton.disabled = false;
          return;
        }
      } catch (error) {
        this.notifications.show('Invalid saved game found', 'warn');
      }
    }

    if (continueButton) {
      continueButton.disabled = true;
    }
  }

  continueGame() {
    const savedGame = localStorage.getItem('pairEmUpSavedGame');
    if (savedGame) {
      try {
        const gameState = JSON.parse(savedGame);
        this.loadSavedGame(gameState);
      } catch (error) {
        this.notifications.show('Error loading saved game', 'error');
        localStorage.removeItem('pairEmUpSavedGame');
        this.checkSavedGame();
      }
    }
  }

  loadSavedGame(savedState) {
    if (!savedState || !savedState.logic) {
      this.notifications.show('No valid saved game found', 'error');
      return;
    }

    try {
      this.gameLogic = new GameLogic(savedState.logic.mode, savedState.logic);

      this.startTime = Date.now() - (savedState.elapsedTime || 0);
      this.elapsedTime = savedState.elapsedTime || 0;

      this.eraserMode = savedState.eraserMode || false;

      this.startTimer();
      this.showScreen('game');
      this.renderGameGrid();
      this.updateGameInfo();
      this.updateAssistButtons();

      setTimeout(() => {
        if (this.gameLogic.checkWinCondition()) {
          this.winGame();
        } else if (this.gameLogic.checkLoseCondition()) {
          this.loseGame();
        }
      }, 100);

      this.soundManager.playGameStart();
      this.notifications.show('Saved game loaded successfully', 'success');
    } catch (error) {
      this.notifications.show('Error loading game state', 'error');
    }
  }

  autoSaveGame() {
    if (this.gameLogic && this.settings.autoSave) {
      this.saveGame(false);
    }
  }

  showSettings() {
    this.populateSettingsForm();
    this.showModal('settings');
  }

  hideSettings() {
    this.hideModal('settings');
  }

  showResults() {
    this.renderResultsContent();
    this.showModal('results');
  }

  hideResults() {
    this.hideModal('results');
  }

  populateSettingsForm() {
    const themeSelect = document.getElementById('themeSelect');
    const soundToggle = document.getElementById('soundToggle');
    const autoSaveToggle = document.getElementById('autoSaveToggle');

    if (themeSelect) themeSelect.value = this.settings.theme;
    if (soundToggle) soundToggle.checked = this.settings.sound;
    if (autoSaveToggle) autoSaveToggle.checked = this.settings.autoSave;
  }

  saveSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const soundToggle = document.getElementById('soundToggle');
    const autoSaveToggle = document.getElementById('autoSaveToggle');

    this.settings.theme = themeSelect.value;
    this.settings.sound = soundToggle.checked;
    this.settings.autoSave = autoSaveToggle.checked;

    localStorage.setItem('pairEmUpSettings', JSON.stringify(this.settings));
    this.applySettings();
    this.hideSettings();

    this.notifications.show('Settings saved successfully', 'success');
  }

  switchResultsTab(tabName) {
    this.currentResultsTab = tabName;

    const tabs = document.querySelectorAll('.results-screen__tab');
    tabs.forEach((tab) => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('results-screen__tab--active');
      } else {
        tab.classList.remove('results-screen__tab--active');
      }
    });

    this.renderResultsContent();
  }

  renderResultsContent() {
    const resultsContent = document.getElementById('resultsContent');

    if (this.gameResults.length === 0) {
      resultsContent.innerHTML = `
        <div class="results-screen__no-results">
          No game results yet. Play some games to see your results here.
        </div>
      `;
      return;
    }

    let resultsToShow = [...this.gameResults].slice(-5);

    if (this.currentResultsTab === 'best') {
      resultsToShow.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return this.timeToSeconds(a.time) - this.timeToSeconds(b.time);
      });
    } else {
      resultsToShow = resultsToShow.sort(
        (a, b) => this.timeToSeconds(a.time) - this.timeToSeconds(b.time)
      );
    }

    const tableHTML = `
      <table class="results-screen__table">
        <thead>
          <tr>
            <th class="results-screen__table-header">Mode</th>
            <th class="results-screen__table-header">Result</th>
            <th class="results-screen__table-header">Score</th>
            <th class="results-screen__table-header">Time</th>
            <th class="results-screen__table-header">Date</th>
          </tr>
        </thead>
        <tbody>
          ${resultsToShow
            .map(
              (result) => `
            <tr>
              <td class="results-screen__table-cell">${result.mode}</td>
              <td class="results-screen__table-cell">
                ${
                  result.won
                    ? '<span class="results-screen__win-indicator">WIN</span>'
                    : '<span class="results-screen__loss-indicator">LOSS</span>'
                }
              </td>
              <td class="results-screen__table-cell">${result.score}</td>
              <td class="results-screen__table-cell">${result.time}</td>
              <td class="results-screen__table-cell">${this.formatDate(result.date)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    resultsContent.innerHTML = tableHTML;
  }

  timeToSeconds(timeStr) {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }

  saveGameResult(won, finalTime) {
    const result = {
      mode: this.gameLogic.mode,
      won: won,
      score: this.gameLogic.score,
      time: finalTime,
      date: new Date().toISOString(),
    };

    this.gameResults.push(result);

    if (this.gameResults.length > 5) {
      this.gameResults = this.gameResults.slice(-5);
    }

    this.saveGameResults();
  }

  loadGameResults() {
    const savedResults = localStorage.getItem('pairEmUpGameResults');
    if (savedResults) {
      this.gameResults = JSON.parse(savedResults);

      if (this.gameResults.length > 5) {
        this.gameResults = this.gameResults.slice(-5);
        this.saveGameResults();
      }
    } else {
      this.gameResults = [];
    }
  }

  saveGameResults() {
    localStorage.setItem(
      'pairEmUpGameResults',
      JSON.stringify(this.gameResults)
    );
  }

  clearGameResults() {
    if (this.gameResults.length > 0) {
      this.gameResults = [];
      this.saveGameResults();
      this.renderResultsContent();
      this.notifications.show('Game results cleared', 'success');
    } else {
      this.notifications.show('No game results to clear', 'info');
    }
  }

  resetGame() {
    if (this.gameLogic && this.gameLogic.score > 0) {
      this.deactivateEraserMode();
      const currentMode = this.gameLogic.mode;

      localStorage.removeItem('pairEmUpSavedGame');
      this.checkSavedGame();

      this.startNewGame(currentMode);
    } else {
      this.deactivateEraserMode();
      if (this.gameLogic) {
        const currentMode = this.gameLogic.mode;
        this.startNewGame(currentMode);
      }
    }
  }

  saveGame(showNotification = true) {
    if (this.gameLogic) {
      const gameState = {
        logic: this.gameLogic.getGameState(),
        elapsedTime: this.elapsedTime,
        startTime: this.startTime,
        eraserMode: this.eraserMode,
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem('pairEmUpSavedGame', JSON.stringify(gameState));
        if (showNotification) {
          this.notifications.show('Game saved successfully', 'success');
        }
        this.checkSavedGame();
      } catch (error) {
        if (showNotification) {
          this.notifications.show('Error saving game', 'error');
        }
      }
    }
  }

  returnToMenu() {
    this.stopTimer();
    this.deactivateEraserMode();
    this.showScreen('start');
    this.checkSavedGame();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('pairEmUpSettings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
    } else {
      this.settings = {
        sound: true,
        theme: 'light',
        autoSave: true,
      };
    }
    this.applySettings();
  }

  applySettings() {
    if (this.settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    this.soundManager.setEnabled(this.settings.sound);
  }

  updateProgressBar() {
    if (!this.gameLogic) return;

    const progressBar = document.getElementById('progressBar');
    const progress = Math.min(this.gameLogic.score, 100);
    const percentage = progress;

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }
}

export default PairEmUpGame;
