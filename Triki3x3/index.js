//inicio de el programa, se instancian los botones con los cuales el usuario definira quien empieza el juego 

var theboard = new Board();
var ai = new AI('O');
var selected, opponent;

$(document).ready(function(){
	$('button').click(function(){
		$(this).addClass('seed');
		selected = $(this).text();
		opponent = selected === 'X' ? 'O' : 'X';
		ai = new AI('X');
		$('button').attr('disabled', 'true').removeClass('hover');
		

		// El usuario oprime el boton "O" que indica que el sistema inicia jugando 
		if(opponent === 'X') {

			//Proceso en el que el sistema realiza una jugada 
			var move = ai.getBestMove(theboard);
			var moveStr = move.join('');
			$('#'+moveStr).text('X').addClass('selected').unbind( "click" );
			theboard.makeMove('X', move);
		}
		
		//Controlador de los clics en el tablero de juego, esto solo cuando el usuario elige quien empieza a jugar 
	$('.spot').click(handleClicks);
	});
});

function handleClicks() {
		if($('#result').text())
			$('#result').empty();
	
		//Proceso en el que se registra y se efectua el movimiento realizado por el usuario.
		$(this).text(selected);
		$(this).addClass('selected').unbind( "click" );
		var spotid = $(this).attr('id');
		spotid = spotid.split('');
		theboard.makeMove(selected, [spotid[0], spotid[1]]);
		
		//Verifica el estado del juego, si existe una victoria dada por el movimiento del jugador 
		var winner = theboard.checkForWin();
		if(winner || theboard.isFull())
			gameOver(winner);
		else {
			// De lo contrario deja que el sistema juegue 
			var move = ai.getBestMove(theboard);
			console.log(move);
			var moveStr = move.join('');
			$('#'+moveStr).text(opponent).addClass('selected').unbind( "click" );
			theboard.makeMove(opponent, move);
			
			//Verifica nnuevamente si existe un fin de juego dado por el mmovimiento del sistema 
			winner = theboard.checkForWin();
			if(winner || theboard.isFull())
				gameOver(winner);
		}	
}

function gameOver(winner) {
	//Notifica al usuario del estado del juego
	if(winner)
		$('#result').text(winner +' won the game!');
	else
		$('#result').text('The game was a draw!');
	
	//Tiempo en el que se muestra el mensaje, luego se resetea el tablero 
	setTimeout(function(){
		//Reseteo del juego 
		$('table').empty();
		$('table').append("<tr id='row0' class='row'><td id='00' class='spot'> </td><td id='01' class='spot'> </td><td id='02' class='spot'> </td></tr><tr id='row1' class='row'><td id='10' class='spot'> </td><td id='11' class='spot'> </td><td id='12' class='spot'> </td></tr><tr id='row2' class='row'><td id='20' class='spot'> </td><td id='21' class='spot'> </td><td id='22' class='spot'> </td></tr>");
		theboard = new Board();
		$('.spot').click(handleClicks);
		
		if(opponent === 'X') {
			//Hce que el sistema realice su jugada 
			var move = ai.getBestMove(theboard);
			var moveStr = move.join('');
			$('#'+moveStr).text(opponent).addClass('selected').unbind( "click" );
			theboard.makeMove(opponent, move);
		}
	}, 1000);
}

