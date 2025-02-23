/**
 * QuizContent is a custom HTML element that represents the content
 * of a quiz, including questions, answers, and a timer.
 */
export default class QuizContent extends HTMLElement {
  questionUrl = 'https://courselab.lnu.se/quiz/question/1';
  answerUrl = 'https://courselab.lnu.se/quiz/answer/1';
  shadowRoot = this.attachShadow({ mode: 'open' });
  quizAppElement;

  /**
   * Constructs the QuizContent component, initializes state and event handlers.
   * @param {HTMLElement} quizAppElement - The parent quiz app element.
   */
  constructor(quizAppElement) {
    super();
    this.quizAppElement = quizAppElement;
    this.defaultInputFieldValue = '';
    this.isQuestionAnswered = false;
    this.isQuizFinished = false;
    this.resultMessage = '';
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleEnterKeyDown = this.handleEnterKeyDown.bind(this);
  }

  /**
   * Specifies the attributes to observe for changes.
   * @returns {Array<string>} The list of attributes to observe.
   */
  static get observedAttributes() {
    return ['username'];
  }

  /**
   * Called when the element is added to the document.
   * Initializes the quiz by fetching the first question and starting the timer.
   * Also adds global event listeners for keydown events.
   */
  connectedCallback() {
    this.fetchQuestion();
    this.startTimer();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keydown', this.handleEnterKeyDown);
  }

