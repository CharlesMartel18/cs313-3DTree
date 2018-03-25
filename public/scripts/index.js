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
    parents_ids = get_parents_ids(person)
    getParents(function cb(parents) {
      // first the "parent" of "person"
      for (var i = 0; i < parents.length; i++) {
        displayPerson(parents[i]);

        // then the parents of the "parents" ...
        if (parents[i].display.familiesAsChild[0]) {
          var ancestors_ids = get_parents_ids(parents[i]);
          getParents(cb(ancestors), ancestors_ids);
        }
      }
    }, parents_ids);
  });
}

function get_parents_ids(person) {
  var parents_ids = [];
  parents_ids[0] = person.display.familiesAsChild[0].parent1.resourceId;
  parents_ids[1] = person.display.familiesAsChild[0].parent2.resourceId;

  return parents_ids;
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
      $profile = document.createElement('div'),
      $profile_name = document.createElement('div');
  
  // Pretty print the display block of the person
  $profile_name.innerHTML = person.display.name + '<br />' +
    JSON.stringify(person.display, null, 2) + '<br /><br />';
  $profile.id = person.id;

  // Add the display block to the DOM when the profile is clicked
  $profile.appendChild($profile_name);
  $profileContainer.appendChild($profile);

  personInfo(person, $profile);
}

/** 
 * Adds an event listener to each person; gets or closes info for that
 * person alternately.
*/
function personInfo(person, $profile) {
  // Show/hide person's information
  $profile.firstChild.addEventListener('click', function (event) {
    if ($profile.id == person.id) {
      var $details = document.createElement('div'),
          $name = document.createElement('div'),
          $gender = document.createElement('div'),
          $lifespan = document.createElement('div'),
          $birth_date = document.createElement('div'),
          $birth_place = document.createElement('div');
      if (person.display.name) {
        $name.innerHTML = "Name: " + person.display.name;
      }
      if (person.display.gender) {
        $gender.innerHTML = "Gender: " + person.display.gender;
      }
      if (person.display.lifespan) {
        $lifespan.innerHTML = "Lifespan: " + person.display.lifespan;
      }
      if (person.display.birthDate) {
        $birth_date.innerHTML = "Birth Date: " + person.display.birthDate;
      }
      if (person.display.birthPlace) {
        $birth_place.innerHTML = "Birth Place: " + person.display.birthPlace;
      }
      $details.appendChild($name);
      $details.appendChild($gender);
      $details.appendChild($lifespan);
      $details.appendChild($birth_date);
      $details.appendChild($birth_place);
      $details.id = "details_" + person.id;
      $profile.id = "_" + $profile.id;

      $profile.appendChild($details);

    } else if ($profile.id == "_" + person.id) {
        $profile.removeChild(document.getElementById("details_" + person.id));
        $profile.id = person.id;
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