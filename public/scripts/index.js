var APP_KEY = 'a02f100000STXfVAAX';
var REDIRECT_URI = 'http://localhost:5000/index.html';
//var REDIRECT_URI = 'https://intense-plateau-59140.herokuapp.com/';

// Create and configure the API client
var familysearch = new FamilySearch({
  environment: 'integration',
  appKey: APP_KEY,
  redirectUri: REDIRECT_URI,
  saveAccessToken: true
});

// Process OAuth response, if we have one. true is returned if a code parameter
// was found in the query. Otherwise false is returned.
if(familysearch.oauthResponse(load)){
  // When oauthResponse returns true it means it found a code and is
  // going to exchange it for an access token. The response is handled in
  // the callback parameter of that method.
}

// We didn't find a oauth code in the query parameters so now we check to see
// if we're already authenticated.
else if(familysearch.getAccessToken()){
  load();
}

// If we're not processing an OAuth response and we're not already authenticated,
// we wire up and display the sign in button so that the user can initiate authentication.
else {
  document.getElementById('signin').addEventListener('click', function(){
    familysearch.oauthRedirect();
  });
}

/**
 * This method is called once the user is signed in and begins
 * loading data from the API.
 */
function load(){
  
  // Update displayed sections
  document.querySelector('.no-auth').style.display = 'none';
  document.querySelector('.auth').style.display = 'block';
  
  // First we fetch the user's person
  getCurrentPerson(function(person) {

    // Then we display the data
    displayPerson(person);
    
  });
}

/**
 * Fetch the user's current person. The API will respond with a redirect. We tell
 * the SDK to automatically follow the redirect.
 * 
 * https://familysearch.org/developers/docs/api/tree/Current_Tree_Person_resource
 */
function getCurrentPerson(callback) {
  familysearch.get('/platform/tree/current-person', {
    followRedirect: true
  }, function(error, response){
    if(error) {
      handleError(error);
    }
    else {
      callback(response.data.persons[0]);
      console.log(response.data);
    }
  });
}

/**
 * Display a person by printing out the display data in a pre block
 */
function displayPerson(person){
  var $profileContainer = document.querySelector('.person-profile'),
      $person_div = document.createElement('div'),
      $pre = document.createElement('pre');
  
  // Clear the loading message
  $profileContainer.innerHTML = '';
  
  // Pretty print the display block of the person
  $person_div.innerHTML = person.display.name;
  $person_div.id = person.id;
  $button = document.getElementById(person.id);
  $pre.innerHTML = JSON.stringify(person.display, null, 2);
  
  // Add the display block to the DOM
  $profileContainer.appendChild($person_div);
  $profileContainer.appendChild($pre);
}

/**
 * Prints an error to the console and fires an alert telling the user to open the console.
 * Don't do this in a production app.
 */
function handleError(error){
  console.error(error);
  alert('There was an error. Open the developer console to see the details.');
}