import DesktopWindow from '../DesktopWindow/index.js';

const baseGameImagePath = './assets/images/memory-game';

export default class MemoryGame extends DesktopWindow {
  _state;
  timerInterval;
  _username = localStorage.getItem('memory-game-username') || null;
  boardData = this.getEmptyBoardData();

  attempts = 0;

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
    this.renderBody(value);
  }

  get username() {
    return this._username || localStorage.getItem('memory-game-username') || null;
  }

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

  connectedCallback() {
    super.connectedCallback();
    this.state = 'username-choice';
  }

  createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('window__control-panel');

    controlPanel.innerHTML = `
      <div class="window__dropdown">
        <div class="window__dropdown-activator">Settings</div>
        <div class="window__dropdown-content">
          <div data-action="change-username" class="window__dropdown-choice" style="white-space: nowrap;">Change Username</div>
          <div data-action="change-board" class="window__dropdown-choice" style="white-space: nowrap;">Change Board Size</div>
          <div data-action="backToMenu" class="window__dropdown-choice" style="white-space: nowrap;">Back to Menu</div>
        </div>
      </div>
    `;

    this.controlPanel = controlPanel;
    this.changeBoardSizeButton = controlPanel.querySelector('[data-action="change-board"]');

    return controlPanel;
  }

  renderBody(state) {
    this.changeBoardSizeButton.classList.remove('disabled');
    switch (state) {
      case 'username-choice':
        this.changeBoardSizeButton.classList.add('disabled');
        if (this.username) {
          this.state = 'board-choice';
          return;
        }
        this.body.replaceChildren(this.createUsernameChoiceMenu());
        break;
      case 'board-choice':
        this.changeBoardSizeButton.classList.add('disabled');
        this.boardData = this.getEmptyBoardData();
        this.attempts = 0;
        this.body.replaceChildren(this.createBoardChoiceMenu());
        break;
      case 'game':
        this.generateBoardData();
        this.body.replaceChildren(this.createGameBoard(this.boardData));
        break;
      case 'win':
      case 'fail':
        this.body.replaceChildren(this.createGameOverWindow(state));
        break;
      default:
        throw new Error('Invalid state');
    }
  }

  addEventListeners() {
    super.addEventListeners();
    this.shadowRoot.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('keydown', this.handleKeydown.bind(this));
    this.body.addEventListener('submit', this.handleSubmit.bind(this));
  }

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

  generateBoardData() {
    const keyMapping = this.getKeyMapping(this.boardData.rowCount, this.boardData.columnCount);
    this.boardData.keyMapping = keyMapping;
    const tiles = this.generateTileData(this.boardData.rowCount, this.boardData.columnCount);
    this.boardData.tileObjectList = tiles;
  }

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

  startTimer() {
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeLeft = (this.timeLeft - 0.1).toFixed(1);
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.state = 'fail';
      }
    }, 100);
  }

  updateTimerDisplay() {
    const timerElement = this.shadowRoot.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${this.timeLeft}s`;
      timerElement.style.color =
        this.timeLeft <= 3 ? 'red' : this.timeLeft <= 5 ? 'orange' : 'green';
    }
  }

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
        this.username = null;
        this.state = 'username-choice';
        break;
      case 'change-board':
        this.state = 'board-choice';
        break;
    }
  }

  handleMenuButtonClick({ target }) {
    const dataSize = target.dataset.size;
    this.boardData.columnCount = parseInt(dataSize.split('x')[0]);
    this.boardData.rowCount = parseInt(dataSize.split('x')[1]);
    this.state = 'game';
  }

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

  allTilesMatched() {
    return this.boardData.matchedTilesCount >= this.boardData.tileObjectList.length / 2;
  }

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

  restartGame() {
    const rowCount = this.boardData.rowCount;
    const columnCount = this.boardData.columnCount;

    this.boardData = this.getEmptyBoardData();
    this.boardData.rowCount = rowCount;
    this.boardData.columnCount = columnCount;

    this.attempts = 0;
    this.state = 'game';
  }

  getKeyHint(tileId) {
    const keyHint = document.createElement('span');
    keyHint.classList.add('tile__key-hint');
    const entry = Object.entries(this.boardData.keyMapping).find(
      ([key, value]) => value === tileId,
    );
    keyHint.textContent = entry ? entry[0] : '';
    return keyHint;
  }

  generateHiddenTileImageTag() {
    const hiddenImageTag = document.createElement('img');
    hiddenImageTag.src = `${baseGameImagePath}/0.png`;
    hiddenImageTag.style.pointerEvents = 'none';
    return hiddenImageTag;
  }

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

        .auth {
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 2rem;
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
