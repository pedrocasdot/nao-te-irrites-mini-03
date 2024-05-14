import { COORDENADAS, JOGADORES, SALTO } from './posicoes.js';

const diceButtonElement = document.querySelector('#dice-btn');
var elDiceOne = document.getElementById('dice1');
var elDiceTwo = document.getElementById('dice2');

const values = {
    1: 1,
    2: 5,
    3: 6,
    4: 3,
    5: 4,
    6: 2
};

const playerPiecesElements = {
    P1: document.querySelectorAll('[player-id="P1"].player-piece'),
    P2: document.querySelectorAll('[player-id="P2"].player-piece'),
    P3: document.querySelectorAll('[player-id="P3"].player-piece'),
    P4: document.querySelectorAll('[player-id="P4"].player-piece'),
}

export class UI {
    static listenDiceClick(callback) {
        diceButtonElement.addEventListener('click', callback);
    }

    static listenResetClick(callback) {
        document.querySelector('button#reset-btn').addEventListener('click', callback)
    }

    static listenPieceClick(callback) {
        document.querySelector('.player-pieces').addEventListener('click', callback)
    }


    /**
     * 
     * @param {string} player 
     * @param {Number} piece 
     * @param {Number} newPosition 
     */
    static setPiecePosition(player, piece, newPosition) {
        if (!playerPiecesElements[player] || !playerPiecesElements[player][piece]) {
            console.error(`Player element of given player: ${player} and piece: ${piece} not found`)
            return;
        }

        const [x, y] = COORDENADAS[newPosition];

        const pieceElement = playerPiecesElements[player][piece];
        pieceElement.style.top = y * SALTO + '%';
        pieceElement.style.left = x * SALTO + '%';
    }

    static setTurn(index) {
        if (index < 0 || index >= JOGADORES.length) {
            console.error('index out of bound!');
            return;
        }

        const player = JOGADORES[index];

        // Display player ID
        document.querySelector('.active-player span').innerText = player;

        const activePlayerBase = document.querySelector('.player-base.highlight');
        if (activePlayerBase) {
            activePlayerBase.classList.remove('highlight');
        }
        // highlight
        document.querySelector(`[player-id="${player}"].player-base`).classList.add('highlight')
    }

    static enableDice() {
        diceButtonElement.removeAttribute('disabled');
    }

    static disableDice() {
        diceButtonElement.setAttribute('disabled', '');
    }

    /**
     * 
     * @param {string} player 
     * @param {Number[]} pieces 
     */
    static highlightPieces(player, pieces) {
        pieces.forEach(piece => {
            const pieceElement = playerPiecesElements[player][piece];
            pieceElement.classList.add('highlight');
        })
    }

    static unhighlightPieces() {
        document.querySelectorAll('.player-piece.highlight').forEach(ele => {
            ele.classList.remove('highlight');
        })
    }

    static setDiceValue1(valueDice1) {
        for (var i = 1; i <= 6; i++) {
            elDiceOne.classList.remove('show-' + i);
        }

        elDiceOne.classList.add('show-' + valueDice1);
        return values[valueDice1];
    }


    static setDiceValue2(valueDice2) {
        for (var i = 1; i <= 6; i++) {
            elDiceTwo.classList.remove('show-' + i);
        }
        elDiceTwo.classList.add('show-' + valueDice2);
        return values[valueDice2];
    }
}