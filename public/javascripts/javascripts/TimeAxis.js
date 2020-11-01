var legendV = ["V", "IS", "IM", "ISM", "NF", "NFS", "ISS"];
//var colorV = d3.scale.ordinal().domain(legendV).range(["green", "#663399", "gray", "red", "yellow", "#4d4d00", "#D3D3D3"]);
var colorV = d3.scale.ordinal().domain(legendV).range(["green", "red", "red", "red", "yellow", "yellow", "red"]);
var validationV = {"V":"Valid", "IS":"Invalid:AS", "NF":"Not-Found", "IM":"Invalid:ML", "ISM":"Invalid:AS-ML", "NFS":"Not_Found:AS-Set", "ISS":"Invalid:AS-Set"};

var divName = "div_Chart"; 

var timeDiff = 6 * 60 * 60 * 1000;
function longDates(listVal, idx)
{
	for(var i = 0; i<listVal.length; i++)
	{
		var str = listVal[i].T;
		var time2 = new Date(str.substring(0,4)+"-"+str.substring(4,6)+"-"+str.substring(6,8)+"T"+str.substring(9,11)+":00:00");
		var time1 = new Date();
		time1.setTime(time2.getTime() - timeDiff);
		listVal[i].B = time1.getTime();
		listVal[i].E = time2.getTime();
		listVal[i].lane = idx;
	}
}

