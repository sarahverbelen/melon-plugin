const axios = require('axios');
const $ = require('jquery');
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// getting the data
axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/user/608fb0824832f22bdd3542f1/record/',
    })
    .then(function(response) {
        $('#debug').text(JSON.stringify(response.datasets));

		// if the data was received, make the chart
        createChart(response.data);
    })
    .catch(function(response) {
        $('#debug').text(JSON.stringify(response));
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