const baseDesktopIconsImagePath = './assets/images/desktop-icons';

export default class DesktopGrid extends HTMLElement {
  shadowRoot = this.attachShadow({ mode: 'open' });

  selectedElement;
  draggedElement;
  initialColumn;
  initialRow;

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = this.getStyles();

    const grid = document.createElement('div');
    grid.classList.add('grid');

    const memoryGameIcon = document.createElement('desktop-icon');
    memoryGameIcon.setAttribute('name', 'Memory Game');
    memoryGameIcon.setAttribute('icon-src', `${baseDesktopIconsImagePath}/folder-empty.png`);
    memoryGameIcon.style.gridColumnStart = 1;
    memoryGameIcon.style.gridRowStart = 1;

    const chatWindowIcon = document.createElement('desktop-icon');
    chatWindowIcon.setAttribute('name', 'Chat');
    chatWindowIcon.setAttribute('icon-src', `${baseDesktopIconsImagePath}/folder-empty.png`);
    chatWindowIcon.style.gridColumnStart = 2;
    chatWindowIcon.style.gridRowStart = 1;

    grid.appendChild(memoryGameIcon);
    grid.appendChild(chatWindowIcon);

    this.shadowRoot.appendChild(grid);
  }

  addEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));

    const grid = this.shadowRoot.querySelector('.grid');
    grid.addEventListener('drop', this.handleDrop.bind(this));
    grid.addEventListener('dragover', this.handleDragOver.bind(this));
    grid.addEventListener('click', this.handleGridClick.bind(this));

    const cells = this.shadowRoot.querySelectorAll('desktop-icon');
    cells.forEach((cell) => {
      cell.setAttribute('draggable', true);
      cell.addEventListener('dragstart', this.handleDragStart.bind(this));
      cell.addEventListener('dragend', this.handleDragEnd.bind(this));
    });
  }

  handleGridClick(event) {
    const targetIcon = event
      .composedPath()
      .find((el) => el.classList && el.classList.contains('desktop-icon'));

    if (this.selectedElement) {
      this.selectedElement.classList.remove('selected');
      this.selectedElement = null;
    }

    if (targetIcon) {
      this.selectedElement = targetIcon;
      this.selectedElement.classList.add('selected');
    }
  }

  handleResize() {
    const grid = this.shadowRoot.querySelector('.grid');
    const gridChildren = Array.from(grid.children);

    gridChildren.forEach((child, index) => {
      child.style.gridColumnStart = 1;
      child.style.gridRowStart = index + 1;
    });
  }

  handleDragStart(event) {
    const element = event.target;
    this.draggedElement = element;
    element.classList.add('dragging');
    event.dataTransfer.setData('text/plain', event.target.innerHTML);
    this.initialColumn = parseInt(this.draggedElement.style.gridColumnStart, 10);
    this.initialRow = parseInt(this.draggedElement.style.gridRowStart, 10);

    const dragImage = element.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    dragImage.style.pointerEvents = 'none';
    dragImage.shadowRoot.querySelector('.desktop-icon').classList.add('selected');
    dragImage.style.opacity = '0.75';

    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, 42.5, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  handleDrop(event) {
    event.preventDefault();

    const grid = this.shadowRoot.querySelector('.grid');
    const { left, top, width: gridWidth, height: gridHeight } = grid.getBoundingClientRect();

    const gridStyles = getComputedStyle(grid);
    const columns = gridStyles
      .getPropertyValue('grid-template-columns')
      .split(' ')
      .filter(Boolean).length;
    const rows = gridStyles
      .getPropertyValue('grid-template-rows')
      .split(' ')
      .filter(Boolean).length;

    const columnWidth = parseFloat(gridStyles.getPropertyValue('grid-auto-columns'));
    const rowHeight = parseFloat(gridStyles.getPropertyValue('grid-auto-rows'));
    const columnGap = (gridWidth - columnWidth * columns) / (columns - 1);
    const rowGap = (gridHeight - rowHeight * rows) / (rows - 1);

    const cursorX = event.clientX - left;
    const cursorY = event.clientY - top;
    const targetColumn = this.calculatePosition(cursorX, columnWidth, columnGap);
    const targetRow = this.calculatePosition(cursorY, rowHeight, rowGap);

    if (this.draggedElement) {
      const { finalColumn, finalRow } = this.findAvailablePosition(
        grid,
        targetColumn,
        targetRow,
        columns,
        rows,
      );
      this.draggedElement.style.gridColumnStart = finalColumn;
      this.draggedElement.style.gridRowStart = finalRow;
    }
  }

  calculatePosition(coordinate, size, gap) {
    return Math.ceil((coordinate + gap / 2) / (size + gap));
  }

  findAvailablePosition(grid, targetColumn, targetRow, columns, rows) {
    const gridChildren = Array.from(grid.children);
    let currentColumn = targetColumn;
    let currentRow = targetRow;
    let found = false;

    const isCellOccupied = (column, row) =>
      gridChildren.some((child) => {
        const childColumn = parseInt(child.style.gridColumnStart, 10);
        const childRow = parseInt(child.style.gridRowStart, 10);
        return childColumn === column && childRow === row;
      });

    do {
      const isSameAsInitialPosition =
        currentColumn === this.initialColumn && currentRow === this.initialRow;
      const isCellAvailable = isSameAsInitialPosition || !isCellOccupied(currentColumn, currentRow);

      if (isCellAvailable) {
        found = true;
        break;
      }

      currentRow++;
      if (currentRow > rows) {
        currentRow = 1;
        currentColumn++;
        if (currentColumn > columns) {
          currentColumn = 1;
        }
      }
    } while (currentColumn !== targetColumn || currentRow !== targetRow);

    if (!found) {
      currentColumn = this.initialColumn;
      currentRow = this.initialRow;
    }

    return { finalColumn: currentColumn, finalRow: currentRow };
  }

  handleDragEnd(event) {
    event.target.classList.remove('dragging');
    this.draggedElement = null;
  }

  getStyles() {
    return `
      <style>
        :host {
          width: 100%;
          height: 100%;
        }

        .grid {
          display: grid;
          grid-gap: 10px 5px;
          grid-template-columns: repeat(auto-fill, 80px);
          grid-template-rows: repeat(auto-fill, 75px);
          grid-auto-rows: 75px;
          grid-auto-columns: 80px;
          justify-content: space-between;
          align-content: space-between;
          width: 100%;
          height: 100%;
          padding: 5px;
          box-sizing: border-box;
        }
      </style>
    `;
  }
}

customElements.define('desktop-grid', DesktopGrid);
