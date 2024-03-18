import ENV from './.env.json';
import { io } from "socket.io-client";

const adress = "http://" + ENV.serverAdress + ":" + ENV.port;
console.log("connecting to: ", adress);
const socket = io(adress);



let hints = "";
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

function clear(){
    const wordContainer = document.getElementById("wordToGuess");
    if (wordContainer){
        wordContainer.innerHTML = "";
    }

    hintsChoosed.splice(0, hintsChoosed.length);
    const hintsMyTeamContainer = document.getElementById("hintsMyTeam");
    if (hintsMyTeamContainer){
        hintsMyTeamContainer.innerHTML = "";
    }

    hintsSquares.splice(0, hintsSquares.length);
    const wordHintsContainer = document.getElementById("wordHints");
    if (wordHintsContainer){
        wordHintsContainer.innerHTML = "";
    }
    squares.splice(0, squares.length);
    const wordTryContainer = document.getElementById("wordTry");
    if (wordTryContainer){
        wordTryContainer.innerHTML = "";
    }
}


function initHints(str: string){
    hints = str;

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

    squares.splice(0, squares.length);
    const wordTryContainer = document.getElementById("wordTry");
    if (wordTryContainer){
        wordTryContainer.innerHTML = "";
        for (let i = 0; i < hints.length; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.textContent = wordTry[i];
            squares.push(square);
            wordTryContainer.appendChild(square);
        }
    }

}


const wordSquares = new Array<HTMLDivElement>();
const hintsChoosed = new Array<HintType>();

enum HintType {
    None = "None",
    Common = "Common",
    MyTeam = "MyTeam"
}

function initChooseHints(str: string){
    

    hintsChoosed.splice(0, hintsChoosed.length);
    for (let i = 0 ; i < str.length; i ++) hintsChoosed.push(HintType.None)
    const hintsMyTeamContainer = document.getElementById("hintsMyTeam");
    if (hintsMyTeamContainer){
        hintsMyTeamContainer.innerHTML = "";
        for (let i = 0; i < str.length; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            square.textContent = str[i];

            square.onclick = () => {
                if (hintsChoosed[i] == HintType.Common){
                    hintsChoosed[i] = HintType.None;
                    square.classList.remove("square-choosed-common")
                } else {
                    hintsChoosed[i] = HintType.Common;
                    square.classList.add("square-choosed-common")
                    square.classList.remove("square-choosed-my-team")
                }
                socket.emit("hintsChoosed", hintsChoosed)
            }

            square.addEventListener("contextmenu", function(event) {
                event.preventDefault(); // Prevent the default right-click menu from showing
                if (hintsChoosed[i] == HintType.MyTeam){
                    hintsChoosed[i] = HintType.None;
                    square.classList.remove("square-choosed-my-team")
                } else {
                    hintsChoosed[i] = HintType.MyTeam;
                    square.classList.remove("square-choosed-common");
                    square.classList.add("square-choosed-my-team")
                }
                socket.emit("hintsChoosed", hintsChoosed)
            });

            hintsMyTeamContainer.appendChild(square);
        }
    }
}











function setWordTry(str: string){
    wordTry = str;
    for (let i = 0; i < hints.length; i++) {
        squares[i].textContent = wordTry[i];
    }
}




socket.on("chooseHints", (str: string) => {
    console.log("chooseHints");
    clear();
    initChooseHints(str);
});


socket.on("hints", (str: string) => {
    clear();
    console.log("hints");
    initHints(str)
})


socket.on("updateTries", (newTries: [string, string]) => {
    const triesContainer = document.getElementById("tries");
    if (triesContainer){
        triesContainer.innerHTML = "";
        for (let i = newTries.length-1; i >= 0 ; i --){
            const tryDiv = document.createElement("div");
            tryDiv.classList.add("try");
            tryDiv.textContent = newTries[i][1];
            if (newTries[i][0] == "Blue"){
                tryDiv.classList.add("blue");
            } else if (newTries[i][0] == "Orange") {
                tryDiv.classList.add("orange");
            }
            triesContainer.appendChild(tryDiv);
        }
    }
})

