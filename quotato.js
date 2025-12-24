quote_p = document.getElementById("quote")
tries_p = document.getElementById("tries")
guessed_p = document.getElementById("guessed")
quote_info_p = document.getElementById("quote_info")
who_p = document.getElementById("who")
date_p = document.getElementById("date")
d = new Date()
const regex_non_alphabet_g=/[^a-z]/gi
const regex_non_alphabet=/[^a-z]/i
QUOTES = []
QUOTE_INFO = ""
TRIES = 0
MAX_TRIES = 0
GAME_STATE = 0
LETTERS = ""
GUESSES = new Set()

date_p.valueAsDate = d;

fetch('quotes.csv')
  .then(response => response.text())
  .then(quotes => init_quotes (quotes))

function init_quotes(quotes){
    QUOTES = quotes.split("\n")
    QUOTES.splice(0,1)
    init_game()
}

function init_game(){
    prng = splitmix32(cyrb128(d.toDateString())[0]);
    ind = Math.floor(prng() * QUOTES.length);
    QUOTE_INFO = QUOTES[ind].split("|");
    QUOTE_INFO[0] = QUOTE_INFO[0].toUpperCase();
    quote_p.innerText = remove_letters(QUOTE_INFO[0]);
    who_p.innerText = ", "+QUOTE_INFO[1];
    quote_info_p.innerText = "Said while playing"+QUOTE_INFO[3]+", scribed by "+QUOTE_INFO[2]+" on "+QUOTE_INFO[4];
    LETTERS = calculate_tries(QUOTE_INFO[0]);
    MAX_TRIES = LETTERS.size + 5 <= 27 ? LETTERS.size + 5 : 27 ;
    TRIES = 0;
    GUESSES = new Set();
    GAME_STATE = 0;
    document.forms["guess_form"]["guess"].disabled = false;
    update_hud();
}

function remove_letters(text){
    return text.replace( /\w/g, '#');
}

function calculate_tries(text){
    x = text.replace( regex_non_alphabet_g,"");
    letters = new Set(x)
    return letters
}

//Used to generate the random seed generator
//https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function splitmix32(a) {
    return function() {
      a |= 0;
      a = a + 0x9e3779b9 | 0;
      let t = a ^ a >>> 16;
      t = Math.imul(t, 0x21f0aaad);
      t = t ^ t >>> 15;
      t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
     }
}

function validate_input(e){
    e.preventDefault();
    check_game_state();
    if (GAME_STATE === 0){
        let x = document.forms["guess_form"]["guess"].value.toUpperCase();
        document.forms["guess_form"]["guess"].value = ""
        x = x.toUpperCase()
        if ((x == "") || (GUESSES.has(x)) || (regex_non_alphabet.test(x))) {
            alert("Guess is not a valid character");
            return false
        }
        TRIES++;
        GUESSES.add(x)
        if(LETTERS.has(x)){
            for (i = 0; i< QUOTE_INFO[0].length;i++){
                if (QUOTE_INFO[0][i] === x){
                    tex = quote_p.innerText
                    tex = tex.substring(0,i)+x+tex.substring(i+1) 
                    quote_p.innerText = tex
                }
            }
        }
        update_hud()
        check_game_state();
    }
    return false;
}
function update_hud(){
    tries_p.innerText = "Tries: "+TRIES+" of "+MAX_TRIES
    guessed_p.innerText = "Guesses: "+Array.from(GUESSES).join(", ")
}

function check_game_state(){
    if (GAME_STATE === 0){
        if (TRIES >= MAX_TRIES){
            // game over
            alert("Game Over")
            document.forms["guess_form"]["guess"].disabled = true
            GAME_STATE = 1
        }
        if (QUOTE_INFO[0] === quote_p.innerText){
            // guessed quote
            alert("You did it, great job!")
            document.forms["guess_form"]["guess"].disabled = true
            GAME_STATE = 2
        }
    }
}

function update_date(e){
    d = date_p.valueAsDate
    init_game()
}