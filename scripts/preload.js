let urls = {
    start: "./assets/startscreen.png",
    levelselect: "./assets/levelselect.png",
    easybtn: "./assets/easybtn.png",
    mediumbtn: "./assets/mediumbtn.png",
    hardbtn: "./assets/hardbtn.png",
    bg: "./assets/background.png",
    gameover: "./assets/gameover.png",
    backcardsprite: "./assets/backcard.png",
    spritesheet: "./assets/cardspritesheet.png",
    1: "./assets/card1.png",
    2: "./assets/card2.png",
    3: "./assets/card3.png",
    4: "./assets/card4.png",
    5: "./assets/card5.png",
    6: "./assets/card6.png",
    7: "./assets/card7.png",
    8: "./assets/card8.png",
    9: "./assets/card9.png",
    10: "./assets/card10.png",
    11: "./assets/card11.png",
    12: "./assets/card12.png",
    13: "./assets/card13.png",
    14: "./assets/card14.png",
    15: "./assets/card15.png",
    16: "./assets/card16.png",
}

export async function preloadImages() {
    const loadedImages = {};
  
    const promises = Object.entries(urls).map(([name, url]) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
  
        image.onload = () => {
          loadedImages[name] = image;
          resolve();
        };
  
        image.onerror = () => reject(`Image '${name}' failed to load: ${url}`);
      });
    });
  
    await Promise.all(promises);
  
    return loadedImages;
}

export {
    urls
}