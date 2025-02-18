const baseImagePath = './assets/images';

export default class PersonalWebDesktop extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  lastOpenedX = 30;
  lastOpenedY = 30;
  openedWindows = new Map();
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

    const { id, desktopWindow } = this.createWindow(windowTitle, windowTag);

    if (id === null) return;

    this.shadowRoot.appendChild(desktopWindow);
    this.positionWindow(desktopWindow);

    const customEvent = new CustomEvent('updateTaskbar', {
      detail: { windowTitle, id },
      bubbles: false,
      composed: true,
    });

    this.taskbar.dispatchEvent(customEvent);
  }

  handleClickTab(event) {
    const { id } = event.detail;
    const window = this.openedWindows.get(id);
    window.style.display = window.style.display === 'none' ? 'block' : 'none';
  }

  createWindow(windowTitle, tagName) {
    const desktopWindow = tagName
      ? document.createElement(tagName)
      : document.createElement('desktop-window');
    desktopWindow.setAttribute('title', windowTitle);
    const id = this.generateUniqueId();
    desktopWindow.setAttribute('id', id);
    this.openedWindows.set(id, desktopWindow);

    return { id, desktopWindow };
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
