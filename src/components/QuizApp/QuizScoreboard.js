/**
 * QuizScoreboard is a custom HTML element that displays the scoreboard
 * of quiz results, showing a list of users and their performance times.
 */
export default class QuizScoreboard extends HTMLElement {
  /** @private */
  shadowRoot = this.attachShadow({ mode: 'open' });
  quizAppElement;

  /**
   * Constructs the QuizScoreboard component, initializes rendering and event handlers.
   * @param {HTMLElement} quizAppElement - The parent quiz app element.
   */
  constructor(quizAppElement) {
    super();
    this.quizAppElement = quizAppElement;
    this.render();
    this.addEventListeners();
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM
   * with styles and template, and populates the scoreboard with data.
   * @private
   */
  render() {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
    this.populateScoreBoard();
  }

  /**
   * Populates the scoreboard with scores retrieved from local storage.
   * It sorts the scores and appends them to the table body.
   * @private
   */
  populateScoreBoard() {
    const scores = this.getScoresFromLocalStorage();
    const sortedScores = this.sortScores(scores);
    const scoreTableBody = this.shadowRoot.getElementById('score-table-body');

    sortedScores.forEach((score, index) => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${score.name}</td>
        <td>${score.time}s</td>
      `;
      scoreTableBody.appendChild(tableRow);
    });
  }

  /**
   * Retrieves scores from local storage.
   * @returns {Array} An array of score objects.
   * @private
   */
  getScoresFromLocalStorage() {
    return JSON.parse(localStorage.getItem('quizScores')) || [];
  }

  /**
   * Sorts an array of scores in ascending order based on time.
   * @param {Array} scores - The array of score objects to sort.
   * @returns {Array} The sorted array of score objects.
   * @private
   */
  sortScores(scores) {
    return scores.sort((a, b) => a.time - b.time);
  }

  /**
   * Returns the HTML template for the scoreboard component.
   * @returns {string} The HTML template string.
   * @private
   */
  getTemplate() {
    return `
      <div class="scoreboard">
        <h2 class="scoreboard__title">Scoreboard</h2>
        <hr class="scoreboard_divider" />
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Place</th>
                <th>Name</th>
                <th>Best Time</th>
              </tr>
            </thead>
            <tbody id="score-table-body"></tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Returns the CSS styles for the scoreboard component.
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
          flex: 1;
          display: flex;
          flex-flow: column nowrap;
          justify-content: flex-start;
          align-items: center;
          overflow-y: hidden;
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

customElements.define('quiz-scoreboard', QuizScoreboard);
