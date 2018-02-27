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
        // Add swipe event listeners to gender selection screen
        gender.addEventListener(t$.EventTypes.SWIPELEFT, app.genSwipe);
        gender.addEventListener(t$.EventTypes.SWIPERIGHT, app.genSwipe);
        // Add event listeners to tab menu at bottom of display
        app.addFavs();
    },

    // add listeners for swiping to the cards
    addHandlers: function(){
        let cardsNode = document.querySelectorAll('.card');
        let mgr = new t$(cardsNode);
        mgr.addEventListener(t$.EventTypes.SWIPELEFT, app.reject);
        mgr.addEventListener(t$.EventTypes.SWIPERIGHT, app.accept);
        let nmgr = new t$(document.querySelectorAll(".bar .tab"));
        nmgr.addEventListener(t$.EventTypes.TAP, app.nav);
    },

    // Swipe at intro screen to choose gender
    genSwipe: function(ev){
        if(ev.type == 'swiperight'){
            app.gender = 'female';
        }
        document.getElementById('prompt-male').classList.add('move-left');
        document.getElementById('prompt-female').classList.add('move-right');
        setTimeout(() => {
            document.getElementById('gender').classList.remove('active');
        }, 500);
        setTimeout(() => {
            document.getElementById('main').classList.add('active');
        }, 500);
        setTimeout(() => {
            app.getData();
        }, 400);
        document.getElementById('home').classList.add('current');
    },

    // toggle which page is showing (main pr favourites), and toggle the selected icon in the navbar
    nav: function(ev){
        switch (ev.target.id) {
            case 'home':
                document.getElementById('main').classList.add('active');
                document.getElementById('home').classList.add('current');
                document.getElementById('favourites').classList.remove('active');
                document.getElementById('favs').classList.remove('current');
                break;
            case 'favs':
                document.getElementById('favourites').classList.add('active');
                document.getElementById('favs').classList.add('current');
                document.getElementById('main').classList.remove('active');
                document.getElementById('home').classList.remove('current');
                break;
    }},

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
        // Set the first item in the profiles array (currently active and accepted card/profile) to sessionStorage with a key derived from the
        // profile's id and turn JSON profile information into a string for storing in sessionStorage
        sessionStorage.setItem(app.profiles[0].id, JSON.stringify(app.profiles[0]));
        // Execute addFavs to create "favourites" array based on current sessionStorage members
        app.addFavs();
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
    // Activate overlay and display message dependent on how it was called
    prompt: function(choice){
        let overlay = document.querySelector('.overlay-bars');
        overlay.classList.add('active');
        switch (choice) {
            // Profile is accepted
            case 'accept':
                var message = document.querySelector('.t3');
                message.classList.remove('error');
                message.classList.add('success');
                message.innerHTML = 'Saving to Favourites';
                break;
            // Profile is rejected
            case 'reject':
                var message = document.querySelector('.t3');
                message.classList.remove('success');
                message.classList.add('error');
                message.innerHTML = "Rejected!";
                break;
            // Profile is deleted from the favourites page
            case 'delete':
                var message = document.querySelector('.t3');
                message.classList.remove('success');
                message.classList.add('error');
                message.innerHTML = "Removing from Favourites";
                break;
        }
        // Timeout for removing the overlay after message is displayed
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 500);
    },
    // Create favourites array and then loop through sessionStorage based on it's length, adding each sessionStorage member to the array
    addFavs: function(){
        let favourites = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            // Get key for member in sessionStorage at position of index i, place it in a variable
            let keyvar = sessionStorage.key(i);
            // Retrieve sessionStorage member data based on key in keyvar and turn the string back into JSON for placement in the "favourites" array
            favourites.push(JSON.parse(sessionStorage[keyvar]));
        }
        // Take current favourites array and call the list builder for the Favourites page
        app.listBuilder(favourites);
        // After list items have been built, add listeners for the delete button on all list members
        let tis = new t$(document.querySelectorAll('.action-right'));
        tis.addEventListener(t$.EventTypes.TAP, app.deleteFav);
    },
    // Build the list of favourites based on what is currently in session storage
    listBuilder: function(arr){
        let df = new DocumentFragment();
        arr.forEach(favourite =>{
            let favItem = document.createElement('li');
            favItem.classList.add('list-item');
            // Add id of profile as the id attribute of the list item (li)
            favItem.setAttribute('id', favourite.id);
            let img = document.createElement('img');
            img.src = app.imgUrl + favourite.avatar;
            img.alt = `A ${favourite.gender} Avatar`;
            img.classList.add('avatar');
            let name = document.createElement('p');
            name.textContent = `${favourite.first} ${favourite.last}`;
            let span = document.createElement('span');
            span.classList.add('action-right');
            span.classList.add('icon');
            span.classList.add('clear');
            favItem.appendChild(img);
            favItem.appendChild(name);
            favItem.appendChild(span);
            df.appendChild(favItem);
        });
        // Clear current elements in the list and generate new list with new favourites
        document.querySelector('.favlist').innerHTML = '';
        document.querySelector('.favlist').appendChild(df);
    },

    deleteFav: function(ev) {
        app.prompt('delete');
        var element = ev.target.parentElement;
        element.outerHTML = "";
        delete element;
        sessionStorage.removeItem(ev.target.getAttribute('id'));
    }
};

let loadEvent = ('deviceready' in document)?'deviceready':'DOMContentLoaded';
document.addEventListener(loadEvent, app.init);