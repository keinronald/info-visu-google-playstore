import * as d3 from "d3";



export default class Chart {
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

      // set up parent element and SVG
      this.element.innerHTML = '';
      this.svg = d3.select(this.element).append('svg');
      this.svg.attr('width',  this.width);
      this.svg.attr('height', this.height);

      // we'll actually be appending to a <g> element
      this.plot = this.svg.append('g')
          .attr('transform',`translate(${this.width / 2},${this.height/2})`)
          .on("mouseleave", mouseleave);

      // formatting the data
      this.partition = d3.partition()
          .size([2 * Math.PI, this.radius]);

      // find the root node
      this.root = d3.hierarchy(this.data)
          .sum((d) => d.size);

      //calculate each arc
      this.partition(this.root);
      this.arc = d3.arc()
          .startAngle((d) => d.x0)
          .endAngle((d) => d.x1)
          .innerRadius((d) => d.y0)
          .outerRadius((d) => d.y1);

      // putting it all together
      this.plot.selectAll('path')
          .data(this.root.descendants())
          .enter()
          .append('path')
          .attr("display",(d) => d.depth ? null : "none")
          .attr("d", this.arc)
          .style('stroke', '#fff')
          .style("fill", "#51BCB7")
          .on("mouseover", mouseover)
          .append('text')
          .text(d => d.data.name);

      // adding info texts
      const name_text = this.svg.append("text")
          .attr("id","title")
          .attr("x", 0)
          .attr("y", 40)
          .style("font-size", "2em")
          .style("fill", "#51BCB7");

      const amount_text = this.plot.append("text")
          .attr("id","title")
          .attr("x", 0)
          .attr("y", 20)
          .text("Amount of Apps")
          .attr("text-anchor", "middle")
          .style("font-size", "1em")
          .style("fill", "grey");

      const percentage_text = this.plot.append("text")
          .attr("id","title")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .style("font-size", "1.5em")
          .style("fill", "white")
          .text("100%");

      const totalSize = this.root.descendants()[0].value;
      const plot = this.plot;

      function mouseover(d) {
          let sequenceArray = d.ancestors().reverse();
          sequenceArray.shift();

          let seqString = "";
          sequenceArray.forEach((entry) => {(seqString === "") ? seqString = `${entry.data.name}`: seqString += ` > ${entry.data.name}`;});

          name_text.text(seqString);

          let percentage = (100 * d.value / totalSize).toPrecision(3);
          let percentageString = percentage + "%";
          if (percentage < 0.1) {
              percentageString = "< 0.1%"; }
          percentage_text.text(percentageString);
          amount_text.text(`${d.value} Apps`)
              .style('fill', 'white');

          // remove root node from the array
          // Fade all the segments.
          plot.selectAll("path")
              .style("opacity", 0.3);

          // Then highlight only those that are an ancestor of the current segment.
          plot.selectAll("path")
              .filter(node => sequenceArray.indexOf(node) >= 0)
              .style("opacity", 1);
      }

      function mouseleave() {
          name_text.text("");
          percentage_text.text("100%");
          amount_text.text("Amount of Apps")
              .style('fill', 'grey');

          plot.selectAll("path")
              .transition()
              .duration(200)
              .style('opacity', 1)
              .on("end", function() {
                  d3.select(this).on("mouseover", mouseover);
              });
      }
  }
}