//Implementacion del agente inteligente (IA)
function AI(seed) {
	this.marker = seed;
	this.opponent = seed == 'X' ? 'O' : 'X';
	this.max = 10;
	this.min = -10;
	//funcion basada en el algoritmo maximos y minimos 
	this.minimax = function(board, player) {
		var bestScore = -10,
				currScore = 0,
				moves = board.getAvailableMoves();
		
		//Caso base para recorrer los nodos hoja
		if(board.turnCnt >= 9 || board.checkForWin() || !moves)
			return this.evaluate(board);
		
		//Maximo
		if(player === this.marker) {
			bestScore = this.min;
			for(var move in moves) {
				var newBoard = board.clone();
				newBoard.makeMove(this.marker, moves[move]);
				currScore = this.minimax(newBoard, this.opponent);
				if(currScore > bestScore) {
					bestScore = currScore;
				}
			}
			return bestScore;
		}
		
		//Minimo
		if(player === this.opponent) {
			bestScore = this.max;
			for(var move in moves) {
				var newBoard = board.clone();
				newBoard.makeMove(this.opponent, moves[move]);
				currScore = this.minimax(newBoard, this.marker);
				if(currScore < bestScore) {
					bestScore = currScore;
				}
			}
			return bestScore;
		}
	};
	
	//Se obtiene la mejor jugada para esta configurtacion de tablero (Situacion actual)
	this.getBestMove = function(board) {
		var bestScore = this.min;
		var currScore;
		var bestMove = null;
		var moves = board.getAvailableMoves();
		var corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
		//Movimientos para las primeras dos rondas del juego, siempre se ejecutan 
		//debido a la probabilidad de victoria que se tiene haciendo estos movimientos 
		if(board.turnCnt === 0)
			return [1, 1];
		else if(board.turnCnt === 1 && board.gamestate[1][1] === '')
			return [1, 1];
		else if(board.turnCnt === 1)
			return corners[Math.floor(Math.random() * 4)];
		//se obtiene la mejor jugada posible teniendo en cuenta la situsaciuon actual del tablero 
		//y los posibles movimientos que puede realizar el usuarioaplicando recurcion 
		for(var move in moves) {
			var newBoard = board.clone();
			newBoard.makeMove(this.marker, moves[move]);
			currScore = this.minimax(newBoard, this.opponent);
			console.log('Current score: ' + currScore);
			console.log('Current move: ' + moves[move]);
			if(currScore > bestScore) {
				bestScore = currScore;
				bestMove = moves[move];
			}
		}
		return bestMove;
	};
	
	//Evalua la puntuacion de la tabla, comprobando cada linea
	this.evaluate = function(board) {
		var score = 0;
		
		score += this.evaluateLine(board, 0, 0, 0, 1, 0, 2);  // row 0
		score += this.evaluateLine(board, 1, 0, 1, 1, 1, 2);  // row 1
		score += this.evaluateLine(board, 2, 0, 2, 1, 2, 2);  // row 2
		score += this.evaluateLine(board, 0, 0, 1, 0, 2, 0);  // col 0
		score += this.evaluateLine(board, 0, 1, 1, 1, 2, 1);  // col 1
		score += this.evaluateLine(board, 0, 2, 1, 2, 2, 2);  // col 2
		score += this.evaluateLine(board, 0, 0, 1, 1, 2, 2);  // diagonal
		score += this.evaluateLine(board, 0, 2, 1, 1, 2, 0);  // alternate diagonal
		
		return score;
	};
	
	//Anota la línea revisando cada celda para nuestro marcador, 1 punto por 1, 10 puntos por 2, 
	//100 por 3, con el signo opuesto para el oponente 
	this.evaluateLine = function(board, r1, c1, r2, c2, r3, c3) {
		var score = 0;
		
		//Primera celda
		if(board.gamestate[r1][c1] === this.marker)
			score = 1;
		else if(board.gamestate[r1][c1] === this.opponent)
			score = -1;
		
		//Segunda celda
		if(board.gamestate[r2][c2] === this.marker){
			if(score == 1) //La primera celda la marque yo
				score = 10;
			else if (score === -1) // La primera celda la marco mi oponente 
				return 0;
			else //La celda 1 esta vacia 
				score = 1;
		}
		else if(board.gamestate[r2][c2] === this.opponent){
			if(score == -1) //La primera celda la marco mi oponente
				score = -10;
			else if (score === 1) // La primera celda la marque yo
				return 0;
			else //La celda 1 esta vacia 
				score = -1;
		}

		//celda final 
		if(board.gamestate[r3][c3] === this.marker){
			if(score > 1) //La primera y/o segunda celda la marque yo
				score *= 10;
			else if (score < 0) // La primera y/o segunda celda la marco mi oponente 
				return 0;
			else //La primera y/o segunda celda estan vacias 
				score = 1;
		}
		else if(board.gamestate[r3][c3] === this.opponent){
			if(score < 0) //La primera y/o segunda celda la marco mi oponente 
				score *= 10;
			else if (score > 1) // La primera y/o segunda celda la marque yo
				return 0;
			else //La primera y/o segunda celda estan vacias
				score = -1;
		}
		return score;
	};
}

//Implementacion del objeto tablero 
function Board() {
	this.turnCnt = 0;
	this.gamestate = [['','',''], ['','',''], ['','','']];
	//Devuelve las posiciones abiertas en el tablero como una matriz de puntos como [fila, columna] o [y, x]
	this.getAvailableMoves = function() {
		var moves = [];
		
		for(var row in this.gamestate)
			for(var col in this.gamestate[row])
				if(this.gamestate[row][col] === '')
					moves.push([row, col]);
		
		return moves;
	};
	// clonacion del tablero 
	this.clone = 	function() {
		var newBoard = new Board();
		
		//Realiza la copia de las X , O y el numero de turnos del tablero a clonar  
		for(var row = 0; row < 3; row++)
			for(var col = 0; col < 3; col++)
				newBoard.gamestate[row][col] = this.gamestate[row][col];
		newBoard.turnCnt = this.turnCnt;
		
		return newBoard;
	};
		
	//Se toma en cuenta la marca del jugador el cual realiza el movimiento 
	this.makeMove = function(player, point) {
		var row = parseInt(point[0]);
		var col = parseInt(point[1]);
		this.gamestate[row][col] = player;
		this.turnCnt++;
	};
	
	this.isFull = function() {
		return this.turnCnt === 9;
	};
	
	// revisa los estados de victoria
	this.checkForWin = function() {
		var boardState = this.gamestate;
		var winner;
		
		//Revicion de las diagonales
		if(boardState[1][1] !== '' &&
			 ((boardState[0][0] === boardState[1][1] 
				 && boardState[2][2] === boardState[1][1])
				|| (boardState[0][2] === boardState[1][1] 
						&& boardState[2][0] === boardState[1][1]))) {
			winner = boardState[1][1];
			return winner;
		}
		else {
			//Revicion de las filas 
			for(var row in boardState) {
				if(boardState[row][0] !== '' &&
					 boardState[row][0] === boardState[row][1] 
					 && boardState[row][2] === boardState[row][1]) {
					winner = boardState[row][0];
					return winner;
				}
			}
			//Revicion de las columnas
			for(var col in boardState) {
				if(boardState[0][col] !== '' &&
					 boardState[0][col] === boardState[1][col] 
					 && boardState[1][col] === boardState[2][col]) {
					winner = boardState[0][col];
					return winner;
				}
			}
		}
	};
}