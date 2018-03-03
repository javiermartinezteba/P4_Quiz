const fs = require("fs");

//Nombre del fichero donde se guardan las preguntas
const DB_FILENAME = "quizzes.json";

// Modelo de datos.
//
// En esta variable se mantienen todos los quizzes existentes.
// Es un array de objetos, que tienen atributos question
// y answer para guardar el texto de la pregunta y el de la respuesta.
let quizzes = [
    {
        question: "Capital de Italia",
        answer: "Roma"
    },
    {
        question: "Capital de Francia",
        answer: "París"
    },
    {
        question: "Capital de España",
        answer: "Madrid"
    },
    {
        question: "Capital de Portugal",
        answer: "Lisboa"
    }];

/**
 *carga contenido del fichero
 */
const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if (err){

        // La primera vez no existe el fichero
        if (err.code === "ENOENT") {
            save(); //valores iniciales
            return;
        }
        throw err;
    }
    let json = JSON.parse(data);
    if (json) {
        quizzes = json;
    }
});
};

/**
 *Guarda las preguntas en el fichero 
 */
 const save = () => {
    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
            if (err) throw err;
        });
 };

//
/**
 *Devuelve el numero total de preguntas existentes.
 *
 *@returns {number} numero total de preguntas.
 */
exports.count = () => quizzes.length;

/**
 *Añade un nuevo quiz.
 *
 *@param question String con pregunta.
 *@param answer String con respuesta.
 */
exports.add = (question, answer) => {

    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
 *Actualiza quiz
 *
 *@param id Clave del quiz
 *@param question String con la pregunta
 *@param answer String respuesta
 */
exports.update = (id, question, answer) =>{

    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parametro id no es valido.`);
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};


/**
 *Devuelve todos los quizzes existentes.
 *
 *@returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));


/**
 *Devuelve un clon del quiz almacenado en la posicion dada.
 *
 * Para clonar el quiz usa stringify + parse.
 *
 *@param id Clave del quiz a devolver
 *
 *@returns {question, answer} Devuelve objeto quiz.
 */
exports.getByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del párametro id no es válido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};

//
/**
 *Elimina el quiz situado en la posicion dada.
 *
 *@param id Clave que identifica el quiz a borrar.
 */
exports.deleteByIndex = id => {

    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del párametro id no es válido.`);
    }
    quizzes.splice(id, 1);
    save();
};

//Carga los quizzes almacenados en el fichero.
load();


