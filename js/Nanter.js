    // Importações dos módulos necessários
    import { BASE, BASE_2, BASE_3, LARGO_CASA, CASA, JOGADORES, JOGADORES_2, JOGADORES_3, NAO_PODE_MATAR, INICIO, ESTADO_DADO, DESTINO } from './posicoes.js';
    import { Interface } from './Interface.js';

    // Elemento HTML para o segundo dado
    const segundoDado = document.getElementById('dice2');
    let quantidadeJogadores;
    // Declaração da classe Ludo
    export class Nanter {
        // Propriedade para armazenar as posições atuais das peças de cada jogador
        currentPositions = {
            P1: [],
            P2: [],
            P3: [],
            P4: []
        };
        
        // Array para controlar se cada jogador já jogou pela primeira vez
        primeiraVez = [false, false, false, false];
        // Array para armazenar os valores dos dados
        dados = [false, false];
        // Propriedade para armazenar o bônus do jogador atual
        _bonus;
        // Getter e setter para a propriedade _bonus
        get bonus() {
            return this._bonus;
        }
        set bonus(value) {
            this._bonus = value;
        }

        // Getter e setter para o primeiro dado
        get diceone() {
            return this._diceone;
        }
        set diceone(value) {
            this._diceone = value;
            this._diceone = Interface.alterarValorDadoUm(value);
        }

        // Getter e setter para o segundo dado
        _dicetwo;
        get dicetwo() {
            return this._dicetwo;
        }
        set dicetwo(value) {
            this._dicetwo = value;
            this._dicetwo = Interface.alterarValorDadoDois(value);
        }

        // Getter e setter para controlar de quem é a vez
        _turn;
        get turn() {
            return this._turn;
        }
        set turn(value) {
            this._turn = value;
            Interface.proximoJogador(value);
        }

        // Getter e setter para o estado atual do jogo
        _state;
        get state() {
            return this._state;
        }
        set state(value) {
            this._state = value;
            // Atualiza a interface de acordo com o estado do jogo
            if (value === ESTADO_DADO.DICE_NOT_ROLLED) {
                    Interface.ativarDado();
                    Interface.desativarDestaquePecas();
            } else {
                Interface.desativarDado();
            }
        }

        iniciar = async () => {
            const { value: jogadores } = await Swal.fire({
                title: `<div style = 'font-size: 15px;'><i>"Não te irrites, mais do que um jogo, um estilo de vida"</i></div><p> <br>Escolha a quantidade de jogadores</p>`,
                input: "radio",
                inputOptions: {
                    2: 2,
                    3: 3,
                    4: 4,
                },
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonText: "Começar",
                customClass: {
                    title: 'input-tittle',
                    radio: 'text',
                    confirmButton: 'input-options'
                },
                inputValidator: (value) => {
                return new Promise((resolve) => {
                    if(!value)resolve("Selecione uma opção, por favor!");
                    else resolve();
                });
                }
            });
            if (jogadores) {
                this.listenDiceClick();
                this.listenResetClick();
                this.listenPieceClick();
                // Reseta o jogo para sua configuração inicial
                this.resetGame(jogadores);
            }
            
        };

        // Construtor da classe Ludo
        constructor()  {
            // Configura os listeners de cliques nos dados, reset e peças
            /* inputOptions can be an object or Promise */
            this.iniciar();    
        }

        // Método para adicionar o listener de clique nos dados
        listenDiceClick() {
            Interface.listenDiceClick(this.onDiceClick.bind(this));
        }

        listenResetClick(){
            Interface.listenResetClick(this.onResetClick.bind(this));
        }

        onResetClick(){
            this.iniciar();
        }
        // Método chamado quando os dados são clicados
        onDiceClick() {

            // Reproduz o som do dado sendo rolado
            var audio = new Audio('../assets/audio/dado_rolando-2.mp3');

            // Valores possíveis dos dados
            var values = [3, 3, 1, 1, 1, 3, 2, 3, 3, 4, 4, 5, 5, 6, 6];

            // Gera valores aleatórios para os dados
            let x = Math.floor(Math.random() * 15);
            let y = Math.floor(Math.random() * 15);
            this.diceone = values[x];
            this.dicetwo = values[y];
            audio.play();
            
            // Verifica se é a primeira jogada do jogador e se obteve um 6 em algum dado
            if (this.primeiraVez[this.turn] === false && (this.diceone === 6 || this.dicetwo === 6)) {
                this.primeiraVez[this.turn] = true;
                const jogador = JOGADORES[this.turn];
                this.setPiecePosition(jogador, 0, INICIO[jogador]);
                this.setPiecePosition(jogador, 1, INICIO[jogador]);
                this.movePiece(jogador, 1, Math.min(this.diceone, this.dicetwo));
                return;
            }
            // Atualiza o estado do jogo para indicar que os dados foram rolados
            this.state = ESTADO_DADO.DICE_ROLLED;
            // Verifica quais peças podem ser movidas com base nos valores dos dados
            this.checkForEligiblePieces();
        }

        // Método para verificar quais peças podem ser movidas
        checkForEligiblePieces() {
            const player = JOGADORES[this.turn];
            let eligiblePieces = this.getEligiblePieces(player);
            let contarPecasInicio = this.countPiecesAtPosition(player, INICIO[player]);
            if(contarPecasInicio > 1){
                eligiblePieces =  eligiblePieces.filter(peca => {
                    if(BASE[player].includes(this.currentPositions[player][peca])){
                        return false;
                    }
                    return true;
                });
            }
            
            if (eligiblePieces.length) {
                Interface.destacarPecas(player, eligiblePieces);
            } else {
                this.incrementTurn();
            }
        }

        // Método para avançar para o próximo jogador
        incrementTurn() {
            // Lógica para definir o próximo jogador
            let players = Object.keys(this.currentPositions).length;
            switch(players){
                case 2:
                    this.turn = (this.turn + 1) % 2;
                    break;
                case 3:
                    if (this.turn == 0) {
                        this.turn = 2;
                    } else if (this.turn === 1) {
                        this.turn = 0;
                    } else if (this.turn == 2) {
                        this.turn = 1;
                    }
                    break;
                case 4:
                    if (this.turn == 0) {
                        this.turn = 2;
                    } else if (this.turn === 1) {
                        this.turn = 3;
                    } else if (this.turn == 2) {
                        this.turn = 1;
                    } else if (this.turn == 3) {
                        this.turn = 0;
                    }
                default:
            }
            // Reseta os valores dos dados e exibe o segundo dado novamente
            this.dados[0] = this.dados[1] = false;
            segundoDado.hidden = false;
            this.state = ESTADO_DADO.DICE_NOT_ROLLED;
        }

        // Método para verificar se há algum bloqueio para o jogador atual
        verificarBloqueio(player, piece) {
            let menorValorDices = this.diceone;
            if(!this.dados[1] && segundoDado.hidden === false){
                menorValorDices = Math.min(this.dicetwo, menorValorDices);
            }
            alert(menorValorDices);
            let step = this.currentPositions[player][piece];
            while(menorValorDices){
                step+=1;
                let p =  this.getPlayersAndPiecesAtPosition(step);
                if(p.length === 2 && p[0].player === p[1].player && INICIO[player].includes(step))return true;
                menorValorDices--;
            }        
            return false;
        }

        // Método para retornar todas as peças elegíveis para o jogador atual
        getEligiblePieces(player) {
            return [0, 1, 2, 3].filter(piece => {
                const currentPosition = this.currentPositions[player][piece];

                if (currentPosition === CASA[player]) {
                    return false;
                }
                if (
                    BASE[player].includes(currentPosition) &&
                    (this.dados[0] ? true : this.diceone !== 6) &&
                    (this.dados[1] || segundoDado.hidden ? true : this.dicetwo !== 6)
                ) {
                    return false;
                }
                if (!this.dados[0]) {
                    if (
                        LARGO_CASA[player].includes(currentPosition) &&
                        this.diceone > CASA[player] - currentPosition
                    ) return false;
                }
                if (!this.dados[1]) {
                    if (
                        LARGO_CASA[player].includes(currentPosition) &&
                        this.dicetwo > CASA[player] - currentPosition
                    ) return false;
                }
                return true;
            });
        }

        // Método para retornar todas as peças elegíveis para o bônus do jogador atual
        getEligiblePiecesForBonus(player) {
            return [0, 1, 2, 3].filter(piece => {
                const currentPosition = this.currentPositions[player][piece];
                if (currentPosition === CASA[player]) {
                    return false;
                }
                if (BASE[player].includes(currentPosition) && this.bonus !== 6) {
                    return false;
                }
                if (
                    LARGO_CASA[player].includes(currentPosition) &&
                    this.bonus > CASA[player] - currentPosition
                ) {
                    return false;
                }
                return true;
            });
        }

        // Método para adicionar o listener de clique no botão de reset
        listenResetClick() {
            Interface.listenResetClick(this.resetGame.bind(this));
        }

        
        // Método para reiniciar o jogo
        resetGame(jogadoresQ) {
            // Reseta as posições das peças para a configuração inicial
            if(jogadoresQ == 2){
                this.currentPositions = structuredClone(BASE_2);
                JOGADORES_2.forEach(player => {
                    [0, 1, 2, 3].forEach(piece => {
                        this.setPiecePosition(player, piece, this.currentPositions[player][piece])
                    });
                });
            }else if(jogadoresQ == 3){
                this.currentPositions = structuredClone(BASE_3);
                JOGADORES_3.forEach(player => {
                    [0, 1, 2, 3].forEach(piece => {
                        this.setPiecePosition(player, piece, this.currentPositions[player][piece])
                    });
                });
            }else{
                this.currentPositions = structuredClone(BASE);
                JOGADORES.forEach(player => {
                    [0, 1, 2, 3].forEach(piece => {
                        this.setPiecePosition(player, piece, this.currentPositions[player][piece])
                    });
                });
            }
        

            ['P1', 'P2', 'P3', 'P4'].forEach(p => {
                let currentPlayers = Object.keys(this.currentPositions);
                if(currentPlayers.includes(p) === false){
                    document.querySelectorAll(`div[id="${p[1]}"]`).forEach(v => {
                        v.hidden = true;
                    });
                }
            });
            
            // Define aleatoriamente qual jogador começará
            this.turn = 0;
            // Reseta o bônus e exibe o segundo dado novamente
            this.bonus = 0;
            segundoDado.hidden = false;
            this.state = ESTADO_DADO.DICE_NOT_ROLLED;
        }

        // Método para adicionar o listener de clique nas peças
        listenPieceClick() {
            Interface.listenPieceClick(this.onPieceClick.bind(this));
        }

        // Método para tratar o clique em uma peça
        onPieceClick(event) {
            const target = event.target;

            // Verifica se o alvo do clique é uma peça e se está destacada
            if (!target.classList.contains('peca') || !target.classList.contains('highlight')) {
                return;
            }
            const player = target.getAttribute('PID');
            const piece = target.getAttribute('peca');

            const currentPosition = this.currentPositions[player][piece];

            // Trata o clique com base na posição atual da peça
            if (BASE[player].includes(currentPosition) || this.bonus) {
                this.handlePieceClick(player, piece, this.bonus);
                Interface.desativarDestaquePecas();
                console.log(this.dados[0]);
                this.checkForEligiblePieces();

                if(this.dados[0] === true && segundoDado.hidden === true){
                    Interface.desativarDestaquePecas();
                    Interface.ativarDado();
                    this.dados[0] = false;
                }
                let jogadorAserApertada = this.verificarAperto(player, INICIO[player]);
                if(jogadorAserApertada !== undefined){
                    this.setPiecePosition(jogadorAserApertada.player, jogadorAserApertada.piece,
                        BASE[jogadorAserApertada.player][jogadorAserApertada.piece]
                    );
                }
                return;
            }

            // Abre um modal para permitir ao jogador escolher qual dado usar
            Swal.fire({
                showDenyButton: segundoDado.hidden ? false : true,
                confirmButtonText: `<span style='color: white; font-weight: bold;${this.dados[0] ? `pointer-events: none;` : ""}'>${this.diceone}</span>`,
                denyButtonText: `<span style='color: white; font-weight: bold; ${this.dados[1] ? `pointer-events: none;` : ""}'>${this.dicetwo}</span>`,
                background: `url('../assets/images/dados.jpg') no-repeat`,
                customClass: {
                    title: 'swal-text-white',
                    content: 'swal-text-white',
                    actions: 'swal-text-white',
                    confirmButton: this.countPiecesAtPositionAllPlayer(currentPosition + this.diceone) > 1 || this.dados[0]
                    ?  'swal-button-unable': 'swal-button-red',
                    denyButton: this.countPiecesAtPositionAllPlayer(currentPosition + this.dicetwo) > 1  || this.dados[1]
                    ?  'swal-button-unable':'swal-button-deny',
                },
                width: 'auto',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.handlePieceClick(player, piece, this.diceone);
                    this.dados[0] = true;
                } else if (result.isDenied) {
                    this.handlePieceClick(player, piece, this.dicetwo);
                    this.dados[1] = true;
                }
                // Verifica se ainda faltam dados para serem escolhidos
                
                if ((!this.dados[0] || !this.dados[1])) {
                    this.checkForEligiblePieces();
                }
            });

        }

        // Método para tratar o clique em uma peça
        handlePieceClick(player, piece, value) {
            const currentPosition = this.currentPositions[player][piece];

            if (BASE[player].includes(currentPosition)) {
                this.setPiecePosition(player, piece, INICIO[player]);
                if (this.diceone === 6 && !this.dados[0]) {
                    this.dados[0] = true;
                } else if (this.dicetwo === 6 && !this.dados[1]) {
                    this.dados[1] = true;
                }
                this.state = ESTADO_DADO.DICE_NOT_ROLLED;
                return;
            }
            Interface.desativarDestaquePecas();
            this.movePiece(player, piece, value);
            this.bonus = 0;

        }
        
        // Método para definir a posição de uma peça
        setPiecePosition(player, piece, newPosition) {
            this.currentPositions[player][piece] = newPosition;
            Interface.mudarPosicoesPecas(player, piece, newPosition)
        }

        // Método para mover uma peça
        movePiece(player, piece, moveBy) {
            const interval = setInterval(() => {
                this.incrementPiecePosition(player, piece);
                moveBy--;
                if (moveBy === 0) {
                    clearInterval(interval);
                    if (this.hasPlayerWon(player)) {
                        alert(`Player: ${player} has won!`);
                        this.resetGame();
                        return;
                    }
                    
                    // if(CASA[player].includes(this.currentPositions[player][piece])){
                    //     this.bonus = 10;
                    //     const eligiblePieces = this.getEligiblePiecesForBonus(player);
                    //     if (eligiblePieces.length) {
                    //         UI.highlightPieces(player, eligiblePieces);
                    //         return;
                    //     }
                    // }


                    // Verifica se o jogador venceu
                    
                    // Verifica se houve um kill
                    const isKill = this.checkForKill(player, piece);
                    if (isKill) {
                        const player = JOGADORES[this.turn];
                        this.bonus = 20;
                        const eligiblePieces = this.getEligiblePiecesForBonus(player);
                        if (eligiblePieces.length) {
                            Interface.destacarPecas(player, eligiblePieces);
                            return;
                        }
                    }
                    
                    
                    
                    //deve girar novamente, caso o sair o valor 6 em dos dados
                
                    if (this.diceone === 6 || (this.dicetwo === 6 && !segundoDado.hidden)) {
                        segundoDado.hidden = true;
                        this.dados[1] = true;
                        this.dados[0] = false;
                        this.state = ESTADO_DADO.DICE_NOT_ROLLED;
                        return;
                    }

                    if (segundoDado.hidden === false) {
                        if (this.dados[0] === true && this.dados[1] === true) {
                            this.incrementTurn();
                        }
                    } else {
                        this.incrementTurn();
                    }

                }
            }, 200);
        }
        

        // Método para verificar se houve um kill
        checkForKill(player, piece) {
            const currentPosition = this.currentPositions[player][piece];
            let opponents = Object.keys(this.currentPositions);
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
        countPiecesAtPosition(player, position) {
            let count = 0;
            this.currentPositions[player].forEach(piecePosition => {
                if (piecePosition === position) {
                    count++;
                }
            });
            return count;
        }
        getPlayersAndPiecesAtPosition(position) {
            let playersAndPieces = [];
            let players = Object.keys(this.currentPositions);
            players.forEach(player => {
                [0, 1, 2, 3].forEach(piece => {
                    if (this.currentPositions[player][piece] === position) {
                        playersAndPieces.push({ player: player, piece: piece });
                    }
                });
            });
            return playersAndPieces;
        }
        verificarAperto(player, position){
            let playersAndPieces = this.getPlayersAndPiecesAtPosition(position);
            for(let i = 0; i < playersAndPieces.length; i++){
                if(playersAndPieces[i].player !== player){
                    return playersAndPieces[i];
                }
            }
        }

        

        countPiecesAtPositionAllPlayer(position) {
            let count = 0;
            let players = Object.keys(this.currentPositions);
            players.forEach(player => {
                this.currentPositions[player].forEach(pos => {
                    if(pos === position)count++;
                });
            });
            return count;
        }

        // Método para verificar se o jogador venceu
        hasPlayerWon(player) {
            return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === CASA[player])
        }

        // Método para incrementar a posição de uma peça
        incrementPiecePosition(player, piece) {
            this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
        }

        // Método para obter a próxima posição de uma peça
        getIncrementedPosition(player, piece) {
            const currentPosition = this.currentPositions[player][piece];
            if (currentPosition === DESTINO[player]) {
                return LARGO_CASA[player][0];
            } else if (currentPosition === 79) {
                return 0;
            }
            return currentPosition + 1;
        }
    }
