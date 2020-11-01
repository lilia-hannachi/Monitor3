var labelArray = {
"Covered":"Covered", "Not-Covered":"Not-Covered",	
	"ISS":"Invalid: AS-Set", "Cv":"Covered","NFS":"Not-Found:AS-SET", "I":"Invalid", "NCv":"Not-Covered", "Same-Path":"Same-Path", "Different-Path":"Different-Path", "SP":"Same-Peer", "DP":"Different-Peer", "SO":"Same-Origin", "DO":"Different-Origin", "A":"ARIN", "R":"RIPE", "P":"APNIC", "L":"LACNIC", "F":"AFRINIC", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "Cust":"Customer", "NCust":"Not-Customer"};
var colorVal = {
"Covered":"#007E33", "Cv":"#007E33", "Not-Covered":"#CD5C5C", "Valid":"#00C851", "Not-Found":"#ffff66", "Invalid":"#CC0000", "Invalid:AS":"#F08080", "Invalid:ML":"#663399", "invalid:AS-ML":"gray","Not-Found:AS-SET":"#cdd62b", "Invalid:AS-SET":"gray", "APNIC":"#F08080", "ARIN":"#663399",    "RIPE":"#DA70D6",  "AFRINIC":"#808000", "LACNIC":"#FF4500", "Same-Path":"#32CD32", "Different-Path":"#FF69B4", "Same-Origin":"#20B2AA", "Different-Origin":"#87CEFA", "Same-Peer":"#F4A460", "Different-Peer":"pink", "Customer":"gray", "Not-Customer":"yellow"};

var config;

var donut_width2 = donut_width /2;

function generateSunBurst(version, setData, divName, legendDiv, total, title, legendY, title_param)
{

	config = {
	divId: divName,
//	width: 410,
//	height: 410,
	width: donut_width2,
	height: donut_width2,
	data: setData,
	label: function(d) {
		return labelArray[d.data["V"]] ;
	},
	colors: function(d) {
		return colorVal[labelArray[d.data["V"]]] ;
	},
	total: total,
	value: "C",
	inner: "D",
	type: "V",
	stroke: "white",
	strokeWidth: 2,
	transitionDuration: 200,
legendY:0.75		
//	legendY: legendY	
	};
	drawPie(title, title_param);			
			
}


var arcIndex = 0, svg, labels, group, radius, radiusDelta;

function drawPie(title, title_param)
{
	radius = Math.max(config.width, config.height) /2 -20;	 
	labels = new Array();
	d3.select("#"+config.divId).select("div").remove();
	svg = d3.select("#" + config.divId)
		.append("div")		
                .classed("svg-container", true) //container class to make it responsive
                .append("svg")
                .attr('id', config.divId+"s")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 600 320")//class to make it responsive
                .classed("svg-content-responsive", true);
	var widthRadius = radius + 150;
	var heightRadius = radius - 5;
	group = svg.append("g").attr("transform", "translate("+ widthRadius +", "+ heightRadius +")");
	createPieCenter();
	// to contain pie cirlce
	    
    var innerRadius = radius * 0.4;
    var outerRadius = radius * 0.5;
    radiusDelta = outerRadius - innerRadius+ 2;
    draw(config.data, innerRadius, outerRadius, -90 * Math.PI/180 , -90 * Math.PI/180 + 2*Math.PI, [0, 0], "");	
    generateLegend();
    /* Draw Title  */
    svg.append("text")
        .attr("x", donut_width2-50)
        .attr("y", 15 )
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text(title);
   /* Draw Footer  */
  var position_x = 10;
  var position_y = 290;
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
}

function generateLegend()
{
	/*  CREAT LEGEND	**/ 	
	width = donut_width * 0.8;  
	var dataL = width / labels.length-40;
	var offset = 55;
	var y = donut_height * config.legendY;
	var legend = svg.selectAll('.legend')                    
	  .data(labels)                                   
	  .enter()                                        
	  .append('g')                                    
	  .attr('class', 'legend')                        
	  .attr("transform", function (d, i) {		 			 
		 if(dataL > width) 
		 { 
			dataL = width / labels.length-40;
			y += 15;
		 }
		 var newdataL = dataL;
		 dataL +=  labelArray[d].length + offset;
		 return "translate(" + (newdataL) + ","+y+")";
		}
	);
	
	legend.append('rect')
	  .attr('width', 10) 
	  .attr('height', 10)
	  .style('fill', function(d) { return colorVal[labelArray[d]]; });             
	legend.append('text')                                     
	  .attr('x', 12)           
	  .attr('y', 7)      
	  .style("font-size", "8px")        
	  .text(function(d) { return labelArray[d]; });      
}


function createPieCenter()
{
	var title = config.title;
	var total = config.total;
	
	group.append("circle").attr("r", radius * 0.35).style("fill", "silver");
	group.append('text')
		.attr('class', 'center-txt All')
		.attr('y', radius * -0.25)
		.attr('text-anchor', 'middle')
		.style('font-weight', 'bold')
		.text("Invalids");
/*
	group.append('text')
                .attr('class', 'center-txt Title')
                .attr('y', radius * -0.15)
                .attr('text-anchor', 'middle')
                .style('font-weight', 'bold')
                .text(title);
  */              
 group.append('text')
			.attr('class', 'center-txt type')
			.attr('y', radius * -0.05)
			.style('font-weight', 'bold')
			.attr('text-anchor', 'middle')
			.text();
		
	group.append('text')
			.attr('class', 'center-txt value')
			.attr('y', radius * 0.08)
			.style('font-weight', 'bold')
			.attr('text-anchor', 'middle')
			.text(total);
			
	group.append('text')
			.attr('class', 'center-txt percentage')
			.attr('y', radius * 0.18)
			.attr('text-anchor', 'middle')
			.style('font-weight', 'bold')
			.text("100%"); 
}

