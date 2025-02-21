const baseIconsImagePath = './assets/icons';

const DragManager = {
  currentlyDraggedInstance: null,
};

window.addEventListener('mouseout', handleMouseOut);
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('mouseup', handleMouseUp);

function handleMouseOut() {
  const instance = DragManager.currentlyDraggedInstance;
  if (instance) {
    instance.isDragging = false;
  }
}

function handleMouseMove(event) {
  const instance = DragManager.currentlyDraggedInstance;

  if (instance && instance.isDragging) {
    const newX = Math.min(Math.max(0, event.clientX - instance.offsetX), instance.maxX - 1);
    const newY = Math.min(Math.max(0, event.clientY - instance.offsetY), instance.maxY);

    instance.style.left = `${newX}px`;
    instance.style.top = `${newY}px`;
  }
}

function handleMouseUp() {
  const instance = DragManager.currentlyDraggedInstance;
  if (instance) {
    instance.isDragging = false;
    DragManager.currentlyDraggedInstance = null;
  }
}

export default class DesktopWindow extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  isFocused = false;
  isDragging = false;
  maxX;
  // 32 (taskbar height) + 28 (window title bar height) = 60
  maxY = window.innerHeight - 60;
  offsetX;
  offsetY;
  body;

  connectedCallback() {
    this.dataId = this.getAttribute('data-window-id');
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();

    const title = this.getAttribute('title') || 'Untitled Window';

    const container = document.createElement('div');
    container.classList.add('window');
    container.innerHTML = `
        <div class="window__title-bar">
          <div class="window__title-bar-text">${title}</div>
          <div class="window__title-bar-controls">
            <button class="title-bar-button" aria-label="Minimize" />
            <button class="title-bar-button" aria-label="Close" />
          </div>
        </div>
        <div class="window__body" />
    `;

    this.body = container.querySelector('.window__body');
    this.shadowRoot.appendChild(container);
  }

  addEventListeners() {
    this.shadowRoot
      .querySelector('.window__title-bar')
      .addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.shadowRoot
      .querySelector('button[aria-label="Close"]')
      .addEventListener('click', this.handleCloseClick.bind(this));
    this.shadowRoot
      .querySelector('button[aria-label="Minimize"]')
      .addEventListener('click', this.handleMinimizeClick.bind(this));
    window.addEventListener('windowFocusChange', this.handleFocusChange.bind(this));
  }

  handleMouseDown(event) {
    if (event.target.tagName !== 'BUTTON') {
      this.isDragging = true;
      this.offsetX = event.clientX - this.offsetLeft;
      this.offsetY = event.clientY - this.offsetTop;
      this.maxX = window.innerWidth - this.offsetWidth;
      DragManager.currentlyDraggedInstance = this;
    }
  }

  handleCloseClick() {
    const closeEvent = new CustomEvent('closeWindow', {
      detail: { id: this.dataId },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(closeEvent);
  }

  handleMinimizeClick() {
    this.style.display = 'none';
  }

  handleFocusChange(event) {
    const focusedWindowId = event.detail.focusedWindowId;
    this.isFocused = this.getAttribute('data-window-id') === focusedWindowId;
  }

  getStyles() {
    return `
      <style>
        :host {
          display: block;
          position: fixed;
          width: fit-content;
          height: fit-content;

          min-width: 112px;
          min-height: 27px;

          font-size: 11px;
          box-shadow: inset -1px -1px #00138c, inset 1px 1px #0831d9, inset -2px -2px #001ea0,
            inset 2px 2px #166aee, inset -3px -3px #003bda, inset 3px 3px #0855dd;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 0 0 3px 0;
          -webkit-font-smoothing: antialiased;
          background: #ece9d8;
          overflow: hidden;
        }

        button:not(.title-bar-button) {
          font-size: 11px;
          -webkit-font-smoothing: antialiased;
          box-sizing: border-box;
          border: 1px solid #003c74;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(236, 235, 229, 1) 86%,
            rgba(216, 208, 196, 1) 100%
          );
          box-shadow: none;
          border-radius: 3px;
          min-width: 23px;
          min-height: 23px;
          padding: 0 12px;
        }

        button:not(.title-bar-button):active {
          box-shadow: none;
          background: linear-gradient(
            180deg,
            rgba(205, 202, 195, 1) 0%,
            rgba(227, 227, 219, 1) 8%,
            rgba(229, 229, 222, 1) 94%,
            rgba(242, 242, 241, 1) 100%
          );
        }

        button:not(.title-bar-button):focus{
          outline: 1px dotted #000000;
          outline-offset: -4px;
          box-shadow: inset -1px 1px #cee7ff, inset 1px 2px #98b8ea, inset -2px 2px #bcd4f6, inset 1px -1px #89ade4,
            inset 2px -2px #89ade4;
        }

        button:not(.title-bar-button):hover {
         box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
        }

        button:not(.title-bar-button)::-moz-focus-inner {
          border: 0;
        }

        .window__title-bar {
          user-select: none;
          box-sizing: content-box;
          background: linear-gradient(
            180deg,
            rgba(9, 151, 255, 1) 0%,
            rgba(0, 83, 238, 1) 8%,
            rgba(0, 80, 238, 1) 40%,
            rgba(0, 102, 255, 1) 88%,
            rgba(0, 102, 255, 1) 93%,
            rgba(0, 91, 255, 1) 95%,
            rgba(0, 61, 215, 1) 96%,
            rgba(0, 61, 215, 1) 100%
          );
          padding: 3px 5px 3px 3px;
          border-top: 1px solid #0831d9;
          border-left: 1px solid #0831d9;
          border-right: 1px solid #001ea0;
          border-top-left-radius: 8px;
          border-top-right-radius: 7px;
          font-size: 13px;
          text-shadow: 1px 1px #0f1089;
          height: 21px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .window__title-bar-text {
          font-weight: bold;
          color: white;
          letter-spacing: 0;
          margin-right: 24px;
          padding-left: 3px;
        }

        .window__title-bar-controls {
          display: flex;
        }

        .window__body {
          margin: 8px;
        }

        button.title-bar-button {
          min-width: 21px;
          min-height: 21px;
          margin-left: 2px;
          background-repeat: no-repeat;
          background-position: center;
          box-shadow: none;
          background-color: #0050ee;
          transition: background 100ms;
          border: none;
        }

        button.title-bar-button:active,
        button.title-bar-button:hover,
        button.title-bar-button:focus {
          outline: none;
          box-shadow: none;
        }
        button.title-bar-button[aria-label='Minimize'] {
          background-image: url('${baseIconsImagePath}/minimize.svg');
        }

        button.title-bar-button[aria-label='Minimize']:hover {
          background-image: url('${baseIconsImagePath}/minimize-hover.svg');
        }

        button.title-bar-button[aria-label='Minimize']:not(:disabled):active {
          background-image: url('${baseIconsImagePath}/minimize-active.svg');
        }

        button.title-bar-button[aria-label='Maximize'] {
          background-image: url('${baseIconsImagePath}/maximize.svg');
        }

        button.title-bar-button[aria-label='Maximize']:hover {
          background-image: url('${baseIconsImagePath}/maximize-hover.svg');
        }

        button.title-bar-button[aria-label='Maximize']:not(:disabled):active {
          background-image: url('${baseIconsImagePath}/maximize-active.svg');
        }

        button.title-bar-button[aria-label='Restore'] {
          background-image: url('${baseIconsImagePath}/restore.svg');
        }

        button.title-bar-button[aria-label='Restore']:hover {
          background-image: url('${baseIconsImagePath}/restore-hover.svg');
        }

        button.title-bar-button[aria-label='Restore']:not(:disabled):active {
          background-image: url('${baseIconsImagePath}/restore-active.svg');
        }

        button.title-bar-button[aria-label='Help'] {
          background-image: url('${baseIconsImagePath}/help.svg');
        }

        button.title-bar-button[aria-label='Help']:hover {
          background-image: url('${baseIconsImagePath}/help-hover.svg');
        }

        button.title-bar-button[aria-label='Help']:not(:disabled):active {
          background-image: url('${baseIconsImagePath}/help-active.svg');
        }

        button.title-bar-button[aria-label='Close'] {
          background-image: url('${baseIconsImagePath}/close.svg');
        }

        button.title-bar-button[aria-label='Close']:hover {
          background-image: url('${baseIconsImagePath}/close-hover.svg');
        }

        button.title-bar-button[aria-label='Close']:not(:disabled):active {
          background-image: url('${baseIconsImagePath}/close-active.svg');
        }
      </style>
    `;
  }
}

customElements.define('desktop-window', DesktopWindow);
