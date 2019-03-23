import * as d3 from "d3";

export default class Bar_Chart {
    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.elementBar = opts.elementBar;
        this.elementPie = opts.elementPie;
        // create the chart
        this.drawBarChart();
        this.drawPieChart();
    }

    drawBarChart() {
        // define width, height and margin
        this.margin = {
            top: 20,
            right: 75,
            bottom: 200,
            left: 100
        };
        this.width = this.elementBar.offsetWidth - this.margin.right - this.margin.left;
        this.height = this.width / 2;
        const maxValue = Math.max.apply(Math, this.data.map(d => d.ratings.total));

        // set up parent element and SVG
        this.elementBar.innerHTML = '';
        const svg = d3.select(this.elementBar).append('svg');
        svg.attr('width',  this.width + this.margin.left + this.margin.right);
        svg.attr('height', this.height + this.margin.top + this.margin.bottom);

        // we'll actually be appending to a <g> element
        this.plot = svg.append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`);

        // scaling
        const yScale = d3.scaleLinear()
            .range([this.height, 0])
            .domain([0, maxValue]);

        const xScale = d3.scaleBand()
            .range([0, this.width])
            .domain(this.data.map((d) => d.name))
            .padding(0.2);

        this.makeYLines = () => d3.axisLeft()
            .scale(yScale);

        this.plot.append('g')
            .attr('class', 'grid')
            .call(this.makeYLines()
                .tickSize(-this.width, 0, 0)
                .tickFormat('')
            );

        // axes
        this.plot.append('g')
            .call(d3.axisLeft(yScale));

        this.plot.append('g')
            .attr('transform', `translate(0, ${this.height})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(90) translate(10, -12)')
            .style('text-anchor', 'start');

        // draw the bar to represent the data
        const barGroups = this.plot.selectAll()
            .data(this.data)
            .enter()
            .append('g');

        const plot = this.plot;
        const width = this.width;

        barGroups.append('rect')
            .attr('class', 'bar')
            .attr('x', (d) => xScale(d.name))
            .attr('y', (d) => yScale(d.ratings.total))
            .attr('height', (d) => this.height - yScale(d.ratings.total))
            .attr('width', xScale.bandwidth())
            .style("fill", "#51BCB7")
            .on('mouseenter', function (actual, i) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 0.3)

            })
            .on('mouseleave', function () {
                d3.selectAll('.value')
                    .attr('opacity', 1);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .attr('x', (a) => xScale(a.name))
                    .attr('width', xScale.bandwidth());

                plot.selectAll('#limit').remove();
                plot.selectAll('.difference').remove()
            });

        // add the axis-label
        svg.append('text')
            .attr('x', -(this.height / 2) - this.margin.top)
            .attr('y', this.margin.left / 4)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .text('');

        svg.append('text')
            .attr('class', 'label')
            .attr('x', this.width / 2 + this.margin.left)
            .attr('y', this.height + this.margin.top + this.margin.bottom - 25)
            .attr('text-anchor', 'middle')
            .text('Categories');

    }

    drawPieChart() {
        // define width, height and margin
        this.width = this.elementPie.offsetWidth;
        this.height = this.width / 2;
        this.radius = (Math.min(this.width, this.height) - 2) / 2;
        const color = d3.scaleOrdinal()
            .range(['#51BCB7', '#8CD5B3', '#BBECAD', '#E1FFA9', '#eeffde', '#f6f6f6']);
        const data = this.data;

        // set up parent element and SVG
        this.elementPie.innerHTML = '';
        this.svg = d3.select(this.elementPie).append('svg');
        this.svg.attr('width',  this.width);
        this.svg.attr('height', this.height);

        // we'll actually be appending to a <g> element
        this.plot = this.svg.append('g')
            .attr('transform',`translate(${this.width / 2},${this.height/2})`);

        this.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.radius);

        this.pie = d3.pie()
            .value(function(d) { return d.value; })
            .sort(null);

        const plot = this.plot;

        this.path = this.plot.selectAll('path')
            .data(this.pie(this.data))
            .enter()
            .append('path')
            .attr('d', this.arc)
            .attr('fill', function(d, i) {
                return color(d.data.label);
            })
            .style('stroke', '#fff')
            .on('mouseover', function(d) {
                let total = d3.sum(data.map(function(d) {
                    return d.value;
                }));
                let percent = Math.round(1000 * d.data.value / total) / 10;
                tooltip.select('.label').html(d.data.label);
                tooltip.select('.count').html(d.data.value);
                tooltip.select('.percent').html(percent + '%');
                tooltip.style('display', 'block');

                plot.selectAll("path")
                    .style("opacity", 0.3);

                d3.select(this)
                    .style('opacity', '1');
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');

                plot.selectAll("path")
                    .style("opacity", 1);
            });

        // adding the legend
        this.legend = this.svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                let height = 18 + 4;
                let vert = i * height;
                return `translate(0,${vert+10})`;
            });

        this.legend.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color)
            .style('stroke', 'white');

        this.legend.append('text')
            .attr('x', 18 + 4)
            .attr('y', 18 - 4)
            .text(function(d) { return d; });


        // tooltip
        let tooltip = d3.select(this.elementPie)
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');


    }

    // the following are "public methods"
    // which can be used by code outside of this file
    setData(newData) {
        this.data = newData;

        // full redraw needed
        this.draw();
    }
}
