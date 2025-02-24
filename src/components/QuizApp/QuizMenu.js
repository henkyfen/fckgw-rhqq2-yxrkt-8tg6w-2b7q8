/**
 * QuizMenu is a custom HTML element that represents the menu
 * for starting a quiz. It includes an input field for the username
 * and a button to start the quiz.
 */
export default class QuizMenu extends HTMLElement {
  /** @private */
  shadowRoot = this.attachShadow({ mode: 'open' });
  quizAppElement;
  /**
   * Constructs the QuizMenu component, initializes rendering,
   * and binds event handlers.
   * @param {HTMLElement} quizAppElement - The parent quiz app element.
   */
  constructor(quizAppElement) {
    super();
    this.quizAppElement = quizAppElement;
    this.render();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Lifecycle method called when the element is added to the document.
   * Sets up a global keydown event listener to handle input.
   */
  connectedCallback() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Lifecycle method called when the element is removed from the document.
   * Cleans up the global keydown event listener.
   */
  disconnectedCallback() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM
   * with styles and template, and adds event listeners for form submission.
   * @private
   */
  render() {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();

    this.shadowRoot.querySelector('.menu').addEventListener('submit', (event) => {
      event.preventDefault();
      this.startQuiz();
    });
  }

  /**
   * Handles keydown events to focus the input field and append
   * typed characters if the input field is not focused.
   * @param {KeyboardEvent} event - The keydown event.
   * @private
   */
  handleKeyDown(event) {
    if (!this.quizAppElement.isFocused) return;

    const inputField = this.shadowRoot.querySelector('input[type="text"]');
    if (
      inputField &&
      event.key.length === 1 &&
      !this.isModifierKeyPressed(event) &&
      document.activeElement !== inputField
    ) {
      inputField.focus();
      inputField.value += event.key;
      event.preventDefault();
    }
  }

  /**
   * Checks if a modifier key (Ctrl, Alt, Meta) is pressed during a keydown event.
   * @param {KeyboardEvent} event - The keydown event.
   * @returns {boolean} True if a modifier key is pressed, false otherwise.
   * @private
   */
  isModifierKeyPressed(event) {
    return event.ctrlKey || event.altKey || event.metaKey;
  }

  /**
   * Returns the CSS styles for the quiz menu component.
   * @returns {string} The CSS styles string.
   * @private
   */
  getStyles() {
    const parentStyles = this.quizAppElement.getStyles();
    const filteredStyles = parentStyles.replace(/:host\s*{[^}]*}/g, '');
    return (
      filteredStyles +
      `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :host {
          width: 300px;
        }

        .menu {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          border-radius: 8px;
          gap: 24px;
        }

        .menu__title {
          text-align: center;
          font-size: 1.75rem;
          font-weight: 500;
        }

        .menu__control-panel {
          height: 100%;
          display: flex;
          flex-flow: column nowrap;
          jsutify-content: center;
          align-items: stretch;
          gap: 8px;
        }

        .menu__input-field {
          padding: 4px;
        }

        .menu__input-field:focus {
          outline: none;
        }

        .menu__button {
          height: 30px;
        }
      </style>
    `
    );
  }

  /**
   * Returns the HTML template for the quiz menu component.
   * @returns {string} The HTML template string.
   * @private
   */
  getTemplate() {
    return `
      <form class="menu">
        <h2 class="menu__title">Welcome to the Quiz!</h2>
        <div class="menu__control-panel">
          <input class="menu__input-field" type="text" id="username" placeholder="Enter your name" required autofocus />
          <button class="menu__button" label="Start Quiz" type="submit" id="startButton">Start Quiz</button>
        </div>
      </form>
    `;
  }

  /**
   * Starts the quiz by dispatching a custom event with the username
   * if a valid username is entered. Alerts the user if the username is invalid.
   * @private
   */
  startQuiz() {
    const username = this.shadowRoot.getElementById('username').value.trim();
    if (username) {
      this.dispatchEvent(new CustomEvent('start-quiz', { detail: { username }, bubbles: true }));
    } else {
      alert('Please enter a valid username.');
    }
  }
}

customElements.define('quiz-menu', QuizMenu);
