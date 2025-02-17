export default class DesktopTaskbar extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  openedTabs = new Map();

  connectedCallback() {
    this.render();
    this.addEventListeners();
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();

    const taskbar = document.createElement('div');
    taskbar.classList.add('taskbar');

    const startButton = document.createElement('div');
    startButton.classList.add('start-button');
    startButton.innerHTML = `
      <img src="./assets/icons/logo.svg">
      <span>start</span>
      `;

    const openedTabs = document.createElement('div');
    openedTabs.classList.add('opened-tabs');

    const time = document.createElement('div');
    time.classList.add('time');

    taskbar.appendChild(startButton);
    taskbar.appendChild(openedTabs);
    taskbar.appendChild(time);

    this.shadowRoot.appendChild(taskbar);
  }

  addEventListeners() {
    this.addEventListener('updateTaskbar', this.handleUpdateTaskbar.bind(this));
    this.addEventListener('removeTab', this.handleRemoveTab.bind(this));
  }

  handleUpdateTaskbar(event) {
    const taskbar = this.shadowRoot.querySelector('.opened-tabs');

    const newTab = document.createElement('div');
    newTab.classList.add('open-tab');
    newTab.textContent = event.detail.windowTitle;
    newTab.setAttribute('data-id', event.detail.id);
    newTab.addEventListener('click', this.handleTabClick.bind(this));
    this.openedTabs.set(event.detail.id, newTab);

    taskbar.appendChild(newTab);
  }

  handleTabClick(event) {
    const id = event.target.getAttribute('data-id');
    const clickTab = new CustomEvent('clickTab', {
      detail: { id },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(clickTab);
  }

  handleRemoveTab(event) {
    const tabId = event.detail.id;
    const tab = this.openedTabs.get(tabId);
    tab.remove();
    this.openedTabs.delete(tabId);
  }

  updateTime() {
    const timeElement = this.shadowRoot.querySelector('.time');
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit' };
    const timeString = now.toLocaleTimeString([], options);
    timeElement.textContent = timeString;
  }

  getStyles() {
    return `
    <style>
      * {
        box-sizing: border-box;
        user-select: none;
      }

      :host {
        z-index: 100;
      }

      .taskbar {
        flex-shrink: 0;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: stretch;
        color: white;
        background: linear-gradient(to bottom, #245EDC 0%, #3f8cf3 9%, #245EDC 18%, #245EDC 92%, #1941A5 100%) center/cover no-repeat;
        width: 100%;
        height: 32px;
      }

      .start-button {
        font-size: 20px;
        line-height: 22px;
        font-weight: bold;
        font-style: italic;
        background: radial-gradient(circle, #5eac56 0%, #3c873c 100%) center/cover no-repeat;
        box-shadow: -13px 0 10px -10px #30522d inset, 0 11px 4px -8px #94d88d inset;
        padding: 2px 25px 6px 10px;
        text-shadow: 1px 1px 3px #222;
        border-radius: 0px 8px 8px 0px;
        margin-right: 16px;
        cursor: pointer;
        flex-shrink: 0;
      }

      .start-button img {
        height: 20px;
        filter: drop-shadow(1px 1px 1px #222);
        transform: translateY(4px);
      }

      .opened-tabs {
        display: flex;
        gap: 0px;
        flex-flow: row nowrap;
        flex: 1 1;
        overflow: hidden;
      }

      .open-tab {
        width: 182px;
        height: 26px;
        margin: 3px 0;
        background-color: #1e94f0;
        border: 1px solid #0067ba;
        border-radius: 4px;
        font-size: 12px;
        line-height: 12px;
        padding: 8px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-wrap: break-word;
        cursor: pointer;
        box-shadow: inset 0px -1px 0px 0px rgba(0, 0, 0, 0.05);
        background-image: linear-gradient(
          160deg,
          rgba(255, 255, 255, 0.4) 0%,
          rgba(148, 187, 233, 0) 12%
        );
      }

      .open-tab:active {
        background-color: #0063b6;
        border-color: #004d9a;
        background-image: none;
        box-shadow: inset 2px 2px 0px 0px rgba(0, 0, 0, 0.2);
      }

      .time {
        height: 100%;
        font-size: 12px;
        line-height: 12px;
        background:
          linear-gradient(to right, #1290E9 0%, #19B9F3 2%, #1290E9 3%, transparent 3%, transparent 100%) left/cover no-repeat,
          linear-gradient(to bottom, #1290E9 0%, #19B9F3 9%, #1290E9 18%, #1290E9 92%, #1941A5 100%) center/cover no-repeat;
        box-shadow: 8px 0px 4px -5px #19B9F3 inset;
        padding: 9px 15px 9px 25px;
        border-left: 1px solid #092E51;
        text-shadow: 1px 1px 2px #222;
        cursor: pointer;
        text-transform: uppercase;
        flex-shrink: 0;
      }
    </style>
      `;
  }
}

customElements.define('desktop-taskbar', DesktopTaskbar);
