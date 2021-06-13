const axios = require('axios');
import environment from '../src/environments.json';

// get the settings
chrome.storage.sync.get('settingsObject', function(res) {
    let settings = res.settingsObject;
    if (settings.facebook != 'false') {

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
            setTimeout(() => {
                let formData = new FormData();
                formData.append('html', document.documentElement.innerHTML)
                formData.append('source', 'facebook')
            
                axios({
                    method: 'post',
                    url: `${environment['api-url']}/record`,
                    data: formData,
                    headers: { "Content-Type": "multipart/form-data", "Authorization": auth_token },
                })
            }, 5000);

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

            // we will group some mutations together so we don't have to do as many requests
            let groupedMutations = '';
            let groupedMutationsCount = 0;
            
            // Callback function to execute when mutations are observed
            const callback = function (mutationsList, observer) {
                for (let mutation of mutationsList) {
                    if (mutation.type == 'childList') {
                        if (mutation.addedNodes.length > 0) {
                            let mutationHtml = mutation.addedNodes[0].innerHTML;
                            if (mutationHtml != undefined) {
                                let spanIndex = mutationHtml.search('span');
                                if (spanIndex != -1) {
                                    groupedMutations += mutationHtml;
                                    groupedMutationsCount++;

                                    if(groupedMutationsCount >= 25) {
                                        let postFormData = new FormData();
                                        postFormData.append('html', groupedMutations);
                                        postFormData.append('source', 'facebook');
                                        axios({
                                            method: 'post',
                                            url: `${environment['api-url']}/record`,
                                            data: postFormData,
                                            headers: { "Content-Type": "multipart/form-data", "Authorization": auth_token },
                                        })
                                        .then(function (response) {
                                            //handle success
                                            groupedMutationsCount = 0;
                                            groupedMutations = '';
                                        });
                                        groupedMutationsCount = 0;
                                        groupedMutations = '';
                                    }
                                    
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