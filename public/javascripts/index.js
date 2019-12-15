var socket = io.connect('http://localhost:3000');
var description = document.getElementById("description");
var displayList = document.getElementById("displayList");
var rating = document.getElementById("rating");
var rated = document.getElementById("rated");



let state = { 
    state: "allTalks",
    speaker: "",
    session: "",
    tag: "",
    talk: ""
};

function render() {
    switch(state.state) {
        case "allTalks":
            getTalks().catch(function(error) {
                console.log("Error loading talks");
            }); 
            break;
        case "allSpeakers":
            getSpeakers().catch(function(error) {
                console.log("Error loading speakers");
            });
            break;
        case "speakerTalks":
            getSpeakerTalks(state.speaker).catch(function(error) {
                console.log("Error loading speaker talks");
            });
            break;
        case "allSessions":
            getSessions().catch(function(error) {
                console.log("Error loading sessions");
            });
            break;
        case "sessionTalks":
            getSessionTalks(state.session).catch(function(error) {
                console.log("Error loading session talks");
            });
            break;
        case "allTags":
            getTags().catch(function(error) {
                console.log("Error loading tags");
            });
            break;
        case "tagTalks":
            getTagTalks(state.tag).catch(function(error) {
                console.log("Error loading tag talks");
            });
            break;
        case "interestingTalks":
            getInterestingTalks().catch(function(error) {
                console.log("Error loading interesting talks");
            });
            break;
        case "talk":
            getTalk(state.talk).catch(function(error) {
                console.log("Error loading tag talk");
            });
            break;
        default:
            getTalks().catch(function(error) {
                console.log("Error loading talks");
            }); 
      }
}

(function initialize() {
    window.history.replaceState(state, null, "");
    render(state);
})();

//List of talks that are marked as interesting
var interestingTalks = [];
//List of talks that have been rated
var ratedTalks = [];
//Keeps track of talk that is currently being viewed
var talkID = 0;

//Returns list of all talks
async function getTalks(){
    title.innerHTML="All talks";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();

    displayTalks(json);
}

//Returns list of speakers
async function getSpeakers(){
    displayList.innerHTML = "";
    title.innerHTML = "All Speakers";
    displayList.style.display = "block";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();

    //There is no endpoint for speakers, so this manually constructs a list of speakers out of all talks.
    resultLoop:
    for (i = 0; i < json.length; i++) {
        var items = displayList.getElementsByTagName("li");
        for (var j = 0; j < items.length; ++j) {
            if (items[j].textContent === json[i].speaker){
                continue resultLoop;
            }
        }
        let value = json[i].speaker;  
        var node = document.createElement("li");
        var div = document.createElement("div"); 
        div.className="list";
        div.addEventListener("click", function(){ speakerTalksButton(value); });           
        var textnode = document.createTextNode(value); 
        div.appendChild(textnode);  
        node.appendChild(div);
        displayList.appendChild(node);
    }
}

//Gets all talks of a specific speaker
async function getSpeakerTalks(speaker){
    title.innerHTML="Talks by " + speaker;
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks/speaker/" + speaker);
    var json = await data.json();

    displayTalks(json);
    
}

//Retrieves a list of sessions. As with the speakers, this list is manually constructed.
async function getSessions(){
    displayList.innerHTML = "";
    title.innerHTML="All sessions";
    displayList.style.display = "block";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/sessions");
    var json = await data.json();

    for (i = 0; i < json.length; i++) {
        let value = json[i];   
        var node = document.createElement("li");              
        var div = document.createElement("div"); 
        div.className = "list";
        div.addEventListener("click", function(){ sessionTalksButton(value.id); });           
        div.innerHTML=value.title;
        node.appendChild(div); 
        displayList.appendChild(node);
    }
}

//Gets all talks in a particular session.
async function getSessionTalks(session){
    displayList.innerHTML = "";
    title.innerHTML="Talks in session "+session;
    displayList.style.display = "block";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();

    
    for (i = 0; i < json.length; i++) {
        let value = json[i]; 
        if(value.session != session){
            continue;
        } 
        var node = document.createElement("li");              
        var div = document.createElement("div"); 
        div.className = "list";
        div.addEventListener("click", function(){ talkButton(value.id); });           
        
        //Calculates average rating and displays it
        var totalRating = 0;
        for(var j = 0; j < value.ratings.length; j++){
            totalRating = totalRating + Number(value.ratings[j]);
        }
        var averageRating = totalRating/value.ratings.length;
    
        if(totalRating==0){
            div.innerHTML=value.title + ", By: " + value.speaker + ", Session: "+value.session + ", Time: "+ value.time +", No ratings yet.";
        }
        else{
            div.innerHTML=value.title + ", By: " + value.speaker + ", Session: "+value.session + ", Time: "+ value.time +", Average Rating: " + averageRating;
        }

        node.appendChild(div); 
        displayList.appendChild(node);
    }
}


