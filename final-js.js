/*

OH YOU ARE A CURIOUS ONE, AREN'T YOU?

TELL YOU WHAT... WHY DON'T YOU CLOSE THIS, GO PLAY THE GAME LIKE A NORMAL PERSON, AND WE'LL PRETEND THIS NEVER HAPPENED.

NO ONE LIKES A CHEATER... ESPECIALLY THE GAMEMASTER (WHO SPENT A GOOD CHUNK OF TIME ON THIS). :)

*/

function Person(name, faction, minRoll, maxRoll, isTheOne, isGlitch) { //set up basic character structure
    this.name = name;
    this.faction = faction;
    this.minRoll = minRoll;
    this.maxRoll = maxRoll;
    this.isTheOne = isTheOne;
    this.isGlitch = isGlitch;
}

const resistance = new Person("Resistance", "Red", 1, 20, false, false);
const agent = new Person("Agent", "Blue", 1, 15, false, false);
const oracle = new Person("Oracle", "Red", 20, 20, false, false);
const architect = new Person("Architect", "Blue", 15, 15, false, false);
const theOne = new Person("Resistance", "Red", 15, 20, true, false); // Name is resistance to keep it hidden
const glitch = new Person("Resistance", "Red", 15, 20, false, true); // Name is resistance to keep it hidden

function getIdentity(code) { //assign identity based on input 3-digit code
    code = code.toLowerCase();
    var identity;
    var invalidCode = false;
    const glitches = ['ws1', 'bby'];
    const agents = ['8h1', '6d5', 'm12'];
    const resistances = ['f0n', '1gi', '6xv', '9iw', '9er', 'uk4', 'drv', 'zvn', 'i3t', 'm9b', '09v', 'vgp', '7qg', 'oak', '6ov', 'lrr', '50y', '8tq', 'liu', 'ub4', 'apg', 'mti', 'i0y', 'zo4', 'uyb', 'pbb', 'eca', 'eq8', 'mfb', 'f6x', '5i4', '63n'];
    switch (code) {
        case 'yne':
            identity = oracle;
            break;
        case 'cwp':
            identity = architect;
            break;
        case 'zrt':
            identity = theOne;
            break;
        default:
            if (glitches.includes(code)) identity = glitch;
            if (agents.includes(code)) identity = agent;
            if (resistances.includes(code)) identity = resistance;
            if (!identity) invalidCode = true;
    }
    const output = {
        "identity": identity,
        "invalidCode": invalidCode
    };
    return output;
}

function initialize(identity, firstTime = false) { //set up everything based on the identity entered or stored in local storage
    // 1 - save identity locally & define globally

    currentIdentity = identity;
    localStorage.setItem('identity', JSON.stringify(currentIdentity)); //save to local storage in case someone refreshes or loses connection

    // 2 - set initial faction

    if (identity.faction == 'Blue') {
        $('.faction').html('Agents');
        $('.faction-container').css('background-color', '#0026eb');
    }
    if (identity.faction == 'Red') {
        $('.faction').html('Resistance');
        $('.faction-container').css('background-color', '#ca0000');
    }

    // 3 - set instructions & rename oracle and architect & hide question about turning from architect and oracle

    if (identity.name == 'Architect') {
        $('.architect').show();
        $('.faction').html('Architect');
        $('.yes').hide();
    }

    if (identity.name == 'Oracle') {
        $('.oracle').show();
        $('.faction').html('Oracle');
        $('.yes').hide();
    }

    // 4 - set transition

    if (!identity.isTheOne) {
        $('.transition.second').remove(); //remove the transition for the one unless they are the one
    }

    // 5 - show intro transition and instructions if it's the first initialization
    if (firstTime) {
        $('.enter-code').hide();
        $('.loading-screen').show();

        setTimeout(function() {
            if (identity.name == 'Oracle') $('.oracle-instructions').show();
            if (identity.name == 'Architect') $('.architect-instructions').show();
            $('.loading-screen').hide();
            $('.instructions').show();
        }, 6000);
    }
}

function showLock(startTimer) { //show the 2 minute lock screen
    if (startTimer) {
        var mins = 1;
        var secs = 59;
        var time = mins * 60 + secs;
        var lockout = time;
        var i = 1;
        $('.mins').html(mins);
        $('.secs').html(secs);
        $('.face-off').addClass('disabled');
        $('.tracing-signature').html('Tracing Signature...');
        setTimeout(function() {
            $('.face-off').removeClass('disabled');
            $('.tracing-signature').html('Signature Locked');
        }, time * 1000);
        while (time > 0) {
            setTimeout(function() {
                if (secs > 0) {
                    secs--;
                } else {
                    mins--;
                    secs = 59;
                }
                $('.mins').html(mins);
                $('.secs').html(secs.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                }));
            }, 1000 * i);
            i++
            time--;
        }
    }
    $('.lock').show();
}

