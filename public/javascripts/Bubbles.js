var myColor = {"Total":"gray", "V|I":"#FF0000", "V|NF":"#FFFF00", "I|V":"#7CFC00", "I|NF":"#F08080", "NF|I":"#800000", "NF|V":"#663399"};
var valLabels = {"Total":"Total", "NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-Set"};

var line_width2 = line_width / 2;
var line_height2 = line_height /2;

var parseDate = d3.time.format("%Y%m%d.%H").parse;
var format = d3.time.format("%Y%m%d%H")

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


function sortByDateAscending(a, b) {
        if(a != null && b != null)
        {
                return a.Time - b.Time;
        }
}

function getBubble_Total(data_values, dataVal, subSelect)
{
  data_values = data_values.sort(sortByDateAscending);
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

function getBubble_chart(data_values, divName, yAxisLabel, title, title_param)
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
 
	var dates = data_values.dates;
  var classes = data_values.classes;
   
    /* Define X Axis properties*/
    var parseDate = d3.time.format("%Y%m%d.%H");
    var x = d3.time.scale().range([0, line_width-140]);
    x.domain(d3.extent(dates, function(d) { return d; }));
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(format);
 
 /* Draw Title  */
  svg.append("text")
        .attr("x", line_width2 - 50)             
        .attr("y", -15 )
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .text(title);

 /* Add Footer  */
  add_footer(svg, title_param);

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
    var y = d3.scale.log().range([line_height2, 0]).nice();
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
      .attr("y",  -50)
      .attr("x", -80)
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
      .style("background-color", "#423EA6")
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
      .style("font-size", "14px")
      .style('font-weight', 'bold')	  
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
    d3.selectAll("."+divName).style("opacity", .05)
    // expect the one that is hovered    
    d3.selectAll("."+d.replace("|", "")).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function(d){
    d3.selectAll("."+divName).style("opacity", 1)
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
    .attr("class", function(d) {return "bubbles " +divName+" "+ d.Name.replace("|", ""); })
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
        .attr("cy", line_height2 * 1.26) // where the first dot appears
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
        .attr("y", line_height2 * 1.26) // where the first dot appears
    //    .style("fill", function(d){ return myColor[d]})
        .text(function(d){ return valLabels[d]})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);
}

function validation_changes2(dubbles_data, param1, param2)
{
	var classes = new Array();
        classes.push(param1);
        classes.push(param2);
    	result = {};
    	result["data"] = dubbles_data["data"].filter(function(row) {if(row["Name"] == param1 || row["Name"] == param2) return row;});
    	result["dates"] = dubbles_data["dates"];
        result["classes"] = classes;
    	return result;
}
