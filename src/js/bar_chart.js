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
            bottom: 200,
            left: 100
        };
        this.width = this.element.offsetWidth - this.margin.right - this.margin.left;
        this.height = this.width / 2;
        const maxValue = Math.max.apply(Math, this.data.map(d => d.value));

        // set up parent element and SVG
        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg');
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
            .attr('y', (d) => yScale(d.value))
            .attr('height', (d) => this.height - yScale(d.value))
            .attr('width', xScale.bandwidth())
            .style("fill", "#51BCB7")
            .on('mouseenter', function (actual, i) {
                d3.selectAll('.value')
                    .attr('opacity', 0);

                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 0.3);

                const y = yScale(actual.value);

                plot.append('line')
                    .attr('id', 'limit')
                    .attr('x1', 0)
                    .attr('y1', y)
                    .attr('x2', width)
                    .attr('y2', y);

                barGroups.append('text')
                    .attr('class', 'difference')
                    .attr('x', (a) => xScale(a.name) + xScale.bandwidth() / 2 + 6)
                    .attr('y', (a) => yScale(a.value) - 3)
                    .attr('fill', 'white')
                    .attr('text-anchor', 'end')
                    .text((a, idx) => {
                        const divergence = (a.value - actual.value);

                        let text = '';
                        if (divergence > 0) text += '+';
                        text += divergence;

                        return idx !== i ? text : '';
                    });

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

    // the following are "public methods"
    // which can be used by code outside of this file
    setData(newData) {
        this.data = newData;

        // full redraw needed
        this.draw();
    }
}
