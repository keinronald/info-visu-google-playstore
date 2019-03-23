import * as d3 from "d3";

import './assets/sass/style.scss';
import BarChart from './js/bar_chart';
import SunburstChart from './js/sunburst_chart';
import PieChart from './js/pie_chart';
import ScatterPlot from './js/scatter_plot';
// import DashboardChart from './js/dashboard_chart';
import * as barChartData from './barchart.json';
import * as pieChartData from './piechart.json';
import * as playstoreData from './playstore.json';


/*
    preparing data
 */
// preparing data for the scatter plot
let spDataAll = [];
Object.keys(playstoreData.app).forEach(function (item, i) {
    let o = {};
    o.name = playstoreData.app[item]; // key
    o.rating = playstoreData.rating[item]; // value
    o.reviews = playstoreData.reviews[item]; // value
    o.category = playstoreData.category[item]; // value
    spDataAll.push(o);
});

let spDataFree = [];
Object.keys(playstoreData.app).forEach(function (item, i) {

    if (playstoreData.type[item] === "Free") {
        let o = {};
        o.name = playstoreData.app[item]; // key
        o.rating = playstoreData.rating[item]; // value
        o.reviews = playstoreData.reviews[item]; // value
        o.category = playstoreData.category[item]; // value
        spDataFree.push(o);
    }
});

let spDataPaid = [];
Object.keys(playstoreData.app).forEach(function (item, i) {

    if (playstoreData.type[item] === "Paid") {
        let o = {};
        o.name = playstoreData.app[item]; // key
        o.rating = playstoreData.rating[item]; // value
        o.reviews = playstoreData.reviews[item]; // value
        o.category = playstoreData.category[item]; // value
        spDataPaid.push(o);
    }
});

// preparing data for the sunburst chart
let sbcData = {'name': 'TOPICS', 'children': []};
Object.keys(playstoreData.category).forEach(function (key, i) {
    let allready_added = sbcData.children.some(function (el) {
        return el.name === playstoreData.category[key];
    });
    if (!allready_added) {
        let o = {
            'name': `${playstoreData.category[key]}`,
            'children': [{
                'name': 'Free',
                'size': 0
            }, {
                'name': 'Paid',
                'size': 0
            }]
        };
        sbcData.children.push(o);
    }
});

Object.keys(playstoreData.type).forEach(function (key, i) {
    let index = sbcData.children.findIndex(x => x.name==playstoreData.category[key]);//
    if (playstoreData.type[key] == "Free") {
        sbcData.children[index].children[0].size = sbcData.children[index].children[0].size + 1;
    }
    else {
        sbcData.children[index].children[1].size = sbcData.children[index].children[1].size + 1;
    }
});

function compareSB(a,b) {
    if (a.children[0].size + a.children[1].size > b.children[0].size + b.children[1].size)
        return -1;
    if (a.children[0].size + a.children[1].size < b.children[0].size + b.children[1].size)
        return 1;
    return 0;
}

sbcData.children.sort(compareSB);
sbcData.children = sbcData.children.splice(0,4);


// preparing data for the pie-chart
let pcData = [];
Object.keys(pieChartData.count).forEach(function (item, i) {
    let o = {};
    o.label = item; // key
    o.value = pieChartData.count[item]; // value
    pcData.push(o);
});
let pcDataInstalls = [];
Object.keys(pieChartData.sum).forEach(function (item, i) {
    let o = {};
    o.label = item; // key
    o.value = pieChartData.sum[item]; // value
    pcDataInstalls.push(o);
});

function compare(a,b) {
    if (a.value > b.value)
        return -1;
    if (a.value < b.value)
        return 1;
    return 0;
}

pcData.sort(compare);
pcDataInstalls.sort(compare);


// preparing data for the barchart
let bcdata = [[],[]];
Object.keys(barChartData.sum).forEach(function (item, i) {
    let o = {};
    o.name = item; // key
    o.value = barChartData.count[item]; // value
    bcdata[0].push(o);
    let o1 = {};
    o1.name = item; // key
    o1.value = barChartData.sum[item]; // value
    bcdata[1].push(o1);

});

/*
    creating the new charts using their constructors
 */

// line chart
const scatter_plot = new ScatterPlot({
	element: document.querySelector('.scatter-plot-container'),
    data: spDataAll
});


// bar chart
const bar_chart = new BarChart({
	element: document.querySelector('.bar-chart-container'),
    data: bcdata[0]

});


// sunburst chart
const sunburst_chart = new SunburstChart({
	element: document.querySelector('.sunburst-chart-container'),
    data: sbcData

});


// pie chart
const pie_chart = new PieChart({
    element: document.querySelector('.pie-chart-container'),
    data: pcData
});


/*
    change the data or appearance of the charts
 */
// change data in bar-chart
d3.selectAll('select.bc-data').on('change', () => {
    let sel = document.getElementById('bar-chart-data');
    let selected = sel.options[sel.selectedIndex].value
    if (selected === "apps") {
        bar_chart.setData(bcdata[0]);
    }
    else if (selected === "installs") {
        bar_chart.setData(bcdata[1]);
    }
});


// change data in pie-chart
d3.selectAll('select.pie-data').on('change', () => {
    let sel = document.getElementById('pie-chart-data');
    let selected = sel.options[sel.selectedIndex].value;
    if (selected === "apps") {
        pie_chart.setData(pcData);
    }
    else if (selected === "installs") {
        pie_chart.setData(pcDataInstalls);
    }
});


// change line colour on click
d3.selectAll('button.type').on('click', function(){
    const type = d3.select(this).text().split(' ')[0];
    if (type === "All") {
        scatter_plot.setData(spDataAll);
    } else if (type === "Paid") {
        scatter_plot.setData(spDataPaid);
    } else if (type === "Free") {
        scatter_plot.setData(spDataFree);
    }
});

d3.selectAll('div.info').on('click', function () {
    d3.select(this)
        .style('display', 'none')
});