function randomIntFromInterval(min, max) { // roll a random number
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function showTransition(identity) {
    if (randomIntFromInterval(0, 1)) { // only show the special transition 50% of the time to make it less obvious
        $('.transition.first').css({
            'z-index': 499
        });
    } else {
        $('.transition.first').css({
            'z-index': 501
        });
    }
    $('.lock').hide();
    $('.transition').show();
    setTimeout(function() {
        $('.transition').hide();
        $('.roll-screen').show();
        roll(identity);
    }, 500);
}

function roll(identity) { // roll the dice based on your identity
    var i = 1;
    $('.turn-question').hide();
    $('.nat20').hide();
    $('.new-identity').hide();
    var divToShow = $('.turn-question');
    var diceRoll = randomIntFromInterval(identity.minRoll, identity.maxRoll);
    if (diceRoll == 20 && identity.faction == 'Red') { // remind people that they are turning agents with a natural 20
        divToShow = $('.nat20');
    }
    for (i = 1; i < 6; i++) { // create the rolling animation
        setTimeout(function() {
            $('.roll').html(randomIntFromInterval(1, identity.maxRoll));
        }, 200 * i);
    }
    setTimeout(function() {
        $('.roll').html(diceRoll);
        divToShow.fadeIn(400);
    }, 1200);

}

function wereYouTurned(result) {
    if (result) {
        switchIdentity(); // switch faction if they were turned
    } else {
        $('.roll-screen').hide();
        showLock(true);
    }
}

function switchIdentity() { // set up the game to recognize a new faction when turned
    var newAlignment = 'an Agent.';
    if (currentIdentity.faction == 'Red') {
        initialize(agent);
    } else {
        initialize(resistance);
        newAlignment = 'part of the Resistance.';
    }
    $('.turn-question').hide();
    $('.alignment').html(newAlignment);
    $('.new-identity').show();
    setTimeout(function() {
        $('.roll-screen').hide();
        $('.new-identity').hide();
        showLock(true);
    }, 5000);
}

function matrixCodeCanvas() { // show the matrix code on the loading screen
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        canvas2 = document.getElementById('canvas2'),
        ctx2 = canvas2.getContext('2d'),
        // full screen dimensions
        cw = window.innerWidth,
        ch = window.innerHeight,
        charArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        maxCharCount = 100,
        fallingCharArr = [],
        fontSize = 10,
        maxColums = cw / (fontSize);
    canvas.width = canvas2.width = cw;
    canvas.height = canvas2.height = ch;


    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.draw = function(ctx) {

        this.value = charArr[randomInt(0, charArr.length - 1)].toUpperCase();
        this.speed = randomFloat(1, 5);


        ctx2.fillStyle = "rgba(255,255,255,0.8)";
        ctx2.font = fontSize + "px san-serif";
        ctx2.fillText(this.value, this.x, this.y);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px san-serif";
        ctx.fillText(this.value, this.x, this.y);



        this.y += this.speed;
        if (this.y > ch) {
            this.y = randomFloat(-100, 0);
            this.speed = randomFloat(2, 5);
        }
    }

    for (var i = 0; i < maxColums; i++) {
        fallingCharArr.push(new Point(i * fontSize, randomFloat(-500, 0)));
    }


    var update = function() {

        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, cw, ch);

        ctx2.clearRect(0, 0, cw, ch);

        var i = fallingCharArr.length;

        while (i--) {
            fallingCharArr[i].draw(ctx);
            var v = fallingCharArr[i];
        }

        requestAnimationFrame(update);
    }

    update();
}

$(document).ready(function() {

    var startTimer = true;

    currentIdentity = '';

    if (window.location.search) { // allow the gamemaster to reset the local storage if needed
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reset')) {
            localStorage.removeItem('identity');
        }
    }

    if (localStorage.getItem('identity')) { // check local storage for existing identity
        currentIdentity = JSON.parse(localStorage.getItem('identity'));
        $('.enter-code').hide();
        initialize(currentIdentity);
        showLock(startTimer);
        startTimer = false;
    }

    $('.go').click(function() {
        identity = getIdentity($('#code').val());
        if (identity.invalidCode) {
            $('.error').show()
        } else {
            initialize(identity.identity, true);
        }
    });

    $('.read-instructions').click(function() {
        $('.instructions').hide();
        showLock(startTimer);
        startTimer = false;
    });

    $('.read-rules').click(function() {
        $('.lock').hide();
        $('.instructions').show();
    });

    $('.face-off').click(function() {
        if (!$('.face-off').hasClass('disabled')) {
            showTransition(currentIdentity);
        }
    });

    $('.yes').click(function() {
        if (!currentIdentity.isTheOne && !currentIdentity.isGlitch) {
            wereYouTurned(true);
        }
    });

    $('.no').click(function() {
        wereYouTurned(false);
    });
    matrixCodeCanvas();
});