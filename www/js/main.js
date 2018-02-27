let tinyshell;

const app = {
    URL: "http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=",
    imgUrl: "",
    gender: "male",
    profiles: [],
    DATA: null,

    init: function(){
        // Create new instance of Tinyshell
        let target = document.getElementById('gender');
        let gender = new t$(target);
        console.log(gender);
        // Add event listeners to 
        gender.addEventListener(t$.EventTypes.SWIPELEFT, app.genSwipe);
        gender.addEventListener(t$.EventTypes.SWIPERIGHT, app.genSwipe);
        // Add event listeners to tab menu at bottom of display
        let nmgr = new t$(document.querySelectorAll(".bar .tab"));
        nmgr.addEventListener(t$.EventTypes.TAP, app.nav);
        app.genFavs();
    },

    // add listeners for swiping to the cards
    addHandlers: function(){
        let cardsNode = document.querySelectorAll('.card');
        let mgr = new t$(cardsNode);
        mgr.addEventListener(t$.EventTypes.SWIPELEFT, app.reject);
        mgr.addEventListener(t$.EventTypes.SWIPERIGHT, app.accept);
    },

    // Swipe at intro screen to choose gender
    genSwipe: function(ev){
        if(ev.type == 'swiperight'){
            app.gender = 'female';
        }
        document.getElementById('prompt-male').classList.add('move-left');
        document.getElementById('prompt-female').classList.add('move-right');
        app.getData();
        setTimeout(() => {document.getElementById('gender').classList.remove('active');}, 500);
        document.getElementById('main').classList.add('active');
        document.getElementById('home').classList.add('current');
    },

    // toggle which page is showing (main pr favourites), and toggle the selected icon in the navbar
    nav: function(){
        document.getElementById('main').classList.toggle('active');
        document.getElementById('favourites').classList.toggle('active');
        document.getElementById('home').classList.toggle('current');
        document.getElementById('favs').classList.toggle('current');
    },

    // fetch to retrieve profile data
    getData: function(){
        fetch(app.URL + app.gender)
        .then(response => response.json())
        .then(data => {
            // place all json data retrieved into DATA namespace
            app.DATA = data;
            // take encoded URL from DATA and decode it, then enter it into imgUrl namespace
            app.imgUrl = 'http:' + decodeURIComponent(app.DATA.imgBaseURL);
            // isolate profile data into profiles namespace
            app.profiles = app.profiles.concat(app.DATA.profiles);
            // build the cards based on the profiles in the profiles namespace
            app.buildCards(app.profiles);
        });
    },

    // Build card for each profile in array
    buildCards: function(arr){
        let df = new DocumentFragment();
        arr.forEach(person => {
            // Create profile card div
            let card = document.createElement('div');
            card.classList.add('card');
            card.classList.add('fixed');
            card.classList.add('nobar');
            card.classList.add('dot');
            card.setAttribute('id', person.id);
            // Create img element and add image to card
            let img = document.createElement('img');
            img.src = app.imgUrl + person.avatar;
            img.alt = `A ${person.gender} Avatar`;
            img.classList.add('round');
            // Create h2 element and add name to card
            let name = document.createElement('h2');
            name.textContent = `${person.first} ${person.last}`;
            // Create text field for distance
            let dist = document.createElement('p');
            dist.textContent = `This person is ${person.distance} away!`;
            card.appendChild(name);
            card.appendChild(img);
            card.appendChild(dist);
            df.appendChild(card);
        });
        // Append card to main page/div
        document.querySelector('#main').appendChild(df);
        // Wait until swipe is complete to make next card appear
        setTimeout(() => {main.firstElementChild.classList.remove('dot')}, 100);
        app.addHandlers();
    },
    // Function for rejection of profile
    reject: function(ev) {
        ev.target.classList.add("left");
        app.prompt('reject');
        setTimeout(() => {
            let element = document.getElementById("main").firstElementChild;
            element.outerHTML = "";
            delete element;
            document.getElementById("main").firstElementChild.classList.remove('dot');
            app.profiles.shift();
            if (app.profiles.length <= 3){
                app.getData();
        }
        }, 250);},
    // Function for accept of profile
    accept: function(ev) {
        ev.target.classList.add("right");
        app.prompt('accept');
        sessionStorage.setItem(app.profiles[0].id, JSON.stringify(app.profiles[0]));
        app.genFavs();
        setTimeout(() => {
            let element = document.getElementById("main").firstElementChild;
            element.outerHTML = "";
            delete element;
            document.getElementById("main").firstElementChild.classList.remove('dot');
            app.profiles.shift();
            if (app.profiles.length <= 3){
                app.getData();
        }
        }, 250);},

    prompt: function(choice){
        let overlay = document.querySelector('.overlay-bars');
        overlay.classList.add('active');
        switch (choice) {
            case 'accept':
                var message = document.querySelector('.t4');
                message.classList.remove('error');
                message.classList.add('success');
                message.innerHTML = 'Saving to Favourites';
                break;
            case 'reject':
                var message = document.querySelector('.t4');
                console.log(message);
                message.classList.remove('success');
                message.classList.add('error');
                message.innerHTML = "Rejected!";
                break;
            case 'delete':
                break;
        }
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    },

    genFavs: function(){

    }
};

let loadEvent = ('deviceready' in document)?'deviceready':'DOMContentLoaded';
document.addEventListener(loadEvent, app.init);