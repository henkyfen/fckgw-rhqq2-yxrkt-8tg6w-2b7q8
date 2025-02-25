/**
 * @class QuizResult
 * @classdesc A custom HTML element that displays the result of a quiz.
 * It includes the user's performance details and provides options to restart the quiz or view the scoreboard.
 * @augments HTMLElement
 */
export default class QuizResult extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  quizAppElement;

  /**
   * Specifies the attributes to observe for changes.
   * @returns {Array<string>} The list of attributes to observe.
   */
  static get observedAttributes () {
    return ['username', 'status', 'elapsed-time', 'result-message'];
  }

  /**
   * Called when an observed attribute has been added, removed, updated, or replaced.
   * Updates the component's properties and re-renders the component.
   * @param {string} name - The name of the attribute.
   * @param {string} oldValue - The old value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      // Convert kebab-case to camelCase for JavaScript
      const propertyName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
      this[propertyName] = newValue;
      this.render();
      this.addEventListeners();
    }
  }

  /**
   * Constructs the QuizResult component, initializes rendering and event handlers.
   * @param {HTMLElement} quizAppElement - The parent quiz app element.
   */
  constructor (quizAppElement) {
    super();
    this.quizAppElement = quizAppElement;
    this.render();
    this.addEventListeners();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Lifecycle method called when the element is added to the document.
   * Updates local storage if the quiz is completed and sets up a global keydown event listener.
   */
  connectedCallback () {
    if (this.status === 'done' && this.username && this.elapsedTime) {
      this.updateLocalStorage();
    }
    window.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Lifecycle method called when the element is removed from the document.
   * Cleans up the global keydown event listener.
   */
  disconnectedCallback () {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Handles keydown events to restart the quiz when 'r' is pressed.
   * @param {KeyboardEvent} event - The keydown event.
   * @private
   */
  handleKeyDown (event) {
    if (event.key === 'r' && this.quizAppElement.isFocused) {
      this.dispatchEvent(new CustomEvent('restart-quiz'));
    }
  }

  /**
   * Updates the local storage with the user's quiz score.
   * Stores the username and elapsed time in seconds.
   * @private
   */
  updateLocalStorage () {
    const scores = JSON.parse(localStorage.getItem('quiz-scores')) || [];
    scores.push({ name: this.username, time: this.elapsedTime / 1000 });
    localStorage.setItem('quiz-scores', JSON.stringify(scores));
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM.
   * Combines styles and template to display the quiz result.
   * @private
   */
  render () {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
  }

  /**
   * Adds event listeners to the buttons for handling user interactions.
   * Listens for clicks on "Try Again" and "Scoreboard" buttons.
   * @private
   */
  addEventListeners () {
    this.shadowRoot.getElementById('tryAgainButton').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('restart-quiz'));
    });
    this.shadowRoot.getElementById('scoreboardButton').addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('navigate-to', {
          detail: { view: 'scoreboard' },
          bubbles: true,
          composed: true
        })
      );
    });
  }

  /**
   * Returns the CSS styles for the quiz result component.
   * Filters out parent styles and adds specific styles for the result view.
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

        .result {
          text-align: center;
        }

        .result__paragraph {
          margin-top: 8px;
        }

        .result__control-panel {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .result__button {
          height: 30px;
        }
      </style>
    `
    );
  }

  /**
   * Returns the HTML template for the quiz result component.
   * Displays the result message, elapsed time, and control buttons.
   * @returns {string} The HTML template string.
   * @private
   */
  getTemplate () {
    return `
      <div class="result">
        <h2>
          ${this.status === 'done' ? 'Congratulations' : 'Better luck next time'},
          ${this.username || 'Guest'}!
        </h2>
        <p class="result__paragraph">${this.resultMessage}</p>
        <p class="result__paragraph">It took you ${(this.elapsedTime / 1000).toFixed(3)} seconds</p>
        <div class="result__control-panel">
          <button class="result__button" id="tryAgainButton">Try Again</button>
          <button class="result__button" id="scoreboardButton">Scoreboard</button>
        </div>
      </div>
    `;
  }
}

customElements.define('quiz-result', QuizResult);
