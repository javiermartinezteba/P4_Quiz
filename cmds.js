
const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");
const {models} = require('./model');


/**
  * Muestra la ayuda.
  */

exports.helpCmd = (socket, rl) => {
	log(socket, "Commandos");
    log(socket, " h|help - Muestra esta ayuda.");
    log(socket, " list - Listar los quizzes existentes.");
    log(socket, " show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
    log(socket, " add - Añadir un nuevo quiz interactivamente.");
    log(socket, " delete <id> - Borrar el quiz indicado.");
    log(socket, " edit <id> - Editar el quiz indicado.");
    log(socket, " test <id> - Probar el quiz indicado.");
    log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(socket, " credits - Creditos.");
    log(socket, " q|quit - Salir del programa.");
    rl.prompt();
};

exports.listCmd = (socket, rl) => {

     models.quiz.findAll()
        .each(quiz=> {
            log(socket, ` [${colorize(quiz.id,'magenta')}]: ${quiz.question}`);
        })
        .catch(error => {
            errorlog(socket, error.messsage);
        })
        .then(()=> {
            rl.prompt();
        });
};

const validateId = id => {

    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id== "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        }else {
            id = parseInt(id);
            if(Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            }else{
                resolve(id);
            }
        }
    });
};


/**
 * Muestra un quiz
 * @param id Clave del quiz
 */
exports.showCmd = (socket, rl, id) => {

	  validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id= ${id}.`);
            }
            log(socket, `[${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(error => {
            errorlog(socket, error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


const makeQuestion = (rl, text)=> {

    return new Sequelize.Promise((resolve,reject) => {
        rl.question(colorize(text,'red'), answer => {
            resolve(answer.trim());
        });
    });
};


 /**
 * Añade un quiz
 */
exports.addCmd = (socket, rl) => {
 	makeQuestion(rl,'Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta: ')
                .then(a => {
                    return {question : q, answer: a}
                });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(socket, `  ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket, 'El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error=> {
            errorlog(socket, error.message);
        })
        .then(()=>{
            rl.prompt();
        });
};


/**
 * Borra un quiz
 * @param id Clave del quiz
 */
exports.deleteCmd = (socket, rl, id) => {
	   
       validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
            errorlog(socket, error.message);
        })
        .then(()=> {
            rl.prompt();
        });
};


/**
 * Edita un quiz
 * @param id Clave del quiz
 */
exports.editCmd = (socket, rl, id) => {
	validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe el quiz asociado al id= ${id}.`);
        }

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, ' Introduzca la pregunta: ')
       .then(q => {
            process.stdout.isTTY && setTimeout(()=> {rl.write(quiz.answer)},0);
            return makeQuestion(rl, ' Introduzca la respuesta: ')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
              });
         });
     })
     .then(quiz => {
          return quiz.save();
     })
     .then(quiz => {
         log(socket, `   Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
     })
     .catch(Sequelize.ValidationError, error => {
         error.log(socket, 'El quiz es erroneo:');
         error.errors.forEach(({message})=>errorlog(message));
     })
     .catch(error =>{
         errorlog(socket, error.message);
     })
     .then(() => {
         rl.prompt();
     });
};


/**
 * Prueba un quiz
 * @param id Clave del quiz
 */
exports.testCmd = (socket, rl, id) => {
   validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id= ${id}.`);
        }

         return makeQuestion(rl, ` ${quiz.question} : ` )
            .then(a => {
                if( a.toLowerCase().trim() === quiz.answer.trim().toLowerCase()) {
                    log(socket, "Su respuesta es:");
                    log(socket, "Correcta" , 'green');
                }else{
                    log(socket, "Su respuesta es:");
                    log(socket, "Incorrecta", 'red');
                }
                rl.prompt();

                 });

         })   
        .catch(Sequelize.ValidationError, error => {
         error.log(socket, 'El quiz es erroneo:');
         error.errors.forEach(({message})=>errorlog(message));
         })
        .catch(error =>{
         errorlog(socket, error.message);
         })
        .then(() => {
         rl.prompt();
     });
};
/**
 * Pregunta en modo aleatorio
 */
exports.playCmd = (socket, rl) => {
    let score = 0;
    let toBeResolved = [];
    
    models.quiz.findAll() 
        .each(quiz => {
            toBeResolved.push(quiz.id);
        })
        .then(() => {
            playOne();
        });

        const playOne = () => {
            if(toBeResolved.length === 0){
                log(socket, `No hay mas preguntas`);
                log(socket, `Fin de examen`);
                log(socket, `${score}`, 'blue');
                rl.prompt();
        }else{
            let quiz = Math.floor(Math.random()*toBeResolved.length);
            let id= toBeResolved[quiz];

             validateId(id)
            .then(id => models.quiz.findById(id))
             .then(quiz => {
                 if(!quiz){
                 throw new Error(`No existe un quiz asociado al id= ${id}.`);
                }

            
            
            return makeQuestion(rl, ` ${quiz.question} : ` )
            .then(a => {
                if( a.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    score++;
                    toBeResolved.splice(id, 1);

                    log(socket, `Correcto`, 'green');
                    log(socket, `Llevas ${score} aciertos`);
                    playOne();
                }else{
                    log(socket, `Incorrecto`,'red');
                    log(socket, `Fin del examen`);
                    log(socket, `Has tenido ${score} aciertos`);
                }
             
                
            });



        })
            .catch(Sequelize.ValidationError, error => {
                errorlog(socket, 'El quiz es erroneo:');
                error.errors.forEach(({message}) => errorlog(message));
            })
            .catch(error => {
                errorlog(socket, error.message);
            })
            .then(() => {
                rl.prompt();
            });
        }
};
};
/**
 * Creditos
 */
exports.creditsCmd = (socket, rl) => {
	log(socket, 'Autores de la practica:');
    log(socket, 'Javier', 'green');
    rl.prompt();
};


/**
 * Termina
 */
exports.quitCmd = (socket, rl) => {
	rl.close();
};