function createChart(data)
{
	var lanes = [];	
	var items = new Array();

	var itemList = d3.nest().key(function(d) { return d.O=="00" ? d.Pr : d.Pr+"("+d.O+")"; }).entries(data);
	for(var i = 0; i<itemList.length; i++)
	{
		var prefix = itemList[i].key;
		lanes.push(prefix);

		longDates(itemList[i].values, i);
		var values = itemList[i].values.sort(function(obj1, obj2) {
			return obj1.B - obj2.B;
		});

		var valLists = overlapData(values);

		for(var j=0; j<valLists.length; j++)
		{
			items.push(valLists[j]);
		}
	}

	var valList = items.sort(function(obj1, obj2) {
			return obj1.B - obj2.B;
		});
	var laneLength = lanes.length;

//	createLegend();

	var orient = "bottom",
    tickFormat = { format: d3.time.format("%Y-%m-%d:%H"),
      tickTime: d3.time.hours,
      tickInterval: 1,
      tickSize: 3
    }
    beginning = valList[0].B,
	ending = valList[valList.length-1].E;

	var m = [0, 30, 20, 210], //top right bottom left
//	w = 960 - m[1] - m[3],
	w=700,
	h = 400 - m[0] - m[2],
	miniHeight = laneLength * 13 + 50,
	mainHeight = h - miniHeight - 120;

	var chart = d3.select("#"+divName)
		    .append("div")
                    .classed("svg-container", true)
		    .style("padding-bottom", "41%")
		    .append("svg")
                    .attr("preserveAspectRatio", "xMinYMin meet")
   		    .attr("viewBox", "0 0 950 700")
		    .classed("svg-content-responsive", true)
		//			.attr("width", w + m[1] + m[3])
		//			.attr("height", h + m[0] + m[2])
		;

	//scales
	var x1 = d3.time.scale()
			.domain([beginning, ending])
			.range([0, w]);

	var x2 = d3.time.scale()
			.range([0, w]);

	var y1 = d3.scale.linear()
			.domain([0, laneLength])
			.range([0, mainHeight-30]);
	var y2 = d3.scale.linear()
			.domain([0, laneLength])
			.range([0, miniHeight]);
	
	var xAxis1 = d3.svg.axis()
		        .scale(x1)
		        .orient(orient)
		        .tickFormat(tickFormat.format)
		        .tickSize(tickFormat.tickSize);
	
	var xAxis2 = d3.svg.axis()
		        .scale(x2)
		        .orient(orient)
		        .tickFormat(d3.time.format("%m-%d:%H"))
		        .tickSize(tickFormat.tickSize);	

	chart.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", w)
		.attr("height", mainHeight);

	var mini = chart.append("g")
			.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
			.attr("width", w)
			.attr("height", miniHeight)
			.attr("class", "mini");

	var main = chart.append("g")
			.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
			.attr("width", w)
			.attr("height", mainHeight)
			.attr("class", "main");

	var appendTimeAxis = function(g, xAxis, yPosition, classN) {
	    var axis = g.append("g")
	        .attr("class", classN)
	        .attr("transform", "translate(" + 0 + "," + yPosition + ")")
	        .call(xAxis);
	    if(classN=="x1 axis")
	    {
	    	axis.selectAll("text")
		    .attr("y", 0)
		    .attr("x", 9)
		    .attr("dy", ".35em")
		    .attr("transform", "rotate(90)")
		    .attr("stroke", "black")
		    .style("text-anchor", "start");
	    }
    };

	appendTimeAxis(mini, xAxis1, miniHeight+10, "x1 axis");
	appendTimeAxis(main, xAxis2, mainHeight-20, "x2 axis");

	//mini lanes
	mini.append("g").selectAll(".laneLines")
		.data(valList)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1",  d => y2(d.lane))
		.attr("x2", w)
		.attr("y2", d => y2(d.lane))
		.attr("stroke", "lightgray");

	//main lanes
	main.append("g").selectAll(".laneLines")
		.data(valList)
		.enter().append("line")
		.attr("x1", m[1])
		.attr("y1", function(d) {return y1(d.lane) })
		.attr("x2", w)
		.attr("y2", function(d) {return y1(d.lane) })
		.attr("stroke", "lightgray");

	//mini texts
	mini.append("g").selectAll(".mini_labels")
		.data(lanes)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y2(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		.attr("class", "axis");
	
	//main texts
	main.append("g").selectAll(".main_labels")
		.data(lanes)
		.enter().append("text")
		.text(function(d) {return d;})
		.attr("x", -m[1])
		.attr("y", function(d, i) {return y1(i + .5);})
		.attr("dy", ".5ex")
		.attr("text-anchor", "end")
		.attr("class", "axis");
	
	var itemRects = main.append("g").attr("clip-path", "url(#clip)");	

	//mini item rects
	mini.append("g").selectAll("miniItems")
		.data(valList)
		.enter().append("rect")
		.attr("class", function(d) { return "miniItem"+d.lane})
		.attr("x", function(d) { return x1(d.B);})
		.attr("y", function(d) { return y2(d.lane+.5) - 7 })
		.attr("width", function(d) {return x1(d.E) - x1(d.B);})
		.attr("height", 16)
		.style("fill", function(d){
          return colorV(d.V);
        });

	//brush
	var brush = d3.svg.brush().x(x1).on("brush", display);

	mini.append("g")
		.attr("class", "brush")
		.call(brush)
		.selectAll("rect")
		.attr("y", 1)
		.attr("height", miniHeight -1);

	//display();

	function display() {
		document.getElementById("ROA").style.display = "none";
		var rects, labels,
			minExtent = brush.empty() ? x2.domain()[0] : brush.extent()[0],
			maxExtent = brush.empty() ? x2.domain()[1] : brush.extent()[1],
			visItems = valList.filter(function(d) {return d.B < maxExtent && d.E > minExtent;});
		
		if (!brush.empty()) {
				mini.select(".brush")
					.call(brush.extent([minExtent, maxExtent]))
		}
		
		x2.domain([minExtent, maxExtent]);
		main.select(".x2.axis").call(xAxis2);

		var coor = [];
		for(var j=0; j<lanes.length; j++)
		{
			coor[j] = [];
		}


		//update main item rects
		rects = itemRects.selectAll("rect")
		        .data(visItems, function(d) { 
		        	var index = coor[d.lane].findIndex(x => x.B==d.B)
				if (index === -1){
    					coor[d.lane].push({"B":d.B, "E":d.E, "V":d.V, "R":d.ROA});
				}
				return validationV[d.V]+"-"+d.lane+"-"+d.E;
				})
				.attr("x",  function(d) {return x2(d.B);})
				.attr("width", function(d) { return x2(d.E) - x2(d.B);}).on("click", function (d) { 
		        	getRoas(lanes[d.lane],coor[d.lane]);
		        });
		
		rects.enter().append("rect")
			.attr("class", function(d) { return "miniItem"+d.lane;} ) 
			.attr("x", function(d) {return x2(d.B);})
			.attr("y", function(d) {return y1(d.lane) + 5})
			.attr("width", function(d) {return x2(d.E) - x2(d.B);})
			.attr("height", function(d) {return .8 * y1(1);})
			.style("fill", function(d){
	          return colorV(d.V);
	        });	        

		rects.exit().remove();

		//update the item labels
		labels = itemRects.selectAll("text")
			.data(visItems, function (d) { return validationV[d.V]+"-"+d.lane+"-"+d.E; })					
			.attr("x", function(d) {return x2(Math.max(d.B, minExtent));});

		labels.enter().append("text")
			.text(function(d) {return validationV[d.V];})
			.attr("x", function(d) {return x2(Math.max(d.B, minExtent));})
			.attr("y", function(d) {return y1(d.lane + .5)+5; } )
			.attr("text-anchor", "start");

		labels.exit().remove();
	}

}

function getRoas(prefixO, coor)
{
	var global_Div="ROA", divName="div_ROA", roa_title="ROA_title"; 
	var coord = coor.sort(function(obj1, obj2) {
			return obj1.B - obj2.B;
	});
	var begin = coord[0].B,
	end = coord[coord.length-1].E;

	d3.select("#"+divName).selectAll('table').remove();
	document.getElementById(global_Div).style.display = "block";
	var div = d3.select("#"+divName);

	var parts = prefixO.split("(");
	parts[1] = parts[1].replace(')', '');
	var prParts = parts[0].split("/");
	document.getElementById(roa_title).innerHTML = "ROAs for Prefix  <B>"+parts[0]+"</B>  Originated from  <B>"+parts[1]+"</B>";
	var table = "<table class='table'><thead class='thead-dark'><tr><B><td></td><th>Origin</th><th>Prefix</th><th>Max Length</th><th>Time</th></B></tr></thead> <tbody>";

	for(var j=0; j<coord.length; j++)
	{
		if(coord[j].V != "NF" && coord[j].V != "NFS")
		{
			
			var roa = d3.nest().key(function(d) { return d.Pr+" "+d.O+" "+d.ML; }).entries(coord[j].R);

			var trArr = new Array();
			for(var k = 0; k<roa.length; k++)
			{
				longDates(roa[k].values, k);
				var roaV = roa[k].values.sort(function(obj1, obj2) {
					return obj1.B - obj2.B;
				});

				var roaValues = overlapData2(roaV);
				for(var i =0; i<roaValues.length; i++)
				{
					var td1 = ((roaValues[i].O == parts[1]) ? "btn-success" : "btn-danger");
					var td2 = ((prParts[1] <= roaValues[i].ML) ? "btn-success" : "btn-danger");
					trArr.push("<td><button style='padding:0.5rem;' type='button' class='btn btn-rounded "+td1+"'><strong style='color:black;'>"+roaValues[i].O+'</strong></button></td><td><button style="padding:0.5rem;" type="button" class="btn btn-rounded btn-success "><a href="/ROAs/'+roaValues[i].T.substring(0,11)+'/'+roaValues[i].F+'"><strong style="color:black;">'+roaValues[i].Pr+"</strong></a></button></td><td><button style='padding:0.5rem;' type='button' class='btn btn-rounded "+td2+"'><strong style='color:black;'>"+roaValues[i].ML+"</strong></button></td><td style='font-weight:bold;'>"+getdates(roaValues[i].B, roaValues[i].E)+"</td>");
				}
			}
			table += "<tr><td rowspan="+trArr.length+" bgcolor='"+ colorV(coord[j].V)+"' style='font-weight:bold;color:white;'>"+validationV[coord[j].V]+"</td>"+trArr[0]+"</tr>";
			for(var l=1; l<trArr.length; l++)
			{
				table += "<tr>"+trArr[l]+"</tr>";
			}
		}
		else
		{
			table += "<tr><td bgcolor='"+colorV(coord[j].V)+"' style='font-weight:bold;color:white;'>"+validationV[coord[j].V]+"</td><td> - </td><td> - </td><td> - </td><td style='font-weight:bold;'>"+getdates(coord[j].B, coord[j].E)+"</td></tr>";
		}
		
	}
	table += "</tbody></table>";	
	div.html(table);	
}

function getdates(begin, end)
{
	var str1 = getDate(begin, 1);
	var str2 = getDate(end, 0);
	if(str1 == str2)
	{
		return str1; 
	}
	else
	{
		return str1 +" - "+ str2; 
	}
}

function getDate(millsecond, type)
{
	if(type == 1)
	{
		millsecond += 1*60000
	}
	var time = new Date(millsecond);
	var month = time.getMonth() + 1;
	return time.getFullYear()+"/"+month+"/"+time.getDate()+":"+time.getHours();
}

function getTime(time, begin, end)
{
	var result = false;	
	var time2 = new Date(time.substring(0,4)+"-"+time.substring(4,6)+"-"+time.substring(6,8)+"T"+time.substring(9,11)+":00:00");
	var time1 = new Date();
	time1.setTime(time2.getTime() - timeDiff);
	if(time1.getTime() <= begin && time2.getTime() >= begin)
	{
		return true;
	}
	if(time1.getTime() >= begin && time2.getTime() <= end)
	{
		return true;
	}
	if(time1.getTime() <= end && time2.getTime() >= end)
	{
		return true;
	}
	return result;
}

function createLegend()
{
	var legendVals = ["Not-Found:AS-Set", "Invalid:AS-Set", "Invalid:AS", "Invalid:ML", "Invalid:AS-ML", "Not-Found", "Valid"];
	var color = d3.scale.ordinal()
    .domain(legendVals)
    .range(["#4d4d00", "#D3D3D3", "#663399", "gray", "red", "yellow", "green"]);

    var svgLegned = d3.select("#legend")
	 	    .append("div")
                    .classed("svg-container", true)
                    .style("padding-bottom", "5%")
                    .append("svg")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 950 500")
                    .classed("svg-content-responsive", true);

    var dataL = 0;
    var offset = 120;
    
    var legend = svgLegned.selectAll('#legend')
        .data(legendVals)
        .enter().append('g')
        .attr("transform", function (d, i) {
         if (i === 0) {
            dataL = d.length + offset 
            return "translate(50,0)"
        } else { 
         var newdataL = dataL+60
         dataL +=  d.length + offset
         return "translate(" + (newdataL) + ",0)"
        }
    })

    legend.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d, i) {
        return color(d)
    })
    
    legend.append('text')
        .attr("x", 20)
        .attr("y", 11)
    .text(function (d, i) {
        return d
    })
    .attr("class", "legend")
    .style("font-size", 15);
}

