import DesktopWindow from '../DesktopWindow/index.js';

const baseGameImagePath = './assets/images/memory-game';

export default class MemoryGame extends DesktopWindow {
  _state;

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

  handleClick(event) {
    const action = event.target.getAttribute('data-action');

    switch (action) {
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
