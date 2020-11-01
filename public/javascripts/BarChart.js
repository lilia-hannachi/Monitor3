var line_margin = {top: 35, right: 100, bottom: 10,left: 70};

var line_width2 = line_width / 2;
var line_height2 = line_height /2;

var barColor = {"Invalid":"#FF0000", "Not-Found":"#FFFF00", "Valid":"#7CFC00"};
var c20 = d3.scale.category20();
/*
function add_footer(charts, title_param, margenLeft)
{
  var  position_x = -60;
  var position_y = 255;
  position_x = bold_text(charts, position_x, position_y, 'NIST RPKI Monitor:', 10);
  position_x = regular_text(charts, position_x, position_y, title_param.title, 60);
  position_x = bold_text(charts, position_x, position_y, 'Version:', 95);
  position_x = regular_text(charts, position_x, position_y, title_param.version, 25);
  position_x = bold_text(charts, position_x, position_y, 'Collector:', 30);
  position_x = regular_text(charts, position_x, position_y, title_param.col, 30);
  position_x = bold_text(charts, position_x, position_y, 'RIR:', 27);
  position_x = regular_text(charts, position_x, position_y, title_param.rir, 15);
  position_x = bold_text(charts, position_x, position_y, 'Date:', 25);
  position_x = regular_text(charts, position_x, position_y, title_param.time, 20);
}
*/

