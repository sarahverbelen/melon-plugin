// this is the background script that will need to be compiled in order to use npm packages.
const axios = require('axios');

console.log("scraper running!");

axios.post('http://127.0.0.1:5000/record', {
    html: document.documentElement.innerHTML
}).then(function (res) {
    console.log(res.data);
});
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
        // console.log(mutation);
        if (mutation.type == 'childList') {
            if (mutation.addedNodes.length > 0) {
                mutationHtml = mutation.addedNodes[0].innerHTML;
                if (mutationHtml != undefined) {
                    h3Index = mutationHtml.search('h3');
                    if (h3Index != -1) {
                        // console.log(mutation);
                        axios.post('http://127.0.0.1:5000/getAll', {
                            html: mutationHtml,
                        }).then(function (res) {
                            if (res.data.length > 0) {
                                // console.log(res.data);
                                let data = res.data[0];

                                if (data.sentiment == "neg" || data.sentiment == -1) { // if it's negative, make it look negative
                                    let found = false;
                                    let h3s = document.getElementsByTagName("h3");
                                    for (h3 of h3s) {
                                        if (h3.innerHTML == data.text) {
                                            h3.classList.add('neg');
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        let ps = document.getElementsByTagName("p");
                                        for (p of ps) {
                                            if (p.innerHTML == data.text) {
                                                p.classList.add('neg');
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                }

                            }
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