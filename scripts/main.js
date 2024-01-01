import { preloadImages } from "./preload.js";
import { Card } from "./card.js";
import { drawText } from "./font.js";
import { playSFX } from "./audio.js";

const mainCanvas = document.getElementById("main-layer");
const animCanvas = document.getElementById("anim-layer");
const bgCanvas = document.getElementById("bg-layer");
const ctx = mainCanvas.getContext("2d");
const animCtx = animCanvas.getContext("2d");
const bgCtx = bgCanvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const width = mainCanvas.width;
const height = mainCanvas.height;
const fps = 120;
let deltaTime = 0;
// "START", "LEVELSELECT", "RUN", "PAUSE", "GAMEOVER";
let gameState = "START"

let textures = await preloadImages();

// [row, col, startX, startY]
let difficulty = {
    easy:   [4, 4, 100, 30],
    medium: [4, 6, 68, 30],
    hard:   [4, 8, 36, 30]
}

let currentButtonBeingHovered = null;
let isHovered = false;
let selectedDifficulty = difficulty.easy;

let mousePos = {x: 0, y: 0};
let clicked = false;

let cards = [];
let selected = [];
let pairsFound = 0;
let hoverRange = 12;

let score = 0;



function createCards() {
    let [numRows, numColumns, startX, startY] = selectedDifficulty;
    let cardPositions = [];
    cards = [];

    const spriteWidth = 24;
    const spriteHeight = 24;
    const padding = 8;

    let startId = 1 + Math.floor(Math.random() * 16);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numColumns; col++) {
            
            let x = startX + col * (spriteWidth + padding);
            let y = startY + row * (spriteHeight + padding);
            cardPositions.push([x, y]);
        }
    }

    cardPositions = shuffle(cardPositions);


    for (let i = 0; i < cardPositions.length; i++) {
        let [x, y] = cardPositions[i];
        let centerX = x + spriteWidth/2
        let centerY = y + spriteHeight/2

        // Id starts at a random number between 1 - 16 and wraps around, 
        // that way we get random cards every game;
        let id = Math.floor(cards.length / 2) + startId;
        id = (id % 16) + 1

        let frontcardsprite = textures[id];

        let newCard = new Card(x, y, centerX, centerY, id, textures.spritesheet, textures.backcardsprite, frontcardsprite)
        cards.push(newCard);   
    }
}
function initialize() {
    let diff = currentButtonBeingHovered[2];

    if (diff === "easybtn") { 
        selectedDifficulty = difficulty.easy; 
    } else if (diff === "mediumbtn") { 
        selectedDifficulty = difficulty.medium; 
    } else if (diff === "hardbtn") { 
        selectedDifficulty = difficulty.hard; 
    }

    createCards();
    pairsFound = 0;
    score = 0;
    
    gameState = "RUN";
}


// Main Update calls --------------------------------------------------

function updateLevelSelect() {
    // [x, y, width, height, texture];
    let buttons = [
        [131, 74, 53, 18, "easybtn"], 
        [113, 98, 90, 19, "mediumbtn"], 
        [129, 123, 56, 18, "hardbtn"]
    ];

    for (let i = 0; i < buttons.length; i++) {
        let [x, y, btnWidth, btnHeight, diff] = buttons[i];
        let centerX = x + btnWidth/2,
            centerY = y + btnHeight/2
        
        let a = Math.abs(centerX - mousePos.x),
            b = Math.abs(centerY - mousePos.y);
        
        let inRange = a < btnWidth/2 && b < btnHeight/2;


        if (!inRange) {
            isHovered = false;
        }
        if (clicked && inRange) {
            initialize();
            clicked = false;
        }
        if (inRange) {
            currentButtonBeingHovered = [x, y, diff];
            isHovered = true;
            break;
        }
    }
}
function checkWin() {
    if (pairsFound !== cards.length/2) {
        return false;
    }

    return true;
}
function update() {
    if (checkWin()) {
        gameState = "GAMEOVER"
    }

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];

        let a = (card.centerX - mousePos.x) ** 2,
            b = (card.centerY - mousePos.y) ** 2,
            distance = a + b;

        let inRange = distance < (hoverRange ** 2);
        let notSelected = !selected.includes(card);
        let notFlipped = card.face === "back";
        let canSelectCard = clicked && inRange && notSelected && notFlipped && selected.length < 2;

        if (canSelectCard) {
            selected.push(card);
            card.flip();
            playSFX("flip");

            if (selected.length === 2) {
                let card1 = selected[0];
                let card2 = selected[1];

                card.onAnimationFinished(() => {
                    if (card1.id !== card2.id) {
                        // Delay before flipping back
                        delay(700).then(() => {
                            selected = [];
                            card1.flip();
                            card2.flip();
                            playSFX("flip");
                            score -= 50;
                            score = score < 0 ? 0 : score;
                        });

                        return;
                    } else {
                        score += 100;
                        pairsFound++;
                        playSFX("pairfound");
                    }

                    selected = [];
                });
            }

            clicked = false;
        }
    }
}

