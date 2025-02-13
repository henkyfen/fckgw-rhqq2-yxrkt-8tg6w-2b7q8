export default class PersonalWebDesktop extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  constructor() {
    super();
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();

    const personalWebDesktop = document.createElement('div');
    personalWebDesktop.classList.add('personal-web-desktop');

    const grid = document.createElement('desktop-grid');
    const desktopTaskbar = document.createElement('desktop-taskbar');

    personalWebDesktop.appendChild(grid);
    personalWebDesktop.appendChild(desktopTaskbar);

    this.shadowRoot.appendChild(personalWebDesktop);
  }

  addEventListeners() {}

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
            background-image: url("./assets/bliss_4k.webp");
          }

          @media (max-device-width: 1919px) {
            background-repeat: no-repeat;
            background-size: cover;
            background-image: url("./assets/bliss_FullHd.webp");
          }
        }
      </style>
    `;
  }
}

customElements.define('personal-web-desktop', PersonalWebDesktop);
