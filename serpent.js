// return function-constructor of object Serpent
exports.getSerpent = function(cfg, field) {
    this.id = cfg.id;
    this.alive = false;
    this.message = "";
    this.length = cfg.startLengthOfSerpent;
    this.body = [];
    this.body.splice(0,0,field.body[cfg.xStartCell][cfg.yStartCell]);
    this.tail = [];
    this.moveVector = [];
    this.field = field;
};

// store vector of move direction in object Serpent
exports.changeMoveDirection = function(md) {
    this.moveVector.splice(0, 1, md);
};

// add cell on the way of Serpent's move to the array of Serpent's body
exports.grow = function(cell) {
    this.body.splice(0, 0, cell);
};

// add the last cell of Serpent's body to the array of Serpent's tail,
// then delete the last cell of Serpent's body
exports.leave = function() {
    if (this.body.length > this.length) {
        this.tail.splice(0, 1, this.body[this.body.length-1]);
        this.body.splice(this.body.length-1,1);
    }
};

// change the flag of alive to false, store the message to show in client window
exports.kill = function(message) {
    this.alive = false;
    this.message = message;
};

// check possibility to move, then call kill or grow&leave function
exports.move = function() {
    if (this.moveVector.length > 0) {
        var serpentHead = this.body[0];
        var moveToX = serpentHead.x+this.moveVector[0][0];
        var moveToY = serpentHead.y+this.moveVector[0][1];
        if ((moveToX < 0)||(moveToX == this.field.xDimension)||
            (moveToY < 0)||(moveToY == this.field.yDimension)) {
            this.kill("Serpent is over the field!");
        } else {
            var cellOnTheWay = this.field.body[moveToX][moveToY];
            if (this.body.indexOf(cellOnTheWay)>0) {
                if (cellOnTheWay !== this.body[this.body.length-1]) {
                    this.kill("Serpent eat himself!");
                }
            }
        }
        if (this.alive) {
            this.grow(cellOnTheWay);
            this.leave();
        }
    }
};