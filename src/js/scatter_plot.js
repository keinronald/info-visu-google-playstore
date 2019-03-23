import * as d3 from "d3";

export default class Bar_Chart {
    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        // create the chart
        this.draw();
    }

    draw() {
        // define width, height and margin
        this.margin = {
            top: 20,
            right: 75,
            bottom: 75,
            left: 75
        };
        this.width = this.element.offsetWidth - this.margin.right - this.margin.left;
        this.height = this.width / 2;

        // set up parent element and SVG
        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg');
        svg.attr('width',  this.width + this.margin.left + this.margin.right);
        svg.attr('height', this.height + this.margin.top + this.margin.bottom);

        // zoom
        let zoom = d3.zoom()
            .on("zoom", zoomed);

        svg.call(zoom);

        // we'll actually be appending to a <g> element
        this.plot = svg.append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`);

        // scaling
        const yScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => Number(d.reviews)))
            .range([this.height, 0]);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(this.data, d => Number(d.rating)))
            .range([0, this.width]);

        //this.makeYLines = () => ;

        const grid = this.plot.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft()
                .scale(yScale)
                .tickSize(-this.width, 0, 0)
                .tickFormat('')
            );

        // axes
        let xAxis = d3.axisBottom(xScale);
        let yAxis = d3.axisLeft(yScale);

        let y_axis = this.plot.append('g')
            .call(yAxis);

        let x_axis = this.plot.append('g')
            .attr('transform', `translate(0, ${this.height})`)
            .call(xAxis);

        x_axis.selectAll('text')
            .attr('transform', 'rotate(90) translate(10, -12)')
            .style('text-anchor', 'start');

        // draw the bar to represent the data
        const circleGroups = grid.selectAll()
            .data(this.data)
            .enter()
            .append('g');

        // adding the tooltip
        let tooltip = d3.select(this.element)
            .append('div')
            .attr('class', 'tooltip');

        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'count');

        tooltip.append('div')
            .attr('class', 'percent');

        // drawing the circles
        let circles = circleGroups.append('circle')
            .attr('class', 'bar')
            .attr('cx', (g) => xScale(g.rating))
            .attr('cy', (g) => yScale(g.reviews))
            .attr('r', 10)
            .style("fill", "#51BCB7")
            .style('opacity', 0.2)
            .on('mouseover', function(d) {

                d3.select(this)
                    .style('opacity', 1)
                    .style('stroke', 'white');

                tooltip.select('.label').html(d.name);
                tooltip.select('.count').html(`avg: ${d.rating}`);
                tooltip.select('.percent').html(`ratins: ${d.reviews}`);
                tooltip.style('display', 'block');
            })
            .on('mouseleave', function () {
                tooltip.style('display', 'none');
                d3.select(this)
                    .style('opacity', 0.2)
                    .style('stroke', 'none');
            });

        // add the axis-label
        svg.append('text')
            .attr('class', 'label')
            .attr('x', this.width / 2 + this.margin.left)
            .attr('y', this.height + this.margin.top + this.margin.bottom - 25)
            .attr('text-anchor', 'middle')
            .text('Ratings');

        svg.append('text')
            .attr('class', 'label')
            .attr('x', -(this.height / 2) - this.margin.top)
            .attr('y', this.margin.left / 6.5)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .text('Number of Reviews');

        let width = this.width;
        function zoomed() {
            let new_x_scale = d3.event.transform.rescaleX(xScale);
            let new_y_scale = d3.event.transform.rescaleY(yScale);

            x_axis.transition()
                .duration(0)
                .call(xAxis.scale(new_x_scale));

            y_axis.transition()
                .duration(0)
                .call(yAxis.scale(new_y_scale));

            circles
                .attr("cx", function(d) {
                    return new_x_scale(d.rating)
                })
                .attr("cy", function(d) {
                    return new_y_scale(d.reviews)
                });

            grid.call(d3.axisLeft()
                    .scale(new_y_scale)
                    .tickSize(-width, 0, 0)
                    .tickFormat('')
                );

        }
    }

    // the following are "public methods"
    // which can be used by code outside of this file
    setColor(newColor) {
        this.plot.selectAll('.rect')
            .style('fill', newColor);

        // store for use when redrawing
        this.barColor = newColor;
    }

    setData(newData) {
        this.data = newData;

        // full redraw needed
        this.draw();
    }


}
