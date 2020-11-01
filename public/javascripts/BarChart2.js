var valLabels = {"Total":"Total", "NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-Set"};
var barColor = {"Invalid":"#FF0000", "Not-Found":"#FFFF00", "Valid":"#7CFC00", "V|I":"#FF0000", "V|NF":"#FFFF00", "I|V":"#7CFC00", "I|NF":"#F08080", "NF|I":"#800000", "NF|V":"#663399"};
var c20 = d3.scale.category20();

function generateBarChart(margenLeft, data, divName, label, title, axes)
{
  d3.select("#"+divName).select("div").remove();	
	var y_orig; //to store original y-posn
	
  if(data.length >0)
  { 
    	  //sort bars based on value
      /*  data = data.sort(function (a, b) {
            return d3.ascending(a.total, b.total);
        });*/
        
        data = data.sort(function (a, b) {
            if ( a.total < b.total ){
              return -1;
            }
            if ( a.total > b.total ){
              return 1;
            }
            if(a.total = b.total){
              if(a < b)
              {
                return 1;
              }
              else
              {
                return -1;
              }
            }
            return 0;
        });
           
        var svg = d3.select("#"+divName)
               .append("div")
               .classed("svg-container", true) //container class to make it responsive
               .append("svg")
	       .attr('id', divName+"s")
               //responsive SVG needs these 2 attributes and no width and height attr
               .attr("preserveAspectRatio", "xMinYMin meet")
               .attr("viewBox", "-50 0 700 700")//class to make it responsive
               .classed("svg-content-responsive", true)
               .append("g")
               .attr("transform", "translate(" + margenLeft + "," + bar_margin.top + ")"); 
               
               
        /* Draw Title  */
        svg.append("text")
              .attr("x", 50-margenLeft)             
              .attr("y", -55 )
              .style("font-size", "14px") 
              .text(title);
         /* Draw Footer  */
         svg.append("text")
                .attr("x", 10-margenLeft)             
                .attr("y", 390 )
                .style("font-size", "10px") 
                .text('NIST RPKI Monitor '+time_str);   
                    
        var width_x = bar_width-bar_margin.right - margenLeft;
        var x = d3.scale.log().clamp(true).range([0, width_x]).domain([1, d3.max(data, function (d) {return d.total;})]).base(2).nice();
        var xAxis = d3.svg.axis().scale(x).orient("top").tickFormat(d3.format(".1s"));
        var gx = svg.append("g").attr("class", "axis").call(xAxis)
	.append("text")
        .attr("y", -40)
        .attr("x", 250-margenLeft)
        .attr("dy", "2em")
        .style("text-anchor", "middle")
	.style("font-weight", "bold")
        .text(axes.labelX);

        //make y axis to show bar names
        var yAxis_height = (axes.legendX == "" ? bar_height : bar_height-50);
      	var y = d3.scale.ordinal().rangeRoundBands([yAxis_height, 0], .1)
                  .domain(data.map(function (d) {
      			          return d.name;
      		      }));
        var yAxis = d3.svg.axis().scale(y).tickSize("0").orient("left");
        var gy = svg.append("g").attr("class", "axis").call(yAxis)
	.append("text")
        .attr("transform", "rotate(-90)")
    	.attr("y", 0 - margenLeft)
    	.attr("x",0 - (bar_height/2 ))
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
    		    .attr("width", function (d) {return x(d.y0+d.y1)- (d.y0==0 ? 0 : x(d.y0));})
  		      .attr("y", function(d) {  return y(d.mytime)})
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
    			  .attr("y",yPos +height/2)
    			  .attr("class","tooltip1")
    			  .text(function(){ 
    				return valLabels[d.name] +": "+ delta ; 
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
	        legend_width = bar_width * 0.9;
        	var dataL= 15, offset = 100, y2= bar_height * 0.94;
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
                	dataL += d.Value.length + offset;
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
	
	
	
	
