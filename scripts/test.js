var servantNameClass = getServantNamesClass();

function hello() {
    let userInput = document.getElementById("userInput").value;
    document.getElementById("userOutput").innerHTML = userInput;
    document.getElementById('output').innerHTML = 'Happy Monday!!';
}

function showImage() {
    let imageSRC = "https://static.atlasacademy.io/JP/CharaGraph/702200/702200b@2.png";
    let image = document.getElementById('servantImage');
    image.style.visibility = 'visible';
    image.src = imageSRC;
}

async function getServant() {
    let servant;
    await fetch("https://fgo-servant-api.vercel.app/random-servant")
        .then(response => response.json())
        .then(data => {
            servant = data;
        })
        .then(() => console.log(servant['name']));
    let image = document.getElementById('servantImage');
    image.style.visibility = 'visible';
    image.src = servant["asc4_art"]
}

async function getServantNamesClass() {
    servantNameClass = await fetch("https://fgo-servant-api.vercel.app/servant-name-class")
        .then(response => response.json())
    console.log(servantNameClass)
}

function autocompleteMatch(input) {
    if (input == '') {
        return [];
    }
    var reg = new RegExp(input, "i")
    console.log(reg.ignoreCase)
    return servantNameClass.filter(function(term) {
        if (term.match(reg)) {
            return term;
        }
    });
}
  
function showResults(val) {
    res = document.getElementById("result");
    res.innerHTML = '';
    let list = '';
    let terms = autocompleteMatch(val);
    for (i=0; i<terms.length && i < 10; i++) {
        list += '<li>' + terms[i] + '</li>';
    }
    res.innerHTML = '<ul>' + list + '</ul>';
}