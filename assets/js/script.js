/*******************************************************************************
 * Global Variables
 ******************************************************************************/ 
/**
 * An array containing references to jquery elements for every day of the week
 * index 0 is today, index 1 is tomorrow etc. 
 */
var dayEles = []
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

/*******************************************************************************
 * Initialization
 ******************************************************************************/ 

setTime();
setDays();
setInterval(() => {
    setTime()
}, 1000);