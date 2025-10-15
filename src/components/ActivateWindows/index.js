import DesktopWindow from '../DesktopWindow/index.js';

const baseActivateWindowsImagePath = '/assets/images/activate-windows';

/**
 * @class ActivateWindows
 * @classdesc An application that simulates the Windows XP product key activation.
 * @augments DesktopWindow
 */
export default class ActivateWindows extends DesktopWindow {
  #correctKey = 'FCKGW-RHQQ2-YXRKT-8TG6W-2B7Q8';
  #_state;

  /**
   * Gets the current state of the application.
   * @returns {string} The current state.
   */
  get state () {
    return this.#_state;
  }

  /**
   * Sets the state of the application and updates the UI.
   * @param {string} value - The new state to set.
   */
  set state (value) {
    this.#_state = value;
    this.renderBody();
  }

  /**
   * Lifecycle method called when the component is added to the DOM.
   */
  connectedCallback () {
    super.connectedCallback();
    this.state = 'activation';
  }

  /**
   * Renders the body of the application and attaches all event listeners.
   */
  renderBody () {
    this.body.style.width = '480px';
    this.body.style.height = '360px';
    // Reset padding to let child elements control their own layout.
    this.body.style.padding = '0';

    this.body.innerHTML = `
      <div class="header-section">
        <div class="header-text">
          <h2>Your Product Key</h2>
          <p class="header-subtitle">Your Product Key uniquely identifies your copy of Windows XP.</p>
        </div>
        <img src="${baseActivateWindowsImagePath}/installer-icon.png" alt="Installer Icon" class="installer-icon" />
      </div>
      <div class="main-section">
        <div class="content">
          <div class="content__left">
            <img src="${baseActivateWindowsImagePath}/certificate-of-authenticity.png" alt="Certificate of Authenticity" />
          </div>
          <div class="content__right">
            <p>The 25-character product key appears on the lower section of your Certificate of Authenticity.</p>
            <p>Entering your product key now is optional but strongly recommended to help avoid complications during activation.</p>
          </div>
        </div>
        <form id="activation-form" class="form">
          <label for="key-part-1">Product key:</label>
          <div class="form__inputs">
            <input type="text" id="key-part-1" name="key-part-1" maxlength="5" required> -
            <input type="text" id="key-part-2" name="key-part-2" maxlength="5" required> -
            <input type="text" id="key-part-3" name="key-part-3" maxlength="5" required> -
            <input type="text" id="key-part-4" name="key-part-4" maxlength="5" required> -
            <input type="text" id="key-part-5" name="key-part-5" maxlength="5" required>
          </div>
        </form>
      </div>
      <div class="footer">
          <button type="button" id="back-button" disabled>&lt; <u>B</u>ack</button>
          <button type="submit" form="activation-form" id="next-button"><u>N</u>ext &gt;</button>
          <button type="button" id="cancel-button">Cancel</button>
      </div>
    `;

    // --- Event Listener Setup ---
    const form = this.body.querySelector('#activation-form');
    const inputs = this.body.querySelectorAll('.form__inputs input');
    const cancelButton = this.body.querySelector('#cancel-button');

    // Attach all listeners directly after element creation
    form.addEventListener('submit', (event) => this.handleSubmit(event, inputs));
    cancelButton.addEventListener('click', this.handleCloseClick.bind(this));

    inputs.forEach((input, index) => {
      input.addEventListener('input', (event) => this.handleInput(event, index, inputs));
      input.addEventListener('keyup', (event) => this.handleKeyup(event, index, inputs));
    });
  }

  /**
   * Handles input events on the key fields.
   * @param {Event} event - The input event.
   * @param {number} index - The index of the input field.
   * @param {NodeListOf<HTMLInputElement>} inputs - The list of input fields.
   */
  handleInput (event, index, inputs) {
    const input = event.target;
    input.value = input.value.toUpperCase();

    if (input.value.length === 5 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }

  /**
   * Handles keyup events for navigation between input fields.
   * @param {KeyboardEvent} event - The keyup event.
   * @param {number} index - The index of the input field that triggered the event.
   * @param {NodeListOf<HTMLInputElement>} inputs - The list of input fields.
   */
  handleKeyup (event, index, inputs) {
    if (event.key === 'Backspace' && event.target.value.length === 0 && index > 0) {
      inputs[index - 1].focus();
    }
  }

  /**
   * Handles form submission.
   * @param {Event} event - The submit event.
   * @param {NodeListOf<HTMLInputElement>} inputs - The list of input fields.
   */
  handleSubmit (event, inputs) {
    event.preventDefault();
    const enteredKey = Array.from(inputs).map(input => input.value).join('-');

    if (enteredKey.toUpperCase() === this.#correctKey) {
      window.location.href = 'https://henkas.eu';
    } else {
      alert('The product key you entered is not valid.');
    }
  }

  /**
   * Gets the styles for the application.
   * @returns {string} The styles as a string.
   */
  getStyles () {
    return (
      super.getStyles() +
      `
      <style>
        .header-section {
          background-color: white;
          padding: 1rem;
          margin: 3px; /* Match the parent window's internal border */
          border-bottom: 1px solid #d4d0c8;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-text h2 {
          font-size: 1.1em;
          margin: 0 0 0.5rem 0;
        }
        .header-text p {
          margin: 0;
        }
        .header-subtitle {
          padding-left: 1em;
        }
        .installer-icon {
          width: 48px;
          height: 48px;
        }
        .main-section {
          padding: 1rem;
          padding-top: 0;
        }
        .content {
          display: flex;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }
        .content__left img {
          width: 120px;
        }
        .content__right p {
          margin: 0 0 1rem 0;
          font-size: 0.9em;
        }
        .form {
            display: flex;
            flex-direction: column;
        }
        .form__inputs {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .form__inputs input {
            width: 60px;
            text-align: center;
        }
        .footer {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
        }
        .footer button {
            width: 80px;
        }
      </style>`
    );
  }
}

customElements.define('activate-windows', ActivateWindows);
