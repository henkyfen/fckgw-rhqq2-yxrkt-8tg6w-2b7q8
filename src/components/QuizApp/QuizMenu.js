/**
 * @class QuizMenu
 * @classdesc A custom HTML element that represents the menu for starting a quiz.
 * It includes an input field for the username and a button to start the quiz.
 * This component is responsible for rendering the menu and handling user interactions
 * such as form submission and keydown events.
 * @augments HTMLElement
 */
export default class QuizMenu extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  quizAppElement;
  /**
   * Constructs the QuizMenu component, initializes rendering,
   * and binds event handlers.
   * @param {HTMLElement} quizAppElement - The parent quiz app element.
   */
  constructor (quizAppElement) {
    super();
    this.quizAppElement = quizAppElement;
    this.render();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Called when the element is connected to the DOM.
   * Initializes the component by setting up event listeners and
   * restoring the username from local storage if available.
   */
  connectedCallback () {
    window.addEventListener('keydown', this.handleKeyDown);
    const username = localStorage.getItem('quiz-app-username');

    if (username) {
      this.shadowRoot.querySelector('input[type="text"]').value = username;
      this.shadowRoot.querySelector('input[name="remember-me"]').checked = true;
    }

    this.shadowRoot.querySelector('.menu').addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Lifecycle method called when the element is removed from the document.
   * Cleans up the global keydown event listener.
   */
  disconnectedCallback () {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM
   * with styles and template, and adds event listeners for form submission.
   * @private
   */
  render () {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
  }

  /**
   * Handles form submission to start the quiz.
   * Saves username to local storage if 'remember-me' is checked.
   * @param {Event} event - The form submission event.
   */
  handleSubmit (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const username = formData.get('username').trim();
    const rememberMe = formData.get('remember-me');

    if (!username) {
      alert('Please enter a valid username.');
      return;
    }

    if (rememberMe) {
      localStorage.setItem('quiz-app-username', username);
    }

    this.dispatchEvent(new CustomEvent('start-quiz', {
      detail: { username },
      bubbles: true
    }));
  }

  /**
   * Handles keydown events to focus the input field and append
   * typed characters if the input field is not focused.
   * @param {KeyboardEvent} event - The keydown event.
   * @private
   */
  handleKeyDown (event) {
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
  isModifierKeyPressed (event) {
    return event.ctrlKey || event.altKey || event.metaKey;
  }

  /**
   * Returns the HTML template for the quiz menu component.
   * @returns {string} The HTML template string.
   * @private
   */
  getTemplate () {
    return `
      <form class="menu">
        <h2 class="menu__title">Welcome to the Quiz!</h2>
        <div class="menu__control-panel">
          <input class="menu__input-field" type="text" id="username" name="username" placeholder="Enter your name" required autofocus />
          <div class="menu__checkbox">
            <input type="checkbox" id="remember-me" name="remember-me" />
            <label for="remember-me">Remember me</label>
          </div>
          <button class="menu__button" label="Start Quiz" type="submit" id="startButton">Start Quiz</button>
        </div>
      </form>
    `;
  }

  /**
   * Returns the CSS styles for the quiz menu component.
   * @returns {string} The CSS styles string.
   * @private
   */
  getStyles () {
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

        .menu__checkbox {
          display: flex;
          flex-flow: row nowrap;
          font-size: 0.8rem;
        }

        .menu__button {
          height: 30px;
        }
      </style>
    `
    );
  }
}

customElements.define('quiz-menu', QuizMenu);
