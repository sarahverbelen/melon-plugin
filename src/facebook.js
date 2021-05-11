// this is the background script that will need to be compiled in order to use npm packages.
const axios = require('axios');

console.log("scraper running!");

setTimeout(() => {
    let formData = new FormData();
    formData.append('html', document.documentElement.innerHTML)
    formData.append('source', 'facebook')

    axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/record',
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    })
        .then(function (response) {
        //handle success
        console.log(response);
        })
        .catch(function (response) {
        //handle error
        console.log(response);
        });
}, 5000);

