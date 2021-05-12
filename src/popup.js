const axios = require('axios');
const $ = require('jquery');
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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

    $("#graph").hide();
    $('#logInForm').show();

    // initial loading
    chrome.storage.sync.get('loggedInObject', function(result) {
        loginForm(result.loggedInObject.loggedIn, result.loggedInObject.auth_token);
    });

    // if the value has changed
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.loggedInObject?.newValue) {
            loginForm(changes.loggedInObject.newValue.loggedIn, changes.loggedInObject.newValue.auth_token)
        }
    });
});

function loginForm(loggedIn, auth_token) {
    if (loggedIn == true) {
        // only show the graph when the user is logged in
        $("#graph").show();
        $('#logInForm').hide();
        
        // getting the data
        axios({
            method: 'get',
            url: 'http://127.0.0.1:5000/record/',
            headers: {'Authorization': auth_token}
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
}

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
        let loggedInObject = {
            loggedIn: true,
            auth_token: res.data
        }
        chrome.storage.sync.set({loggedInObject});

        $("#graph").show();
        $('#logInForm').hide();

    }).catch(function(err) {
        // TODO: error handling, showing the user what's wrong
        $('#debug').text(JSON.stringify(response));
    });

}