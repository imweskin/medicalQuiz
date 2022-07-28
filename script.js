let startBtn = document.querySelector(".start-btn");
let rulesDiv = document.querySelector(".rules");
let exitBtn = document.querySelector(".exit");
let startQuizBtn = document.querySelector(".continue");
let quizDiv = document.querySelector(".quiz");
let answersDiv = document.querySelector(".quiz .answers");
let submitAnsBtn = document.querySelector(".quiz .submit");
let nextQstBtn = document.querySelector(".quiz .next");
let resultsDiv = document.querySelector(".results");
let resultsText = document.querySelector(".results .results-text");
let quitBtn = document.querySelector(".results .quit");
let replayBtn = document.querySelector(".results .replay");

//settings
let questions;
let qstCount;
let currentQst = 0;
let score = 0;
let countTime = 60; //seconds
let countDownInterval;

startBtn.onclick = () => {
    startBtn.style.display = "none";
    rulesDiv.style.display = "block";
};

exitBtn.onclick = () => {
    rulesDiv.style.display = "none";
    startBtn.style.display = "block";
};

startQuizBtn.onclick = () => {
    rulesDiv.style.display = "none";
    quizDiv.style.display = "block";
    startQuiz();
};

quitBtn.onclick = () => {
    //temporary solution
    window.location.reload();
};

replayBtn.onclick = () => {
    resultsDiv.style.display = "none";
    quizDiv.style.display = "block";
    //reset all settings
    clearInterval(countDownInterval);
    currentQst = 0;
    score = 0;
    countTime = 60; //seconds
    //restart
    startQuiz();
};

function startQuiz() {
    //get questions
    let request = new XMLHttpRequest();
    request.open("GET","questions.json",true);
    request.send();

    request.onreadystatechange = function () {
        if(this.readyState === 4 && this.status === 200) {
            questions = JSON.parse(this.responseText);
            qstCount = questions.length;
            //add question title + answers
            addQuestion();
            //start counter
            countDown();
            //submit answer button (next)
            submitAnsBtn.onclick = () => {
                submitAnswer();
            };
            //next question button
            nextQstBtn.onclick = () => {
                nextQuestion();
            };
        }
    };
};

function addQuestion() {
    if(currentQst < qstCount) {
        //add question title
        let qstTitle = questions[currentQst]["title"];
        document.querySelector(".quiz .question").innerHTML = `${currentQst+1}. ${qstTitle}`;
        //add answers
        for(let i = 1; i <= 5; i++) {
            let answer = document.createElement("li");
            answer.className = "answer";
            answer.appendChild(document.createTextNode(questions[currentQst][`answer_${i}`]));
            answersDiv.appendChild(answer);
        }
        //add question number
        document.querySelector(".current-qst").innerHTML = currentQst+1;
        document.querySelector(".total-qst").innerHTML = qstCount;
    }
};

function countDown() {
    if(currentQst < qstCount) {
        let timeSpan = document.querySelector(".time .numbers");
        let minutes, seconds;
        countDownInterval = setInterval(() => {
            minutes = parseInt(countTime / 60);
            seconds = parseInt(countTime % 60);

            minutes = minutes < 10 ? `0${minutes}` : minutes;
            seconds = seconds < 10 ? `0${seconds}` : seconds;

            timeSpan.innerHTML = `${minutes}:${seconds}`;

            countTime--;

            let answers = document.querySelectorAll(".quiz .answer");
            answers.forEach((answer) => {
                answer.onclick = () => {
                    if(answer.classList.contains("checked")) {
                        answer.classList.remove("checked");
                    } else {
                        answer.classList.add("checked");
                    }
                };
            });

            if(countTime < 0) {
                clearInterval(countDownInterval);
                submitAnsBtn.click();
            }
        }, 1000);
    }
};

function submitAnswer() {
    //stop timer
    clearInterval(countDownInterval);
    //get right answers
    let rightAnswers = questions[currentQst]["right_answer"];
    //increase question index
    currentQst++;
    //check Answer
    checkAnswer(rightAnswers);
    //remove submit and add next
    submitAnsBtn.style.display = "none";
    nextQstBtn.style.display = "block";
};

function nextQuestion() {
    //remove old question
    document.querySelector(".quiz .question").innerHTML = "";
    //remove old answers
    answersDiv.innerHTML = "";
    //add new question + new answers
    addQuestion();
    //restart counter
    clearInterval(countDownInterval);
    countTime = 60;
    countDown();
    //remove next and add submit
    submitAnsBtn.style.display = "block";
    nextQstBtn.style.display = "none";
    //show results if its the last question
    showResults();
}

function checkAnswer(rightAnswers) {
    //get all answers
    let answers = document.querySelectorAll(".quiz .answer");
    //get user chosen answers
    let chosenAnswers = [];
    let notChosenAnswers = [];
    answers.forEach((answer) => {
        if(answer.classList.contains("checked")) {
            chosenAnswers.push(answer);
            answer.classList.remove("checked");
        } else {
            notChosenAnswers.push(answer);
        }
    });
    let correct = true;
    chosenAnswers.forEach((chosenAnswer) => {
        if(rightAnswers.includes(chosenAnswer.innerHTML)) {
            chosenAnswer.classList.add("good");
        } else {
            chosenAnswer.classList.add("bad");
            correct = false;
        }
    });
    notChosenAnswers.forEach((notChosenAnswer) => {
        if(rightAnswers.includes(notChosenAnswer.innerHTML)) {
            notChosenAnswer.classList.add("bad");
        }
    });
    if(chosenAnswers.length === rightAnswers.length && correct) {
        score++;
    }
};

function showResults() {
    if(currentQst === qstCount) { //out of questions since we started from 0
        quizDiv.style.display = "none";
        resultsDiv.style.display = "block";
        let results;
        if(score > (qstCount / 2) && score < qstCount) {
            results = `et bien joué! Vous avez eu <span id="userAnswer">${score}</span> sur <span id="totalAnswers">${qstCount}</span>`; 
        } else if(score === qstCount) {
            results = `et parfait! Vous avez eu <span id="userAnswer">${score}</span> sur <span id="totalAnswers">${qstCount}</span>`;
        } else {
            results = `mais mauvaises nouvelles ... vous avez eu <span id="userAnswer">${score}</span> sur <span id="totalAnswers">${qstCount}</span>`;
        }

        resultsText.innerHTML = results;
    }
};