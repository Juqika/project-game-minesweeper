class Cell {
    constructor(row, col, board) {
        this.row = row;
        this.col = col;
        this.bomb = false;
        this.board = board;
        this.revealed = false;
        this.flagged = false;
        this.adjBombs = 0;
    }

    // Get all adjacent cells using relative offset
    getAdjCells() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [ 0, -1],          [ 0, 1],
            [ 1, -1], [ 1, 0], [ 1, 1]
        ];
        return directions
            .map(([dRow, dCol]) => {
                const newRow = this.row + dRow;
                const newCol = this.col + dCol;
                return this.isValidCell(newRow, newCol) ? this.board[newRow][newCol] : null;
            })
            .filter(Boolean); // Remove nulls for invalid cells
    }

    // Check if a cell is within bounds
    isValidCell(row, col) {
        return row >= 0 && row < this.board.length && col >= 0 && col < this.board[0].length;
    }

    // Calculate adjacent bombs
    calcAdjBombs() {
        this.adjBombs = this.getAdjCells().reduce((count, cell) => count + (cell.bomb ? 1 : 0), 0);
    }

    // Toggle flagging of a cell
    flag() {
        if (!this.revealed) {
            this.flagged = !this.flagged;
            return this.flagged;
        }
        return false;
    }

    // Reveal a cell and recursively reveal adjacent cells if no bombs are nearby
    reveal() {
        if (this.revealed) return false;
        this.revealed = true;

        if (this.bomb) return true; // Hit a bomb

        if (this.adjBombs === 0) {
            this.getAdjCells().forEach(cell => cell.reveal());
        }

        return false; // No bomb hit
    }
}
