class GameLogic {
  constructor(mode, savedState = null) {
    this.mode = mode;
    this.grid = [];
    this.score = 0;
    this.selectedCells = [];
    this.isChecking = false;
    this.lastMove = null;
    this.revertAvailable = false;
    this.gridColumns = 9;
    this.maxRows = 50;

    this.assistUses = {
      hints: 0,
      revert: 0,
      addNumbers: 0,
      shuffle: 0,
      eraser: 0,
    };

    this.assistLimits = {
      addNumbers: 10,
      shuffle: 5,
      eraser: 5,
    };

    if (savedState) {
      this.loadState(savedState);
    } else {
      this.initializeGrid();
    }
  }

  loadState(savedState) {
    this.grid = savedState.grid || [];
    this.score = savedState.score || 0;
    this.selectedCells = savedState.selectedCells || [];
    this.lastMove = savedState.lastMove || null;
    this.revertAvailable = savedState.revertAvailable || false;

    if (savedState.assistUses) {
      this.assistUses = { ...this.assistUses, ...savedState.assistUses };
    }
  }

  initializeGrid() {
    switch (this.mode) {
      case 'classic':
        this.generateClassicGrid();
        break;
      case 'random':
        this.generateRandomGrid();
        break;
      case 'chaotic':
        this.generateChaoticGrid();
        break;
      default:
        this.generateClassicGrid();
    }
  }

  generateClassicGrid() {
    const numbers = [];

    for (let i = 1; i <= 9; i++) {
      numbers.push(i);
    }

    for (let i = 11; i <= 19; i++) {
      const digits = i.toString().split('').map(Number);
      const filteredDigits = digits.filter((digit) => digit !== 0);

      numbers.push(...filteredDigits);
    }

    this.grid = numbers;
  }

  generateRandomGrid() {
    const numbers = [];

    for (let i = 1; i <= 9; i++) {
      numbers.push(i);
    }

    for (let i = 11; i <= 19; i++) {
      const digits = i.toString().split('').map(Number);
      const filteredDigits = digits.filter((digit) => digit !== 0);

      numbers.push(...filteredDigits);
    }

    this.shuffleArray(numbers);
    this.grid = numbers;
  }

