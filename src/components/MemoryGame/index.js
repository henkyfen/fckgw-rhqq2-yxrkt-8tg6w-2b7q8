import DesktopWindow from '../DesktopWindow/index.js';
import MemoryGameScoreboard from './MemoryGameScoreboard.js';

const baseGameImagePath = './assets/images/memory-game';

/**
 * Class representing a Memory Game.
 * @augments DesktopWindow
 */
export default class MemoryGame extends DesktopWindow {
  _state;
  timerInterval;
  _username = localStorage.getItem('memory-game-username') || null;
  boardData = this.getEmptyBoardData();
  attempts = 0;

  /**
   * Gets the current state of the game.
   * @returns {string} The current state.
   */
  get state() {
    return this._state;
  }

  /**
   * Sets the state of the game and updates the UI accordingly.
   * @param {string} value - The new state value.
   */
  set state(value) {
    this._state = value;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.renderBody(value);
  }

  /**
   * Gets the username of the player.
   * @returns {string|null} The username or null if not set.
   */
  get username() {
    return this._username || localStorage.getItem('memory-game-username') || null;
  }

  /**
   * Sets the username of the player and optionally remembers it.
   * @param {object} value - The username object containing username and rememberMe flag.
   */
  set username(value) {
    if (value === null || value === undefined) {
      this._username = null;
      localStorage.removeItem('memory-game-username');
    } else {
      const { username, rememberMe } = value;
      this._username = username;
      if (rememberMe) {
        localStorage.setItem('memory-game-username', username);
      }
    }
  }

  /**
   * Lifecycle method called when the component is added to the DOM.
   */
  connectedCallback() {
    super.connectedCallback();
    this.state = this.username ? 'board-choice' : 'username-choice';
  }

  /**
   * Creates the control panel for the game window.
   * @returns {HTMLDivElement} The control panel element.
   */
  createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('window__control-panel');

    controlPanel.innerHTML = `
      <div class="window__dropdown">
        <div class="window__dropdown-activator">View</div>
        <div class="window__dropdown-content">
          <div data-action="change-board" class="window__dropdown-choice" style="white-space: nowrap;">Board Size Menu</div>
          <div data-action="view-scoreboard" class="window__dropdown-choice" style="white-space: nowrap;">Scoreboard</div>
        </div>
      </div>
      <div class="window__dropdown">
        <div class="window__dropdown-activator">Settings</div>
        <div class="window__dropdown-content">
          <div data-action="change-username" class="window__dropdown-choice" style="white-space: nowrap;">Change Username</div>
        </div>
      </div>
    `;

