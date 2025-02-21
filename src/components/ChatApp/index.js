import DesktopWindow from '../DesktopWindow/index.js';

const baseChatImagePath = './assets/images/chat-app';

export default class ChatApp extends DesktopWindow {
  _state;
  _username = localStorage.getItem('username') || null;

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageListElement = null;
    this.inputFieldElement = null;
    this.renderBody(value);
  }

  get username() {
    return this._username || localStorage.getItem('username') || null;
  }

  set username(value) {
    if (value === null || value === undefined) {
      this._username = null;
      localStorage.removeItem('username');
    } else {
      const { username, rememberMe } = value;
      this._username = username;
      if (rememberMe) {
        localStorage.setItem('username', username);
      }
    }
  }

  socket;
  apiKey = 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd';
  channel = 'default_channel';
  messageListElement;
  inputFieldElement;

  connectedCallback() {
    super.connectedCallback();
    this.state = 'username-choice';
  }

  disconnectedCallback() {
    this.socket && this.socket.close();
  }

  renderBody(state) {
    this.body.style.width = '250px';
    this.body.style.height = '400px';

    if (state === 'username-choice') {
      if (this.username) {
        this.state = 'channel-choice';
        return;
      }
      this.body.replaceChildren(this.createUsernameChoiceMenu());
    } else if (state === 'channel-choice') {
      this.body.replaceChildren(this.createChannelChoiceMenu());
    } else if (state === 'chat') {
      const { messageListElement, inputFieldElement, chat } = this.createChat();
      this.messageListElement = messageListElement;
      this.inputFieldElement = inputFieldElement;
      this.body.replaceChildren(chat);
      this.connect();
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
    const form = event.target;

    switch (form.id) {
      case 'auth-form':
        this.handleAuthFormSubmit(form);
        break;
      case 'channel-form':
        this.handleChannelChoiceFormSubmit(form);
        break;
      case 'message-form':
        this.handleMessageFormSubmit(form);
        break;
      default:
        throw new Error('Unhandled form submission');
    }
  }

  handleAuthFormSubmit(form) {
    const formData = new FormData(form);
    const username = formData.get('username');
    const rememberMe = formData.get('remember-me');
    if (username) {
      this.username = { username, rememberMe: !!rememberMe };
      this.state = 'channel-choice';
    }
  }

  handleChannelChoiceFormSubmit(form) {
    const formData = new FormData(form);
    const channel = formData.get('channel');
    if (channel) {
      this.channel = channel;
      this.state = 'chat';
    }
  }

  handleMessageFormSubmit(form) {
    const formData = new FormData(form);
    const message = formData.get('message');
    if (message) {
      this.sendMessage(message);
      this.inputFieldElement.value = '';
    }
  }

  sendMessage(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not open.');
      return;
    }

    const message = {
      type: 'message',
      data,
      username: this.username,
      channel: this.channel,
      key: this.apiKey,
    };

    this.socket.send(JSON.stringify(message));
  }

  createMessageElement(message) {
    if (message.username.toLowerCase() === 'the server') {
      const serverMessageElement = document.createElement('p');
      serverMessageElement.classList.add('server-message');
      serverMessageElement.textContent = message.data;
      return serverMessageElement;
    } else {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');

      const usernameElement = document.createElement('p');
      usernameElement.classList.add('username');
      usernameElement.textContent = `${message.username}:`;
      messageElement.appendChild(usernameElement);

      const contentElement = document.createElement('p');
      contentElement.classList.add('content');
      contentElement.textContent = message.data;
      messageElement.appendChild(contentElement);

      return messageElement;
    }
  }

  createUsernameChoiceMenu() {
    const menu = document.createElement('div');
    menu.classList.add('container', 'menu');

    const authForm = document.createElement('form');
    authForm.id = 'auth-form';
    authForm.classList.add('form');
    authForm.innerHTML = `
      <img src="${baseChatImagePath}/logo.webp" alt="Messenger Logo" />
      <label class="form__hint" for="username">Enter your username</label>
      <input class="form__input" type="text" name="username" placeholder="Username" required />
      <div class="form__checkbox">
        <input type="checkbox" id="remember-me" name="remember-me" />
        <label for="remember-me">Remember me</label>
      </div>
      <button class="form__button" type="submit">Sign in</button>
    `;

    menu.appendChild(authForm);
    return menu;
  }

  createChannelChoiceMenu() {
    const menu = document.createElement('div');
    menu.classList.add('container', 'menu');

    const channelChoiceForm = document.createElement('form');
    channelChoiceForm.id = 'channel-form';
    channelChoiceForm.classList.add('form');
    channelChoiceForm.innerHTML = `
      <img src="${baseChatImagePath}/logo.webp" alt="Messenger Logo" />
      <label for="channel">Enter channel name</label>
      <input type="text" name="channel" placeholder="default_channel" value="default_channel" required />
      <button type="submit">Connect</button>
    `;

    menu.appendChild(channelChoiceForm);
    return menu;
  }

  createChat() {
    const chat = document.createElement('div');
    chat.classList.add('container', 'chat');

    const messageListElement = document.createElement('div');
    messageListElement.classList.add('messages');

    const inputFormElement = document.createElement('form');
    inputFormElement.id = 'message-form';
    inputFormElement.classList.add('input-form');

    const inputFieldElement = document.createElement('textarea');
    inputFieldElement.classList.add('input-field');
    inputFieldElement.name = 'message';
    inputFieldElement.required = true;
    inputFormElement.appendChild(inputFieldElement);

    const sendButton = document.createElement('button');
    sendButton.type = 'submit';
    sendButton.classList.add('send-btn');
    sendButton.innerHTML = '<u>S</u>end';
    inputFormElement.appendChild(sendButton);

    inputFieldElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        inputFormElement.requestSubmit();
      }
    });

    chat.appendChild(messageListElement);
    chat.appendChild(inputFormElement);

    return { messageListElement, inputFieldElement, chat };
  }

  connect() {
    this.socket = new WebSocket('wss://courselab.lnu.se/message-app/socket');
    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('message', this.handleMessage.bind(this));
    this.socket.addEventListener('error', this.handleError);
    this.socket.addEventListener('close', this.handleClose.bind(this));
  }

  handleOpen() {
    console.log('Connection with the server established.');
  }

  scrollToBottom() {
    this.messageListElement.scrollTop = this.messageListElement.scrollHeight;
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    if (message.type !== 'heartbeat') {
      const messageElement = this.createMessageElement(message);
      this.messageListElement.appendChild(messageElement);
      this.scrollToBottom();
    }
  }

  handleClose() {
    console.log('Connection closed.');
    this.socket = null;
  }

  handleError(error) {
    console.error('Connection error:', error);
  }

  getStyles() {
    return (
      super.getStyles() +
      `
      <style>
      .container {
        display: flex;
        flex-flow: column nowrap;
        min-width: inherit;
        width: 100%;
        min-height: inherit;
        height: 100%;
        position: relative;
      }

      .menu {
        align-items: center;
        justify-content: center;
      }

      .chat {
        justify-content: space-between;
        align-items: stretch;
      }

      .form {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 12rem;
      }

      .form img {
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

      .form__hint {
        font-size: 1rem;
      }

      .form__button {
        width: 100%;
      }

      .form__checkbox {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        font-size: 0.8rem;
      }

      .form__checkbox input {
        margin-left: 0;
      }

      .messages {
        overflow-x: hidden;
        overflow-y: auto;
        flex: 1 1;
      }

      .messages .server-message,
      .messages .username,
      .messages .content {
        margin: 0;
      }

      .messages .server-message {
        color: #777;
      }

      .messages .content {
        margin-left: 1rem;
      }

      .input-form {
        flex: 0 0;
      }

      .input-field {
        box-sizing: border-box;
        width: 100%;
        height: 5em;
        resize: none;
        padding-right: 64px;
        border: 1px solid #ccc;
        border-radius: 0.25rem;
        vertical-align: middle;
        overflow-y: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .input-field::-webkit-scrollbar {
        display: none;
      }

      .input-field:focus-visible {
        outline: none;
        border: 1px solid #ccc;
      }

      .send-btn {
        width: 52px;
        height: 48px;
        position: absolute;
        right: 9px;
        bottom: 9px;
      }

      </style>`
    );
  }
}

customElements.define('chat-app', ChatApp);
