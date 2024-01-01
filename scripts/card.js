export class Card {
    constructor(x, y, centerX, centerY, id, spritesheet, backSprite, frontSprite) {
        this.spritesheet = spritesheet;
        this.frames = 3;
        this.currentFrame = 0;
        this.frameWidth = 24;
        this.frameHeight = 24
        this.x = x;
        this.y = y;
        this.centerX = centerX;
        this.centerY = centerY;
        this.id = id;
        this.backSprite = backSprite;
        this.frontSprite = frontSprite;
        this.face = "back";
        this.isPlaying = false;
        this.callback;
    }

    flip() {
        this.isPlaying = true;
    }
    
    async update(ctx) {
        if (!this.isPlaying) {
            if (this.face === "back") {
                ctx.drawImage(this.backSprite, this.x, this.y);
            }
            if (this.face === "front") {
                ctx.drawImage(this.frontSprite, this.x, this.y);
            }
    
            return;
        }
        
    
        if (this.currentFrame === this.frames) {
            this.currentFrame = 0;
            this.isPlaying = false;
    
            // Toggle the card's face after the animation
            this.face = this.face === "back" ? "front" : "back";

            if (this.callback) {
                this.callback();

                this.callback = null;
            }

            return;
        }
        
        this.drawFrame(ctx);
        this.currentFrame++;
    }

    drawFrame(ctx) {
        ctx.clearRect(this.x, this.y, this.frameWidth, this.frameHeight);
        ctx.drawImage(this.spritesheet, 
                    this.frameHeight * this.currentFrame, 0, 
                    this.frameWidth, this.frameHeight, 
                    this.x, this.y, 
                    this.frameWidth, this.frameHeight);
    }

    onAnimationFinished(callback) {
        this.callback = callback;
    }
}

