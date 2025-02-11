export default class DesktopWindow extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  isDragging = false;
  offsetX;
  offsetY;

  static currentDraggedInstance = null;
  static initializeGlobalListeners() {
    window.addEventListener('mouseout', () => {
      const instance = DesktopWindow.currentDraggedInstance;
      if (instance) {
        instance.isDragging = false;
      }
    });

    document.addEventListener('mousemove', (e) => {
      const instance = DesktopWindow.currentDraggedInstance;
      if (instance && instance.isDragging) {
        instance.style.left = `${e.clientX - instance.offsetX}px`;
        instance.style.top = `${e.clientY - instance.offsetY}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      const instance = DesktopWindow.currentDraggedInstance;
      if (instance) {
        this.isDragging = false;
        DesktopWindow.currentDraggedInstance = null;
      }
    });
  }

  constructor() {
    super();
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
  }

  addEventListeners() {
    this.shadowRoot.querySelector('.window__title-bar').addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        this.isDragging = true;
        this.offsetX = e.clientX - this.offsetLeft;
        this.offsetY = e.clientY - this.offsetTop;
        console.log(this);
        DesktopWindow.currentDraggedInstance = this;
      }
    });
  }

  getStyles() {
    return `
      <style>
        :host {
          display: block;
          position: relative;
          width: fit-content;
          height: fit-content;

          font-size: 11px;
          box-shadow: inset -1px -1px #00138c, inset 1px 1px #0831d9, inset -2px -2px #001ea0,
            inset 2px 2px #166aee, inset -3px -3px #003bda, inset 3px 3px #0855dd;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 0 0 3px 0;
          -webkit-font-smoothing: antialiased;
          background: #ece9d8;
        }

        .window__title-bar {
          user-select: none;
          box-sizing: content-box;
          font-family: 'Trebuchet MS';
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

        button {
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

        button:active,
        button:hover,
        button:focus {
          outline: none;
          box-shadow: none !important;
        }
        button[aria-label='Minimize'] {
          background-image: url('./assets/icons/minimize.svg');
        }

        button[aria-label='Minimize']:hover {
          background-image: url('./assets/icons/minimize-hover.svg');
        }

        button[aria-label='Minimize']:not(:disabled):active {
          background-image: url('./assets/icons/minimize-active.svg');
        }

        button[aria-label='Maximize'] {
          background-image: url('./assets/icons/maximize.svg');
        }

        button[aria-label='Maximize']:hover {
          background-image: url('./assets/icons/maximize-hover.svg');
        }

        button[aria-label='Maximize']:not(:disabled):active {
          background-image: url('./assets/icons/maximize-active.svg');
        }

        button[aria-label='Restore'] {
          background-image: url('./assets/icons/restore.svg');
        }

        button[aria-label='Restore']:hover {
          background-image: url('./assets/icons/restore-hover.svg');
        }

        button[aria-label='Restore']:not(:disabled):active {
          background-image: url('./assets/icons/restore-active.svg');
        }

        button[aria-label='Help'] {
          background-image: url('./assets/icons/help.svg');
        }

        button[aria-label='Help']:hover {
          background-image: url('./assets/icons/help-hover.svg');
        }

        button[aria-label='Help']:not(:disabled):active {
          background-image: url('./assets/icons/help-active.svg');
        }

        button[aria-label='Close'] {
          background-image: url('./assets/icons/close.svg');
        }

        button[aria-label='Close']:hover {
          background-image: url('./assets/icons/close-hover.svg');
        }

        button[aria-label='Close']:not(:disabled):active {
          background-image: url('./assets/icons/close-active.svg');
        }
      </style>
    `;
  }

  getTemplate() {
    return `
      <div class="window">
        <div class="window__title-bar">
          <div class="window__title-bar-text">My First Program</div>
          <div class="window__title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <div class="window__body">
        </div>
      </div>
    `;
  }
}

DesktopWindow.initializeGlobalListeners();

customElements.define('desktop-window', DesktopWindow);
