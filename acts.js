var serverconfig = require('./config.json');
var clientconfig = require('./client.json');
var field = require('./field');
var serpent = require('./serpent');

// array of ids
var IDs = [];

// function-constructor of object Field
var Field = field.getField;

// array of objects of fields
var Fields = [];

// function-constructor of object Serpent with methods
var Serpent = serpent.getSerpent;

// methods of object Serpent
Serpent.prototype.changeMoveDirection = serpent.changeMoveDirection;
Serpent.prototype.grow = serpent.grow;
Serpent.prototype.leave = serpent.leave;
Serpent.prototype.kill = serpent.kill;
Serpent.prototype.move = serpent.move;

// array of objects of serpents
var Serpents = [];

// array of objects (pairs) of id and time, when it last processed on server
var lastSeens = [];

// id of SetInterval function releaseLastSeens
var intervalReleaseLastSeens;

// id of SetInterval function that showing arrays of objects to server console
var intervalLog;

// generate random integer from min to max
function randomInteger(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

// generate unique id
function getuid() {
    do {
        var rndID = randomInteger(serverconfig.minId, serverconfig.maxId);
    } while (IDs.indexOf(rndID) > -1 );
    return rndID;
}

// store generated unique id to IDs array,
// create objects of Field and Serpent for currunt id,
// store generated unique id, start position and serpent to clientconfig,
// then return generated clientconfig
function completedClientConfig() {
    var id = getuid();
    IDs.push(id);
    clientconfig.id = id;

    var myField = new Field(clientconfig);
    myField.id = id;
    Fields.push(myField);

    clientconfig.xStartCell = randomInteger(0,clientconfig.xDimension-1);
    clientconfig.yStartCell = randomInteger(0,clientconfig.yDimension-1);

    var mySerpent = new Serpent(clientconfig, myField);
    mySerpent.alive = true;
    Serpents.push(mySerpent);

    clientconfig.serpent = mySerpent;
    return clientconfig;
}

// get serpent by id from array of Serpents
function getSerpentById(id) {
    var serpent = '';
    for (var i = 0; i < Serpents.length; i++) {
        if (Serpents[i].id == id) {
            serpent = Serpents[i];
            break;
        }
    }
    return serpent;
}

// refresh the time when key code has been received from client with id last time
function storeIdTime(id) {
    var idIsFinded = false;
    for (var i = 0; i < lastSeens.length; i++) {
        if (lastSeens[i].id == id) {
            lastSeens[i].time = Date.now();
            idIsFinded = true;
            break;
        }
    }
    if (!idIsFinded) {
        lastSeens.push({id:id, time: Date.now()});
    }
}

// check possibility to move serpent, then store vector of move and call move function
function movedSerpent(key, serpent) {
    if (serpent.alive) {
        var moveDirection = '';
        var indexInArray = clientconfig.arrows.indexOf(key);
        if (indexInArray > -1) {
            moveDirection = clientconfig.vectors[indexInArray];
        }
        if (moveDirection) {
            serpent.changeMoveDirection(moveDirection);
            serpent.move();
        }
    }
    return serpent;
}

// delete object Serpent with id from array Serpents
function releaseSerpent(id) {
    for (var i = Serpents.length-1; i >= 0 ; i--) {
        if (Serpents[i].id = id) {
            Serpents.splice(i,1);
            break;
        }
    }
}

// delete object Field with id from array Fields
function releaseField(id) {
    for (var i = Fields.length-1; i >= 0 ; i--) {
        if (Fields[i].id = id) {
            Fields.splice(i,1);
            break;
        }
    }
}

// delete id from array IDs
function releaseID(id) {
    IDs.splice(IDs.indexOf(id),1);
}

// delete id from array lastSeens when server not receive requests from client with this id
function releaseLastSeens() {
    if (lastSeens.length > 0) {
        for (var i = lastSeens.length-1; i >= 0 ; i--) {
            if (Date.now() - lastSeens[i].time > 7500) {
                var idToRelease = lastSeens[i].id;
                lastSeens.splice(i,1);
                releaseSerpent(idToRelease);
                releaseField(idToRelease);
                releaseID(idToRelease);
            }
        }
    } else {
        clearInterval(intervalReleaseLastSeens);
        clearInterval(intervalLog);
    }
}

// check necessity of calling periodic functions setInterval
function checkingSetInterval() {
    if (lastSeens.length = 0) {
        intervalReleaseLastSeens = setInterval(releaseLastSeens, serverconfig.releaseDelay);
        intervalLog = setInterval(function() {
            // console.log(lastSeens);
            // console.log(IDs);
            // console.log(Fields);
            // console.log(Serpents);
        }, serverconfig.logInterval);
    }
}

// send stop-response to client
exports.stop = function(req, res) {
    res.end("stop");
};

// send moved serpent to client for drawing
exports.sendserpenttodraw = function(res, responsebody) {
    var responseId = responsebody.id;
    var responseKey = responsebody.key;
    var currentSerpent = getSerpentById(responseId);
    var serpentToDraw = movedSerpent(responseKey, currentSerpent);
    serpentToDraw.key = responseKey; // add value of processed key to possibility of checking on client
    storeIdTime(responseId);
    res.end(JSON.stringify(serpentToDraw));
};

// send completed clientconfig with generated unique id and serpent to client
exports.sendclientconfig = function(req, res) {
    checkingSetInterval();
    var currentClientConfig = completedClientConfig();
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.end(JSON.stringify(currentClientConfig));
};