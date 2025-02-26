# 📚 Windows XP

For visualized instructions on how to use the app, go [here](docs/)

## 📝 Overview

This project simulates the Windows XP Luna themed UI in a browser environment using vanilla HTML, CSS, and JavaScript with the WebComponents API. It features three main applications:

1. a chat app
2. a memory game
3. a web quiz application inspired by [this repository](https://github.com/Unvares/Web-Quiz).

## 🚀 Features

- Taskbar with tab manager and clock.
- Desktop grid with icons and drag & drop capability that handles collisions.
- Windows that can be resized, maximized, normalized and minimized.
- Messenger application
- Time-limited memory game with a scoreabord
- Time-limited quiz with a scoreboard

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone git@github.com:Unvares/windows-xp.git
cd windows-xp
```

### 2. Install Dependencies

```bash
npm install
```

## ✅ Running Linters

Check code quality with:

```bash
npm run lint
```

## 🔧 Build & Run the Application

### 1. **Build the project:**

```bash
npm run build
```

### 2. **Run the bulid:**

```bash
npm run serve
```

### 3. Access the app by navigating to the IP address displayed in the console.

## 📂 Project Structure

```lua
├── src/
│ ├── components/
│ │ ├── ChatApp/
│ │ ├── DesktopGrid/
│ │ ├── DesktopIcon/
│ │ ├── DesktopTaskbar/
│ │ ├── DesktopWindow/
│ │ ├── MemoryGame/
│ │ ├── PersonalWebDesktop/
│ │ └── QuizApp/
│ ├── public/
| | ├── assets/
| | └── favicon.ico
│ ├── styles/
│ │ └── reset.css
│ ├── .env
│ ├── .env.example
│ ├── index.html
│ └── index.js
├── .editorconfig
├── .eslintrc.js
├── .gitignore
├── .jsdoc.json
├── .prettierrc
├── .stylelintrc.js
├── package.json
├── README_chat.md
├── README.md
└── vite.config.js
```

## 📝 Notes on Code Structure & Challenges

I decided to build the entire application using vanilla HTML, CSS, and JavaScript, utilizing the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) as it offered a nice solution for creating reusable and encapsulated custom elements. The `src/index.js` file is used solely to load these components, with `PersonalWebDesktop` being the main one. This is the only element rendered in `index.html`, and it orchestrates all other components. I aimed to replicate a Vue.js single-component structure by combining HTML, CSS, and JS for each component. This approach provided a centralized and well-encapsulated code structure, but it also introduced challenges, such as Prettier not recognizing CSS code embedded within JavaScript template literals.

For state management, I chose an event-driven architecture with `PersonalWebDesktop` acting as the broker and event data storage. While a centralized state management solution might have been more efficient, it would have increased development overhead. Custom events naturally fit with WebComponents, making this a practical choice.

Regarding component integration, each `DesktopIcon` in `DesktopGrid` is associated with a specific target tag. Upon double-clicking, it emits a custom event with that target tag name. `PersonalWebDesktop` listens for this event, creates, and stores the target tag. Each target tag is expected to be a subclass of `DesktopWindow` and have a corresponding tab in `DesktopTaskbar`. The `PersonalWebDesktop` manages the relationship between the icon, tab, and window. Each component emits events to signal triggered behaviors, such as a tab click or window close.

`DesktopWindow` provides basic functionality for managing windows, with an empty `.window__body` tag where subclasses define content and logic. Currently, `MemoryGame`, `ChatApp`, and `QuizApp` are the only subclasses of `DesktopWindow`.

During development, I faced two main issues:

1. WebComponent instance injection for complex subclasses. The ShadowRoot prevents external CSS from affecting the component, requiring me to inject a parent component instance and render its styles before the child component's styles. This complicates breaking down a large component. While it's often beneficial to encapsulate view logic in separate components, the need for parent component injection (especially for shared state) complicates the process.
2. Lack of contracts between components. Vanilla JS allows for flexibility but doesn't enforce typing. This can be problematic, especially considering how elusive dataflow in event-driven architecture is. While it was interesting to work with vanilla JS again, I would prefer to use TypeScript if starting over, as it would provide a clearer understanding of data flows and potential bugs.

## 🎨 CSS Methodology

This project follows the **BEM (Block-Element-Modifier)** methodology for naming CSS classes. For more information:

[BEM Official Documentation](https://en.bem.info/methodology/)
