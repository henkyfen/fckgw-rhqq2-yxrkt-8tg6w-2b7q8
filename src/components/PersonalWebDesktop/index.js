export default class PersonalWebDesktop extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  constructor() {
    super();
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();
    const component = this.createComponent();
    this.shadowRoot.appendChild(component);
  }

  createComponent() {
    const container = document.createElement('div');
    container.classList.add('personal-web-desktop');
    return container;
  }

  addEventListeners() {}

  getStyles() {
    return `
      <style>
        .personal-web-desktop {
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