let players = new Array();

socket.on("updateClients", (p: [string, string, string]) => {
    console.log("updatePlayers")
    players = p;

    const playersContainer = document.getElementById("players");
    if (playersContainer){
        playersContainer.innerHTML = "";

        const teamBlueDiv = document.createElement("div");
        teamBlueDiv.classList.add("player");
        teamBlueDiv.textContent = "--- Blue ---";
        teamBlueDiv.classList.add("Blue");
        teamBlueDiv.id = "teamBlue"
        playersContainer.appendChild(teamBlueDiv);


        for (let i = players.length-1; i >= 0 ; i --){
            if (p[i][1] == "Blue"){
                const div = document.createElement("div");
                div.classList.add("player");
                div.textContent = p[i][0];
                div.classList.add("blue");
                playersContainer.appendChild(div);
            }
        }


        const teamOrangeDiv = document.createElement("div");
        teamOrangeDiv.classList.add("player");
        teamOrangeDiv.textContent = "--- Orange ---";
        teamOrangeDiv.classList.add("Orange");
        teamOrangeDiv.id = "teamOrange";
        playersContainer.appendChild(teamOrangeDiv);

        for (let i = players.length-1; i >= 0 ; i --){
            if (p[i][1] == "Orange"){
                const div = document.createElement("div");
                div.classList.add("player");
                div.textContent = p[i][0];
                div.classList.add("Orange");
                playersContainer.appendChild(div);
            }
        }
    }
})


socket.on("updatePoints", (points: [number, number]) => {
    console.log(points);
    const teamBlueDiv = document.getElementById("teamBlue");
    if (teamBlueDiv){
        teamBlueDiv.innerHTML = `${points[0]} Blue`
    }   
    const teamOrangeDiv = document.getElementById("teamOrange");
    if (teamOrangeDiv){
        teamOrangeDiv.innerHTML = `${points[1]} Orange`
    }   

})


let myId = ""; 

socket.on("updateId", (id: string) => {
    console.log("updateId");
    myId = id;

    for (const player of players){
        if (player[2] == id){
            const myNameDiv = document.getElementById("myName");
            if (myNameDiv){
                if (player[1] == "Blue"){
                    myNameDiv.classList.add("blue");
                } else {
                    myNameDiv.classList.add("orange");
                }
                myNameDiv.innerHTML = player[0];
            }
            if (player[1] == "Blue"){
                // document.getElementById("wordTry")?.classList.add("blue");
                // document.getElementById("hintsMyTeam")?.classList.add("blue");
            } else {
                //  document.getElementById("wordTry")?.classList.add("orange");
                //  document.getElementById("hintsMyTeam")?.classList.add("orange");

            }
        }
    }

})



document.body.addEventListener('keydown', function(event) {
    if (event.target instanceof Element && event.target.matches('textarea')) {
        return; // Exit the function if the event target is a textarea
    }
    
    if (event.key === 'Backspace') {
        setWordTry(wordTry.slice(0, -1));
    } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        if (wordTry.length < hints.length){
            setWordTry(wordTry + event.key.toUpperCase());
        }
    } else if (event.key == "Enter"){
        socket.emit("guess", wordTry);
        setWordTry("");
    }
});

// const nextButton = document.getElementById("next");
// if (nextButton){
//     nextButton.onclick = () => {
//         console.log("go");
//         socket.emit("askHint");
//     }
// }


const myNameTextarea = document.getElementById('myName') as HTMLTextAreaElement; 
myNameTextarea?.addEventListener('input', function() {
    socket.emit('updateName', this.value); 
});



const resetButton = document.getElementById("reset");
resetButton?.addEventListener('click', function() {
    socket.emit('resetPoints'); 
});
