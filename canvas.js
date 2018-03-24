// create object Canvas, Element 'canvas' in client index.html and other stuff
var Canvas = function (options) {

    this.xDimension = options.xDimension;
    this.yDimension = options.yDimension;
    this.cellWidth = options.cellWidth;
    this.cellHeight = options.cellHeight;
    this.xDelta = options.xDelta;
    this.yDelta = options.yDelta;
    this.canvasStyle = options.canvasStyle;
    this.fieldColor = options.fieldColor;
    this.serpentColor = options.serpentColor;

    var myLabel = document.getElementById('canvases');
    var createdCanvas = document.createElement('canvas');
    createdCanvas.width = this.cellWidth*options.xDimension+1;
    createdCanvas.height = this.cellHeight*options.yDimension+1;
    createdCanvas.style = this.canvasStyle;
    myLabel.appendChild(createdCanvas);

    this.body = createdCanvas;
    this.context2D = createdCanvas.getContext('2d');
    this.fieldGradient = this.context2D.createLinearGradient(0, 0, this.cellWidth, this.cellHeight);
    this.fieldGradient.addColorStop(0,this.fieldColor);
    this.serpentGradient = this.context2D.createLinearGradient(0, 0, this.cellWidth, this.cellHeight);
    this.serpentGradient.addColorStop(1,this.serpentColor);
};

// draw field in client window from properties of object Canvas
Canvas.prototype.drawField = function() {
    this.context2D.fillStyle = this.fieldGradient;
    this.context2D.fillRect(
        this.xDelta,
        this.yDelta,
        this.cellWidth*this.xDimension-this.xDelta,
        this.cellHeight*this.yDimension-this.yDelta);
    for (var i = 0; i <= this.xDimension; i++) {
        this.context2D.moveTo(i*this.cellWidth+0.5, 0);
        this.context2D.lineTo(i*this.cellWidth+0.5, this.cellHeight*this.yDimension);
        this.context2D.stroke();
    }
    for (var j = 0; j <= this.yDimension; j++) {
        this.context2D.moveTo(0, j*this.cellHeight+0.5);
        this.context2D.lineTo(i*this.cellWidth*this.xDimension, j*this.cellHeight+0.5);
        this.context2D.stroke();
    }
};

// draw serpent on field in client window
Canvas.prototype.drawSerpent = function(serpentToDraw) {
    this.context2D.fillStyle = this.serpentGradient;
    for (var i = 0; i < serpentToDraw.body.length; i++) {
        this.context2D.fillRect(
            serpentToDraw.body[i].x*this.cellWidth+this.xDelta,
            serpentToDraw.body[i].y*this.cellHeight+this.yDelta,
            this.cellWidth-this.xDelta,
            this.cellHeight-this.yDelta);
    }
    if (serpentToDraw.tail[0]!==undefined) {
        this.context2D.fillStyle = this.fieldGradient;
        if (serpentToDraw.tail[0]!==serpentToDraw.body[0]) {
            this.context2D.fillRect(
                serpentToDraw.tail[0].x*this.cellWidth+this.xDelta,
                serpentToDraw.tail[0].y*this.cellHeight+this.yDelta,
                this.cellWidth-this.xDelta,
                this.cellHeight-this.yDelta);
        }
    }
};