//Manually constructed list of all existing tags.
async function getTags(){
    displayList.innerHTML = "";
    title.innerHTML="All Tags";
    displayList.style.display = "block";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();


    for (i = 0; i < json.length; i++) {
        var tags = json[i].tags;
        tagloop:
        for(var j = 0; j < tags.length; j++){
            var items = displayList.getElementsByTagName("li");
            for (var k = 0; k < items.length; ++k) {
                if (items[k].textContent === tags[j]){
                    continue tagloop;
                }             
            }    
            let value = tags[j];  
            var node = document.createElement("li");
            var div = document.createElement("div"); 
            div.className = "list";
            div.addEventListener("click", function(){ tagTalksButton(value); });           
            var textnode = document.createTextNode(value); 
            div.appendChild(textnode);  
            node.appendChild(div);
            displayList.appendChild(node);
        }
    
        
    }
}

//Gets all talks that have a tag
async function getTagTalks(tag){
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    title.innerHTML="Talks with tag: " + tag;
    var data = await fetch("http://localhost:3000/talks/tag/" + tag);
    var json = await data.json();
    
    displayTalks(json);

}


//Retrieves all relevant information for a talk. Enables user to rate and add to list of interesting talks.
async function getTalk(id){

    document.getElementById("interestingError").innerHTML = "";
    displayList.style.display = "none";
    description.style.display = "block";
    var data = await fetch("http://localhost:3000/talks/" + id);
    var json = await data.json();
    var talk = json[0];

    //Checks if talk has already been rated and displays radio buttons accordingly.
    var isRated = false;
    for(var i = 0; i < ratedTalks.length; i++){
        if(talk.id==ratedTalks[i]){
            isRated = true;
            break;
        }   
    }
    if(isRated){
        rating.style.display = "none";
        rated.style.display = "block";
    }
    else{
        rating.style.display = "block";
        rated.style.display = "none";
    }

    //Checks if talk is marked as interesting and changes button accordingly.
    var interestingTalk = false;
    for(var i = 0; i < interestingTalks.length; i++){
        if(talk.id==interestingTalks[i].id){
            document.getElementById("addTalkBtn").value = "Remove from interesting talks";
            interestingTalk = true;
        }
    }
    if(!interestingTalk){
        document.getElementById("addTalkBtn").value = "Add to interesting talks";
    }

    talkID = talk.id;
    title.innerHTML=talk.title;

    //Gets average rating
    var totalRating = 0;
    for(var i = 0; i < talk.ratings.length; i++){
        totalRating = totalRating + Number(talk.ratings[i]);
    }
    var averageRating = totalRating/talk.ratings.length;
    if(totalRating==0){
        document.getElementById("averageRating").innerHTML = "No ratings yet";
    }
    else{
        document.getElementById("averageRating").innerHTML = averageRating;
    }

    document.getElementById("speaker").innerHTML = talk.speaker;
    document.getElementById("talkDesc").innerHTML = talk.description;
    document.getElementById("session").innerHTML = talk.session;
    document.getElementById("time").innerHTML = talk.time;
    document.getElementById("tags").innerHTML = talk.tags;
    
    //To remove any previous event listeners
    var oldBtn = document.getElementById("addTalkBtn");
    var newButton = oldBtn.cloneNode(true);
    addTalkBtn.parentNode.replaceChild(newButton,oldBtn);
    document.getElementById("addTalkBtn").addEventListener("click", function(){ addInterestingTalk(talk); });
}

//Allows user to add talk to interesting list or remove it if it has already been added. Checks if another talk during same time is already in list.
function addInterestingTalk(talk){
    document.getElementById("interestingError").innerHTML = "";
    
    for(var i = 0; i < interestingTalks.length; i++){
        if(talk.id==interestingTalks[i].id){
            interestingTalks.splice(i,1);
            document.getElementById("interestingError").innerHTML = "Removed from interesting talks!";
            document.getElementById("addTalkBtn").value = "Add to interesting talks";
            return;
        }
    }

    for(var i = 0; i < interestingTalks.length; i++){
        if(talk.time==interestingTalks[i].time){
            document.getElementById("interestingError").innerHTML = "Another talk in that time slot already marked as interesting!";
            return
        }
    }
    interestingTalks.push(talk);
    document.getElementById("interestingError").innerHTML = "Added to interesting talks!";
    document.getElementById("addTalkBtn").value = "Remove from interesting talks";

    
}

