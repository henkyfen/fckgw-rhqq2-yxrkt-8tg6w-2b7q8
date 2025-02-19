import DesktopWindow from '../DesktopWindow/index.js';

const baseGameImagePath = './assets/images/memory-game';

export default class MemoryGame extends DesktopWindow {
  _state;
  boardData = this.getEmptyBoardData();

  attempts = 0;

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
    this.renderBody(value);
  }

  connectedCallback() {
    super.connectedCallback();
    this.state = 'menu';
  }

  renderBody(state) {
    if (state === 'menu') {
      const menu = this.createMenu();
      this.body.replaceChildren(menu);
    } else if (state === 'game') {
      const tileObjectList = this.generateTileData(
        this.boardData.rowCount,
        this.boardData.columnCount,
      );
      this.boardData.tileObjectList = tileObjectList;
      const board = this.createGameBoard(this.boardData);
      this.body.replaceChildren(board);
    } else {
      throw new Error('Invalid state');
    }
  }

  addEventListeners() {
    super.addEventListeners();
    this.body.addEventListener('click', this.handleClick.bind(this));
  }

  createMenu() {
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

  generateTileData(rowCount, columnCount) {
    const totalTiles = rowCount * columnCount;
    const tilesHTML = [];
    for (let i = 0; i < totalTiles; i++) {
      const tileElement = document.createElement('div');
      tileElement.classList.add('tile');
      tileElement.setAttribute('data-id', i);
      tileElement.setAttribute('data-action', 'tile');
      const hiddenTileImageTag = this.generateHiddenTileImageTag();
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

  createGameBoard(boardData) {
    const boardElement = document.createElement('div');
    boardElement.classList.add('board');
    boardElement.style.gridTemplateColumns = `repeat(${boardData.columnCount}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${boardData.rowCount}, 1fr)`;

    boardData.tileObjectList.forEach((tile) => {
      boardElement.appendChild(tile.tileTag);
    });

    return boardElement;
  }

  handleClick(event) {
    const action = event.target.getAttribute('data-action');

    switch (action) {
      case 'tile':
        this.handleTileClick(event);
        break;
      case 'menu':
        this.handleMenuButtonClick(event);
        break;
    }
  }

  handleMenuButtonClick({ target }) {
    const dataSize = target.getAttribute('data-size');
    this.boardData.columnCount = parseInt(dataSize.split('x')[0]);
    this.boardData.rowCount = parseInt(dataSize.split('x')[1]);
    this.state = 'game';
  }

  handleTileClick({ target }) {
    if (target.classList.contains('tile')) {
      const tileIndex = parseInt(target.getAttribute('data-id'));
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
    } else {
      this.attempts++;
      setTimeout(() => {
        flippedTile1.isFlipped = false;
        flippedTile2.isFlipped = false;

        flippedTile1.tileTag.replaceChildren(this.generateHiddenTileImageTag());
        flippedTile2.tileTag.replaceChildren(this.generateHiddenTileImageTag());
      }, 400);
    }

    this.boardData.currentlyFlippedTiles = [];
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
        .menu {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .menu__control-panel {
          padding: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
      </style>`
    );
  }
}

customElements.define('memory-game', MemoryGame);