  /**
   * Called when the element is removed from the document.
   * Cleans up global event listeners.
   */
  disconnectedCallback() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keydown', this.handleEnterKeyDown);
  }

  /**
   * Renders the component by setting the inner HTML of the shadow DOM.
   * @private
   */
  render() {
    this.shadowRoot.innerHTML = this.getStyles() + this.getTemplate();
    this.addEventListeners();
    this.updateTimerDisplay();
  }

  /**
   * Returns the HTML template for the quiz content component.
   * @returns {string} The HTML template string.
   * @private
   */
  getTemplate() {
    const answerHtml = this.alternatives === null ? this.getTextInputHtml() : this.getOptionsHtml();
    const buttonHtml = this.isQuestionAnswered
      ? `<button class="quiz__button" type="submit">${
          this.isQuizFinished ? 'Finish Quiz' : 'Next Question'
        }</button>`
      : '<button class="quiz__button" type="submit">Answer</button>';

    return `
      <p id="timer" class="quiz__timer">${this.timeLeft}s</p>
      <p class="quiz__question">${this.question}</p>
      <form class="quiz__form">
        ${answerHtml}
        ${buttonHtml}
      </form>
    `;
  }

  /**
   * Returns the HTML for the text input field.
   * @returns {string} The HTML string for the text input field.
   * @private
   */
  getTextInputHtml() {
    return `
      <input
        class="quiz__input-field ${this.getResultClass()}"
        type="text"
        name="answer"
        placeholder="Type your answer here"
        value="${this.defaultInputFieldValue}"
        ${this.isQuestionAnswered ? 'disabled' : ''}
        required
        autofocus
      />
    `;
  }

  /**
   * Returns the HTML for the multiple choice options.
   * @returns {string} The HTML string for the options.
   * @private
   */
  getOptionsHtml() {
    const optionsHtml = Object.entries(this.alternatives)
      .map(
        ([key, value]) => `
          <input
            type="radio"
            name="option"
            value="${value}"
            id="${key}"
            ${this.isQuestionAnswered ? 'disabled' : ''}
            ${key === this.selectedOption ? 'checked' : ''}
          />
          <label
            for="${key}"
            class="quiz__option ${this.getResultClass(key)}"
            ${this.isQuestionAnswered ? 'disabled' : ''}
          >
            ${value}
          </label>
        `,
      )
      .join('');
    return `<div class="quiz__options">${optionsHtml}</div>`;
  }

  /**
   * Determines the CSS class for the result based on the answer correctness.
   * @param {string} key - The key of the selected option.
   * @returns {string} The CSS class for the result.
   * @private
   */
  getResultClass(key) {
    if (!this.isQuestionAnswered || (key !== this.selectedOption && this.alternatives)) {
      return '';
    }
    return this.isAnswerCorrect ? 'correct' : 'incorrect';
  }

  /**
   * Fetches the current question from the server and updates the component state.
   * @private
   */
  async fetchQuestion() {
    try {
      const response = await fetch(this.questionUrl);
      const questionObject = await response.json();
      this.question = questionObject.question;
      this.alternatives = questionObject.alternatives || null;
      this.answerUrl = questionObject.nextURL;
      this.render();
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  }

  /**
   * Adds event listeners to the form for handling submissions.
   * @private
   */
  addEventListeners() {
    const formElement = this.shadowRoot.querySelector('.quiz__form');
    formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleFormSubmission(event);
    });
  }

  /**
   * Handles the Enter key press event to submit the form if this quiz app instance is focused.
   * @param {KeyboardEvent} event - The keyboard event.
   * @private
   */
  handleEnterKeyDown(event) {
    if (event.key === 'Enter' && this.quizAppElement.isFocused) {
      event.preventDefault();
      const formElement = this.shadowRoot.querySelector('.quiz__form');
      formElement.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }

  /**
   * Handles keydown events for the quiz content component.
   * This function focuses the input field and appends typed characters
   * if the input field is not already focused. Additionally, it manages
   * keydown events for selecting options in multiple-choice questions
   * when they are present.
   * @param {KeyboardEvent} event - The keyboard event triggered by user interaction.
   * @private
   */
  handleKeyDown(event) {
    if (!this.quizAppElement.isFocused) return;

    const inputField = this.shadowRoot.querySelector('input[type="text"]');
    if (
      inputField &&
      event.key.length === 1 &&
      !this.isModifierKeyPressed(event) &&
      document.activeElement !== inputField &&
      !this.isQuestionAnswered
    ) {
      inputField.focus();
      inputField.value += event.key;
      event.preventDefault();
    }

    if (this.alternatives && !this.isQuestionAnswered) {
      const optionIndex = parseInt(event.key, 10);
      const optionElement = this.shadowRoot.getElementById(`alt${optionIndex}`);
      if (optionElement) {
        const previouslyCheckedOption = this.shadowRoot.querySelector(
          'input[name="option"]:checked',
        );
        if (previouslyCheckedOption) {
          previouslyCheckedOption.checked = false;
        }
        optionElement.checked = true;
        optionElement.click();
      }
    }
  }

  /**
   * Checks if a modifier key (Ctrl, Alt, Meta) is pressed.
   * @param {KeyboardEvent} event - The keyboard event.
   * @returns {boolean} True if a modifier key is pressed, false otherwise.
   * @private
   */
  isModifierKeyPressed(event) {
    return event.ctrlKey || event.altKey || event.metaKey;
  }

  /**
   * Handles the form submission event by determining the type of question and processing the answer.
   * @param {Event} event - The form submission event.
   * @private
   */
  handleFormSubmission(event) {
    if (this.isQuestionAnswered) {
      this.isAnswerCorrect ? this.handleCorrectAnswer() : this.failQuiz();
    } else {
      this.alternatives ? this.submitMultipleChoiceAnswer() : this.submitTextAnswer(event);
    }
  }

  /**
   * Handles the correct answer scenario by proceeding to the next question or finishing the quiz.
   * @private
   */
  handleCorrectAnswer() {
    this.isQuizFinished ? this.finishQuiz() : this.nextQuestion();
  }

  /**
   * Starts the quiz timer and updates the display every 100ms.
   * If the timer reaches zero, the quiz is failed.
   * @private
   */
  startTimer() {
    this.timeLeft = 10.0;
    this.updateTimerDisplay();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.timeLeft = (this.timeLeft - 0.1).toFixed(1);
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.failQuiz();
      }
    }, 100);
  }

  /**
   * Updates the timer display with the remaining time and changes color based on time left.
   * @private
   */
  updateTimerDisplay() {
    const timerElement = this.shadowRoot.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${this.timeLeft}s`;
      timerElement.style.color =
        this.timeLeft <= 3 ? 'red' : this.timeLeft <= 5 ? 'orange' : 'green';
    }
  }

  /**
   * Submits the text answer from the input field to the server.
   * @param {Event} event - The form submission event.
   * @private
   */
  async submitTextAnswer(event) {
    const formData = new FormData(event.target);
    const answer = formData.get('answer').trim();
    this.defaultInputFieldValue = answer;
    await this.submitAnswer({ answer });
  }

  /**
   * Submits the selected multiple choice answer to the server.
   * @private
   */
  async submitMultipleChoiceAnswer() {
    const selectedOption = this.shadowRoot.querySelector('input[name="option"]:checked');

    if (!selectedOption) {
      return;
    }

    this.isQuestionAnswered = true;
    const answer = selectedOption.id;
    this.selectedOption = answer;
    await this.submitAnswer({ answer });
  }

  /**
   * Submits the answer to the server and processes the response.
   * Updates the quiz state based on the server's response.
   * @param {object} answerData - The answer data to submit.
   * @private
   */
  async submitAnswer(answerData) {
    try {
      const response = await fetch(this.answerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      this.isAnswerCorrect = true;
      this.score++;

      if (result.nextURL === undefined) {
        this.isQuizFinished = true;
        this.resultMessage = result.message;
        return;
      }

      this.questionUrl = result.nextURL;
    } catch (error) {
      console.error('Error:', error);
      this.isAnswerCorrect = false;
      this.isQuizFinished = true;
    } finally {
      this.isQuestionAnswered = true;
      if (this.isQuizFinished) {
        this.globalEndTime = new Date();
        clearInterval(this.timerInterval);
      }
      this.render();
    }
  }

  /**
   * Proceeds to the next question in the quiz by resetting relevant states and fetching a new question.
   * @private
   */
  nextQuestion() {
    this.isQuestionAnswered = false;
    this.defaultInputFieldValue = '';
    this.selectedOption = null;
    this.startTimer();
    this.fetchQuestion();
  }

  /**
   * Dispatches a custom event indicating the quiz has failed, including user details and score.
   * @private
   */
  failQuiz() {
    this.dispatchEvent(
      new CustomEvent('fail-quiz', {
        detail: {
          username: this.username,
          score: this.score,
          endTime: this.globalEndTime || new Date(),
        },
        bubbles: true,
      }),
    );
  }

  /**
   * Dispatches a custom event indicating the quiz has finished, including user details, score, and result message.
   * @private
   */
  finishQuiz() {
    this.dispatchEvent(
      new CustomEvent('finish-quiz', {
        detail: {
          username: this.username,
          score: this.score,
          endTime: this.globalEndTime || new Date(),
          resultMessage: this.resultMessage,
        },
        bubbles: true,
      }),
    );
  }

  /**
   * Returns the CSS styles for the quiz content component, excluding parent styles for the host.
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
          display: flex;
          flex-flow: column nowrap;
          align-items: stretch;
          justify-content: flex-start;
          border-radius: 8px;
          gap: 16px;
        }

        .quiz__timer {
          font-size: 1.25rem;
          padding: 0.5rem;
          text-align: center;
        }

        .quiz__title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 500;
          color: #424242;
        }

        .quiz__divider {
          width: 100%;
          height: 2px;
          background-color: #1976d2;
        }

        .quiz__form {
          display: flex;
          flex-flow: column nowrap;
          align-items: stretch;
          gap: 16px;
        }

        .quiz__question {
          text-align: center;
          font-size: 1.25rem;
          color: #424242;
        }

        .quiz__input-field {
          padding: 4px;
        }

        .quiz__input-field:focus {
          outline: none;
        }

        .quiz__options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quiz__option {
          overflow-wrap: break-word;
          display: inline-block;
        }

        .correct {
          color: #3dd119;
        }

        .incorrect {
          color: #d12519;
        }

        .quiz__button {
          height: 30px;
        }
      </style>
    `
    );
  }
}

customElements.define('quiz-content', QuizContent);