//Gets list of all talks marked as interesting
async function getInterestingTalks(){
    var interestingTalksList = [];
    for(var i = 0; i < interestingTalks.length; i++){
        var data = await fetch("http://localhost:3000/talks/" + interestingTalks[i].id);
        var json = await data.json();
        var talk = json[0];
        interestingTalksList.push(talk);

    }

    rating.style.display = "none";
    rated.style.display = "none";
    displayList.style.display = "none";
    description.style.display = "none";
    title.innerHTML="Interesting Talks";
    if(interestingTalks.length>0){
        displayTalks(interestingTalksList);
    }
    else{
        title.innerHTML="No talks marked as interesting";
    }
}

//Function that triggers when rating is submitted
async function ratingSubmit(){
    var radios = document.getElementsByName("ratingRadio");

    for (var i = 0; i < radios.length; i++){
        if (radios[i].checked){
            radios[i].checked = false;
            rating.style.display = "none";
            rated.style.display = "block";
            ratedTalks.push(talkID);

            var data = await fetch("http://localhost:3000/talks/rate/" + talkID + "/" + radios[i].value);
            var json = await data.json();
            var ratings = json.ratings;
            
            var totalRating = 0;
            for(var i = 0; i < ratings.length; i++){
                totalRating = totalRating + Number(ratings[i]);
            }
            var averageRating = totalRating/ratings.length;
        
            if(totalRating==0){
                document.getElementById("averageRating").innerHTML = "No ratings yet";
            }
            else{
                document.getElementById("averageRating").innerHTML = averageRating;
            }

            
        }
    }
}

//Displays list of talks specified in parameter. Used in functions that retrieve different sets of talks.
function displayTalks(json){
    displayList.innerHTML = "";
    displayList.style.display = "block";
    for (i = 0; i < json.length; i++) {
        let value = json[i];   
        var node = document.createElement("li");              
        var div = document.createElement("div"); 
        div.className = "list";
        div.addEventListener("click", function(){ talkButton(value.id); });  

        var totalRating = 0;
        for(var j = 0; j < value.ratings.length; j++){
            totalRating = totalRating + Number(value.ratings[j]);
        }
        var averageRating = totalRating/value.ratings.length;
    
        if(totalRating==0){
            div.innerHTML=value.title + "<br> By: " + value.speaker + "<br> Session: "+value.session + "<br> Time: "+ value.time +"<br> No ratings yet.";
        }
        else{
            div.innerHTML=value.title + "<br> By: " + value.speaker + "<br> Session: "+value.session + "<br> Time: "+ value.time +"<br> Average Rating: " + averageRating;
        }

        
        node.appendChild(div); 
        displayList.appendChild(node);
    }

}


function talksButton(){
    state.state = "allTalks";
    window.history.pushState(state, null, "");
    render(state);
}

function speakersButton(){
    state.state = "allSpeakers";
    window.history.pushState(state, null, "");
    render(state);
}

function sessionsButton(){
    state.state = "allSessions";
    window.history.pushState(state, null, "");
    render(state);
}

function tagsButton(){
    state.state = "allTags";
    window.history.pushState(state, null, "");
    render(state);
}

function interestingButton(){
    state.state = "interestingTalks";
    window.history.pushState(state, null, "");
    render(state);
}

function speakerTalksButton(speaker){
    state.state = "speakerTalks";
    state.speaker = speaker;
    window.history.pushState(state, null, "");
    render(state);
}

function sessionTalksButton(session){
    state.state = "sessionTalks";
    state.session = session;
    window.history.pushState(state, null, "");
    render(state);
}

function tagTalksButton(tag){
    state.state = "tagTalks";
    state.tag = tag;
    window.history.pushState(state, null, "");
    render(state);
}

function talkButton(talk){
    state.state = "talk";
    state.talk = talk;
    window.history.pushState(state, null, "");
    render(state);
}

window.onpopstate = function (event) {
    if (event.state) { state = event.state; }
    render(state);
};

document.getElementById("allTalks").addEventListener("click", talksButton);
document.getElementById("bySpeaker").addEventListener("click", speakersButton);
document.getElementById("bySession").addEventListener("click", sessionsButton);
document.getElementById("byTag").addEventListener("click", tagsButton);
document.getElementById("interestingTalks").addEventListener("click", interestingButton);
document.getElementById("ratingSubmit").addEventListener("click", ratingSubmit);