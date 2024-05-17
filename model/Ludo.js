import { BASE, LARGO_CASA, CASA, JOGADORES, NAO_PODE_MATAR, INICIO, ESTADO_DADO, DESTINO } from '../nanter/posicoes.js';
import { UI } from '../nanter/interface.js';

const segundoDado  = document.getElementById('dice2');


//Declaração da classe Ludo 
export class Ludo {
    currentPositions = {
        P1: [],
        P2: [],
        P3: [],
        P4: []
    }
    primeiraVez = [false, false, false, false];
    dados = [false, false]
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
        if (value === ESTADO_DADO.DICE_NOT_ROLLED) {
            UI.enableDice();
            UI.unhighlightPieces();
        } else {
            UI.disableDice();
        }
    }

    //COnstrutor da classe Ludo
    constructor() {
        this.listenDiceClick();
        this.listenResetClick();
        this.listenPieceClick();
        this.resetGame();
    }

    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this))
    }
    //Quando o dado é clicado
    onDiceClick() {
        var audio = new Audio('../assets/audio/dado_rolando-2.mp3');
        
        var values = [3, 3, 1, 1, 1,3, 2, 3, 3, 4, 4, 5, 5, 6, 6];

        let x = Math.floor(Math.random() * 15);
        let y = Math.floor(Math.random() * 15);
        this.diceone = values[x];
        this.dicetwo = values[y];
        audio.play();

        if(this.primeiraVez[this.turn] === false && (this.diceone === 6 || this.dicetwo === 6)){
            this.primeiraVez[this.turn] = true;
            const jogador = JOGADORES[this.turn];
            this.setPiecePosition(jogador, 0, INICIO[jogador]);
            this.setPiecePosition(jogador, 1, INICIO[jogador]);
            this.movePiece(jogador, 1, Math.min(this.diceone, this.dicetwo));
           // segundoDado.hidden = true;
            return;
        }

        this.state = ESTADO_DADO.DICE_ROLLED;
        this.checkForEligiblePieces();
    }
    //Verifcar todas as peças qu podem ser movimentadas com base os valores dos dados
    checkForEligiblePieces() {
        const player = JOGADORES[this.turn];
        const eligiblePieces = this.getEligiblePieces(player);
        if (eligiblePieces.length) {
            console.log(player, eligiblePieces);
            UI.highlightPieces(player, eligiblePieces);
        } else {
            this.incrementTurn();
        }
    }

    //Quem será o próximo jogador
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
        this.dados[0] = this.dados[1] = false;
        segundoDado.hidden = false;
        this.state = ESTADO_DADO.DICE_NOT_ROLLED;
    }
    
    verificarBloqueio(player, piece){
        //um jogador só pode passar se nas posições 0, 40, 60, 60, 20 tiver até no máximo 1 peça do jogar da respectiva casa de inicio
        return true;
    }
    
    //Retorna todas a possíveis peças que estão elegíveis para o atual jogador
    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === CASA[player]) {
                return false;
            }
            if (
                BASE[player].includes(currentPosition)
                && this.diceone !== 6 && (segundoDado.hidden ? true :  this.dicetwo !== 6)
            ) {
                return false;
            }

            // if(this.verificarBloqueio(player, piece)){
            //     return false;
            // }


            if (
                LARGO_CASA[player].includes(currentPosition)
                && Math.min(this.diceone, segundoDado.hidden ? 10 :  this.dicetwo) > CASA[player] - currentPosition
            ) {
                return false;
            }
            return true;
        });
    }

    getEligiblePiecesForBonus(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === CASA[player]) {
                return false;
            }

            if (
                BASE[player].includes(currentPosition)
                && this.bonus !== 6
            ) {
                return false;
            }

            if (
                LARGO_CASA[player].includes(currentPosition)
                && this.bonus > CASA[player] - currentPosition
            ) {
                return false;
            }
            return true;
        });
    }

    listenResetClick() {
        UI.listenResetClick(this.resetGame.bind(this))
    }


    //Reiniciar o jogo
    resetGame() {
        this.currentPositions = structuredClone(BASE);

        JOGADORES.forEach(player => {
            [0, 1, 2, 3].forEach(piece => {
                this.setPiecePosition(player, piece, this.currentPositions[player][piece])
            })
        });

        this.turn = Math.floor(Math.random() * 4);
        this.bonus = 0;
        segundoDado.hidden = false;
        this.state = ESTADO_DADO.DICE_NOT_ROLLED;
    }

    //JS UI para marcar as peças do atual jogador
    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this));
    }

    //Tratamento de todas as possíveis ocorrência ao clicar na peça 
    onPieceClick(event) {
        const target = event.target;

        if (!target.classList.contains('peca') || !target.classList.contains('highlight')) {
            return;
        }
        const player = target.getAttribute('PID');
        const piece = target.getAttribute('peca');

        const currentPosition = this.currentPositions[player][piece];

        if (BASE[player].includes(currentPosition) || this.bonus) {
            this.handlePieceClick(player, piece, this.bonus);
            segundoDado.hidden = true;
            this.checkForEligiblePieces();
            return;
        }

        Swal.fire({
            showDenyButton: segundoDado.hidden ? false : true,
            confirmButtonText: `<span style='color: white; font-weight: bold;'>${this.diceone}</span>`,
            denyButtonText: `<span style='color: white; font-weight: bold;'>${this.dicetwo}</span>`,
            background: `url('../assets/images/dados.jpg') no-repeat`,
            customClass: {
                title: 'swal-text-white',
                content: 'swal-text-white',
                actions: 'swal-text-white',
                confirmButton: 'swal-button-red',
                denyButton: 'swal-button-deny',
            },
            width: 'auto',
        }).then((result) => {
            if (result.isConfirmed) {
                this.handlePieceClick(player, piece, this.diceone);
                this.diceone = 0;
                this.dados[0] = true;
            } else if (result.isDenied) {
                this.handlePieceClick(player, piece, this.dicetwo);
                this.dicetwo = 0;
                this.dados[1] = true;
            }
            if(this.diceone || this.dicetwo){
                this.checkForEligiblePieces();
            }
        });
        
    }

    //Fazer tratamento ao clicar nas peças
    handlePieceClick(player, piece, value) {
        const currentPosition = this.currentPositions[player][piece];

        if (BASE[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, INICIO[player]);
            this.state = ESTADO_DADO.DICE_NOT_ROLLED;
            segundoDado.hidden = true;
            return;
        }
        UI.unhighlightPieces();
        this.movePiece(player, piece, value);

    }
    //Função para mudar a posição de uma peça
    setPiecePosition(player, piece, newPosition) {
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition)
    }


    //Andar uma quantidade definida de passos
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
                    const player = JOGADORES[this.turn];
                    const eligiblePieces = this.getEligiblePiecesForBonus(player);
                    if (eligiblePieces.length) {
                        this.bonus = 10
                        UI.highlightPieces(player, eligiblePieces);
                        if (this.diceone === 6 || (this.dicetwo === 6 && !segundoDado.hidden)) {
                            segundoDado.hidden = true;
                            this.state = ESTADO_DADO.DICE_NOT_ROLLED;
                        }
                        this.bonus = 0;
                        return;
                    }
                }
                if (this.diceone === 6 || (this.dicetwo === 6 && !segundoDado.hidden)) {
                    segundoDado.hidden = true;
                    this.state = ESTADO_DADO.DICE_NOT_ROLLED;
                    return;
                }

                if(segundoDado.hidden === false){
                    if(this.dados[0] === true && this.dados[1] === true){
                        this.incrementTurn();
                    }
                }else{
                    this.incrementTurn();
                }
             
            }
        }, 200);
    }

    //Função para verificar se é posssível matar
    checkForKill(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        const opponents = ['P1', 'P2', 'P3', 'P4'];
        let kill = false;
        opponents.forEach(opponent => {
            if (opponent !== player) {
                [0, 1, 2, 3].forEach(piece => {
                    const opponentPosition = this.currentPositions[opponent][piece];

                    if (currentPosition === opponentPosition && !NAO_PODE_MATAR.includes(currentPosition)) {
                        this.setPiecePosition(opponent, piece, BASE[opponent][piece]);
                        kill = true
                    }
                });
            }
        });

        return kill
    }
    
    //Vericar se tem algum jogar que já terminou o jogo
    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === CASA[player])
    }


    
    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
    }

    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        if (currentPosition === DESTINO[player]) {
            return LARGO_CASA[player][0];
        }
        else if (currentPosition === 79) {
            return 0;
        }
        return currentPosition + 1;
    }
}