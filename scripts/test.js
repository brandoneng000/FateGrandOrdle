var servantNameClass = getServantNamesClass();
var dailyImage;
var dailyCollectionNum;
var dailyName;
var dailyRarity;
var dailyClass;
var dailyNPType;
var dailyNPEffect;
var chosenCollectionNum;
var chosenName;
var chosenRarity;
var chosenClass;
var chosenNPType;
var chosenNPEffect;
var attemptsRemaining = 8;
var gameOver = false;
var attemptServants = [];
var dailyServant = [];
var userData;

var checkDate;
var date;

var wins = 0;
var games = 0;

var signup = document.getElementById('signUp');
var login = document.getElementById('login');
var token;
var userData;
const loginURL = "http://127.0.0.1:5000/login";
const userDataURL = "http://127.0.0.1:5000/user";
const signUpURL = "http://127.0.0.1:5000/signup";
const updateUserURL = "http://127.0.0.1:5000/user-update";
const checkTokenURL = "http://127.0.0.1:5000/check-token";

function showImage() {
    let image = document.getElementById('servantImage');
    image.style.visibility = 'visible';
    image.src = dailyImage;
}

async function initialize() {
    wins = parseInt(localStorage.getItem("wins"));
    if (isNaN(wins)) {
        wins = 0;
    }
    games = parseInt(localStorage.getItem("games"));
    if (isNaN(games)) {
        games = 0;
    }


    token = localStorage.getItem("token");
    if (token) {
        await fetch(checkTokenURL, {
            method: "GET",
            headers: {
                "x-access-token": token
            }
        })
        .then((response) => {
            if (response.status === 200) {
                return response.json()
            }
            else {
                localStorage.setItem("token", "")
                location.reload();
            }
            
        })
        .then((data) => {
            // console.log(data["name"]);
        })

    }

    userData = JSON.parse(localStorage.getItem("userData"));
    userStatus();
    checkDate = localStorage.getItem("date");
    date = getDate(convertTZ(new Date(), "America/Los_Angeles"));
    if (date !== checkDate) {
        localStorage.removeItem("dailyServant");
        localStorage.removeItem("dailyImage");
        localStorage.removeItem("gameOver");
        localStorage.removeItem("attemptServants");
        localStorage.removeItem("attemptsRemaining");
        localStorage.removeItem("dailyCollectionNum");
    }

    dailyServant = JSON.parse(localStorage.getItem("dailyServant"));
    dailyImage = localStorage.getItem("dailyImage");
    dailyCollectionNum = parseInt(localStorage.getItem("dailyCollectionNum"))
    gameOver = (localStorage.getItem("gameOver") === 'true');
    if (dailyServant === null) {
        dailyServant = [];
        await getServant();
    }
    attemptServants = localStorage.getItem("attemptServants");
    let check = localStorage.getItem("attemptsRemaining");
    if (check === null) {
        attemptsRemaining = 8;
    }
    else {
        attemptsRemaining = check;
    }
    if (attemptServants !== null) {
        attemptServants = JSON.parse(attemptServants)
        for (let i = 0; i < attemptServants.length; i++) {
            insertNewServant(dailyServant, attemptServants[i]);
        }
    }
    else {
        attemptServants = [];
    }
    checkGameStatus();
}