/* Compute the set of displayed values (Sum and %)  */
	var setCenterText = function(group, title, total) {
    		group.select('.All').text("Invalids");
//		group.select('.Title').text(title);
    		group.select('.type').text("");
		group.select('.value').text(total);
		group.select('.percentage').text('100%');
	}

function draw(dataset, innerRadius, outerRadius, startAngle, endAngle, parentCentroid, parentStr) {
		
    if (dataset === null || dataset === undefined || dataset.length < 1) {
        return;
    }
  
    var pie = d3.layout.pie()
    .sort(null).value(function(d) {
	return d[config.value];
    });
    pie.startAngle(startAngle).endAngle(endAngle);

    /* store Label values in labels array	*/
    var values = [];
    for (var i = 0; i < dataset.length; i++) {
		if(labels.indexOf(dataset[i][config.type]) == -1)
		{
			labels.push(dataset[i][config.type]);
		}
        values.push(dataset[i][config.value]);
    }

    var sub_total = d3.sum(dataset, function(d) { return d[config.value]; });
    
    var arc = d3.svg.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius);
    //Set up groups
    arcIndex = arcIndex + 1;

    var clazz = "arc" + arcIndex;
   
var widthRadius = radius + 150; 
var heightRadius = radius - 5;
    var arcs = svg.selectAll("g." + clazz)
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc " + clazz)
	.attr("transform", "translate(" + (widthRadius) + "," + (heightRadius) + ")");
        	
	var modifOutRadius = function(part, eventType) {
		switch(eventType) {
			case 0:
				part.transition()
					.style("stroke", "gray")
					.style("strokeWidth", config.strokeWidth+5);
				break;

			case 1:
				part.transition()
					.style("stroke", config.stroke)
					.style("strokeWidth", config.strokeWidth);
				break;
		}
	}		
			
  var getTypeStr = function(strArr, str)
  {
	var result = "";
	if(strArr.length > 2)
        {
		result = (strArr[strArr.length-2] != undefined ? labelArray[strArr[strArr.length-2]]+"|" : "");
       		result += labelArray[str] ;
	}
	return result;
  } 
  
  var getAllStr = function(strArr, str)
  {
	var result;
	if(strArr.length < 2)
    	{
      		result = str;
    	}
    	else
    	{
      		result = strArr[1];
    	}  
	return labelArray[result]
  }   
      
	var eventObj = {
		'mouseover': function(d, i) {
     var strArr = parentStr.split("|");
			modifOutRadius(d3.select(this), 0);
      
      group.select('.All').text(getAllStr(strArr, d.data[config.type]));	
      
			group.select('.type').text(getTypeStr(strArr, d.data[config.type]));					
			group.select('.value').text(function() {				
					return d.value ;
			});
			group.select('.percentage').text(function() {					
						return (d.value/sub_total*100).toFixed(2) + '%' +((d.value/config.total*100) != (d.value/sub_total*100) ? " ("+ (d.value/config.total*100).toFixed(2) + '% All)' : "");
			});			
		},
		
		'mouseout': function(d, i) {
			modifOutRadius(d3.select(this), 1);
			setCenterText(group, config.title, config.total);
		}
    };
  
    //Draw arc paths
    var paths = arcs.append("path")
    		.attr("fill", config.colors)
        .attr("id", function(d){ return parentStr +"|"+ d.data[config.type];})
        .style("stroke", config.stroke)
        .style("stroke-width", config.strokeWidth)
		.on(eventObj);
    
    paths.transition()
        .duration(config.transitionDuration)
        .delay(config.transitionDuration * (arcIndex - 1))
        .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

	var outerArc = d3.svg.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1);
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}
 
	
	/* ------- Write Labels in Arcs -------*/
	var getInLabels = function()
	{
		var texts = arcs.append("text")
    .style("font-size", "8px")
    .style("font-weight", "bold")
    .attr("x", 3)   //Move the text from the start angle of the arc
    .attr("dy", 12) //Move the text down
    .append("textPath")

    .attr("startOffset",
	function(d,i) {
		return (d.startAngle > 90 * Math.PI/180 ? "55%" : "0%");
	})

	.attr("xlink:href", function(d){ return "#"+ parentStr +"|"+ d.data[config.type]; })
	.text(function(d) {  
            var size = d.endAngle-d.startAngle;  
            if(size < 0.77)
            {
		if(size > 0.29)
		{
			return (d.data[config.value] / sub_total*100).toFixed(1) + '%';
		}
		else
		{
              		if(size > 0.22)
              		{
                		return (d.data[config.value] / sub_total*100).toFixed(1);
              		}
		}
            }
            else
            {
                 return config.label(d) + "\t"+ (d.data[config.value] / sub_total*100).toFixed(1) + '%';    
            }
         }) ;
	}

	
	//labels
	getInLabels();
    for (var j = 0; j < dataset.length; j++){ 
        if (dataset[j][config.inner] !== undefined) {
		// Draw Sub-arcs
       		draw(dataset[j][config.inner], innerRadius + radiusDelta, outerRadius + radiusDelta, paths.data()[j].startAngle, paths.data()[j].endAngle, arc.centroid(paths.data()[j]), parentStr +"|"+dataset[j][config.type]+"|");
        }
    }
};
