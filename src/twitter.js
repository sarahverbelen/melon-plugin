const axios = require('axios');
import environment from '../src/environments.json';

// get the settings
chrome.storage.sync.get('settingsObject', function(res) {
    let settings = res.settingsObject;
    
    if (settings.twitter != 'false') {
        console.log("scraper running!");
        
        // initial loading
        chrome.storage.sync.get('loggedInObject', function(result) {
            if(result.loggedInObject.loggedIn == true){
                gatherData(result.loggedInObject.auth_token);
            }
        });

        // if the value has changed
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes.loggedInObject?.newValue) {
                if(changes.loggedInObject.newValue.loggedIn == true){
                    gatherData(changes.loggedInObject.newValue.auth_token);
                }
            }
        });

        function gatherData(auth_token) {
            setTimeout(() => {
                let formData = new FormData();
                formData.append('html', document.documentElement.innerHTML);
                formData.append('source', 'twitter');
            
                axios({
                    method: 'post',
                    url: `${environment['api-url']}/record`,
                    data: formData,
                    headers: { "Content-Type": "multipart/form-data", "Authorization": auth_token },
                })
                    .then(function (response) {
                    //handle success
                    console.log(response);
                    })
                    .catch(function (response) {
                    //handle error
                    console.log(response);
                    });
            }, 7000);
        }

    }
});
