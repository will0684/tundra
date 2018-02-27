const app = {
    URL: "http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php",
    IMGURL: "",
    GENDER: "male",
    PROFILES: [],
    DATA: null,

    init: function(){
        // add Tinyshell listeners for swiping
        let target = document.querySelector('gender');
        let sTarget = new t$(target);
        sTarget.addEventListener(t$.EventTypes.SWIPELEFT, function(){
            alert('Swiped Left');
        });
        // fetch json data for populating cards
        app.getData();
        // create first set of cards
        app.showCards();
    },
    // data fetch function
    getData: function(){
        fetch("http://griffis.edumedia.ca/mad9022/tundra/get.profiles.php?gender=female")
        .then(response => response.json())
        .then(data => {
            app.DATA = data;
            console.log(app.DATA);
        });
        app.buildCard(app.DATA);
    },

    showCards: function(){
        
    },
    
    buildCard: function(array){
        let df = new DocumentFragment();
        array.forEach(prof => {
            let card = document.createElement('div');
            card.className = 'page fixed active';
            let img = document.createElement('img');
            img.src = app.DATA.imgBaseURL + app.DATA.profile.avatar;
            let name = document.createElement('h2');
            name.setAttribute("data-key", app.DATA.id);
            name.innerHTML = app.DATA.name;
            card.appendChild(img);
            card.appendChild(name);
            df.appendChild(card);
        });
        return df;
    }

};

let loadEvent = ('deviceready' in document)?'deviceready':'DOMContentLoaded';
document.addEventListener(loadEvent, app.init);