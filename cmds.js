


const {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');


/**
  * Muestra la ayuda.
  */

exports.helpCmd = rl => {
	log("Commandos");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Creditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};

/**
 * Lista quizzes
 */
exports.listCmd = rl => {

	model.getAll().forEach((quiz, id) => {

		log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};


/**
 * Muestra un quiz
 * @param id Clave del quiz
 */
exports.showCmd = (rl, id) => {

	if (typeof id === "undefined") {
		errorlog(`Falta el parametro id`);
	}else{
		try{
			const quiz = model.getByIndex(id);
			log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		} catch(error){
			errorlog(error.message);
		}
	}
 	


 	rl.prompt();
 };

 /**
 * Añade un quiz
 */
exports.addCmd = rl => {
 	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
 		
 		rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
 		
 			model.add(question, answer);
 			log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
 			rl.prompt();
 		});
 	});

 };

/**
 * Borra un quiz
 * @param id Clave del quiz
 */
exports.deleteCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parametro id`);
	}else{
		try{
			model.deleteByIndex(id);
		} catch(error){
			errorlog(error.message);
		}
	}
 	
 	rl.prompt();
 };


/**
 * Edita un quiz
 * @param id Clave del quiz
 */
exports.editCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parametro id`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);

			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
 				
 				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

 				rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
 					model.update(id, question, answer);
 					log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
 					rl.prompt();
 				});
 			});
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};


/**
 * Prueba un quiz
 * @param id Clave del quiz
 */
exports.testCmd = (rl, id) => {
	if (typeof id === "undefined") {
		errorlog(`Falta el parametro id`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);

			rl.question(colorize(quiz.question, 'red'), answer => {
				if( answer === quiz.answer) {
					biglog("correcto" , 'green');
				}else{
					biglog("incorrecto", 'red');
				}
				rl.prompt();

 				});
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};
/**
 * Pregunta en modo aleatorio
 */
exports.playCmd = rl => {
	let score = 0;
	let toBeResolved = [];
	
	model.getAll().forEach((quiz,id) => {
		toBeResolved.push(id);

	});
		const playOne = () => {
			if(toBeResolved.length === 0){
				log(`No hay mas preguntas`);
				biglog(`${score}`, 'blue');
				rl.prompt();
		}else{
			let id = Math.floor(Math.random()*toBeResolved.length);
			let quiz = model.getByIndex(toBeResolved[id]);
			
			rl.question(colorize(quiz.question, 'red'), answer => {
				if( answer === quiz.answer) {
					score++;
					toBeResolved.splice(id, 1);

					log(`Correcto, llevas ${score} aciertos` );
					playOne();
				}else{
					log(`Incorrecto`);
					log(`Fin del examen. Aciertos: `);
					biglog(score, 'green');
				}
				rl.prompt();
				
			});



		}
	}
	playOne();
};



/**
 * Creditos
 */
exports.creditsCmd = rl => {
	log('Autores de la practica:');
    log('Javier', 'green');
    rl.prompt();
};


/**
 * Termina
 */
exports.quitCmd = rl => {
	rl.close();
};