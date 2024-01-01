let SFX = {
    flip: "./assets/flip.wav",
    pairfound: "./assets/pairfound.wav",
}

export function playSFX(name) {
    let file = SFX[name];
    var sound = new Audio(file);
    sound.volume = 0.5;
    if (name === "pairfound") { sound.volume = 0.2; } 
    sound.play();
}