function overlapData(item2)
{
	var first = item2[0];
    var start = first.B;
    var end = first.E;
    var val = first.V;
    var roa = first.ROA;
    var lane = first.lane;

	var result = [];
	for(var i=1; i<item2.length; i++)
	{
		var current = item2[i];
		if(current.B <= end && current.V == val){
			roa = merge(roa, current.ROA);
            end = current.E;
        }else{
        	result.push(getObj(start, end, val, roa, lane));
            start = current.B;
            end = current.E;
            val = current.V;
            roa = current.ROA;
            lane = current.lane;
        }
	} 
	result.push(getObj(start, end, val, roa, lane));
	return result;
}


function overlapData2(item2)
{
	var first = item2[0];
    var start = first.B;
    var end = first.E;
    var file = first.F;
    var maxL = first.ML;
    var rir = first.R;
    var orig = first.O;
    var pref = first.Pr;
    var time = first.T;

	var result = [];
	for(var i=1; i<item2.length; i++)
	{
		var current = item2[i];
		if(current.B <= end){
            end = current.E;
        }else{
        	result.push(getObj2(start, end, file, maxL, rir, orig, pref, time));
            start = current.B;
            end = current.E;
            time = current.T;
        }
	} 
	result.push(getObj2(start, end, file, maxL, rir, orig, pref, time));
	return result;
}

function merge(roa1, roa2)
{
	for(var i =0; i<roa2.length; i++)
	{
		roa1.push(roa2[i]);
	}
	return roa1;
}

function getObj(start, end, val, roa, lane)
{
	var obj = {};
	obj["B"] = start;
	obj["E"] = end;
	obj["V"] = val;
	obj["ROA"] = roa;
	obj["lane"] = lane;
	return obj;
}

function getObj2(start, end, file, maxL, rir, orig, pref, time)
{
	var obj = {};
	obj["B"] = start;
	obj["E"] = end;
	obj["F"] = file;
	obj["ML"] = maxL;
	obj["R"] = rir;
	obj["O"] = orig;
	obj["Pr"] = pref;
	obj["T"] = time;
	return obj;
}
