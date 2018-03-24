const express = require('express');
const app = express();
const url = require('url');

app.set('port', (process.env.PORT || 5000))
   .use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views')
   .set('view engine', 'ejs')
   /*.get('/getPerson', function (req, res) {
		getPerson(req, res);
	})*/
   .listen(app.get('port'), function () {
    	console.log('Node app listening on port', app.get('port'));
    });
    



/*

    index.html
    ---------------------------
        index.js
        - authenticate()  (GET access token)
        - draw()
            - user_tree()     (GET each person in each generation for 5 [maybe more] trees from the user's person - ORIGIN)
            - get_person()    (GET information for a selected individual)
            - update_person() (PUT any changes to information are updated on Integration site, too)
            - delete_person() (DELETE person from Integration site)
            - create_person() (CREATE person on Integration site)
            - update_render() (GET next generation and DELETE previous)
    ---------------------------
            business_logic.js
            - FamilySearch Authentication (authenticate())
            - OrbitControls
            - CSS3DRenderer
            - ../build/three.js (includes THREE.LOD())

*/