  generateChaoticGrid() {
    this.grid = Array.from(
      { length: 27 },
      () => Math.floor(Math.random() * 9) + 1
    );
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  isValidPair(num1, num2) {
    if (num1 === num2) return true;
    if (num1 + num2 === 10) return true;
    return false;
  }

  calculatePoints(num1, num2) {
    if (num1 === 5 && num2 === 5) return 3;
    if (num1 === num2) return 1;
    if (num1 + num2 === 10) return 2;

    return 0;
  }

  selectCell(index) {
    if (this.isChecking) return;

    if (this.selectedCells.includes(index)) {
      this.selectedCells = this.selectedCells.filter((i) => i !== index);
      return { type: 'deselect', index };
    }

    if (this.selectedCells.length === 2) {
      this.selectedCells = [index];
      return { type: 'reset', newSelection: index };
    }

    this.selectedCells.push(index);

    if (this.selectedCells.length === 2) {
      this.lastMove = {
        grid: [...this.grid],
        score: this.score,
      };
      this.revertAvailable = true;

      return this.checkPair();
    }

    return { type: 'select', index };
  }

  canConnect(index1, index2) {
    if (index1 === index2) return false;

    const row1 = Math.floor(index1 / this.gridColumns);
    const col1 = index1 % this.gridColumns;
    const row2 = Math.floor(index2 / this.gridColumns);
    const col2 = index2 % this.gridColumns;

    if (this.areAdjacent(row1, col1, row2, col2)) {
      return true;
    }

    if (row1 === row2 && this.isClearHorizontally(row1, col1, col2)) {
      return true;
    }

    if (col1 === col2 && this.isClearVertically(col1, row1, row2)) {
      return true;
    }

    if (this.areRowBoundariesConnected(row1, row2, index1, index2)) {
      return true;
    }

    return false;
  }

  areAdjacent(row1, col1, row2, col2) {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  isClearHorizontally(row, col1, col2) {
    const startCol = Math.min(col1, col2);
    const endCol = Math.max(col1, col2);

    for (let col = startCol + 1; col < endCol; col++) {
      const index = row * this.gridColumns + col;
      if (this.grid[index] !== null) {
        return false;
      }
    }
    return true;
  }

  isClearVertically(col, row1, row2) {
    const startRow = Math.min(row1, row2);
    const endRow = Math.max(row1, row2);

    for (let row = startRow + 1; row < endRow; row++) {
      const index = row * this.gridColumns + col;
      if (this.grid[index] !== null) {
        return false;
      }
    }
    return true;
  }

  areRowBoundariesConnected(row1, row2, index1, index2) {
    if (Math.abs(row1 - row2) !== 1) return false;

    const upperRow = Math.min(row1, row2);
    const lowerRow = Math.max(row1, row2);

    let rightmostInUpper = -1;
    for (let col = this.gridColumns - 1; col >= 0; col--) {
      const idx = upperRow * this.gridColumns + col;
      if (this.grid[idx] !== null) {
        rightmostInUpper = idx;
        break;
      }
    }

    let leftmostInLower = -1;
    for (let col = 0; col < this.gridColumns; col++) {
      const idx = lowerRow * this.gridColumns + col;
      if (this.grid[idx] !== null) {
        leftmostInLower = idx;
        break;
      }
    }

    const isIndex1Rightmost = index1 === rightmostInUpper && row1 === upperRow;
    const isIndex1Leftmost = index1 === leftmostInLower && row1 === lowerRow;
    const isIndex2Rightmost = index2 === rightmostInUpper && row2 === upperRow;
    const isIndex2Leftmost = index2 === leftmostInLower && row2 === lowerRow;

    return (
      (isIndex1Rightmost && isIndex2Leftmost) ||
      (isIndex2Rightmost && isIndex1Leftmost)
    );
  }

  checkPair() {
    this.isChecking = true;
    const [index1, index2] = this.selectedCells;
    const num1 = this.grid[index1];
    const num2 = this.grid[index2];

    if (this.isValidPair(num1, num2) && this.canConnect(index1, index2)) {
      const points = this.calculatePoints(num1, num2);
      this.score += points;

      this.grid[index1] = null;
      this.grid[index2] = null;

      this.selectedCells = [];
      this.isChecking = false;

      return {
        type: 'valid',
        indices: [index1, index2],
        points,
        totalScore: this.score,
      };
    } else {
      this.isChecking = false;
      return {
        type: 'invalid',
        indices: [index1, index2],
      };
    }
  }

  getGameState() {
    return {
      grid: [...this.grid],
      score: this.score,
      selectedCells: [...this.selectedCells],
      mode: this.mode,
      lastMove: this.lastMove
        ? {
            grid: [...this.lastMove.grid],
            score: this.lastMove.score,
          }
        : null,
      revertAvailable: this.revertAvailable,
      assistUses: { ...this.assistUses },
    };
  }

  checkWinCondition() {
    return this.score >= 100;
  }

  checkLoseCondition() {
    const noValidMoves = !this.hasValidPairs();
    const noAssistsLeft = !this.hasAvailableAssists();
    const gridLimitReached = this.checkGridLimit();

    return (noValidMoves && noAssistsLeft) || gridLimitReached;
  }

  hasAvailableAssists() {
    const assistInfo = this.getAssistInfo();

    return (
      assistInfo.addNumbers.available ||
      assistInfo.shuffle.available ||
      assistInfo.eraser.available
    );
  }

  hasValidPairs() {
    const availableIndices = this.grid
      .map((num, index) => (num !== null ? index : null))
      .filter((index) => index !== null);

    for (let i = 0; i < availableIndices.length; i++) {
      for (let j = i + 1; j < availableIndices.length; j++) {
        const index1 = availableIndices[i];
        const index2 = availableIndices[j];
        const num1 = this.grid[index1];
        const num2 = this.grid[index2];

        if (this.isValidPair(num1, num2) && this.canConnect(index1, index2)) {
          return true;
        }
      }
    }

    return false;
  }

  countValidMoves() {
    let count = 0;
    const availableIndices = this.grid
      .map((num, index) => (num !== null ? index : null))
      .filter((index) => index !== null);

    for (let i = 0; i < availableIndices.length; i++) {
      for (let j = i + 1; j < availableIndices.length; j++) {
        const index1 = availableIndices[i];
        const index2 = availableIndices[j];
        const num1 = this.grid[index1];
        const num2 = this.grid[index2];

        if (this.isValidPair(num1, num2) && this.canConnect(index1, index2)) {
          count++;
        }
      }
    }

    return count;
  }

  revert() {
    if (this.revertAvailable && this.lastMove) {
      this.grid = [...this.lastMove.grid];
      this.score = this.lastMove.score;
      this.selectedCells = [];
      this.revertAvailable = false;
      this.assistUses.revert++;
      return true;
    }
    return false;
  }

  addNumbers() {
    if (this.assistUses.addNumbers >= this.assistLimits.addNumbers) {
      return false;
    }

    const currentRows = Math.ceil(this.grid.length / this.gridColumns);
    if (currentRows >= this.maxRows) {
      return false;
    }

    const availableCells = this.maxRows * this.gridColumns - this.grid.length;
    if (availableCells <= 0) {
      return false;
    }

    let newNumbers = [];

    switch (this.mode) {
      case 'classic': {
        const currentNumbers = this.grid.filter((num) => num !== null);
        newNumbers = [...currentNumbers];
        break;
      }
      case 'random': {
        const currentNumbers = this.grid.filter((num) => num !== null);
        newNumbers = [...currentNumbers];
        this.shuffleArray(newNumbers);
        break;
      }
      case 'chaotic': {
        const currentNumbersCount = this.grid.filter(
          (num) => num !== null
        ).length;
        newNumbers = Array.from(
          { length: currentNumbersCount },
          () => Math.floor(Math.random() * 9) + 1
        );
        break;
      }
      default: {
        break;
      }
    }

    newNumbers = newNumbers.slice(0, availableCells);

    if (newNumbers.length === 0) {
      return false;
    }

    this.grid = [...this.grid, ...newNumbers];
    this.assistUses.addNumbers++;
    return true;
  }

  checkGridLimit() {
    const currentRows = Math.ceil(this.grid.length / this.gridColumns);
    return currentRows >= this.maxRows;
  }

  shuffle() {
    if (this.assistUses.shuffle >= this.assistLimits.shuffle) {
      return false;
    }

    const numbers = this.grid.filter((num) => num !== null);

    this.shuffleArray(numbers);

    let numIndex = 0;
    this.grid = this.grid.map((num) =>
      num !== null ? numbers[numIndex++] : null
    );

    this.assistUses.shuffle++;
    return true;
  }

  erase(index) {
    if (this.assistUses.eraser >= this.assistLimits.eraser) {
      return false;
    }

    if (this.grid[index] !== null) {
      this.grid[index] = null;
      this.assistUses.eraser++;
      return true;
    }
    return false;
  }

  getAssistInfo() {
    return {
      hints: {
        used: this.assistUses.hints,
        limit: Infinity,
        available: true,
      },
      revert: {
        used: this.assistUses.revert,
        limit: Infinity,
        available: this.revertAvailable,
      },
      addNumbers: {
        used: this.assistUses.addNumbers,
        limit: this.assistLimits.addNumbers,
        available: this.assistUses.addNumbers < this.assistLimits.addNumbers,
      },
      shuffle: {
        used: this.assistUses.shuffle,
        limit: this.assistLimits.shuffle,
        available: this.assistUses.shuffle < this.assistLimits.shuffle,
      },
      eraser: {
        used: this.assistUses.eraser,
        limit: this.assistLimits.eraser,
        available: this.assistUses.eraser < this.assistLimits.eraser,
      },
    };
  }
}

export default GameLogic;