    return controlPanel;
  }

  /**
   * Renders the body of the game based on the current state.
   * @param {string} state - The current state of the game.
   */
  renderBody(state) {
    const container = document.createElement('div');
    container.classList.add('app-container');

    switch (state) {
      case 'username-choice':
        container.appendChild(this.createUsernameChoiceMenu());
        break;
      case 'board-choice':
        if (!this.username) {
          this.state = 'username-choice';
          return;
        }
        this.boardData = this.getEmptyBoardData();
        this.attempts = 0;
        container.appendChild(this.createBoardChoiceMenu());
        break;
      case 'game':
        this.startTime = null;
        this.endTime = null;
        this.generateBoardData();
        container.appendChild(this.createGameBoard(this.boardData));
        break;
      case 'win':
      case 'fail':
        this.endTime = new Date();
        if (state === 'win') {
          this.saveScore();
        }
        container.appendChild(this.createGameOverWindow(state));
        break;
      case 'scoreboard':
        container.appendChild(this.createScoreboard());
        break;
      default:
        throw new Error('Invalid state');
    }

    this.body.replaceChildren(container);
  }

  /**
   * Saves the player's score to local storage.
   */
  saveScore() {
    const appendix = `${this.boardData.columnCount}x${this.boardData.rowCount}`;
    const localStorageKey = `memory-game-scores-${appendix}`;
    const scores = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    const time = ((this.endTime - this.startTime) / 1000).toFixed(2);
    scores.push({ name: this.username, attempts: this.attempts, time });
    localStorage.setItem(localStorageKey, JSON.stringify(scores));
  }

  /**
   * Creates the username choice menu.
   * @returns {HTMLFormElement} The username choice menu element.
   */
  createUsernameChoiceMenu() {
    const menu = document.createElement('form');
    menu.classList.add('auth');
    menu.innerHTML = `
      <h2 class="auth__title">Welcome to Memory Game!</h2>
      <input class="auth__input" type="text" name="username" placeholder="Enter your name" required />
      <div class="auth__checkbox">
        <input type="checkbox" id="remember-me" name="remember-me" />
        <label for="remember-me">Remember me</label>
      </div>
      <button class="auth__button" type="submit">Sign in</button>
    `;

    return menu;
  }

  /**
   * Creates the board choice menu.
   * @returns {HTMLDivElement} The board choice menu element.
   */
  createBoardChoiceMenu() {
    const menu = document.createElement('div');
    menu.classList.add('menu');
    menu.innerHTML = `
      <h2>Select Board Size</h2>
      <div class="menu__control-panel">
        <button data-size="2x2" data-action="menu">2x2</button>
        <button data-size="2x3" data-action="menu">2x3</button>
        <button data-size="2x4" data-action="menu">2x4</button>
        <button data-size="4x4" data-action="menu">4x4</button>
      </div>
    `;

    return menu;
  }

  /**
   * Generates the board data including key mapping and tile data.
   */
  generateBoardData() {
    const keyMapping = this.getKeyMapping(this.boardData.rowCount, this.boardData.columnCount);
    this.boardData.keyMapping = keyMapping;
    const tiles = this.generateTileData(this.boardData.rowCount, this.boardData.columnCount);
    this.boardData.tileObjectList = tiles;
  }

  /**
   * Generates a key mapping for the board based on its size.
   * @param {number} rowCount - The number of rows on the board.
   * @param {number} columnCount - The number of columns on the board.
   * @returns {object} The key mapping object.
   */
  getKeyMapping(rowCount, columnCount) {
    const keyMapping = {};
    const keys =
      rowCount < 4
        ? [
            ['q', 'w', 'e', 'r'],
            ['a', 's', 'd', 'f'],
            ['z', 'x', 'c', 'v'],
          ]
        : [
            ['1', '2', '3', '4'],
            ['q', 'w', 'e', 'r'],
            ['a', 's', 'd', 'f'],
            ['z', 'x', 'c', 'v'],
          ];

    let index = 0;
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < columnCount; col++) {
        if (keys[row] && keys[row][col]) {
          keyMapping[keys[row][col]] = index;
        }
        index++;
      }
    }
    return keyMapping;
  }

  /**
   * Generates tile data for the board.
   * @param {number} rowCount - The number of rows on the board.
   * @param {number} columnCount - The number of columns on the board.
   * @returns {Array} The array of tile data objects.
   */
  generateTileData(rowCount, columnCount) {
    const totalTiles = rowCount * columnCount;
    const tilesHTML = [];
    for (let i = 0; i < totalTiles; i++) {
      const tileElement = document.createElement('div');
      tileElement.classList.add('tile');
      tileElement.dataset.id = i;
      tileElement.dataset.action = 'tile';

      const keyHint = this.getKeyHint(i);
      const hiddenTileImageTag = this.generateHiddenTileImageTag();

      tileElement.appendChild(keyHint);
      tileElement.appendChild(hiddenTileImageTag);
      tilesHTML.push(tileElement);
    }

    const imagesHTML = this.generateImageTags(totalTiles);

    const tileData = [];
    for (let i = 0; i < totalTiles; i++) {
      tileData.push({
        imageTag: imagesHTML[i],
        tileTag: tilesHTML[i],
        isFlipped: false,
        isMatched: false,
      });
    }
    return tileData;
  }

  /**
   * Generates image tags for the tiles.
   * @param {number} totalTiles - The total number of tiles.
   * @returns {Array} The array of image elements.
   */
  generateImageTags(totalTiles) {
    const images = [];
    const availableIndices = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffledIndices = availableIndices.sort(() => Math.random() - 0.5);
    const imageIndices = shuffledIndices.slice(0, totalTiles / 2);
    for (const index of imageIndices) {
      const image1 = document.createElement('img');
      const image2 = document.createElement('img');
      image1.src = `${baseGameImagePath}/${index}.png`;
      image2.src = `${baseGameImagePath}/${index}.png`;
      images.push(image1, image2);
    }
    return images.sort(() => Math.random() - 0.5);
  }

  /**
   * Creates the game board element.
   * @param {object} boardData - The data for the board.
   * @returns {HTMLDivElement} The game board element.
   */
  createGameBoard(boardData) {
    this.timeLeft = this.boardData.rowCount * this.boardData.columnCount * 2;
    const timer = document.createElement('div');
    timer.classList.add('timer');
    timer.id = 'timer';
    timer.textContent = `${this.timeLeft}s`;

    const boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.style.gridTemplateColumns = `repeat(${boardData.columnCount}, 80px)`;
    boardElement.style.gridTemplateRows = `repeat(${boardData.rowCount}, 80px)`;

    boardData.tileObjectList.forEach((tile) => {
      boardElement.appendChild(tile.tileTag);
    });

    const container = document.createElement('div');
    container.classList.add('game-container');

    container.appendChild(timer);
    container.appendChild(boardElement);

    return container;
  }

  /**
   * Handles the click event on menu buttons.
   * @param {Event} event - The click event.
   */
  handleMenuButtonClick({ target }) {
    const dataSize = target.dataset.size;
    this.boardData.columnCount = parseInt(dataSize.split('x')[0]);
    this.boardData.rowCount = parseInt(dataSize.split('x')[1]);
    this.state = 'game';
  }

  /**
   * Handles the click event on tiles.
   * @param {Event} event - The click event.
   */
  handleTileClick({ target }) {
    if (target.classList.contains('tile')) {
      if (this.timerInterval === undefined) {
        this.startTimer();
      }

      const tileIndex = parseInt(target.dataset.id);
      const tileObject = this.boardData.tileObjectList[tileIndex];

      if (tileObject.isFlipped || tileObject.isMatched) return;

      tileObject.isFlipped = true;
      tileObject.tileTag.replaceChildren(tileObject.imageTag);

      this.boardData.currentlyFlippedTiles.push(tileObject);

      if (this.boardData.currentlyFlippedTiles.length === 2) {
        this.evaluateFlippedTiles();
      }
    }
  }

  /**
   * Starts the game timer.
   */
  startTimer() {
    this.startTime = new Date();
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeLeft = (this.timeLeft - 0.1).toFixed(1);
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.state = 'fail';
      }
    }, 100);
  }

  /**
   * Updates the timer display on the UI.
   */
  updateTimerDisplay() {
    const timerElement = this.shadowRoot.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${this.timeLeft}s`;
      timerElement.style.color =
        this.timeLeft <= 3 ? 'red' : this.timeLeft <= 5 ? 'orange' : 'green';
    }
  }

  /**
   * Evaluates the currently flipped tiles to check for matches.
   */
  evaluateFlippedTiles() {
    const [flippedTile1, flippedTile2] = this.boardData.currentlyFlippedTiles;

    if (flippedTile1.imageTag.src === flippedTile2.imageTag.src) {
      flippedTile1.isMatched = true;
      flippedTile2.isMatched = true;
      this.boardData.matchedTilesCount++;

      if (this.allTilesMatched()) {
        this.state = 'win';
      }
    } else {
      this.attempts++;
      setTimeout(() => {
        flippedTile1.isFlipped = false;
        flippedTile2.isFlipped = false;

        const tileId1 = Number(flippedTile1.tileTag.dataset.id);
        const tileId2 = Number(flippedTile2.tileTag.dataset.id);

        const keyHint1 = this.getKeyHint(tileId1);
        const keyHint2 = this.getKeyHint(tileId2);

        const hiddenImageTag1 = this.generateHiddenTileImageTag();
        const hiddenImageTag2 = this.generateHiddenTileImageTag();

        flippedTile1.tileTag.replaceChildren(keyHint1, hiddenImageTag1);
        flippedTile2.tileTag.replaceChildren(keyHint2, hiddenImageTag2);
      }, 400);
    }

    this.boardData.currentlyFlippedTiles = [];
  }

  /**
   * Checks if all tiles have been matched.
   * @returns {boolean} True if all tiles are matched, otherwise false.
   */
  allTilesMatched() {
    return this.boardData.matchedTilesCount >= this.boardData.tileObjectList.length / 2;
  }

  /**
   * Generates a key hint element for a tile.
   * @param {number} tileId - The ID of the tile.
   * @returns {HTMLSpanElement} The key hint element.
   */
  getKeyHint(tileId) {
    const keyHint = document.createElement('span');
    keyHint.classList.add('tile__key-hint');
    const entry = Object.entries(this.boardData.keyMapping).find(
      ([key, value]) => value === tileId,
    );
    keyHint.textContent = entry ? entry[0] : '';
    return keyHint;
  }

  /**
   * Generates a hidden tile image tag.
   * @returns {HTMLImageElement} The hidden tile image element.
   */
  generateHiddenTileImageTag() {
    const hiddenImageTag = document.createElement('img');
    hiddenImageTag.src = `${baseGameImagePath}/0.png`;
    hiddenImageTag.style.pointerEvents = 'none';
    return hiddenImageTag;
  }

  /**
   * Creates the game over window element.
   * @param {string} state - The state of the game ('win' or 'fail').
   * @returns {HTMLDivElement} The game over window element.
   */
  createGameOverWindow(state) {
    const gameOverWindow = document.createElement('div');
    gameOverWindow.classList.add('game-over');

    const messageElement = document.createElement('p');
    switch (state) {
      case 'win':
        messageElement.textContent = `Congrats! It took you ${this.attempts} attempts to win.`;
        break;
      case 'fail':
        messageElement.textContent = 'Game Over! You ran out of time. Wanna try again?';
        break;
    }
    messageElement.style.textAlign = 'center';
    messageElement.style.margin = '1rem 1rem 0';

    const controlPanel = document.createElement('div');
    controlPanel.classList.add('game-over__control-panel');

    const restartButton = document.createElement('button');
    restartButton.classList.add('game-over__button');
    restartButton.textContent = 'Restart Game';
    restartButton.dataset.action = 'restart';

    const closeButton = document.createElement('button');
    closeButton.classList.add('game-over__button');
    closeButton.textContent = 'Back to Menu';
    closeButton.dataset.action = 'change-board';

    gameOverWindow.appendChild(messageElement);
    gameOverWindow.appendChild(controlPanel);
    controlPanel.appendChild(restartButton);
    controlPanel.appendChild(closeButton);

    return gameOverWindow;
  }

  /**
   * Creates the scoreboard element.
   * @returns {MemoryGameScoreboard} The scoreboard element.
   */
  createScoreboard() {
    const scoreBoard = new MemoryGameScoreboard(this);
    return scoreBoard;
  }

  /**
   * Adds event listeners for the game.
   */
  addEventListeners() {
    super.addEventListeners();
    this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('keydown', this.handleKeydown.bind(this));
    this.body.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Handles the submit event for the username form.
   * @param {Event} event - The submit event.
   */
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const rememberMe = formData.get('remember-me');

    if (username) {
      this.username = { username, rememberMe: !!rememberMe };
      this.state = 'board-choice';
    }
  }

  /**
   * Handles the keydown event for keyboard interactions.
   * @param {Event} event - The keydown event.
   */
  handleKeydown(event) {
    if (!this.isFocused || this.state !== 'game') return;

    if (event.key === 'Escape') {
      this.state = 'board-choice';
    }

    const key = event.key.toLowerCase();
    const keyMapping = this.boardData.keyMapping;

    if (keyMapping[key] !== undefined) {
      const tileIndex = keyMapping[key];
      const tileObject = this.boardData.tileObjectList[tileIndex];

      if (tileObject.isFlipped || tileObject.isMatched) return;

      this.handleTileClick({ target: tileObject.tileTag });
    }
  }

  /**
   * Handles the click event for various game actions.
   * @param {Event} event - The click event.
   */
  handleClick(event) {
    const action = event.target.dataset.action;

    switch (action) {
      case 'tile':
        this.handleTileClick(event);
        break;
      case 'menu':
        this.handleMenuButtonClick(event);
        break;
      case 'restart':
        this.restartGame();
        break;
      case 'change-username':
        this.state = 'username-choice';
        break;
      case 'change-board':
        this.state = 'board-choice';
        break;
      case 'view-scoreboard':
        this.state = 'scoreboard';
        break;
    }
  }

  /**
   * Restarts the game with the current board size.
   */
  restartGame() {
    const rowCount = this.boardData.rowCount;
    const columnCount = this.boardData.columnCount;

    this.boardData = this.getEmptyBoardData();
    this.boardData.rowCount = rowCount;
    this.boardData.columnCount = columnCount;

    this.attempts = 0;
    this.state = 'game';
  }

  /**
   * Gets an empty board data object.
   * @returns {object} The empty board data object.
   */
  getEmptyBoardData() {
    return {
      rowCount: 0,
      columnCount: 0,
      keyMapping: {},
      timeLeft: 0,
      tileObjectList: [],
      currentlyFlippedTiles: [],
      matchedTilesCount: 0,
    };
  }

  /**
   * Gets the styles for the game component.
   * @returns {string} The styles as a string.
   */
  getStyles() {
    return (
      super.getStyles() +
      `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-container {
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 32px;
          box-sizing: border-box;
        }

        .auth {
          width: 360px;
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .auth > * {
          width: 100%;
        }

        .auth__title {
          text-align: center;
          font-size: 1.75rem;
          font-weight: 500;
        }

        .auth__input {
          padding: 4px;
        }

        .auth__checkbox {
          display: flex;
          flex-flow: row nowrap;
          font-size: 0.8rem;
        }

        .auth__checkbox input {
          margin-left: 0;
        }

        .auth__button {
          height: 30px;
        }

        .menu {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .menu__control-panel {
          display: flex;
          flex-flow: row nowrap;
          gap: 10px;
          padding: 1rem;
        }

        .menu__control-panel button {
          width: 75px;
        }

        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          height: 100%;
        }

        .timer {
          padding: 0.5rem;
          font-size: 1.25rem;
        }

        .board {
          width: 100%;
          height: 100%;
          display: grid;
          justify-content: center;
          align-content: center;
          gap: 5px;
        }

        .tile {
          position: relative;
          background-color: #ccc;
          display: flex;
          align-items: center;
          width: 80px;
          height: 80px;
          justify-content: center;
          cursor: pointer;
        }
        
        .tile img {
          max-width: 100%;
          max-height: 100%;
        }

        .tile__key-hint {
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .game-over {
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .game-over__control-panel {
          display: flex;
          flex-flow: row nowrap;
          justify-content: center;
          gap: 1rem;
          margin: 1rem;
        }

        .game-over__button {
          white-space: nowrap;
        }
      </style>`
    );
  }
}

customElements.define('memory-game', MemoryGame);
