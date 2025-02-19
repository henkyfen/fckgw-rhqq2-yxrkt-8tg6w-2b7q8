const baseImagePath = './assets/images';

export default class PersonalWebDesktop extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  lastOpenedX = 30;
  lastOpenedY = 30;
  openedWindows = new Map();
  currentlyFocusedWindow;
  highestZIndex = 1;
  taskbar;

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();

    const personalWebDesktop = document.createElement('div');
    personalWebDesktop.classList.add('personal-web-desktop');

    const grid = document.createElement('desktop-grid');
    const desktopTaskbar = document.createElement('desktop-taskbar');
    this.taskbar = desktopTaskbar;

    personalWebDesktop.appendChild(grid);
    personalWebDesktop.appendChild(desktopTaskbar);

    this.shadowRoot.appendChild(personalWebDesktop);
  }

  addEventListeners() {
    this.shadowRoot.addEventListener('iconDoubleClick', this.handleIconDoubleClick.bind(this));
    this.shadowRoot.addEventListener('clickTab', this.handleClickTab.bind(this));
    this.shadowRoot.addEventListener('closeWindow', this.handleWindowClose.bind(this));
    this.shadowRoot.addEventListener('mousedown', this.handleWindowClick.bind(this));
  }

  handleWindowClick(event) {
    const windowId = event.target.getAttribute('data-window-id');

    if (!windowId) return;

    const targetWindow = this.openedWindows.get(windowId);
    if (this.currentlyFocusedWindow !== targetWindow) {
      this.bringWindowToFront(targetWindow);
    }
  }

  handleWindowClose(event) {
    const { id } = event.detail;
    const window = this.openedWindows.get(id);

    if (window) {
      window.remove();
      this.openedWindows.delete(id);
    }

    const removeTabEvent = new CustomEvent('removeTab', {
      detail: { id },
      bubbles: false,
      composed: true,
    });

    this.taskbar.dispatchEvent(removeTabEvent);
  }

  handleIconDoubleClick(event) {
    const { windowTitle, windowTag } = event.detail;

    const { windowId, desktopWindow } = this.createWindow(windowTitle, windowTag);

    if (windowId === null) return;

    this.shadowRoot.appendChild(desktopWindow);
    this.bringWindowToFront(desktopWindow);
    this.positionWindow(desktopWindow);

    const customEvent = new CustomEvent('updateTaskbar', {
      detail: { windowTitle, windowId },
      bubbles: false,
      composed: true,
    });

    this.taskbar.dispatchEvent(customEvent);
  }

  handleClickTab(event) {
    const { windowId } = event.detail;
    const desktopWindow = this.openedWindows.get(windowId);
    desktopWindow.style.display = desktopWindow.style.display === 'none' ? 'block' : 'none';
    if (desktopWindow.style.display === 'block' && this.currentlyFocusedWindow !== desktopWindow) {
      this.bringWindowToFront(desktopWindow);
    }
  }

  createWindow(windowTitle, tagName) {
    const desktopWindow = tagName
      ? document.createElement(tagName)
      : document.createElement('desktop-window');
    desktopWindow.setAttribute('title', windowTitle);
    const windowId = this.generateUniqueId();
    desktopWindow.setAttribute('data-window-id', windowId);
    this.openedWindows.set(windowId, desktopWindow);

    return { windowId, desktopWindow };
  }

  generateUniqueId() {
    return Math.random().toString(36).substring(2, 8);
  }

  positionWindow(element) {
    setTimeout(() => {
      this.lastOpenedX += 20;
      this.lastOpenedY += 28;

      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - (32 + element.offsetHeight); // 32 = taskbar height

      if (this.lastOpenedX > maxX) {
        this.lastOpenedX = 50;
      }

      if (this.lastOpenedY > maxY) {
        this.lastOpenedY = 50;
      }

      element.style.left = `${this.lastOpenedX}px`;
      element.style.top = `${this.lastOpenedY}px`;
    }, 0);
  }

  bringWindowToFront(desktopWindow) {
    this.currentlyFocusedWindow = desktopWindow;
    this.highestZIndex += 1;
    desktopWindow.style.zIndex = this.highestZIndex;

    const focusEvent = new CustomEvent('windowFocusChange', {
      detail: { focusedWindowId: desktopWindow.getAttribute('data-window-id') },
    });
    window.dispatchEvent(focusEvent);
  }

  getStyles() {
    return `
      <style>
        .personal-web-desktop {
          display: flex;
          flex-direction: column;
          min-width: 800px;
          min-height: 600px;
          width: 100svw;
          height: 100svh;
          overflow: hidden;

          @media (min-device-width: 1920px) {
            background-repeat: no-repeat;
            background-size: cover;
            background-image: url("${baseImagePath}/bliss_4k.webp");
          }

          @media (max-device-width: 1919px) {
            background-repeat: no-repeat;
            background-size: cover;
            background-image: url("${baseImagePath}/bliss_FullHd.webp");
          }
        }
      </style>
    `;
  }
}

customElements.define('personal-web-desktop', PersonalWebDesktop);
