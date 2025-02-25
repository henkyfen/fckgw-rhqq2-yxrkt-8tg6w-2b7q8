/**
 * @class MemoryGameScoreboard
 * @classdesc A custom HTML element that displays the scoreboard for the memory game,
 * showing a list of users and their performance times.
 * @augments HTMLElement
 */
export default class MemoryGameScoreboard extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });
  memoryGameElement;

  _state;

  /**
   * Gets the current state of the scoreboard.
   * @returns {string} The current state.
   */
  get state () {
    return this._state;
  }

  /**
   * Sets the state of the scoreboard and triggers a render.
   * @param {string} value - The new state value.
   */
  set state (value) {
    this._state = value;
    this.render(value);
  }

  /**
   * Constructs the MemoryGameScoreboard component, initializes rendering and event handlers.
   * @param {HTMLElement} memoryGameElement - The parent MemoryGame element.
   */
  constructor (memoryGameElement) {
    super();
    this.memoryGameElement = memoryGameElement;
  }

  /**
   * Lifecycle method called when the element is added to the document.
   * Renders the initial menu and sets up event listeners.
   */
  connectedCallback () {
    this.render('menu');
    this.addEventListeners();
  }

  /**
   * Adds event listeners to the component.
   * Listens for click events to handle button interactions.
   * @private
   */
  addEventListeners () {
    this.shadowRoot.addEventListener('click', this.handleButtonClick.bind(this));
  }

  /**
   * Handles button click events to change the state based on the selected size.
   * @param {Event} event - The click event.
   * @private
   */
  handleButtonClick (event) {
    const size = event.target.dataset.size;
    if (size) {
      this.size = size;
      this.state = 'scoreboard';
    }
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM
   * with styles and template, and populates the scoreboard with data.
   * @param {string} state - The current state to render.
   * @private
   */
  render (state) {
    this.shadowRoot.innerHTML = this.getStyles();
    switch (state) {
      case 'menu':
        this.shadowRoot.appendChild(this.createMenu());
        break;
      case 'scoreboard':
        this.shadowRoot.appendChild(this.createScoreboard());
        this.populateScoreBoard();
        break;
      default:
        throw new Error('Invalid state');
    }
  }

  /**
   * Creates the menu element for selecting the scoreboard size.
   * @returns {HTMLElement} The menu element.
   * @private
   */
  createMenu () {
    const menu = document.createElement('div');
    menu.classList.add('menu');
    menu.innerHTML = `
      <h2>Select Scoreboard</h2>
      <div class="menu__control-panel">
        <button data-size="2x2">2x2</button>
        <button data-size="2x3">2x3</button>
        <button data-size="2x4">2x4</button>
        <button data-size="4x4">4x4</button>
      </div>
    `;

    return menu;
  }

  /**
   * Creates the scoreboard element to display user scores.
   * @returns {HTMLElement} The scoreboard element.
   * @private
   */
  createScoreboard () {
    const scoreboard = document.createElement('div');
    scoreboard.classList.add('scoreboard');
    scoreboard.innerHTML = `
      <h2 class="scoreboard__title">Scoreboard</h2>
      <hr class="scoreboard_divider" />
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Place</th>
              <th>Name</th>
              <th>Attempts</th>
              <th>Best Time</th>
            </tr>
          </thead>
          <tbody id="score-table-body"></tbody>
        </table>
      </div>
    `;

    return scoreboard;
  }

  /**
   * Populates the scoreboard with scores retrieved from local storage.
   * It sorts the scores and appends them to the table body.
   * @private
   */
  populateScoreBoard () {
    const scores = this.getScoresFromLocalStorage();
    const sortedScores = this.sortScores(scores);
    const scoreTableBody = this.shadowRoot.getElementById('score-table-body');

    sortedScores.forEach((score, index) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.name}</td>
        <td>${score.attempts}</td>
        <td>${score.time}s</td>
      `;
      scoreTableBody.appendChild(tableRow);
    });
  }

  /**
   * Retrieves scores from local storage.
   * @returns {Array<object>} An array of score objects.
   * @private
   */
  getScoresFromLocalStorage () {
    return JSON.parse(localStorage.getItem(`memory-game-scores-${this.size}`)) || [];
  }

  /**
   * Sorts an array of scores in ascending order based on attempts.
   * If attempts are equal, sorts by time.
   * @param {Array<object>} scores - The array of score objects to sort.
   * @returns {Array<object>} The sorted array of score objects.
   * @private
   */
  sortScores (scores) {
    return scores.sort((a, b) => {
      if (a.attempts === b.attempts) {
        return a.time - b.time;
      }
      return a.attempts - b.attempts;
    });
  }

  /**
   * Returns the CSS styles for the scoreboard component.
   * @returns {string} The CSS styles string.
   * @private
   */
  getStyles () {
    const parentStyles = this.memoryGameElement.getStyles();
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
          flex: 1;
          display: flex;
          flex-flow: column nowrap;
          justify-content: flex-start;
          align-items: center;
          overflow-y: hidden;
        }

        .menu {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .menu__control-panel {
          display: flex;
          flex-flow: row nowrap;
          gap: 10px;
          padding: 1rem;
        }

        .menu__control-panel button {
          width: 75px;
        }

        .scoreboard {
          min-width: 300px;
          height: 100%;
        }

        .scoreboard__title {
          text-align: center;
          font-size: 24px;
          margin: 0;
        }

        .scoreboard_divider {
          width: 100%;
          margin: 16px 0;
          height: 2px;
          background-color: #1976d2;
        }

        .table-container {
          max-height: 400px;
          overflow-y: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th, .table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }

        .table th {
          background-color: #1976d2;
          color: white;
        }

        .table tr:nth-child(even) {
          background-color: #f2f2f2;
        }

        .table tr:hover {
          background-color: #ddd;
        }
      </style>
    `
    );
  }
}

customElements.define('memory-game-scoreboard', MemoryGameScoreboard);
