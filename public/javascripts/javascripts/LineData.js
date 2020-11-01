var colLabels = {"Total":"Total", "I":"ISC", "E":"EQUIX", "L":"LINX", "N":"NWAX", "R3":"RouteViews3", "R4":"RouteViews4", "SP":"SAOPAULO", "SP2":"SAOPAULO2", "AF":"NAPAFRICA", "SF":"SFMIX", "SG":"SINGAPORE", "SD":"SYDNEY", "T":"TELXATL",
"D":"DIXIE(WIDE)", "K":"KIXP", "O6":"OREGON(V6)", "P":"PERTH", "O":"OREGON", "SX":"SOXRS", "J":"JINX"};
var rirLabels = {"Total":"Total", "A":"ARIN", "R":"RIPE", "P":"APNIC", "L":"LACNIC", "F":"AFRINIC"};
var covLabels = {"Total":"Total", "Covered":"Covered", "Not-Covered":"Not-Covered", "Cv":"Covered", "NCv":"Not-Covered", "Same-Path":"Same-Path", "Different-Path":"Different-Path", "SP":"Same-Peer", "DP":"Different-Peer", "SO":"Same-Origin", "DO":"Different-Origin"};
var poLabels = {"Total":"Total", "PO4":"P/O", "PC4":"Path", "PO6":"P/O", "PC6":"Path", 6:"IPV6", 4:"IPV4", "IPV4":"Num Changes", "IPV6":"Num Changes", "e":"Error", "w":"Warning", "v":"Valid"};

var valLabels = {"Total":"Total", "NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-Set"};

var colColor = {"Total":"gray", "E":"#FFFF00", "L":"#7CFC00", "N":"#3366cc", "R3":"#dc3912", "R4":"#ff9900", "SP":"#109618", "SP2":"#990099", "AF":"#0099c6", "SF":"#dd4477", "SG":"#00FFFF", "SD":"#8A2BE2", "T":"#00FFFF", "D":"#8A2BE2", "K":"#F08080", "O6":"#663399", "P":"#00ffbf", "O":"#8000ff", "SX":"#bf00ff", "J":"#996633"};
var rirColor = {"Total":"gray", "A":"#996633", "R":"#339966", "P":"#993366", "L":"#cc6666", "F":"#cccc66"};
var covColor = {"Total":"gray", "Covered":"#7fcc66", "Not-Covered":"#cc6666", "Cv":"#7fcc66", "NCv":"#cc6666", "Same-Path":"#66cc99", "Different-Path":"#cc667f", "SP":"#9966cc", "DP":"#cc66cc", "SO":"#a6cc33", "DO":"#cc3359"};
var poColor = {"Total":"gray", "PO4":"#66b3cc", "PC4":"#b366cc", "PO6":"#66b3cc", "PC6":"#b366cc", 6:"#cc9966", 4:"#ccb366", "IPV4":"#cc9966", "IPV6":"#ccb366", "v":"#7CFC00", "e":"#FF0000", "w":"orange"};
var valColor = {"Total":"gray", "I":"#FF0000", "NF":"#FFFF00", "V":"#7CFC00", "IS":"#F08080", "IM":"#663399", "ISM":"#800000", "ISS":"#D3D3D3", "NFS":"#4d4d00", "V|I":"#FF0000", "V|NF":"#FFFF00", "I|V":"#7CFC00", "I|NF":"#F08080", "NF|I":"#800000", "NF|V":"#663399"};

var c20 = d3.scale.category20();
var parseDate = d3.time.format("%Y%m%d.%H").parse;

function getLineData(data, param)
{
  var result; 
  data = data.sort(sortByDateAscending);
	var data = data.filter(function(row){ return row["Time"]>"20190901.00";});	
		
  var date = getDates(data);
  if(param["attr2"] == "")
  {
	if(param["type"] == 1)
	{
		result = oneDimVC(data, param["attr1"], "V", "C", param["label"]);
	}
	else
	{
		result = oneDim(data, param["attr1"], param["label"]);
	}
  }
  else
  {
	if(param["attr3"] != "")
	{
		result = twoDimSV(data, param["attr1"][0], param["attr2"], param["attr3"], param["attr4"], "C", "V", "C", param["label"]);
	}
	else
	{
		if(param["type"] == 1)
		{
			result = twoDimVC(data, param["attr1"][0], param["attr2"], "V", "C", param["label"]);
		}
		else
		{
			result = twoDim(data, param["attr1"][0], param["attr2"], param["label"]);
		}
	}
  }
  return {data: result, date: date};
}

function sortByDateAscending(a, b) {
  if(a != null && b != null)
 {
	return a.Time - b.Time;
}
}

function getTimeObj(time, count)
{
  return {"Time":parseDate(time), "Count":parseInt(count)};
}

function getDates(data)
{
  var date = new Array();
  for(var i=0; i<data.length; i++)
	{
if(data[i] != null)
     date.push(parseDate(data[i].Time));
  }
  return date;
}

