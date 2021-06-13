const axios = require('axios');
import environment from '../src/environments.json';

// get the settings
chrome.storage.sync.get('settingsObject', function(res) {
    let settings = res.settingsObject;
    if (settings.reddit != 'false') {

        let formData = new FormData();
        formData.append('html', document.documentElement.innerHTML)
        formData.append('source', 'reddit')

        // initial loading
        chrome.storage.sync.get('loggedInObject', function(result) {
            if(result.loggedInObject.loggedIn == true){
                gatherData(result.loggedInObject.auth_token)
            }
        });

        // if the value has changed
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'sync' && changes.loggedInObject?.newValue) {
                if(changes.loggedInObject.newValue.loggedIn == true){
                    gatherData(changes.loggedInObject.newValue.auth_token)
                }
            }
        });

        function gatherData(auth_token) {
            axios({
                method: 'post',
                url: `${environment['api-url']}/record`,
                data: formData,
                headers: { "Content-Type": "multipart/form-data", "Authorization": auth_token },
            
            })
            // solution for infinite scroll based on: https://stackoverflow.com/questions/57313620/how-to-run-chrome-extension-code-repeatedly-on-infinite-scroll-pages
            const targetNode = document.body;
            
            // Options for the observer (which mutations to observe)
            // Set attributes to false if you do not care if existing nodes have changed,
            //  otherwise set it true. 
            const config = {
                attributes: false,
                childList: true,
                subtree: true
            };
            
            // Callback function to execute when mutations are observed
            const callback = function (mutationsList, observer) {
                for (let mutation of mutationsList) {
                    if (mutation.type == 'childList') {
                        if (mutation.addedNodes.length > 0) {
                            let mutationHtml = mutation.addedNodes[0].innerHTML;
                            if (mutationHtml != undefined) {
                                let h3Index = mutationHtml.search('h3');
                                if (h3Index != -1) {
                                    let postFormData = new FormData();
                                    postFormData.append('html', mutationHtml);
                                    postFormData.append('source', 'reddit');
                                    axios({
                                        method: 'post',
                                        url: `${environment['api-url']}/record`,
                                        data: postFormData,
                                        headers: { "Content-Type": "multipart/form-data", "Authorization": auth_token },
                                    });
                                }
                            }
            
                        }
                    }
                }
            };
            
            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);
            
            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);
        }
    }
});
