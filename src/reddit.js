const axios = require('axios');
import { read_cookie } from 'sfcookies';

console.log("scraper running!");

let formData = new FormData();
formData.append('html', document.documentElement.innerHTML)
formData.append('source', 'reddit')

console.log(read_cookie('auth_token'));

axios({
	method: 'post',
	url: 'http://127.0.0.1:5000/record',
	data: formData,
	headers: { "Content-Type": "multipart/form-data", "Authorization": read_cookie('auth_token') },

  })
	.then(function (response) {
	  //handle success
	  console.log(response);
	})
	.catch(function (response) {
	  //handle error
	  console.log(response);
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
                let mutationHtml = mutation.addedNodes[0].innerHTML;
                if (mutationHtml != undefined) {
                    let h3Index = mutationHtml.search('h3');
                    if (h3Index != -1) {
                        let postFormData = new FormData();
						postFormData.append('html', mutationHtml);
						postFormData.append('source', 'reddit');
                        axios({
							method: 'post',
							url: 'http://127.0.0.1:5000/record',
							data: postFormData,
							headers: { "Content-Type": "multipart/form-data", "Authorization": read_cookie('auth_token') },
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