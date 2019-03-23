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
        this.width = this.element.offsetWidth;
        this.height = this.width / 2;
        this.radius = (Math.min(this.width, this.height) - 2) / 2;
        const color = d3.scaleOrdinal()
            .range(['#51BCB7', '#8CD5B3', '#BBECAD', '#E1FFA9', '#eeffde', '#f6f6f6']);
        const data = this.data;

        // set up parent element and SVG
        this.element.innerHTML = '';
        this.svg = d3.select(this.element).append('svg');
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
        let tooltip = d3.select(this.element)
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
