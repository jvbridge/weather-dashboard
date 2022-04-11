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

/**
 * Reference to the current time element
 */
var timeEle = $("#current-time");
   
/**
 * Reference to the current location element
 */
var locationEle = $("#current-location");

/**
 * Reference to the weather cards for the weekly forecast
 */
var weatherCardRow =  $("#weather-card-row");

/**
 * My weather API key
 */
const myApiKey = "a8edca00c7d55cb7839e4e8d9ac5b165";


/**
 * public API key
 */
const pubApiKey = "b1b15e88fa797225412429c1c50c122a1"

/**
 * The link to the open weather API for One Call
 */
const oneCallApi = "https://api.openweathermap.org/data/2.5/onecall";

/**
 * The link to the geo locator API
 */
const geoApi = "http://api.openweathermap.org/geo/1.0/direct";

/**
 * The image source base URL
 */
const imageSrc = "http://openweathermap.org/img/wn/";

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

    // formatting the request
    var requestString = oneCallApi + "?" // starting
    requestString += "&lat=" + lat; // latitude
    requestString += "&lon=" + lon; // longitude
    requestString += "&units=imperial" // imperial units for us backwards Yanks
    requestString += "&appid=" + myApiKey; // API key
    console.log("request string: " + requestString);

    // fetching the data from the API
    var data  = await fetch(requestString).then((response) =>{
        if (response.status === 200){
            return response.json();
        }
        return response.status;
    }).then((data) => {
        console.log(data);
        if (typeof data == "number"){
            return data;
        }
        console.log("Data found: ", data);
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
    console.log("getting the location of: " + query);
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
            console.log("found something: ", data);
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
    setCurrentWeather(weather.current);

    // Format search query string to look better
    var tmpQuery = query.toLowerCase();
    var niceArr = tmpQuery.split(" ");
    niceQuery = ""; // our nice query
    niceArr.forEach((value)=>{
        tmpStr = value.charAt(0).toUpperCase() + value.slice(1);
        niceQuery += tmpStr + " ";
    })

    // set the location
    locationEle.text(niceQuery);

    // add the city to the history 
    searchHistory.push(niceQuery);
    addSearchHistory(niceQuery);
}


/**
 * sets a card's weather conditions given both an object and a card
 * @param {object} card the jquery object for that card
 * @param {object} conditions the conditions to set that card to
 */
function setCard(card, conditions){
    // TODO: make this set a card given an index
    
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
    text.on("click", ()=>setCurrentWeather(query));
    
    body.append(text);
    card.append(body);
    searchItem.append(card);

    searchHistoryContainer.prepend(searchItem);
}

/**
 * Sets the DOM to reflect the given data
 * @param {object} conditions conditions object fetched from database
 */
function setCurrentWeather(conditions){
    // City name
    console.log("Got a city! Lets update our DOM");
    console.log(conditions);

    // Date -> TODO:set up localization
    
    // icon for conditions

    // temperature
    $("#current-temp").text("Currently: " + conditions.temp + " degrees");

    // humidity
    $("#current-hum").text("Humidity: " + conditions.humidity + "%");

    // wind speed
    $("#current-wind").text("Wind: " + conditions.wind_speed + " mph");

    // UV index
    $("#current-uv").text("UV index: " + conditions.uvi);
}

/**
 * Takes the array returned from the weekly weather and propgates it to the DOM
 * @param {object[]} days 
 */
function setWeeklyWeather(days){
    console.log("Got: ", days);
    // TODO: propogate
}

/**
 * Creates a card and adds it to the array of cards, as well as to the DOM
 */
function createCard (){
    var cardNumber = dayEles.length;
    var card = $("<div id=day-'" + cardNumber + "' class='card m-2'></div>");
    var cardBody = $("<div class='card-body'></div>");
    var cardTitle = $("<h6 class='card-title'></h6>");
    var weatherInfo = $("<div id='day-"+ cardNumber + "-info></div>");

    card.append(cardBody);
    card.append(cardTitle);
    card.append(weatherInfo);
    weatherCardRow.append(card);
    dayEles.push(card);
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
searchButton.on("click", ()=>searchCity(searchBox.val()));

// for loop getting and adding the references to dayEles[]
for (var i = 0; i < daysDisplayed; i++){
    createCard();
}

// set our default location (san francisco)
// TODO: use local storage to remember location

// get a location for the position
 navigator.geolocation.getCurrentPosition(async (position) =>{
    // if we are successful
    console.log("success!");
    var weather = await fetchWeather(position.coords.latitude, position.coords.longitude)
    setCurrentWeather(weather.current);
    setWeeklyWeather(weather.daily);
}, async () =>{
    // if we are not successful default to San Francisco
    console.log("failed to get a location");
    var weather = await fetchWeather(37, -122);
    setCurrentWeather(weather.current);
    setWeeklyWeather(weather.daily);
    locationEle.text("San Francisco");
});
