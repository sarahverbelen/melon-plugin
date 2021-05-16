const axios = require('axios');
const $ = require('jquery');
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

$(function() {
    // handles the links (found here: https://stackoverflow.com/questions/8915845/chrome-extension-open-a-link-from-popup-html-in-a-new-tab)
    $('body').on('click', 'a', function(){
        if($(this).attr('id') != 'logout') {
            chrome.tabs.create({url: $(this).attr('href')});
        }
        return false;
      });

    // logout link
    $('#logout').on('click', function(e) {
        e.preventDefault();
        let loggedInObject = {
            loggedIn: false,
            auth_token: ''
        }
        chrome.storage.sync.set({loggedInObject});
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
        // apply the settings
        getSettings(auth_token);
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
            // $('#debug').text(JSON.stringify(response['message']));
            $("#graph").hide();
            $('#logInForm').show();
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
            'Negatief'
        ],
        datasets: [{
            label: 'sentiment',
            data: [sentimentData.positiveCount, sentimentData.negativeCount],
            backgroundColor: [
                'rgb(89, 161, 96)', // positive
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
        getSettings(res.data);

        $("#graph").show();
        $('#logInForm').hide();

    }).catch(function(err) {
        // TODO: error handling, showing the user which input was wrong
        // $('#debug').text(JSON.stringify(response['message']));
    });

}

function getSettings(auth_token) {
    axios({
        method: 'get',
        url: 'http://localhost:5000/me',
        headers: {'Authorization': auth_token},
    }).then(function (res) {
        // $('#debug').text(JSON.stringify(res.data.settings));
        let settingsObject = res.data.settings
        chrome.storage.sync.set({settingsObject});

    }).catch(function(err) {
        // TODO: error handling, showing the user which input was wrong
        // $('#debug').text(JSON.stringify(err));
    });
}