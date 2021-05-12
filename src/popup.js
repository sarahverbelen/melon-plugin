const axios = require('axios');
const $ = require('jquery');
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { bake_cookie, read_cookie } from 'sfcookies';

$(function() {
    // handles the links (found here: https://stackoverflow.com/questions/8915845/chrome-extension-open-a-link-from-popup-html-in-a-new-tab)
    $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
      });

    // submit the login form
    $('#submit').on('click', function(e) {
        e.preventDefault();
        validateForm();
    });

    
    if (read_cookie('loggedIn') == true) {
        // only show the graph when the user is logged in
        $("#graph").show();
        $('#logInForm').hide();
    
        // getting the data
        axios({
            method: 'get',
            url: 'http://127.0.0.1:5000/record/',
            headers: {'Authorization': read_cookie('auth_token')}
        })
        .then(function(response) {
            // if the data was received, make the chart
            createChart(response.data);
        })
        .catch(function(response) {
            $('#debug').text(JSON.stringify(response));
        });

    } else { // show login form when user is not logged in 
        $("#graph").hide();
        $('#logInForm').show();
    }

});

function createChart(sentimentData) {
    const data = {
        labels: [
            'Positief',
            'Neutraal',
            'Negatief'
        ],
        datasets: [{
            label: 'sentiment',
            data: [sentimentData.positiveCount, sentimentData.neutralCount, sentimentData.negativeCount],
            backgroundColor: [
                'rgb(89, 161, 96)', // positive
                'rgb(103, 103, 103)', // neutral
                'rgb(235, 98, 86)' // negative
            ],
            hoverOffset: 2,
            borderWidth: 0
        }]
    };

    const config = {
        type: 'doughnut',
        data: data
    }

    let chart = new Chart(
        document.getElementById('chart'),
        config
    );
}

function validateForm() {
    const email = document.forms['loginForm']['email'].value;
    const password = document.forms['loginForm']['password'].value;

    let formData = new FormData();
	formData.append('email', email);
	formData.append('password', password);

    axios({
        method: 'post',
        url: 'http://localhost:5000/login',
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    }).then(function (res) {
        bake_cookie('loggedIn', true);
        bake_cookie('auth_token', res.data);

        $("#graph").show();
        $('#logInForm').hide();

    }).catch(function(err) {
        // TODO: error handling, showing the user what's wrong
        $('#debug').text(JSON.stringify(response));
    });

}