function generateBarChart(margenLeft, data, divName, label, title, axes, title_param)
{
  d3.select("#"+divName).select("div").remove();	
	var y_orig; //to store original y-posn
	
  if(data.length >0)
  { 
        var svg = d3.select("#"+divName)
               .append("div")
               .classed("svg-container", true) //container class to make it responsive
               .append("svg")
	       .attr('id', divName+"s")
               //responsive SVG needs these 2 attributes and no width and height attr
               .attr("preserveAspectRatio", "xMinYMin meet")
               .attr("viewBox", "0 0 600 320")//class to make it responsive
               .classed("svg-content-responsive", true)
               .append("g")
               .attr("transform", "translate(" + margenLeft + "," + line_margin.top + ")"); 
               
        /* Draw Title  */
        svg.append("text")
              .attr("x", line_width2 -margenLeft + 30)             
              .attr("y", -20 )
	      .attr("text-anchor", "middle")
              .style("font-size", "14px") 
              .text(title);
         /* Draw Footer  */
//  	add_footer(svg, title_param, margenLeft);    

var  position_x = -margenLeft;
  var position_y = 255;
  position_x = bold_text(svg, position_x, position_y, 'NIST RPKI Monitor:', 10);
  position_x = regular_text(svg, position_x, position_y, title_param.title, 60);
  position_x = bold_text(svg, position_x, position_y, 'Version:', 95);
  position_x = regular_text(svg, position_x, position_y, title_param.version, 25);
  position_x = bold_text(svg, position_x, position_y, 'Collector:', 30);
  position_x = regular_text(svg, position_x, position_y, title_param.col, 30);
  position_x = bold_text(svg, position_x, position_y, 'RIR:', 27);
  position_x = regular_text(svg, position_x, position_y, title_param.rir, 15);
  position_x = bold_text(svg, position_x, position_y, 'Date:', 25);
  position_x = regular_text(svg, position_x, position_y, title_param.time, 20);


        var width_x = line_width - line_margin.right/2 - margenLeft;
	var x = d3.scale.linear().range([0, width_x]).domain([0, d3.max(data, function (d) {return d.total;})]).nice();

	//  .attr("transform", "translate(" + line_margin.left + "," + line_margin.top + ")");
	  var xAxis = d3.svg.axis().scale(x).orient("top");  
        var gx = svg.append("g").attr("class", "axis").attr("transform", "translate(0,15)").call(xAxis)
	  .selectAll("text")
	  .style("font-size", "8px")
	  .style("text-anchor", "end");



	svg.append("text")
        .attr("y", -22)
        .attr("x", 200)
        .attr("dy", "2em")
        .style("text-anchor", "middle")
	.style("font-weight", "bold")
        .text(axes.labelX);

        //make y axis to show bar names
	var y = d3.scale.ordinal().rangeRoundBands([line_height2 + 50, 15], .1)
                  .domain(data.map(function (d) { return d.name; }));
        var yAxis = d3.svg.axis().scale(y).tickFormat(function(d) {return (d.length > 31 ? d.substring(0, 31) : d)}).orient("left");

	var y_labels_pos_x = -margenLeft+10;  
	if(axes.labelY != "")
		y_labels_pos_x += 15;
	  var gy = svg.append("g").attr("class", "axis").attr("transform", "translate(0, 0)").call(yAxis)
	.selectAll("text")
	.attr("y", 0)
        .attr("x", y_labels_pos_x)  
	.attr("dy", ".9em")  
	.style("font-size", "8px")
	.style("text-anchor", "start");

	svg.append("text")
        .attr("transform", "rotate(-90)")
    	.attr("y", 0 - margenLeft)
    	.attr("x",0 - line_height2 + 50 )
    	.attr("dy", "2em")
    	.style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(axes.labelY);
      	
						
	var rects = {};
			
        var bars = svg.selectAll(".bar").data(data).enter().append("g")
			
    		bars.selectAll("rect")
            .data(function(d) {
    			      return d.count; 
    		    })
    		    .enter().append("rect")
    		    .attr("width", function (d) {
			    return x(d.y1-d.y0);
			    })
	  .attr("y", function(d) {  return y(d.mytime)+3;})
  		   //   .attr("y", function(d) {  return y(d.mytime)+3;})
    		    .attr("x",function(d) { //add to stock code
			    return x(d.y0);
    			    })
    		    .attr("height", y.rangeBand())
    		    .attr("class", function(d) {
    			    classLabel = d.name; //remove spaces
    			    return "class" + classLabel;
    		      })
    		    .style("fill", function(d) {
					var color;
    					(label == "N" ? color = "#66b3cc" : (barColor[d.name] != undefined ? color =  barColor[d.name] : color = c20(d.name)));
					rects[d.name] = color;
    					return color;  
    				 });
    		  
    		bars.selectAll("rect")
    		   .on("mouseover", function(d){
    		   
    			  var delta = d.y1 - d.y0;
    			  var xPos = parseFloat(d3.select(this).attr("x"));
    			  var yPos = parseFloat(d3.select(this).attr("y"));
    			  var height = parseFloat(d3.select(this).attr("height"))
    
    			  d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);
    
    			  svg.append("text")
    			  .attr("x",xPos)
    			  .attr("y",yPos+1+height/2)
			  .style("font-size", "8px")
    			  .attr("class","tooltip1")
    			  .text(function(){ 
    				return d.name +": "+ delta ; 
    			  });
    		   })
    		   .on("mouseout",function(){
    			  svg.select(".tooltip1").remove();
    			  d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);
    									
    			}) 

	   if(axes.legendX != "")
	   {
		  /*  ------------ ADD LEGEND ----------------- */
		  var rectsObj = getData(rects);
	        legend_width = line_width * 0.7;
        	var dataL= 65, offset = 110, y2= line_height2 * 1.32;
	        var legend = svg.selectAll('.legend')
        	    .data(rectsObj)
	            .enter()
        	    .append('g')
	            .attr('class', 'legend')
        	    .attr('transform', function(d, i) {
                	if(dataL > bar_width)
	                {
        	            dataL = 15;
                	    y2 += 15;
	                }
        	        var dataLN = dataL;
			if(d.Value.length == 1)
			{
				dataL += d.Value.length + 70;
			}
			else
			{
                		dataL += d.Value.length + offset;
			}
	                return "translate("+dataLN+", "+y2+")";
        	    });

	        legend.append('rect')
        	    .attr("width", 10)
	            .attr("height", 10)
        	    .style('fill', function(d) { return d.Color;});

	        legend.append('text')
        	    .attr("x", 20)
	            .attr("y", 10)
        	    .text(function(d) { return d.Value; });


	  } 
    		return true;
	}
	else
	{
		return false;
	}					
}

function getData(rects)
{
	var result = [];
	var i=0;
	for(var key in rects)
	{
		result[i] = {"Value": key, "Color":rects[key]};
		i++;
	}
	return result;
}
	
	
	
	
