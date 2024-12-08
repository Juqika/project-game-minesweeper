/*----- constants -----*/
var bombImage = '<img src="images/bomb.png">';
var flagImage = '<img src="images/flag.png">';
var wrongBombImage = '<img src="images/wrong-bomb.png">';
var sizeLookup = {
  '9': { totalBombs: 10, tableWidth: '245px' },
  '16': { totalBombs: 40, tableWidth: '420px' },
  '26': { totalBombs: 100, tableWidth: '665px' },
};
var colors = [
  '',
  '#0000FA',
  '#4B802D',
  '#DB1300',
  '#202081',
  '#690400',
  '#457A7A',
  '#1B1B1B',
  '#7A7A7A',
];

/*----- app's state (variables) -----*/
var size = 16;
var board, bombCount, timeElapsed, adjBombs, hitBomb, elapsedTime, timerId, winner;

/*----- cached element references -----*/
var boardEl = document.getElementById('board');

/*----- event listeners -----*/
document.getElementById('size-btns').addEventListener('click', function(e) {
  size = parseInt(e.target.id.replace('size-', ''));
  init();
  render();
});

boardEl.addEventListener('click', function (e) {
  if (winner || hitBomb) return;

  var clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (clickedEl.classList.contains('game-cell')) {
    if (!timerId) setTimer();

    var row = parseInt(clickedEl.dataset.row);
    var col = parseInt(clickedEl.dataset.col);
    var cell = board[row][col];

    if (e.shiftKey && !cell.revealed && bombCount > 0) {
      bombCount += cell.flag() ? -1 : 1;
    } else if (!cell.flagged) {
      hitBomb = cell.reveal();
      if (hitBomb) {
        revealAll();
        clearInterval(timerId);
        clickedEl.style.backgroundColor = 'red';
      }
    }

    winner = checkWinner();
    render();
  }
});

function createResetListener() {
  document.getElementById('reset').addEventListener('click', function () {
    init();
    render();
  });
}

/*----- functions -----*/

function setTimer() {
  timerId = setInterval(function () {
    elapsedTime += 1;
    document.getElementById('timer').innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
}

function revealAll() {
  board.flat().forEach(function (cell) {
    cell.reveal();
  });
}

function buildTable() {
  let rows = `
    <tr>
      <td class="menu" id="window-title-bar" colspan="${size}">
        <div id="window-title">Minesweeper</div>
      </td>
    </tr>
    <tr>
      <td class="menu" colspan="${size}">
        <section id="status-bar">
          <div id="bomb-counter">000</div>
          <div id="reset"><img src="images/btnreset.png"></div>
          <div id="timer">000</div>
        </section>
      </td>
    </tr>
  `;

  // Tambahkan baris untuk papan permainan
  for (let i = 0; i < size; i++) {
    rows += `<tr>${'<td class="game-cell"></td>'.repeat(size)}</tr>`;
  }

  // Pastikan elemen tabel tertutup dengan benar
  boardEl.innerHTML = `<table>${rows}</table>`;
  boardEl.style.width = sizeLookup[size].tableWidth;

  // Tambahkan atribut data-row dan data-col
  Array.from(document.querySelectorAll('td:not(.menu)')).forEach((cell, idx) => {
    cell.setAttribute('data-row', Math.floor(idx / size));
    cell.setAttribute('data-col', idx % size);
  });

  createResetListener();
}


function buildArrays() {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function buildCells() {
  board.forEach((rowArr, rowIdx) => {
    rowArr.forEach((_, colIdx) => {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  addBombs();
  runCodeForAllCells(cell => cell.calcAdjBombs());
}

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
}

function getBombCount() {
  return board.flat().filter(cell => cell.bomb).length;
}

function addBombs() {
  let currentTotalBombs = sizeLookup[size].totalBombs;
  while (currentTotalBombs > 0) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (!board[row][col].bomb) {
      board[row][col].bomb = true;
      currentTotalBombs -= 1;
    }
  }
}

function checkWinner() {
  return board.flat().every(cell => cell.revealed || cell.bomb);
}

function render() {
  document.getElementById('bomb-counter').innerText = bombCount.toString().padStart(3, '0');
  const cells = Array.from(document.querySelectorAll('[data-row]'));
  cells.forEach(function (cellEl) {
    const row = parseInt(cellEl.getAttribute('data-row'));
    const col = parseInt(cellEl.getAttribute('data-col'));
    const cell = board[row][col];

    if (cell.flagged) {
      cellEl.innerHTML = flagImage;
    } else if (cell.revealed) {
      if (cell.bomb) {
        cellEl.innerHTML = bombImage;
      } else if (cell.adjBombs > 0) {
        cellEl.className = 'revealed';
        cellEl.style.color = colors[cell.adjBombs];
        cellEl.textContent = cell.adjBombs;
      } else {
        cellEl.className = 'revealed';
      }
    } else {
      cellEl.innerHTML = '';
    }
  });

  if (hitBomb) {
    document.getElementById('reset').innerHTML = '<img src="images/dead-face.png">';
    board.flat().forEach(cell => {
      if (!cell.bomb && cell.flagged) {
        const td = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        td.innerHTML = wrongBombImage;
      }
    });
  } else if (winner) {
    document.getElementById('reset').innerHTML = '<img src="images/cool-face.png">';
    clearInterval(timerId);
  }
}

function runCodeForAllCells(cb) {
  board.flat().forEach(cb);
}


init();
render();