async function getServant() {
    await fetch("https://fgo-servant-api.vercel.app/random-servant")
        .then(response => response.json())
        .then(data => {
            dailyCollectionNum = data['collection_no'];
            dailyName = data['name'];
            dailyClass = data['class_name'];
            dailyRarity = data['rarity'];
            dailyNPType = data['np_type'];
            dailyNPEffect = data['np_effect'];
            if (dailyNPEffect === "attackEnemyAll") {
                dailyNPEffect = "ALL"
            }
            else if (dailyNPEffect === "attackEnemyOne") {
                dailyNPEffect = "SINGLE"
            }
            else {
                dailyNPEffect = "SUPPORT"
            }
            dailyImage = data['asc4_art'];
        })
    dailyServant.push(dailyName);
    dailyServant.push(dailyRarity);
    dailyServant.push(dailyClass);
    dailyServant.push(dailyNPType);
    dailyServant.push(dailyNPEffect);
    localStorage.setItem("dailyServant", JSON.stringify(dailyServant));
    localStorage.setItem("dailyImage", dailyImage);
    localStorage.setItem("dailyCollectionNum", dailyCollectionNum);
}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        let servantName;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            let servant = arr[i];
            let servantName = servant['name'];
            let effect = servant['np_effect'];
            if (effect === "attackEnemyAll") {
                effect = "ALL"
            }
            else if (effect === "attackEnemyOne") {
                effect = "SINGLE"
            }
            else {
                effect = "SUPPORT"
            }
            /*check if the item starts with the same letters as the text field value:*/
            if (servantName.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + servantName.substr(0, val.length) + "</strong>";
                b.innerHTML += servantName.substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + servantName.replace(/'/g, '&#x27;') + "'>";
                b.innerHTML += "<br><span class=\"extra-info\">| RARITY: " + servant["rarity"] +
                    "| CLASS: " + servant["class_name"].toUpperCase() +
                    "<br>| NP TYPE: " + servant['np_type'].toUpperCase() +
                    " | NP EFFECT: " + effect +
                    " | ID: " + servant["collection_no"] + "</span>"
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    chosenCollectionNum = servant["collection_no"];
                    chosenName = servantName.replace(/'/g, '&#x27;');
                    chosenRarity = servant["rarity"];
                    chosenClass = servant["class_name"];
                    chosenNPType = servant['np_type'];
                    chosenNPEffect = effect;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

async function getServantNamesClass() {
    return await fetch("https://fgo-servant-api.vercel.app/servant")
        .then((res) => res.json())
        .then(data => {
            return data
        })

}

getServantNamesClass().then(data => {
    autocomplete(document.getElementById("myInput"), data);
})

async function checkMatch() {
    if (gameOver) {
        return;
    }
    if (chosenCollectionNum === undefined) {
        return;
    }
    checkText = document.getElementById("myInput").value
    // console.log(chosenName)
    if (checkText !== chosenName.replace(new RegExp("&" + "#" + "x27;", "g"), "'")) {
        return
    }
    let chosenServant = [];
    chosenServant.push(chosenName);
    chosenServant.push(chosenRarity);
    chosenServant.push(chosenClass);
    chosenServant.push(chosenNPType);
    chosenServant.push(chosenNPEffect);

    attemptServants.push(chosenServant);
    insertNewServant(dailyServant, chosenServant);
    if (dailyCollectionNum === chosenCollectionNum) {
        attemptsRemaining = 0;
        gameOver = true;
        wins++;
    }
    else {
        attemptsRemaining -= 1;
        if (attemptsRemaining === 0) {
            gameOver = true;
            insertNewServant(dailyServant, dailyServant);
            attemptServants.push(dailyServant);
        }
    }
    
    document.getElementById("myInput").value = ''
    checkGameStatus();
    localStorage.setItem("attemptsRemaining", attemptsRemaining);
    localStorage.setItem("attemptServants", JSON.stringify(attemptServants));
    localStorage.setItem("gameOver", gameOver);
    if(attemptsRemaining === 0) {
        games++;
        localStorage.setItem("wins", wins);
        localStorage.setItem("games", games);
        if (token) {
            await updateUser();
        }
    }
}

function compareServants(daily, chosen) {
    let p = document.createElement('p');
    let color = daily === chosen ? "green" : "red";
    p.style.backgroundColor = color;
    p.innerHTML = String(chosen).toUpperCase();
    return p
}

function insertNewServant(daily, chosen) {
    let b = document.createElement('div');
    let element = document.getElementById('guessAttempts');
    for (let i = 0; i < daily.length; i++) {
        b.append(compareServants(daily[i], chosen[i]));
    }
    element.appendChild(b)
}

function checkGameStatus() {
    let image = document.getElementById('servantImage');
    if (gameOver) {
        showImage();
    }
    else {
        image.src = "/images/question.png";
    }
}

function getDate(today) {
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    localStorage.setItem("date", today);
    return today
}

function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}


// notification function
function snackMessage(message) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = message;
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 2000);
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == signup) {
        signup.style.display = "none";
    }
    if (event.target == login) {
        document.getElementById("login-psw").value = "";
        login.style.display = "none";
    }
}

