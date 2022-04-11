/*******************************************************************************
 * Global Variables
 ******************************************************************************/ 
/**
 * An array containing references to jquery elements for every day of the week
 * index 0 is today, index 1 is tomorrow etc. 
 */
var dayEles = [];

/**
 * A list of the previously searched terms
 * @type {string[]}
 */
var searchHistory = [];

/**
 * A list of the search history jquery objects for their DOM elements 
 * @type {object[]}
 */
var searchHistoryEles = [];

/**
 * A reference to the jquery object for the search history container
 */
var searchHistoryContainer = $("#search-history");

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
 * Reference to the current location element
 */
var locationEle = $("#current-location");

/**
 * My weather API key
 */
const myApiKey = "a8edca00c7d55cb7839e4e8d9ac5b165";


/**
 * public API key
 */
const pubApiKey = "b1b15e88fa797225412429c1c50c122a1"

/**
 * The link to the open weather API
 */
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";

/**
 * 
 */
const geoApi = "http://api.openweathermap.org/geo/1.0/direct";
/**
 * Current latitude and longitude
 */
var lat=37;
var lon=-122;


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
 * @param {number} lat the latitude where you are retrieving the weather
 * @param {number} lon the longitunde where you are retrieving the weather
 * @returns {object} the conditions we require from the weather API
 */
 async function fetchWeather(lat, lon){ 
    console.log("fetching weather");

    var lat;
    var lon;

    var requestString = weatherApiUrl + "?"
    requestString += "&lat=" + lat;
    requestString += "&lon=" + lon;
    requestString += "&appid=" + myApiKey;
    console.log("request string: " + requestString);
    var data  = await fetch(requestString).then((response) =>{
        console.log(response);
        if (response.status === 200){
            return response.json();
        }
        return response.status;
    }).then((data) => {
        console.log(data);
        if (typeof data == "number"){
            return data;
        }
        return data;
    });
    return data;
}

/**
 * Returns latitude and longitude of a search query string.
 * @param {string} query 
 * @returns {object} location - holder object for the information
 * @returns {number} location.lat - the latitude of the location
 * @returns {number} location.lon - the longitude of the location
 * @returns {null} returned if there are no results
 */
async function fetchLocation(query){
    // format the request
    var requestString = geoApi;
    requestString += "?q=" + query;
    requestString += "&limit=1";
    requestString += "&appid=" + myApiKey;

    // grab the data!
    var geoData = await fetch(requestString).then((request)=>{
        // if all is well and good send us the goods
        if(request.status == 200){
            return request.json();
        }
        return null;
    }).then((data)=>{
        // if we got data, return said data 
        if (data){
            return {lat: data[0].lat, lon: data[0].lon};
        }
        return null;
        
    });
    
    // return whatever we got from the fetch request
    return geoData;
}

/**
 * Searches for cities and appropriately adds/modifies DOM elements for it.
 * @param {string} query the query the user sent the engine
 */
 async function searchCity (query){
    console.log("doing an API search with: " + query);
    
    // clear the search box first
    searchBox.val("");

    // TODO: use local storage to hold results

    // fetch from the API
    var location = await fetchLocation(query);
    // check if response is good
    if (!location){
        console.log("didn't get a result for searching for: " + query);
        return;
    }

    // fetch the city from the API
    var weather = await fetchWeather(location.lat, location.lon);
    
    // propogate those values to the DOM
    setCity(weather);

    // add the city to the history 
    searchHistory.push(query);
    addSearchHistory(query);
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

/**
 * Makes a search history element for the given search query and appends 
 * it to the DOM
 * @param {string} query 
 */
function addSearchHistory(query){
    // make our base item with the appropiate data information
    var searchItem = $("<div class='search-item mt-3' data-query='"+
    query +"'></div>");

    var card = $("<div class='card bg-primary text-light'></div>");
    var body = $("<div class='card-body'></div>");
    var text = $("<h5>" + query + "<h5>");
    // TODO formatting for the results

    // making the text a clickable link that sets the information
    text.on("click", ()=>setCity(query));
    
    body.append(text);
    card.append(body);
    searchItem.append(card);

    searchHistoryContainer.prepend(searchItem);
}

/**
 * Sets the DOM to reflect the given data
 * @param {object} conditions conditions object fetched from database
 */
function setCity(conditions){
    // City name
    locationEle.text(conditions.cityName);

    // Date -> set up localization? TODO

    
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
searchButton.on("click", ()=> searchCity(searchBox.val()));

// TODO: local storage for search history