function twoDimVC(data, dataVal, subSelect, Name, POCount, label)
{
	var globalArr = new Array();
	for(var i=0; i<data.length; i++)
	{
		var time = data[i].Time;
		data[i][subSelect].forEach(function(v) {
			for(var j=0; j<v[dataVal].length; j++)
			{
        			globalArr = get_Data_Obj(globalArr, time, v[dataVal][j][POCount], v[dataVal][j][Name], label);
			}
		});
	}
  return globalArr;
}

function twoDimSV(data, dataVal, subSelect, value, value2, secondVal, Name, POCount, label)
{
	var globalArr = new Array();
	for(var i=0; i<data.length; i++)
	{
	   if(data[i][subSelect] != undefined)
           {
           var total = 0;
    		var time = data[i].Time;
		var data2 = data[i][subSelect].filter(function(row){ return row["V"]==value;});
		if(value2 != "" && data2.length >0)
		{			
			data2 = data2[0][dataVal].filter(function(row){ return row["V"]==value2;});
		}
    		if(data2.length >0)
		{
			data2 = data2[0];
			if(data2[dataVal].length == 0)
			{
              total += data2[secondVal];
      				globalArr = get_Data_Obj(globalArr, time, data2[secondVal], data2["V"], label);
			}
			else
			{
				for(var j=0; j<data2[dataVal].length; j++)
				{
                total += data2[dataVal][j][POCount];
        				globalArr = get_Data_Obj(globalArr, time, data2[dataVal][j][POCount], data2[dataVal][j][Name], label);
				}
			}
		}
     globalArr = get_Data_Obj(globalArr, time, total, "Total", label);
	   }
	}
	return globalArr;
}	
	
function get_Data_Obj(globalArr, time, count, name, label)
{
	count = removeZero(count);
	var color =  c20(name);
	if(label != 'N')
	{ 
		color = getColorVal(label, name);
		name = getLabel(label, name);		
	}
    var newIndx = globalArr.length;
	var indx = getIndex(globalArr, name);
	var subArr = new Array();
	if( indx != -1)
	{
		newIndx = indx;
		subArr = globalArr[indx].data;
		subArr.push(getTimeObj(time, count));
	}
	else
	{
		subArr.push(getTimeObj(time, count));
	}
	if(name != undefined)
	{
		globalArr[newIndx]= {
			"name": name,
			"data": subArr,
			"color":color
		};
	}
   return globalArr;
} 
 
function twoDim(data, dataVal, subSelect, label)
{
	var globalArr = new Array();
	for(var i=0; i<data.length; i++)
	{
if(data[i] != null)
{
		if(data[i][subSelect] != undefined)
		{
         var total = 0;
    			var time = data[i].Time;
			data[i][subSelect].forEach(function(d) {
        total += d[dataVal];
				globalArr = get_Data_Obj(globalArr, time, d[dataVal], d["V"], label);
			});
      globalArr = get_Data_Obj(globalArr, time, total, "Total", label);
		}
}
	}  
	return globalArr;
}

function oneDim(data, dataValArr, label)
{
	var globalArr = new Array();

	for(var i=0; i<data.length; i++)
	{
    var time = data[i].Time;
		for(var dataVal in dataValArr)
		{
      globalArr = get_Data_Obj(globalArr, time, data[i][dataValArr[dataVal]], dataValArr[dataVal], label);
		}
	}
	return globalArr;
}

function oneDimVC(data, dataVal, Name, POCount, label)
{
	var globalArr = new Array();
	for(var i=0; i<data.length; i++)
	{
    var time = data[i].Time;
		for(var j=0; j<data[i][dataVal].length; j++)
		{
      globalArr = get_Data_Obj(globalArr, time, data[i][dataVal][j][POCount], data[i][dataVal][j][Name], label);
		}
	}
	return globalArr;
}

function removeZero(count)
{
	if(count == 0)
	{
		count = 0.01;
	}
	return count;
}

function getColorVal(label, value)
{
  var obj = getColorObj(label);
  return obj[value];
}
function getLabel(label, value)
{
  var obj = getLabelObj(label);
  return obj[value];
}

function getLabelObj(label)
{
  if(label == "C")
    return colLabels;
  if(label == "R")
    return rirLabels;
  if(label == "Cv")
    return covLabels;
  if(label == "P")
    return poLabels;
  if(label == "V")
    return valLabels;  
}
function getColorObj(label)
{
  if(label == "C")
    return colColor;
  if(label == "R")
    return rirColor;
  if(label == "Cv")
    return covColor;
  if(label == "P")
    return poColor;
  if(label == "V")
    return valColor;
}

function getIndex(globalArr, str)
{
	for(var i=0; i<globalArr.length; i++)
	{
		if(globalArr[i].name == str)
		{
			return i;
		}
	}
	return -1;
}

