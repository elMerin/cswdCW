var socket = io.connect('http://localhost:3000');
var description = document.getElementById("description");
var displayList = document.getElementById("displayList");
var rating = document.getElementById("rating");
var rated = document.getElementById("rated");

var interestingTalks = [];
var ratedTalks = [];
var talkID = 0;

async function getTalks(){
    title.innerHTML="All talks";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();

    displayTalks(json);
}


async function getSpeakers(){
    displayList.innerHTML = "";
    title.innerHTML = "All Speakers";
    displayList.style.display = "block";
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks");
    var json = await data.json();

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
        var span = document.createElement("span"); 
        span.addEventListener("click", function(){ getSpeakerTalks(value); });           
        var textnode = document.createTextNode(value); 
        span.appendChild(textnode);  
        node.appendChild(span);
        displayList.appendChild(node);
    }
}

async function getSpeakerTalks(speaker){
    title.innerHTML="Talks by " + speaker;
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    var data = await fetch("http://localhost:3000/talks/speaker/" + speaker);
    var json = await data.json();

    displayTalks(json);
    
}

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
        var span = document.createElement("span"); 
        span.addEventListener("click", function(){ getSessionTalks(value.id); });           
        var textnode = document.createTextNode(value.title); 
        span.innerHTML=value.title;
        node.appendChild(span); 
        displayList.appendChild(node);
    }
}

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
        var span = document.createElement("span"); 
        span.addEventListener("click", function(){ getTalk(value.id); });           
        var textnode = document.createTextNode(value.title); 
        span.innerHTML=value.title;
        node.appendChild(span); 
        displayList.appendChild(node);
    }


}

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
            var span = document.createElement("span"); 
            span.addEventListener("click", function(){ getTagTalks(value); });           
            var textnode = document.createTextNode(value); 
            span.appendChild(textnode);  
            node.appendChild(span);
            displayList.appendChild(node);
        }
    
        
    }
}

async function getTagTalks(tag){
    description.style.display = "none";
    rating.style.display = "none";
    rated.style.display = "none";
    title.innerHTML="Talks with tag: " + tag;
    var data = await fetch("http://localhost:3000/talks/tag/" + tag);
    var json = await data.json();
    
    displayTalks(json);

}


async function getTalk(id){
    document.getElementById("interestingError").innerHTML = "";
    displayList.style.display = "none";
    description.style.display = "block";
    var data = await fetch("http://localhost:3000/talks/" + id);
    var json = await data.json();
    var talk = json[0];

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

    talkID = talk.id;
    title.innerHTML=talk.title;

    console.log(talk.ratings);
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
    document.getElementById("addTalkBtn").addEventListener("click", function(){ addInterestingTalk(talk); });
}

function addInterestingTalk(talk){
    document.getElementById("interestingError").innerHTML = "";
    
    for(var i = 0; i < interestingTalks.length; i++){
        if(talk.id==interestingTalks[i].id){
            document.getElementById("interestingError").innerHTML = "Already in interesting talks!";
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

    
}

async function getInterestingTalks(){
    rating.style.display = "none";
    rated.style.display = "none";
    displayList.style.display = "none";
    description.style.display = "none";
    title.innerHTML="Interesting Talks";
    displayTalks(interestingTalks);
}

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

function displayTalks(json){
    displayList.innerHTML = "";
    displayList.style.display = "block";
    for (i = 0; i < json.length; i++) {
        let value = json[i];   
        var node = document.createElement("li");              
        var span = document.createElement("span"); 
        span.addEventListener("click", function(){ getTalk(value.id); });           
        var textnode = document.createTextNode(value.title); 
        span.innerHTML=value.title;
        node.appendChild(span); 
        displayList.appendChild(node);
    }

}

window.onload = function(){
    getTalks().catch(function(error) {
        console.log("Error loading talks");
    });   


}



document.getElementById("allTalks").addEventListener("click", getTalks);
document.getElementById("bySpeaker").addEventListener("click", getSpeakers);
document.getElementById("bySession").addEventListener("click", getSessions);
document.getElementById("byTag").addEventListener("click", getTags);
document.getElementById("interestingTalks").addEventListener("click", getInterestingTalks);
document.getElementById("ratingSubmit").addEventListener("click", ratingSubmit);