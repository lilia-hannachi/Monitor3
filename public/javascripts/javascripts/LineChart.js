
var line_margin = {top: 35, right: 100, bottom: 10,left: 70};

/******************************************************************/
var myColor = {"Total":"gray", "V|I":"#FF0000", "V|NF":"#FFFF00", "I|V":"#7CFC00", "I|NF":"#F08080", "NF|I":"#800000", "NF|V":"#663399"};
var valLabels = {"Total":"Total", "NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-Set"};

var parseDate = d3.time.format("%Y%m%d.%H").parse;
var format = d3.time.format("%Y%m%d%H")

function sortByDateAscending(a, b) {
        if(a != null && b != null)
        {
                return a.Time - b.Time;
        }
}

function getBubble_Total(data_values, dataVal, subSelect)
{
  data_values = data_values.sort(sortByDateAscending);
  data_values = data_values.filter(function(row){ return row["Time"]>"20200906.00";});	
  var dates = new Array();
  var classes = new Array();
  classes.push("Total");
  var data = new Array();
	for(var i=0; i<data_values.length; i++)
	{
    if(data_values[i] != null)
    {     
  		if(data_values[i][subSelect] != undefined)
  		{
          var total = 0;
      		var time = data_values[i].Time;
          dates.push(parseDate(time));
  			  data_values[i][subSelect].forEach(function(d) {
            total +=  d[dataVal];        
  			  });
          data.push({Time:parseDate(time), Name:"Total", Count:total});                     
  		}
    }
	} 
	return {dates: dates, classes: classes, data:data};
}

function getBubble_Data(data_values, dataVal, subSelect)
{
  data_values = data_values.sort(sortByDateAscending);
  data_values = data_values.filter(function(row){ return row["Time"]>"20200930.00";});
  var dates = new Array();
  var classes = new Array();
  var data = new Array();
	for(var i=0; i<data_values.length; i++)
	{
    if(data_values[i] != null)
    {     
  		if(data_values[i][subSelect] != undefined)
  		{
      		var time = data_values[i].Time;
          dates.push(parseDate(time));
  			  data_values[i][subSelect].forEach(function(d) {
            if(d[dataVal] != 0)                                              
              data.push({Time:parseDate(time), Name:d["V"], Count:d[dataVal]});  
            if(!classes.includes(d["V"]))   
            {
              classes.push(d["V"]);
            }  
  			  });                    
  		}
    }
	} 
	return {dates: dates, classes: classes, data:data};
}

function getBubble_chart(data_values, divName, yAxisLabel, title)
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
   .attr("viewBox", "0 0 500 500")//class to make it responsive
   .classed("svg-content-responsive", true)
   .append("g")
   .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")"); 

   /* Get Data for Line Chart */
	var globalArr = data_values.data;
 
	var dates = data_values.dates;
  var classes = data_values.classes;
   
    /* Define X Axis properties*/
    var parseDate = d3.time.format("%Y%m%d.%H");
    var x = d3.time.scale().range([0, line_width-30]);
    x.domain(d3.extent(dates, function(d) { return d; }));
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(format);
 
 /* Draw Title  */
  svg.append("text")
        .attr("x", 150)             
        .attr("y", -15 )
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .text(title);
        
	/* Draw X axis */
	svg.append("g")
   .attr("class", "axis")
	  .attr("transform", "translate(0," + line_height + ")")
	  .call(xAxis)
	  .selectAll("text")
	  .attr("y", 0)
	  .attr("x", 10)
	  .attr("dy", ".35em")
	  .attr("transform", "rotate(30)")
      .style("text-anchor", "start");

    /* Define y Axis properties*/
    var y = d3.scale.log().range([line_height, 0]).nice();
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(0, ".1s");        

    var max = d3.max(globalArr, function(c) {return c.Count;});
    var min = d3.min(globalArr, function(c) {return c.Count;});
    if(min == 0)
      min = 1;
    y.domain([min, max]);
    /* Draw Y axis */
    svg.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")     
      .attr("y", 0 - line_margin.left+10)
      .attr("x",0 - (line_height/2 ))
      .attr("dy", "2em")    
      .style("text-anchor", "middle")
      .text(yAxisLabel);

    // Add a scale for bubble size
    var z = d3.scale.linear()
      .domain([min, max])
      .range([ 4, 40]);      
      
   

  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3.select("#"+divName)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "gray")
      .style("border-radius", "5px")
      .style("padding", "2px")
      .style("color", "white")

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .html(d.Time+": "+valLabels[d.Name]+" ("+d.Count+")")
      .style("left", 2*(d3.mouse(this)[0]+35) + "px")
      .style("top", 2*(d3.mouse(this)[1]+35) + "px")
  }
  var moveTooltip = function(d) {
    tooltip
      .style("left", 2*(d3.mouse(this)[0]+35) + "px")
      .style("top", 2*(d3.mouse(this)[1]+35) + "px")
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }


  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  var highlight = function(d){
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered    
    console.log("++++++"+d+"+++++++");
    d3.selectAll("."+d.replace("|", "")).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function(d){
    d3.selectAll(".bubbles").style("opacity", 1)
  }

  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(globalArr)
    .enter()
    .append("circle")
    .attr("class", function(d) {return "bubbles " + d.Name.replace("|", "") })
 //   .attr("class", function(d) {return "bubbles " + d.Name })
    .attr("cx", function (d) {return x(d.Time); })
    .attr("cy", function (d) {return y(d.Count); } )
    .attr("r", 3 )
 
  //    .attr("r", function (d) { return z(d.Count); } )
      .style("fill", function (d) { return myColor[d.Name]; } )
    // -3- Trigger the functions for hover
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )

    // ---------------------------//
    //       LEGEND              //
    // ---------------------------//

    // Add legend: circles
   

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
      .data(classes)
      .enter()
      .append("circle")
        .attr("cx", function(d,i){ return 10 + i*(size+100)})
        .attr("cy", 250) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return myColor[d]})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add labels beside legend dots
    svg.selectAll("mylabels")
      .data(classes)
      .enter()
      .append("text")
        .attr("x", function(d,i){ return i * (size + 100) + 30})
        .attr("y", 250) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return myColor[d]})
        .text(function(d){ return valLabels[d]})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);
 


}

