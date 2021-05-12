const axios = require('axios');
import { read_cookie } from 'sfcookies';

console.log("scraper running!");

setTimeout(() => {
    let formData = new FormData();
    formData.append('html', document.documentElement.innerHTML)
    formData.append('source', 'twitter')

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
}, 7000);

