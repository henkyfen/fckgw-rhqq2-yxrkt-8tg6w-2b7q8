import DesktopWindow from '../DesktopWindow/index.js';

const baseActivateWindowsImagePath = '/assets/images/activate-windows';

/**
 * @class ActivateWindows
 * @classdesc An application that simulates the Windows XP product key activation.
 * @augments DesktopWindow
 */
export default class ActivateWindows extends DesktopWindow {
  #correctKey = 'FCKGW-RHQQ2-YXRKT-8TG6W-2B7Q8';
  #form;
  #inputs;
  #nextButton;

  /**
   * Lifecycle method called when the component is added to the DOM.
   */
  connectedCallback () {
    super.connectedCallback();
    this.renderBody();
  }

  /**
   * Renders the body of the application.
   */
  renderBody () {
    this.body.style.width = '480px';
    this.body.style.height = '360px';
    this.body.style.position = 'relative';

    this.body.innerHTML = `
      <div class="container">
        <img src="${baseActivateWindowsImagePath}/installer-icon.png" alt="Installer Icon" class="installer-icon" />
        <div class="header">
          <h2>Your Product Key</h2>
          <p>Type the unique product key for your copy of Windows.</p>
        </div>
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
        <div class="footer">
            <button type="button" id="back-button" disabled>&lt; <u>B</u>ack</button>
            <button type="submit" form="activation-form" id="next-button"><u>N</u>ext &gt;</button>
            <button type="button" id="cancel-button">Cancel</button>
        </div>
      </div>
    `;

    this.#form = this.body.querySelector('#activation-form');
    this.#inputs = this.body.querySelectorAll('.form__inputs input');
    this.#nextButton = this.body.querySelector('#next-button');
    const cancelButton = this.body.querySelector('#cancel-button');
    cancelButton.addEventListener('click', () => this.close());
  }

  /**
   * Adds event listeners to the application.
   */
  addEventListeners () {
    super.addEventListeners();
    this.#form.addEventListener('submit', this.handleSubmit.bind(this));
    this.#inputs.forEach((input, index) => {
      input.addEventListener('input', (event) => this.handleInput(event, index));
      input.addEventListener('keyup', (event) => this.handleKeyup(event, index));
    });
  }

  /**
   * Handles input events on the key fields.
   * @param {Event} event - The input event.
   * @param {number} index - The index of the input field.
   */
  handleInput (event, index) {
    const input = event.target;
    input.value = input.value.toUpperCase();

    if (input.value.length === 5 && index < this.#inputs.length - 1) {
      this.#inputs[index + 1].focus();
    }
  }

  /**
   * Handles keyup events for navigation between input fields.
   * @param {KeyboardEvent} event - The keyup event.
   * @param {number} index - The index of the input field that triggered the event.
   */
  handleKeyup (event, index) {
    if (event.key === 'Backspace' && event.target.value.length === 0 && index > 0) {
      this.#inputs[index - 1].focus();
    }
  }

  /**
   * Handles form submission.
   * @param {Event} event - The submit event.
   */
  handleSubmit (event) {
    event.preventDefault();
    const enteredKey = Array.from(this.#inputs).map(input => input.value).join('-');
    if (enteredKey === this.#correctKey) {
      window.location.href = 'https://github.com/rickroll-it/rickroll-it';
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
        .container {
          padding: 1rem;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .installer-icon {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 48px;
          height: 48px;
        }
        .header h2 {
          font-size: 1.1em;
          margin: 0 0 0.5rem 0;
        }
        .header p {
          margin: 0;
        }
        .content {
          display: flex;
          margin: 1.5rem 0;
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