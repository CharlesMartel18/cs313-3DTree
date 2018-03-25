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
function load() {
  
  // Update displayed sections
  document.querySelector('.no-auth').style.display = 'none';
  document.querySelector('.auth').style.display = 'block';
  
  // First we fetch the user's person
  user_tree(function(person) {
    document.querySelector('.person-profile').innerHTML = '';

    // Then we display the data for the current user
    displayPerson(person);

    // And then the data for their ancestors
    var parents_ids = [];
    parents_ids[0] = person.display.familiesAsChild[0].parent1.resourceId;
    parents_ids[1] = person.display.familiesAsChild[0].parent2.resourceId;
    
    getParents(function(parents) {
      for (var i = 0; i < parents.length; i++) {
        displayPerson(parents[i])
      }
    }, parents_ids);
  });
}

/**
 * Fetch the user's current person. The API will respond with a redirect. We tell
 * the SDK to automatically follow the redirect.
 * 
 * https://familysearch.org/developers/docs/api/tree/Current_Tree_Person_resource
 */
function user_tree(callback) {
  familysearch.get('/platform/tree/current-person', {
    followRedirect: true
  }, function(error, response){
    if(error) {
      handleError(error);
    }
    else {
      callback(response.data.persons[0]);
      console.log(response.data.persons[0]);
    }
  });
}

/**
 * Fetch parents of a person. The API will respond with a redirect. We tell
 * the SDK to automatically follow the redirect. (What would be better would
 * be to get the Relationships (parents, children, spouse(s)) for future use)
 * 
 * https://familysearch.org/developers/docs/api/tree/Current_Tree_Person_resource
 */
function getParents(callback, parents_ids) {
  ids_str = String(parents_ids[0]) + ',' + String(parents_ids[1]);

  familysearch.get(('/platform/tree/persons?pids=' + ids_str), {
    followRedirect: true
  }, function(error, response){
    if(error) {
      handleError(error);
    }
    else {
      callback(response.data.persons);
      console.log(response.data);
    }
  });
}

/**
 * Display a person by printing out the display data in a pre block
 */
function displayPerson(person) {
  var $profileContainer = document.querySelector('.person-profile'),
      $person_div = document.createElement('div');
  
  // Pretty print the display block of the person
  $person_div.innerHTML = person.display.name;
  $person_div.id = person.id;

  // Add the display block to the DOM
  $profileContainer.appendChild($person_div);

  var $details = document.getElementById(person.id);
  personInfo($details, person, $profileContainer);
}

function personInfo($details, person, $profileContainer) {
  $details.addEventListener('click', function (event) {
    if ($details.id == person.id) {
      var $pre = document.createElement('pre');
      $pre.innerHTML = JSON.stringify(person.display, null, 2);
      $pre.id = "pre_" + person.id;
      $details.id = "_" + $details.id;

      $profileContainer.appendChild($pre);
    } else if ($details.id == "_" + person.id) {
        $profileContainer.removeChild(document.getElementById("pre_" + person.id));
        $details.id = person.id;
    }
  });
}

/**
 * Prints an error to the console and fires an alert telling the user to open the console.
 * Don't do this in a production app.
 */
function handleError(error) {
  console.error(error);
  alert('There was an error. Open the developer console to see the details.');
}