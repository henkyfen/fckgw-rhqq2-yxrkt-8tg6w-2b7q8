import DesktopWindow from '../DesktopWindow';
import QuizMenu from './QuizMenu';
import QuizContent from './QuizContent';
import QuizResult from './QuizResult';
import QuizScoreboard from './QuizScoreboard';

/**
 * Quiz is a custom HTML element that manages the quiz flow,
 * including the menu, quiz content, and result views.
 */
export default class Quiz extends DesktopWindow {
  _state;

  /**
   * Gets the current state of the quiz.
   * @returns {object} The current state object.
   */
  get state() {
    return this._state;
  }

  /**
   * Sets the state of the quiz and triggers a re-render.
   * @param {object} value - The new state object to set.
   */
  set state(value) {
    this._state = value;
    this.renderBody(value);
  }

  /**
   * Updates the state of the component and re-renders it.
   * @param {object} newState - The new state to merge with the current state.
   * @private
   */
  updateState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Lifecycle method called when the element is added to the document.
   * Initializes the state of the quiz component with default values.
   */
  connectedCallback() {
    super.connectedCallback();
    this.state = {
      currentView: 'menu',
      username: '',
      startTime: null,
      endTime: null,
      resultMessage: '',
    };
  }

  createControlPanel() {
    const controlPanel = document.createElement('div');
    controlPanel.classList.add('window__control-panel');

    controlPanel.innerHTML = `
      <div class="window__dropdown">
        <div class="window__dropdown-activator">View</div>
        <div class="window__dropdown-content">
          <div data-action="back-to-menu" class="window__dropdown-choice" style="white-space: nowrap;">Main Menu</div>
          <div data-action="view-scoreboard" class="window__dropdown-choice" style="white-space: nowrap;">Scoreboard</div>
        </div>
      </div>
    `;

    this.controlPanel = controlPanel;

    return controlPanel;
  }

  /**
   * Renders the body of the quiz component based on the current state.
   * @param {object} state - The current state of the quiz.
   */
  renderBody(state) {
    const container = document.createElement('div');
    container.className = 'quiz-container';
    const component = this.getCurrentView(state.currentView);
    container.appendChild(component);
    this.body.replaceChildren(container);
  }

  addEventListeners() {
    super.addEventListeners();
    this.controlPanel.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const action = event.target.dataset.action;
    switch (action) {
      case 'back-to-menu':
        this.updateState({ currentView: 'menu' });
        break;
      case 'view-scoreboard':
        this.updateState({ currentView: 'scoreboard' });
        break;
    }
  }

  /**
   * Determines and returns the component to render based on the current view state.
   * @returns {HTMLElement} The component corresponding to the current view.
   * @private
   */
  getCurrentView() {
    switch (this.state.currentView) {
      case 'menu':
        return this.createMenuComponent();
      case 'content':
        return this.createContentComponent();
      case 'done':
        return this.createResultComponent('done');
      case 'failed':
        return this.createResultComponent('failed');
      case 'scoreboard':
        return this.createScoreboardComponent();
      default:
        throw new Error('Invalid view state');
    }
  }

  /**
   * Creates and returns the menu component, setting up event listeners for starting the quiz.
   * @returns {QuizMenu} The menu component.
   * @private
   */
  createMenuComponent() {
    const menu = new QuizMenu(this);
    menu.addEventListener('start-quiz', this.handleStartQuiz.bind(this));
    return menu;
  }

  /**
   * Handles the start of the quiz by updating the state with the username,
   * setting the current view to 'content', and recording the start time.
   * @param {CustomEvent} event - The event object containing the username detail.
   * @private
   */
  handleStartQuiz(event) {
    const { username } = event.detail;
    this.updateState({
      username,
      currentView: 'content',
      startTime: new Date(),
    });
  }

  /**
   * Creates and returns the content component, setting up event listeners for quiz completion or failure.
   * @returns {QuizContent} The content component.
   * @private
   */
  createContentComponent() {
    const content = new QuizContent(this);
    content.setAttribute('username', this.state.username);
    content.addEventListener('finish-quiz', this.handleFinishQuiz.bind(this));
    content.addEventListener('fail-quiz', this.handleFailQuiz.bind(this));
    return content;
  }

  /**
   * Handles the failure of the quiz by updating the state with the end time
   * and setting the current view to 'failed'.
   * @param {CustomEvent} event - The event object containing the end time detail.
   * @private
   */
  handleFailQuiz(event) {
    const newState = {
      currentView: 'failed',
      endTime: event.detail.endTime,
    };
    this.updateState(newState);
  }

  /**
   * Handles the completion of the quiz by updating the state with the end time
   * and result message, and setting the current view to 'done'.
   * @param {CustomEvent} event - The event object containing the end time and result message details.
   * @private
   */
  handleFinishQuiz(event) {
    const newState = {
      currentView: 'done',
      endTime: event.detail.endTime,
      resultMessage: event.detail.resultMessage,
    };
    this.updateState(newState);
  }

  /**
   * Creates and returns the result component, setting up event listeners for restarting the quiz.
   * @param {string} status - The status of the quiz ('done' or 'failed').
   * @returns {QuizResult} The result component.
   * @private
   */
  createResultComponent(status) {
    const result = new QuizResult(this);
    result.setAttribute('username', this.state.username);
    result.setAttribute('status', status);
    result.setAttribute('elapsed-time', this.state.endTime - this.state.startTime);
    result.setAttribute('result-message', this.state.resultMessage);
    result.addEventListener('restart-quiz', this.handleRestartQuiz.bind(this));
    result.addEventListener('navigate-to', this.handleNavigateTo.bind(this));
    return result;
  }

  /**
   * Handles the restart of the quiz by resetting the state to the initial view
   * and updating the start time to the current time.
   * @private
   */
  handleRestartQuiz() {
    this.updateState({
      currentView: 'content',
      startTime: new Date(),
    });
  }

  /**
   * Handles navigation to a different view within the quiz application.
   * Updates the current view state based on the event's detail.
   * @param {CustomEvent} event - The event object containing the view to navigate to.
   * @private
   */
  handleNavigateTo(event) {
    const view = event.detail.view;
    if (view) {
      this.updateState({ currentView: view });
    }
  }

  /**
   * Creates and returns the scoreboard component.
   * @returns {QuizScoreboard} The scoreboard component.
   * @private
   */
  createScoreboardComponent() {
    return new QuizScoreboard(this);
  }

  /**
   * Returns the CSS styles for the quiz component.
   * @returns {string} The CSS styles string.
   * @private
   */
  getStyles() {
    return (
      super.getStyles() +
      `
      <style>
        .quiz-container {
          display: flex;
          flex-flow: column nowrap;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 32px;
          box-sizing: border-box;
        }
      </style>
    `
    );
  }
}

customElements.define('quiz-app', Quiz);