/******************************************************************/


function generateLineChart(data_values, divName, yAxisLabel, title)
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
   .attr("viewBox", "0 0 500 500")//class to make it responsive
   .classed("svg-content-responsive", true)
   .append("g")
   .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")"); 

   /* Get Data for Line Chart */
	var globalArr = data_values.data;
	var date = data_values.date;
   
    /* Define X Axis properties*/
    var parseDate = d3.time.format("%Y%m%d.%H");
    var x = d3.time.scale().range([0, line_width-30]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%Y%m%d%H"));
	x.domain(d3.extent(date, function(d) { return d; }));
 
 /* Draw Title  */
  svg.append("text")
        .attr("x", 150)             
        .attr("y", -15 )
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
//        .style("text-decoration", "underline")  
        .text(title);
 /* Draw Footer  */
 svg.append("text")
        .attr("x", -30)             
        .attr("y", 300 )
        .style("font-size", "8px") 
        .text('NIST RPKI Monitor '+time_str);
 
	/* Draw X axis */
	svg.append("g")
   .attr("class", "axis")
	  .attr("transform", "translate(0," + line_height + ")")
	  .call(xAxis)
	  .selectAll("text")
	  .attr("y", 0)
	  .attr("x", 10)
	  .attr("dy", ".35em")
	  .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    /* Define y Axis properties*/
//    var y = d3.scale.log().range([line_height, 0]).base(2).clamp(true).nice(); 
    var y = d3.scale.log().range([line_height, 0]).nice();
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(0, ".1s");

/*  ------------ ADD LEGEND ----------------- */

    legend_width = line_width * 0.9;
    var dataL= 15, offset = 110, y2= line_height * 1.3;
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
            .attr("x", 15)
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
    .attr("y", 0 - line_margin.left+10)
    .attr("x",0 - (line_height/2 ))
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
		 .attr("d", function(d) { return line(d.data);	})
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
	  	  .attr('width', line_width-30) // can't catch mouse events on a g element
	  	  .attr('height', line_height)
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
							var d = "M" + mouse[0] + "," + line_height;
								d += " " + mouse[0] + "," + 0;
							return d;
		  		});

				d3.selectAll(".mouse-per-line")
	  			  .attr("transform", function(d, i) {
						var xDate = x.invert(mouse[0]),
						bisect = d3.bisector(function(d) {  return d.Time; }).right;
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
		//  				  .text(d.name+" : "+y.invert(pos.y).toFixed(0)+"("+parseDate(xDate)+")") .attr("class", "axis");
                   .text(y.invert(pos.y).toFixed(0)+" ("+parseDate(xDate)+")") .attr("class", "axis").style("font-size", "8px");
					return "translate(" + mouse[0] + "," + pos.y +")";
	  			});
  			});	

}


