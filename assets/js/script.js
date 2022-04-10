/*******************************************************************************
 * Global Variables
 ******************************************************************************/ 
/**
 * An array containing references to jquery elements for every day of the week
 * index 0 is today, index 1 is tomorrow etc. 
 */
var dayEles = [];

/**
 * search box jquery object reference
 */
var searchBox = $("#search-box");

/**
 * search button jquery object reference
 */
var searchButton = $("#search-button");

/**
 * The number of days we are going to display on the main day bar
 */
var daysDisplayed = 7
// for loop getting and adding the references to dayEles[]
for (var i = 0; i < daysDisplayed; i++){
    dayEles.push($("day-" + i));
}

/**
 * Reference to the current time element
 */
var timeEle = $("#current-time");
    
/**
 * My weather API key
 */
const myApiKey = "a8edca00c7d55cb7839e4e8d9ac5b165";


/**
 * public API key
 */
const pubApiKey = "b1b15e88fa797225412429c1c50c122a1"

/**
 * 
 */
const weatherApiUrl = "api.openweathermap.org/data/2.5/weather";

/**
 * Current latitude and longitude
 */
var lat=37;
var long=-122;


/*******************************************************************************
 * functions
 ******************************************************************************/ 

/**
 * Updates the elements on the DOM to the correct time
 */
function setTime(){
    // time on the nav bar
    var currentTimeStr = moment().format("h:mm a");
    timeEle.text(currentTimeStr);
}

/**
 * Sets the days of the week in the main section to be correct
 */
function setDays(){
     for (var i = 0; i < dayEles.length; i++){
        // hard code first two to be "today" and "Tomorrow"
        if (i < 2){continue};
        // set the title text to be mon, tues, wed, etc.
        var day = moment();
        day.add(i,"days");
        console.log("that day is: " + day.format("ddd"));

        $("#day-"+ i + "-title").text(day.format("ddd"));
    }
}



/**
 * Fetches the weather from the weather API
 */
 function fetchWeather(){

    console.log("fetching...");
    var requestString = weatherApiUrl + "?id=524901&appid="+ myApiKey;
    // my string
    // var requestString = "api.openweathermap.org/data/2.5/weather?id=524901&appid=a8edca00c7d55cb7839e4e8d9ac5b165"
    // test string
    // var requestString = "https://api.openweathermap.org/data/2.5/weather?id=524901&appid=a8edca00c7d55cb7839e4e8d9ac5b165"
    // var requestString = "https://api.github.com/orgs/nodejs/repos?per_page=5";
    fetch(requestString, {
        mode: 'no-cors'
    }).then((response) =>{
        if(response.status == 200){
            console.log(response);
        }
        return response.json();
    }).then((data) =>{
        console.log(data);
    });

}

/**
 * Searches for cities and appropriately adds/modifies DOM elements for it.
 * @param {string} queryString 
 */
function searchCity (queryString){
    console.log("doing an API search with: " + queryString);
    
    // clear the search box first
    searchBox.val("");

    // fetch from the API
    
    // check if response is good

    // set DOM elements as approriate
    
    // add the city to the history 

    // set the current weather elements to reflect what we want.

}

/**
 * sets a card's weather conditions given both an object and a card
 * @param {object} card the jquery object for that card
 * @param {object} conditions the conditions to set that card to
 */
function setCard(card, conditions){
    // City name
    // Date
// icon for conditions
// temperature
// humidity
// wind speed
// UV index

}

/*******************************************************************************
 * Initialization
 ******************************************************************************/ 

setTime();
setDays();
setInterval(() => {
    setTime()
}, 1000);

// add a keydown event for hitting enter for the search bar.
document.addEventListener('keydown', (event) =>{
    // check if the key is "enter" return if not.
    if (event.key !== "Enter"){
        return;
    }

    // check if the bar is focused return if not.
    if (!($("#search-box").is(":focus"))) {
        return;
      }
    
    // get the search bar text
    var searchString = searchBox.val();
    searchCity(searchString);

});

// add a listener for the search button to send the search as well
searchButton.on("click", searchCity(searchBox.val()));