// create object Cell
function Cell(x, y) {
    this.x = x;
    this.y = y;
}

// return function-constructor of object Field
exports.getField = function (cfg) {
    this.id = 0;
    this.xDimension = cfg.xDimension;
    this.yDimension = cfg.yDimension;
    this.body = [];
    for (var x = 0; x < cfg.xDimension; x++) {
        this.body[x] = [];
        for (var y = 0; y < cfg.yDimension; y++) {
            this.body[x][y] = new Cell(x, y);
        }
    }
    return this;
};