const axios = require('axios');
const $ = require('jquery');

axios({
	method: 'get',
	url: 'http://127.0.0.1:5000/user/608fb0824832f22bdd3542f1/record/',
  })
	.then(function (response) {
	  //handle success
	  console.log(response);
	  $('#graphBox').text(JSON.stringify(response.data));
	})
	.catch(function (response) {
	  //handle error
	  console.log(response);
	  $('#graphBox').text(JSON.stringify(response));
	});