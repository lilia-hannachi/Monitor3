
var line_margin = {top: 35, right: 100, bottom: 10,left: 70};

var line_width2 = line_width / 2;
var line_height2 = line_height /2;

function add_footer(charts, title_param)
{
  var position_x = -60;
  var position_y = 250;
  position_x = bold_text(charts, position_x, position_y, 'NIST RPKI Monitor:', 10);
  position_x = regular_text(charts, position_x, position_y, title_param.title, 60);
  position_x = bold_text(charts, position_x, position_y, 'Version:', 75);
  position_x = regular_text(charts, position_x, position_y, title_param.version, 25);
  position_x = bold_text(charts, position_x, position_y, 'Collector:', 30);
  position_x = regular_text(charts, position_x, position_y, title_param.col, 30);
  position_x = bold_text(charts, position_x, position_y, 'RIR:', 27);
  position_x = regular_text(charts, position_x, position_y, title_param.rir, 15);
  position_x = bold_text(charts, position_x, position_y, 'Date:', 25);
  position_x = regular_text(charts, position_x, position_y, title_param.time, 20);
}

function generateLineChart(data_values, divName, yAxisLabel, title, title_param)
{	
	d3.select("#"+divName).select("div").remove();
    
   // Define SVG properties   
   var svg = d3.select("#"+divName)
   .append("div")
   .classed("svg-container", true) //container class to make it responsive
   .append("svg")
   .attr('id', divName+"s")
   //responsive SVG needs these 2 attributes and no line_width and line_height attr
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 600 320")//class to make it responsive
   .classed("svg-content-responsive", true)
   .append("g")
   .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")"); 

   /* Get Data for Line Chart */
	var globalArr = data_values.data;
	var date = data_values.date;
   
    /* Define X Axis properties*/
    var parseDate = d3.time.format("%Y%m%d.%H");
    var x = d3.time.scale().range([0, line_width-140]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%Y%m%d%H"));
	x.domain(d3.extent(date, function(d) { return d; }));
 
 /* Draw Title  */
  svg.append("text")
        .attr("x", line_width2 - 50)             
        .attr("y", -15 )
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .text(title);
 /* Add Footer	*/	

  var position_x = -60;
  var position_y = 255;
  position_x = bold_text(svg, position_x, position_y, 'NIST RPKI Monitor:', 10);
  position_x = regular_text(svg, position_x, position_y, title_param.title, 60);
  position_x = bold_text(svg, position_x, position_y, 'Version:', 75);
  position_x = regular_text(svg, position_x, position_y, title_param.version, 25);
  position_x = bold_text(svg, position_x, position_y, 'Collector:', 30);
  position_x = regular_text(svg, position_x, position_y, title_param.col, 30);
  position_x = bold_text(svg, position_x, position_y, 'RIR:', 27);
  position_x = regular_text(svg, position_x, position_y, title_param.rir, 15);
  position_x = bold_text(svg, position_x, position_y, 'Date:', 25);
  position_x = regular_text(svg, position_x, position_y, title_param.time, 20);

	/* Draw X axis */
	svg.append("g")
   .attr("class", "axis")
	  .attr("transform", "translate(0," + line_height2 + ")")
	  .call(xAxis)
	  .selectAll("text")
	  .attr("y", 0)
	  .attr("x", 10)
	  .attr("dy", ".35em")
	  .attr("transform", "rotate(30)")
      .style("text-anchor", "start");

    /* Define y Axis properties*/
//    var y = d3.scale.log().clamp(true).range([line_height, 0]).base(2).nice();
    var y = d3.scale.log().clamp(true).range([line_height2, 0]).nice();
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(0, ".1s");
/*  ------------ ADD LEGEND ----------------- */

    legend_width = line_width * 0.7;
    var dataL= 15, offset = 110, y2= line_height2 * 1.24;
    var legend = svg.selectAll('.legend')
            .data(globalArr)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
                if(dataL > legend_width)
                {
                    dataL = 15;
                    y2 += 15;
                }
                var dataLN = dataL;
                dataL += d.name.length + offset;
                return "translate("+dataLN+", "+y2+")";
            });

    legend.append('rect')
            .attr("width", 10)
            .attr("height", 10)
            .style('fill', function(d) {return d.color;});

    legend.append('text')
            .attr("x", 20)
            .attr("y", 10)
            .text(function(d) { return d.name; });


    var max = d3.max(globalArr, function(c) {return d3.max(c.data, function(v) {return v.Count;}) ; });
    var min = d3.min(globalArr, function(c) {return d3.min(c.data, function(v) {return v.Count;}) ; });
    if(min == 0)
      min = 1;
    y.domain([min, max]);
    /* Draw Y axis */
    svg.append("g")
	.attr("class", "axis")
	.call(yAxis)
	.append("text")
	.attr("transform", "rotate(-90)")     
    .attr("y", -60)
    .attr("x", -70)
    .attr("dy", "2em")    
    .style("text-anchor", "middle")
	.text(yAxisLabel);

    /* Define Chart Lines values (X and Y) */
    var line = d3.svg.line().interpolate("linear").x(function(d) { return x(d.Time); }) .y(function(d) { return y(d.Count); });
	
	/* associate data with lines 	*/
	var lines = svg.selectAll(".lines").data(globalArr).enter().append("g").attr("class", "lines");
		 
	/* Draw Lines 	*/
	lines.append("path")
		 .attr("class", "line")
		 .attr("d", function(d) {return line(d.data);	})
     .style("fill", "none")
	   .style("stroke", function(d) {	return d.color;	});

	/* draw text associated with lines 	*/
	lines.append("text")
	  	 .datum(function(d) {
			return {				
		  			name: d.name,
		  			value: d.data[d.data.length - 1]
				   };
	  });  

	var mouseG = svg.append("g")
	  				.attr("class", "mouse-over-effects");

	mouseG.append("path") // this is the black vertical line to follow mouse
	  	  .attr("class", "mouse-line")
	  	  .style("stroke", "black")
	  	  .style("stroke-width", "1px")
	      .style("opacity", "0");
	  
	var linesVal = document.getElementsByClassName('line');
	var mousePerLine = mouseG.selectAll('.mouse-per-line')
	  						 .data(globalArr)
	  						 .enter()
	  						 .append("g")
	  						 .attr("class", "mouse-per-line");

	mousePerLine.append("circle")
	  			.attr("r", 7)
	  			.style("stroke", function(d) {
					return d.color;
	  			})
	  			.style("fill", "none")
	  			.style("stroke-width", "1px")
	  			.style("opacity", "0");

	mousePerLine.append("text").style("opacity", "0") ;  
	  
	mouseG.append('rect') // append a rect to catch mouse movements on canvas
	  	  .attr('width', line_width-140) // can't catch mouse events on a g element
	  	  .attr('height', line_height2)
	  	  .attr('fill', 'none')
	  	  .attr('pointer-events', 'all')
	  	  .on('mouseout', function() { // on mouse out hide line, circles and text
				mouseG.select(".mouse-line")
		  			  .style("opacity", "0");
				mousePerLine.selectAll(".mouse-per-line circle")
		  					.style("opacity", "0");
				mousePerLine.selectAll(".mouse-per-line text")
		  					.style("opacity", "0");
	  		})
	  	  .on('mouseover', function() { // on mouse in show line, circles and text
				mouseG.select(".mouse-line")
		  			  .style("opacity", "1");
				mousePerLine.selectAll(".mouse-per-line circle")
		  					.style("opacity", "1");
				mousePerLine.selectAll(".mouse-per-line text")
		  					.style("opacity", "1");
	  		})
	  	  .on('mousemove', function() { // mouse moving over canvas
				var mouse = d3.mouse(this);
				mouseG.select(".mouse-line")
		  			  .attr("d", function() {
							var d = "M" + mouse[0] + "," + line_height2;
								d += " " + mouse[0] + "," + 0;
							return d;
		  		});

				d3.selectAll(".mouse-per-line")
	  			  .attr("transform", function(d, i) {
						var xDate = x.invert(mouse[0]),
						bisect = d3.bisector(function(d) { return d.Time; }).right;
						idx = bisect(d.data, xDate);
					//	var timeVal = function(d.data) { return (d.Time).toISOString();};
						var beginning = 0,
						end = linesVal[i].getTotalLength(),
						target = null;

						while (true)
						{
		  					target = Math.floor((beginning + end) / 2);
		  					pos = linesVal[i].getPointAtLength(target);
		  					if ((target === end || target === beginning) && pos.x !== mouse[0]) 
		  					{
			  					break;
		  					}
		  					if (pos.x > mouse[0])      
		  						end = target;
		  					else if (pos.x < mouse[0]) beginning = target;
		  					else break; //position found
						}
						d3.select(this).select('text')
					        .text(y.invert(pos.y).toFixed(0)+" ("+parseDate(xDate)+")") .attr("class", "axis").style("font-size", "8px");
		  				//  .text(d.name+" : "+y.invert(pos.y).toFixed(0)+"("+parseDate(xDate)+")") .attr("class", "axis");
					return "translate(" + mouse[0] + "," + pos.y +")";
	  			});
  			});	

}