// Main Draw calls  --------------------------------------------------
function drawStart() { 
    ctx.drawImage(textures.start, 0, 0); 
}
function drawLevelSelect() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(textures.levelselect, 0, 0);
    if (isHovered) {
        let diff = currentButtonBeingHovered[2];
        ctx.drawImage(textures[diff], currentButtonBeingHovered[0], currentButtonBeingHovered[1]);
    }
}
function drawGameOver() {
    ctx.clearRect(0, 0, width, height);
    animCtx.clearRect(0, 0, width, height);

    ctx.drawImage(textures.gameover, 0, 0);
    drawText(ctx, score.toString(), 140, 112, 3);
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    drawText(ctx, "score " + score.toString(), 8, 8, 2);
}


let gameInterval = 1000 / fps;
let lastGameTime = 0;
function renderGameLoop(timestamp) {
    deltaTime = timestamp - lastGameTime;

    if (gameState === "START") { drawStart(); }
    else if (gameState === "LEVELSELECT") { 
        updateLevelSelect();
        drawLevelSelect(); 
    }
    else if (gameState === "GAMEOVER") { drawGameOver(); }
    else if (gameState === "RUN") {
        if (deltaTime > gameInterval) {
            update();
            draw();
    
            lastGameTime = timestamp;
        }
    }
    requestAnimationFrame(renderGameLoop)
}


// Background --------------------------------------------------
function renderBackground() {
    bgCtx.drawImage(textures.bg, 0, 0);
    // bgCtx.drawImage(textures.SCOREBOARD, 0, 0);
}


// Animations --------------------------------------------------
function drawCards() {
    for (let i = 0; i < cards.length; i++) {
        cards[i].update(animCtx);
    }
}

let animInterval = 50;
let lastAnimTime = 0;
function renderCards(timestamp) {
    let elapsed = timestamp - lastAnimTime;

    if (elapsed > animInterval && gameState === "RUN") {
        drawCards();

        lastAnimTime = timestamp;
    }

    requestAnimationFrame(renderCards)
}

// Execute all frame dependent loops --------------------------------------------------
renderGameLoop();
renderBackground();
renderCards();

// Event handler functions --------------------------------------------------
function handleKeyup(e) {
    e.preventDefault();

    if (gameState === "START") {
        gameState = "LEVELSELECT";
    }

    //Restart game
    if (gameState === "GAMEOVER" && (e.key === 'r' || e.key === 'R' || e.key === "Escape")) {
        gameState = "START";
    } 
}
function handlemousePosmove(e) {
    mousePos.x = (e.clientX - mainCanvas.getBoundingClientRect().left) / 2;
    mousePos.y = (e.clientY - mainCanvas.getBoundingClientRect().top) / 2;
}
function handlemousePosdown() {
    clicked = true;
}
function handlemousePosup() {
    clicked = false;
}

window.addEventListener("keyup", handleKeyup);
window.addEventListener("mousemove", handlemousePosmove);
window.addEventListener("mousedown", handlemousePosdown);
window.addEventListener("mouseup", handlemousePosup);


// Utils --------------------------------------------------
function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }
  
async function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }