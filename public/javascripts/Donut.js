var color = {"Valid":"#00C851", "Not-Found":"#ffff66", "Invalid":"#CC0000", "Invalid:AS":"#F08080", "Invalid:ML":"#663399", "invalid:AS-ML":"#800000", "Not-Found:AS-SET":"#cdd62b", "Invalid:AS-Set":"#D3D3D3", "Valid|Invalid":"#FF0000", "Valid|Not-Found":"#FFFF00", "Invalid|Valid":"#7CFC00", "Invalid|Not-Found":"#F08080", "Not-Found|Invalid":"#800000", "Not-Found|Valid":"#663399"};

var donut_width2 = donut_width /2;

function generateDonut(dataset, divName, title, title_param)
{
	if(dataset[0].total == 0)
	{
		document.getElementById("footer_"+divName).style.display = "none";
		d3.select("#"+divName).select('div').remove();
		document.getElementById(divName).innerHTML = "<div> <h3> "+title+"  </h3></div>";
	}
	else
	{
		generateDonut1(dataset, divName, title, title_param);
	}
}

function generateDonut1(dataset, divName, title, title_param)
{
      d3.select("#"+divName).select('div').remove();
      /* Define SVG properties */
      var charts = d3.select("#"+divName)
                   .append("div")
                   .classed("svg-container", true) /* container class to make it responsive */
                   .append("svg")
                   .attr('id', divName+"s")
                  /* responsive SVG needs these 2 attributes and no width and height attr */
                   .attr("preserveAspectRatio", "xMinYMin meet")
                   .attr("viewBox", "0 0 600 320") /* class to make it responsive */
                   .classed("svg-content-responsive", true);      

      var chart_m = donut_width2 / dataset.length / 2 * 0.14;
      var chart_r = donut_width2 / dataset.length / 3 * 0.85;
       
  /* Draw Title  */
  charts.append("text")
        .attr("x", donut_width2-50)             
        .attr("y", 15 )
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .text(title);

  var position_x = 10;
  var position_y = 280;	
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

       
  /*  ------------ ADD LEGEND ----------------- */

	legend_width = donut_width * 0.7; 
  var space = 100;
	var dataL= space, offset = 115, y=donut_height * 0.66;
  var total = dataset[0].total;
 	var legend = charts.selectAll('.legend')
        	.data(dataset[0].data)
	        .enter()
        	.append('g')
	        .attr('class', 'legend')
        	.attr('transform', function(d, i) {
      		    if(dataL > legend_width) 
		          { 
          			dataL = space;
        	  		y += 15;
     		      }
	              var dataLN = dataL;
          	    dataL += d.value.length + offset;
	              return "translate("+dataLN+", "+y+")"; 
        	  });
  legend.append('rect').attr("width", 10).attr("height", 10).style('fill', function(d) {return color[d.value];});
  legend.append('text').attr("x", 20).attr("y", 10).text(function(d) { return d.value+":"+d.count.toLocaleString(); });
         
  var donut = charts.selectAll('.donut').data(dataset).enter().append('svg:svg').attr('width', donut_width2 + 160).attr('height', donut_height)
                    .append('svg:g').attr('class', function(d, i) {return 'donut type' + i;}).attr('transform', 'translate(' + (chart_r+chart_m + 160) + ',' + (chart_r+chart_m) + ')');
                    
  /*  Create the center of the donut  */      
  var createCenter = function(pie) 
  {
        /* Define the list of events associated with Center of Donut Chart      */
        var eventObj = {
                'mouseover': function(d, i) {
                        d3.select(this).transition().attr("r", chart_r * 0.65);
                },
                'mouseout': function(d, i) {
                        d3.select(this).transition().duration(500).ease('bounce').attr("r", chart_r * 0.6);
                },
                'click': function(d, i) {
                        pathAnim(paths, 0);
                        resetAllCenterText();
                }
        }
        var donuts = charts.selectAll('.donut');
        /* The circle displaying total data. */
        donuts.append("svg:circle").attr("r", chart_r * 0.6).style("fill", "#E7E7E7").on(eventObj);

        /*  Define the chosen data that will be displayed in the circle */
        donuts.append('text').attr('class', 'center-txt type').attr('y', chart_r * -0.16).attr('text-anchor', 'middle').style('font-weight', 'bold').style('font-size', 12).text(function(d, i) {return d.type;});
        donuts.append('text').attr('class', 'center-txt value').style('font-weight', 'bold').style('font-size', 12).attr('text-anchor', 'middle').text(function(d) {return d.total.toLocaleString();});
        donuts.append('text').attr('class', 'center-txt percentage').attr('y', chart_r * 0.16).attr('text-anchor', 'middle').style('font-size', 12).style('font-weight', 'bold').style('fill', '#A2A2A2').text('100%');

  }
  createCenter();
      
  /* Set the defaut displayed values in the center as (Total of categories, "") */
  var resetAllCenterText = function() {
              charts.selectAll('.type').text(function(d, i) {return d.type;});
              charts.selectAll('.value').text(function(d) {return d.total;});
              charts.selectAll('.percentage').text('100%');
  }
           
  /*  Create the Donut  */      
  var createDonut = function() 
  {   
      var small_portion = [];              
      var pie = d3.layout.pie().startAngle(-90 * Math.PI/180).endAngle(-90 * Math.PI/180 + 2*Math.PI).sort(null).value(function(d) { return d.count;});
      var arc = d3.svg.arc().innerRadius(chart_r * 0.7).outerRadius(chart_r);

      /* Start joining data with paths */
      var paths = charts.selectAll('.donut').selectAll('path').data(function(d, i) {return pie(d.data);}).enter().append("path").attr("id", function(d, i){return d.data.value + i + divName;})
                        .style("fill", function(d) { return color[d.data.value];}).style('stroke', '#FFFFFF');

      paths.transition().duration(1000).attrTween('d', function(d) 
          {
        		this._current = this._current || d;
        		var interpolate = d3.interpolate(this._current, d);
  	    		this._current = interpolate(0);
      			return function(t) {return arc(interpolate(t));};
          });
      /* Text inside arcs  */             
      charts.selectAll('.donut').selectAll(".monthText")
            .data(function(d, i) { return pie(d.data);})
            .enter().append("text").style("font-size", "10px").attr("x", 10).attr("dy", 20).append("textPath")
            .attr("xlink:href", function(d, i){ return "#"+ d.data.value + i + divName; })
            .text( function(d) {    
                var size = d.endAngle-d.startAngle;
                if((size < 0.8) || (size < 1.3 && d.data.value.length > 13))
                {
                  if(size != 0)
                  {
                    small_portion.push(d.data.value);
                  }
                }
                else
                {return d.data.value + ": "+ (d.data.count / total*100).toFixed(1) + ' %';}

             }) ;
           
      /* List of EVENTS for ARCS in the Donut */                  
      /* MouseOver Event */
      	paths.on("mouseover", function(d, i, j){
              pathAnim(d3.select(this), 1);
              var thisDonut = charts.select('.type' + j);
              thisDonut.select('.value').text(function(donut_d) { return d.data.value+" : "+d.data.count ;});
              thisDonut.select('.percentage').text(function(donut_d) { return (d.data.count/donut_d.total*100).toFixed(2) + '%';});
       });
               
       var setCenterText = function(thisDonut) {
                     thisDonut.select('.value').text(function(d) { return d.total ;});
                     thisDonut.select('.percentage').text('100%');
       }
       /* MouseOut Event */
     	 paths.on("mouseout", function(d, i, j){
              var thisPath = d3.select(this);
              pathAnim(thisPath, 0);
              var thisDonut = charts.select('.type' + j);
              setCenterText(thisDonut);          
       });
 
 


charts.selectAll('.donut').append("g").attr("class", "labels");
charts.selectAll('.donut').append("g").attr("class", "lines");
  var outerArc = d3.svg.arc().innerRadius(chart_r * 0.9).outerRadius(chart_r * 0.9);
  
  /* Write Labels outside the ring */
  var text = charts.selectAll('.donut').select(".labels").selectAll("text")
		.data(function(d, i) {return pie(d.data);});

	text.enter().append("text").style("font-size", 9).attr("dy", ".35em").text(function(d) {
      /*  Check the label is included in small_portion array  */
      if(! small_portion.includes(d.data.value) )
        return;
      else
			 return d.data.value + ": "+ (d.data.count / total*100).toFixed(2) + '%';
		});
	
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = chart_r * (midAngle(d2) < Math.PI ? 1 : -1);
				if(midAngle(d2) < 0)
			            pos[0] = -pos[0];	
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				if(midAngle(d2) < 0)
				        return midAngle(d2) < Math.PI ? "end":"start";
			        else
			        	return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();
 
 /* ------- Draw arrows  -------*/

	var polyline = charts.selectAll('.donut').select(".lines").selectAll("polyline")
		.data(function(d, i) {return pie(d.data);});
	
	polyline.enter()
		.append("polyline")
    .attr("opacity", .4)
    .attr("stroke", "black")
	  .attr("stroke-width", "1px")
    .style("fill", "none");

	polyline.transition().duration(1000)
		.attrTween("points", function(d){
      if(! small_portion.includes(d.data.value) )
        return;
      else
      {
  			this._current = this._current || d;
  			var interpolate = d3.interpolate(this._current, d);
  			this._current = interpolate(0);
  			return function(t) {
  				var d2 = interpolate(t);
  				var pos = outerArc.centroid(d2);
  				pos[0] = chart_r * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				if(midAngle(d2) < 0)
            				pos[0] = -pos[0];
  				return [arc.centroid(d2), outerArc.centroid(d2), pos];
  			};
      }			
		});
	
	polyline.exit()
		.remove();
 
 
 
                     
  }      
  createDonut(); 
  
 
    
      
      
  /* Change the size of selected category of center in the donut */
  var pathAnim = function(path, dir) {
      switch(dir) {
              case 0:
                      path.transition().duration(500).ease('bounce').attr('d', d3.svg.arc().innerRadius(chart_r * 0.7).outerRadius(chart_r));
                      break;
              case 1:
                      path.transition().attr('d', d3.svg.arc().innerRadius(chart_r * 0.7).outerRadius(chart_r * 1.08));
                      break;
      }
  }
}


