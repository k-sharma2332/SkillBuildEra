let userScore = 0;
let compScore = 0;

const choices = document.querySelectorAll('.choice');
const msg = document.getElementById('msg');

const userScorePara = document.querySelector("#user-score");
const compScorePara = document.querySelector("#comp-score");


const genCompChoice = () => {
    const options = ['rock', 'paper', 'scissors'];
    const randomIndex = Math.floor(Math.random() * 3);
    return options[randomIndex];
}
const drawGame = () => {
    console.log("Game is a draw");
    msg.innerText = "Game was a draw! Play again.";
}
const showWinner = (userWin,userChoice,compChoice) => {
    if(userWin) {
        userScore++;
        userScorePara.innerText = ` ${userScore}`;
        console.log("You wins");
        msg.innerText = `You win! Your ${userChoice} beats ${compChoice}`;
        msg.style.backgroundColor = "green";
    } else {
        compScore++;
        compScorePara.innerText = ` ${compScore}`;
        console.log("You lose");
        msg.innerText = `You lost!  ${compChoice} beats your ${userChoice}`;
        msg.style.backgroundColor = "red";
    }
}
const playGame = (userChoice) => {
console.log("user choice = ", userChoice);
const compChoice = genCompChoice();
console.log("computer choice = ", compChoice);
if(userChoice === compChoice){
    //draw game
    drawGame();
} else {
    let userWin = true;
    if(userChoice === "rock ") {
        userWin = compChoice === "paper" ? false : true;
    } else if(userChoice === "paper") {
        userWin = compChoice === "scissors" ? false : true;
    }
    showWinner(userWin, userChoice, compChoice);
}
}

choices.forEach((choice) => {
    choice.addEventListener('click',()=>{
        const userChoice = choice.getAttribute("id");
        console.log(userChoice);
       console.log("choice was clicked");
       playGame(userChoice);
    })
});