// Add 'submit' event handler
login.addEventListener("submit", (event) => {
    event.preventDefault();
    login.style.display = "none";
    userLogin();
});

signup.addEventListener("submit", (event) => {
    if (validatePassword()) {
        return
    }
    event.preventDefault();
    createUser();
    signup.style.display = "none";
});

var password = document.getElementById("password")
var passwordConfirm = document.getElementById("passwordConfirm");

function validatePassword() {
    if (password.value != passwordConfirm.value) {
        passwordConfirm.setCustomValidity("Passwords Don't Match");
    } else {
        passwordConfirm.setCustomValidity('');
    }

    return password.value != passwordConfirm.value
}
password.onchange = validatePassword;
passwordConfirm.onkeyup = validatePassword;

async function userLogin() {
    let data = new FormData();
    let email = document.getElementById("login-email").value;
    let psw = document.getElementById("login-psw").value;

    data.append("email", email);
    data.append("password", psw);

    await fetch(loginURL, {
        method: "POST",
        body: data
    })
        .then((response) => {
            if (response.status === 201) {
                return response.json();
            }
            else if (response.status === 401) {
                snackMessage("Invalid Email");
            }
            else if (response.status === 403) {
                snackMessage("Invalid password");
            }
        })
        .then((data) => {
            try {
                token = data["token"];
                localStorage.setItem("token", token);
                if (token) {
                    getUserInfo();
                }
            }
            catch (TypeError) {
                // no token
            }
        })

}

async function getUserInfo() {
    await fetch(userDataURL, {
        method: "GET",
        headers: {
            "x-access-token": token
        }
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data);
            userData = data;
            localStorage.setItem("userData", JSON.stringify(userData));
            wins = Math.max(wins, userData["wins"]);
            games = Math.max(games, userData["games"]);
            localStorage.setItem("wins", wins);
            localStorage.setItem("games", games);
            if(userData["date"] === date) {
                if (!gameOver) {
                    insertNewServant(dailyServant, dailyServant);
                    attemptServants.push(dailyServant);
                    checkGameStatus();
                    localStorage.setItem("gameOver", gameOver);
                    localStorage.setItem("attemptServants", JSON.stringify(attemptServants));
                }
                gameOver = true;
                userStatus();
            }
        });
}

async function createUser() {
    let data = new FormData();
    let email = document.getElementById("user-email").value;
    let psw = document.getElementById("password").value;
    let displayName = document.getElementById("display-name").value;

    data.append("name", displayName);
    data.append("email", email);
    data.append("password", psw);

    await fetch(signUpURL, {
        method: "POST",
        body: data
    })
        .then((response) => {
            // console.log(response.text())
            if (response.status === 201) {
                snackMessage("User created");
            }
            else if (response.status === 202) {
                snackMessage("User exists. Please log in.")
            }
        })
}

async function updateUser() {
    let data = new FormData();
    data.append("wins", wins);
    data.append("games", games);
    data.append("date", date);
    
    await fetch(updateUserURL, {
        method: "PUT",
        headers: {
            "x-access-token": token
        },
        body: data
    })
    .then((response) => response.json())
}

function userStatus() {
    let buttonLogin = document.getElementById("login-button");
    let buttonSignUp = document.getElementById("signup-button");
    let welcomeMessage = document.getElementById("welcome-message");
    let buttonLogout = document.getElementById("logout-button");

    if(token) {
        buttonLogin.style.visibility = "hidden";
        buttonSignUp.style.visibility = "hidden";
        welcomeMessage.style.visibility = "visible";
        welcomeMessage.innerHTML = "Welcome " + userData["name"];
        buttonLogout.style.visibility = "visible";
    }
}

function userLogOut() {
    localStorage.setItem("token", "");
    location.reload();
}