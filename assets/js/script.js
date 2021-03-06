/*******************************************************************************
 * Global Variables
 ******************************************************************************/ 
/**
 * An array containing references to jquery elements for every day of the week
 * index 0 is today, index 1 is tomorrow etc. 
 */
var dayEles = [];

/**
 * A list of the previously searched terms and their results
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
var daysDisplayed = 5;

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
const oneCallApi = "http://api.openweathermap.org/data/2.5/onecall";

/**
 * The link to the geo locator API
 */
const geoApi = "http://api.openweathermap.org/geo/1.0/direct";

/**
 * The image source base URL
 */
const imageSrc = "http://openweathermap.org/img/wn/";

/**
 * The reverse Geo Api end point, used for when you allow the location of the 
 * browser
 */
const reverseGeoApi = "http://api.openweathermap.org/geo/1.0/reverse"

/**
 * Local storage key for the history objects. Used to store searchHistory[]
 */
const historyKey = "search-history";

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
    setWeeklyWeather(weather.daily);

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

    var historyItem = {
        query: niceQuery,
        currentWeather: weather.current,
        days: weather.daily
    }

    console.log("adding a history item with the item: ", historyItem);
    console.log("we have access to this weather:", weather);
    // add the city to the history 
    searchHistory.push(historyItem);
    addSearchHistoryEle(historyItem);
    // store it locally for later use
    setLocalStorage();
}


/**
 * sets a card's weather conditions given both an object and a card
 * @param {object} card the jquery object for that card
 * @param {object} conditions the conditions to set that card to
 * @param {number} dayOfWeek the day of the week this card represents, starts
 * counting at 0 for today each one is one day later
 */
function setCard(card, conditions, dayOfWeek){

    // set the correct title
    var title;
    if (dayOfWeek === 0){
        title = "Today";
    } else if (dayOfWeek === 1) {
        title = "Tommorrow";
    } else{
        var day = moment();
        day.add(dayOfWeek,"days");
        title = day.format("ddd");
        console.log("that day is: " + day.format("ddd"));
    }


    console.log("card children: ", card.children().children());
    var weatherInfo = card.children().children(".weather-info");
    // set the title
    card.children().find("h6").text(title);

    // icon for conditions
    var iconURL = imageSrc + conditions.weather[0].icon + "@2x.png"
    var iconEle = weatherInfo.children('.card-thumb');
    console.log("icon ele:", iconEle);
    iconEle.attr("src", iconURL);

    // temperature
    var temperatureEle = weatherInfo.find(".card-temp");
    temperatureEle.text("Temp: " + conditions.temp.day);

    // humidity
    var humidityEle = weatherInfo.find(".card-hum");
    humidityEle.text("Hum: " + conditions.humidity + "%")
}

/**
 * Makes a search history element for the given search query and appends 
 * it to the DOM
 * @param {Object} historyItem - an object from the searchHistory[] array 
 */
function addSearchHistoryEle(historyItem){
    // make our base item with the appropiate data information
    var searchItem = $("<div class='search-item mt-3' data-query='"+
    historyItem.query +"'></div>");

    var card = $("<div class='card bg-primary text-light'></div>");
    var body = $("<div class='card-body'></div>");
    var text = $("<h5>" + historyItem.query + "<h5>");
    // TODO formatting for the results

    // making the text a clickable link that sets the information
    text.on("click", ()=>{
        console.log("Clicked on: ", text);
        // re-populate the dom with the elements used to make this entry
        retrievePreviousSearch(historyItem);
    });

    body.append(text);
    card.append(body);
    searchItem.append(card);
    searchHistoryContainer.prepend(searchItem);
}

/**
 * given an item in the search history array, put it up to the screen
 * @param {object} historyItem - item in the searchhistory[] array
 */
function retrievePreviousSearch(historyItem){
    console.log("retrieving history with item: ", historyItem)
    
    // set the location correctly
    locationEle.text(historyItem.query);

    // set the current weather
    setCurrentWeather(historyItem.currentWeather);

    // set the weather for the 5-day forecast
    setWeeklyWeather(historyItem.days);
}

/**
 * Sets the DOM to reflect the given data
 * @param {object} conditions conditions object fetched from database
 */
function setCurrentWeather(conditions){
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
    
    // propogate the value for each day
    dayEles.forEach((value, index) =>{
        setCard(value, days[index], index);
    });
}

/**
 * Creates a card and adds it to the array of cards, as well as to the DOM
 */
function createCard (){
    var cardNumber = dayEles.length;
    console.log("creating card number: ", cardNumber);
    var card = $("<div id=day-'" + cardNumber + "' class='card m-2 col-xl-2 col-lg-3 col-md-4'></div>");
    
    var cardBody = $("<div class='card-body'></div>");

    var cardTitle = $("<h6 class='card-title'></h6>");
    cardBody.append(cardTitle);
    
    var weatherInfo = $("<div class='weather-info'></div>");
    weatherInfo.append($("<img class='img-thumbnail card-thumb' src=''</div>"));
    weatherInfo.append($("<div class='card-temp'>Temp:</div>"));
    weatherInfo.append(("<div class='card-hum'>Hum: %</div>"));
    console.log("appending weather info: ", weatherInfo);
    cardBody.append(weatherInfo);

    card.append(cardBody);
    weatherCardRow.append(card);
    dayEles.push(card);
}

async function decodeLocation(lat, lon){
    
    var requestString = reverseGeoApi;
    requestString += "?lat=" + lat;
    requestString += "&lon=" + lon;
    requestString += "&appid=" + myApiKey;
    var ret = await fetch(requestString).then((reseponse) => {
        return reseponse.json();
    });

    return ret;
}

/**
 * Stores the previous searches to local storage
 */
function setLocalStorage(){
    localStorage.setItem(historyKey, JSON.stringify(searchHistory));
}

/**
 * Retrieves the previous searches from local storage, puts them onto the DOM
 */
function getLocalStorage(){
    var prevSearchHistory = localStorage.getItem(historyKey);
    // check if we got something
    if(prevSearchHistory){
        // parse it to an array
        prevSearchHistory = JSON.parse(prevSearchHistory);
        // now we iterate over that array and add the history item to the DOM
        prevSearchHistory.forEach((value)=>{
            addSearchHistoryEle(value);
        });
    }
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


// now we get our old local storage
getLocalStorage();

// get a location for the position
 navigator.geolocation.getCurrentPosition(async (position) =>{
    // if we are successful
    var weather = await fetchWeather(position.coords.latitude, position.coords.longitude);
    var location = await decodeLocation(position.coords.latitude, position.coords.longitude);
    console.log("got geo location: ",location);
    locationEle.text(location[0].name);
    setCurrentWeather(weather.current);
    setWeeklyWeather(weather.daily);
}, async () =>{
    // no location given, check to see if we've searched somewhere, and apply it
    if (searchHistory.length){
        retrievePreviousSearch(searchHistory[searchHistory.length -1]);
        return;
    }
    // if we are not successful with either, default to San Francisco
    console.log("failed to get a location");
    var weather = await fetchWeather(37, -122);
    setCurrentWeather(weather.current);
    setWeeklyWeather(weather.daily);
    locationEle.text("San Francisco");
});
