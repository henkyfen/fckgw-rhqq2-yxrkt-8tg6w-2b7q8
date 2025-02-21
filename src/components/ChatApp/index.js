import DesktopWindow from '../DesktopWindow/index.js';

const baseChatImagePath = './assets/images/chat-app';

export default class ChatApp extends DesktopWindow {
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
    this.body.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username');
  }

  createMenu() {
    const menu = document.createElement('div');
    menu.classList.add('menu');

    const authForm = document.createElement('form');
    authForm.classList.add('auth');
    authForm.innerHTML = `
      <img src="${baseChatImagePath}/logo.webp" alt="Messenger Logo" />
      <label for="username">Enter your username</label>
      <input type="text" name="username" placeholder="Username" required />
      <button type="submit">Sign in</button>
    `;

    menu.appendChild(authForm);
    return menu;
  }

  getStyles() {
    return (
      super.getStyles() +
      `
      <style>
      .menu {
        position: relative;
        min-width: 250px;
        min-height: 400px;
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
      }

      .auth {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 12rem;
      }

      .auth label {
        font-size: 1rem;
      }

      .auth button {
        width: 100%;
      }

      .auth img {
        user-select: none;
        pointer-events: none;
        position: absolute;
        bottom: -8%;
        right: 0%;
        width: 180px;
        margin-bottom: 2rem;
        opacity: 0.4;
        z-index: -1;
      }
      </style>`
    );
  }
}

customElements.define('chat-app', ChatApp);
