import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants.js';
import { UI } from './UI.js';

export class Ludo {
    currentPositions = {
        P1: [],
        P2: [],
        P3: [],
        P4: []
    }

    _bonus;
    get bonus() {
        return this._bonus;
    }
    set bonus(value) {
        this._bonus = value;
    }

    get diceone() {
        return this._diceone;
    }
    set diceone(value) {
        this._diceone = value;

        this._diceone = UI.setDiceValue1(value);
    }
    _dicetwo;
    get dicetwo() {
        return this._dicetwo;
    }
    set dicetwo(value) {
        this._dicetwo = value;

        this._dicetwo = UI.setDiceValue2(value);
    }

    _turn;
    get turn() {
        return this._turn;
    }
    set turn(value) {
        this._turn = value;
        UI.setTurn(value);
    }

    _state;
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;

        if (value === STATE.DICE_NOT_ROLLED) {
            UI.enableDice();
            UI.unhighlightPieces();
        } else {
            UI.disableDice();
        }
    }

    constructor() {
        this.listenDiceClick();
        this.listenResetClick();
        this.listenPieceClick();
        this.resetGame();

    }

    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this))
    }

    onDiceClick() {

        var audio = new Audio('./ludo/dado_rolando.mp3');


        let x = Math.floor((Math.random() * 6) + 1);
        let y = Math.floor((Math.random() * 6) + 1);
        this.diceone = x;
        this.dicetwo = y;
        audio.play();

        this.state = STATE.DICE_ROLLED;

        this.checkForEligiblePieces();
    }

    checkForEligiblePieces() {
        const player = PLAYERS[this.turn];
        const eligiblePieces = this.getEligiblePieces(player);
        if (eligiblePieces.length) {
            UI.highlightPieces(player, eligiblePieces);
        } else {
            this.incrementTurn();
        }
    }

    incrementTurn() {
        if (this.turn == 0) {
            this.turn = 2;
        } else if (this.turn === 1) {
            this.turn = 3;
        } else if (this.turn == 2) {
            this.turn = 1;
        } else if (this.turn == 3) {
            this.turn = 0;
        }
        this.state = STATE.DICE_NOT_ROLLED;
    }

    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === HOME_POSITIONS[player]) {
                return false;
            }

            if (
                BASE_POSITIONS[player].includes(currentPosition)
                && this.diceone !== 6
            ) {
                return false;
            }

            if (
                HOME_ENTRANCE[player].includes(currentPosition)
                && Math.min(this.diceone, this.dicetwo) > HOME_POSITIONS[player] - currentPosition
            ) {
                return false;
            }
            return true;
        });
    }

    getEligiblePiecesForBonus(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === HOME_POSITIONS[player]) {
                return false;
            }

            if (
                BASE_POSITIONS[player].includes(currentPosition)
                && this.bonus !== 6
            ) {
                return false;
            }

            if (
                HOME_ENTRANCE[player].includes(currentPosition)
                && this.bonus > HOME_POSITIONS[player] - currentPosition
            ) {
                return false;
            }
            return true;
        });
    }

    listenResetClick() {
        UI.listenResetClick(this.resetGame.bind(this))
    }

    resetGame() {
        this.currentPositions = structuredClone(BASE_POSITIONS);

        PLAYERS.forEach(player => {
            [0, 1, 2, 3].forEach(piece => {
                this.setPiecePosition(player, piece, this.currentPositions[player][piece])
            })
        });

        this.turn = Math.floor(Math.random() * 4);
        this.state = STATE.DICE_NOT_ROLLED;
    }

    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this));
    }

    onPieceClick(event) {
        const target = event.target;

        if (!target.classList.contains('player-piece') || !target.classList.contains('highlight')) {
            return;
        }
        const player = target.getAttribute('player-id');
        const piece = target.getAttribute('piece');


        const currentPosition = this.currentPositions[player][piece];

        if (BASE_POSITIONS[player].includes(currentPosition) || this.bonus) {
            this.handlePieceClick(player, piece);
            return;
        }
        Swal.fire({
            showDenyButton: true,
            confirmButtonText: `<span style='color: white; font-weight: bold;'>${this.diceone}</span>`,
            denyButtonText: `<span style='color: white; font-weight: bold;'>${this.dicetwo}</span>`,
            background: `url('./dados.jpg') no-repeat`,
            customClass: {
                title: 'swal-text-white',
                content: 'swal-text-white',
                actions: 'swal-text-white',
                confirmButton: 'swal-button-green',
                denyButton: 'swal-button-red',
            },
            width: '180px',
            heightAuto: false
        }).then((result) => {
            if (result.isConfirmed) {

                this.handlePieceClick(player, piece);
            } else if (result.isDenied) {

                this.diceone = this.dicetwo
                this.handlePieceClick(player, piece);
            }
        });

    }


    handlePieceClick(player, piece) {
        console.log(player, piece);
        const currentPosition = this.currentPositions[player][piece];

        if (BASE_POSITIONS[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }

        UI.unhighlightPieces();
        this.movePiece(player, piece, this.bonus ? this.bonus : this.diceone);
    }

    setPiecePosition(player, piece, newPosition) {
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition)
    }

    movePiece(player, piece, moveBy) {
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
            moveBy--;

            if (moveBy === 0) {
                clearInterval(interval);

                // check if player won
                if (this.hasPlayerWon(player)) {
                    alert(`Player: ${player} has won!`);
                    this.resetGame();
                    return;
                }

                const isKill = this.checkForKill(player, piece);
                if (isKill) {
                    const player = PLAYERS[this.turn];
                    const eligiblePieces = this.getEligiblePiecesForBonus(player);
                    if (eligiblePieces.length) {
                        this.bonus = 10
                        UI.highlightPieces(player, eligiblePieces);
                        if (this.diceone === 6) {
                            this.state = STATE.DICE_NOT_ROLLED;
                        }
                        this.bonus = 0;
                        return;
                    }
                }
                if (this.diceone === 6) {
                    this.state = STATE.DICE_NOT_ROLLED;
                    return;
                }


                this.incrementTurn();
            }
        }, 200);
    }

    checkForKill(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        const opponents = ['P1', 'P2', 'P3', 'P4'];

        let kill = false;
        opponents.forEach(opponent => {
            if (opponent !== player) {
                [0, 1, 2, 3].forEach(piece => {
                    const opponentPosition = this.currentPositions[opponent][piece];

                    if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
                        this.setPiecePosition(opponent, piece, BASE_POSITIONS[opponent][piece]);
                        kill = true
                    }
                });
            }
        });

        return kill
    }

    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === HOME_POSITIONS[player])
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
    }

    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        if (currentPosition === TURNING_POINTS[player]) {
            return HOME_ENTRANCE[player][0];
        }
        else if (currentPosition === 51) {
            return 0;
        }
        return currentPosition + 1;
    }
}