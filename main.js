// configuration that will be received from server
var cfg = '';

// key code of the last pressed key that will be store
var lastKeyCode = '';

// to store current object Canvas in client
var myCanvas = '';

// to store current object Serpent in client
var mySerpent = '';

// store interval id to possibillity of stopping them
var intervalId = '';

// draw field in client window from properties of object Canvas
function drawField() {
    if (myCanvas) {
        myCanvas.drawField();
    }
}

// draw field in client window from properties of object Serpent,
// received from response of server
function drawSerpent() {
    if (mySerpent) {
        myCanvas.drawSerpent(mySerpent);
    }
}

// get id and configuration from server,
// start function drawField and periodical function autoPressKey
function getcfg() {
    //alert("cfg :"+JSON.stringify(cfg));
    if (!cfg) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/getcfg", true);
        xhr.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                setTimeout(getcfg, 500);
                return;
            }
            cfg = JSON.parse(this.responseText);
            myCanvas = new Canvas(cfg);
            drawField();

            mySerpent = cfg.serpent;
            mySerpent.alive = true;
            drawSerpent();

            intervalId = window.setInterval(autoPressKey, cfg.autoPressKeyTime);
        };
        xhr.send(null);
    }
}

// handle response from server and draw moved serpent,
// display text message of processing
function handleResponse(response) {
    var li = document.getElementById('messages');
    if (response) {
        mySerpent = JSON.parse(response);
        var serpentIsAlive = mySerpent.alive;
        if (serpentIsAlive) {
            drawSerpent();
            li.innerText = 'Key '+mySerpent.key.toString()+' is processed';
        } else {
            window.clearInterval(intervalId);
            li.innerText = mySerpent.message + "\nReload page to start again.";
            mySerpent.alive = false;
        }
    } else {
        li.innerText = "Error! Empty response from server";
    }
}

// send id and key to server, then receive and show response message from server
function sendKeyToServer(key, url) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.send(JSON.stringify({id: cfg.id, key: key}));
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
            lastKeyCode = '';
        } else {
            var response = this.responseText;
            handleResponse(response);
        }
    };
}

// send esc or arrow key to server,
// store last pressed key for processing in periodical function autoPressKey
function onKeyDown(event) {
    if (cfg) {
        var keyCode = event.keyCode;
        if (keyCode == cfg.escKey) {
            sendKeyToServer(keyCode, "/stop");
            lastKeyCode = '';
        }
        if (cfg.arrows.indexOf(keyCode) > -1) {
            sendKeyToServer(keyCode, "/sendkey");
            lastKeyCode = keyCode;
        }
    }
}

//  send last pressed arrow key to server periodically
function autoPressKey() {
    if (cfg&&lastKeyCode) {
        sendKeyToServer(lastKeyCode, "/sendkey");
    }
}

// run function getcfg when window will be loaded
window.addEventListener("load", getcfg);

// run function onKeyDown when pressed key is released
window.addEventListener("keydown", onKeyDown, false);