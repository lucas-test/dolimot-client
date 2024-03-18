import { words } from "./words";

let wordToGuess = "";
let hints = "";
let hintsPos = new Array<number>();
let n = 0;
let wordTry = "";
const tries = new Array<string>();



const squares = new Array<HTMLDivElement>();
const hintsSquares = new Array<HTMLDivElement>();



function addToTry(){
    tries.push(wordTry);
    const triesDiv = document.getElementById("tries");
    if (triesDiv){
        triesDiv.innerHTML = "";
        for (const wTry of tries){
            triesDiv.textContent += wTry + "\n";
        }
    }
}


function addRandomHint(){
    if (hintsPos.length >= wordToGuess.length) return;
    while(true){
        const i = Math.floor(Math.random()*wordToGuess.length);
        if (hintsPos.indexOf(i) == -1){
            hintsPos.push(i);
            hintsPos.sort();
            return;
        }
    }
}

function updateHints(){
    hints = ""; 
    for (let i = 0 ; i < hintsPos.length; i ++){
        hints = hints.concat(wordToGuess[hintsPos[i]]);
    }
    const h = wordToGuess.length - hints.length;
    
    for (let i = 0 ; i < h; i++){
        hints += "_";
    }

    for (let i = 0 ; i < hints.length; i ++){
        hintsSquares[i].textContent = hints[i];
    }
}


function init(str: string){

    tries.splice(0, tries.length);
    
    wordToGuess = str;
    hints = "";
    hintsPos.splice(0,hintsPos.length);
    for (let i = 0 ; i < wordToGuess.length; i ++){
        if (Math.random() < 0.5){
            hintsPos.push(i);
            hints = hints.concat(wordToGuess[i])
        }
    }
    const h = wordToGuess.length - hints.length;
    
    for (let i = 0 ; i < h; i++){
        hints += "_";
    }

    n = wordToGuess.length;

    squares.splice(0, squares.length);
    hintsSquares.splice(0, hintsSquares.length);
    
    const wordHintsContainer = document.getElementById("wordHints");
    if (wordHintsContainer){
        wordHintsContainer.innerHTML = "";
        for (let i = 0; i < hints.length; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.textContent = hints[i];
            hintsSquares.push(square);
            wordHintsContainer.appendChild(square);
        }
    }
    
    
    const wordTryContainer = document.getElementById("wordTry");
    if (wordTryContainer){
        wordTryContainer.innerHTML = "";
        for (let i = 0; i < n; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.textContent = wordTry[i];
            squares.push(square);
            wordTryContainer.appendChild(square);
        }
    }
}




function setWordTry(str: string){
    wordTry = str;
    for (let i = 0; i < n; i++) {
        squares[i].textContent = wordTry[i];
    }
}

const accentsMap = {
    A: 'á|à|ã|â|À|Á|Ã|Â',
    E: 'é|è|ê|É|È|Ê',
    I: 'í|ì|î|Í|Ì|Î',
    O: 'ó|ò|ô|õ|Ó|Ò|Ô|Õ',
    U: 'ú|ù|û|ü|Ú|Ù|Û|Ü',
    C: 'ç|Ç',
    N: 'ñ|Ñ',
   };
   
const removeAccents = (text: string): string => {
    return Object.keys(accentsMap).reduce((acc, cur) => {
        const key = cur as keyof typeof accentsMap; // Type assertion
        return acc.replace(new RegExp(accentsMap[key], 'g'), key);
    }, text);
};



function victory(){
    while(true){
        let w = words[Math.floor(Math.random()*words.length)];
        w = removeAccents(w);
        if (w.length >= 4){
            console.log(w);
            init(w);
            return;
        }
    }
}


init("SALUT")



document.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace') {
        setWordTry(wordTry.slice(0, -1));
    } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        if (wordTry.length < n){
            setWordTry(wordTry + event.key.toUpperCase());
        }
    } else if (event.key == "Enter"){
        addToTry();
        if (wordTry == wordToGuess){
            victory();
        }
        setWordTry("");
    }
});

const nextButton = document.getElementById("next");
if (nextButton){
    nextButton.onclick = () => {
        console.log("go")
        addRandomHint();
        updateHints();
    }
}