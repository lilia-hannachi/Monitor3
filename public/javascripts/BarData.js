var colLabels = {"I":"ISC", "E":"EQUIX", "L":"LINX", "N":"NWAX", "R3":"RouteViews3", "R4":"RouteViews4", "SP":"SAOPAULO", "SP2":"SAOPAULO2", "AF":"NAPAFRICA", "SF":"SFMIX", "SG":"SINGAPORE", "SD":"SYDNEY", "T":"TELXATL",
"D":"DIXIE(WIDE)", "K":"KIXP", "O6":"OREGON(V6)", "P":"PERTH", "O":"OREGON", "SX":"SOXRS", "J":"JINX"};

var labelBarArray = {"PO":"PO", "PC":"Path", 6:"IPV6", 4:"IPV4", "Covered":"Covered", "Not-Covered":"Not-Covered", 
					"Same-Path":"Same-Path", "Different-Path":"Different-Path", "SP":"Same-Peer", "DP":"Different-Peer", "SO":"Same-Origin", "DO":"Different-Origin", 
					"A":"ARIN", "R":"RIPE", "P":"APNIC", "L":"LACNIC", "F":"AFRINIC", 
					"I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid"};

/*	Validation type (Valid, Invalid, Not-Found) used to sort ASN	*/
var type;
function compare( a, b ) {
  if ( a.C < b.C ){
    return -1;
  }
  if ( a.C > b.C ){
    return 1;
  }
  return 0;
}

function reorder_type(a, b)
{
  var a2 = a["D"].filter(function(row) {if(row["V"] ==type) return row;})[0]; 	
  var b2 = b["D"].filter(function(row) {if(row["V"] ==type) return row;})[0];	
  if ( a2.C < b2.C ){
    return -1;
  }
  if ( a2.C > b2.C ){
    return 1;
  }
  return 0;
}

function getBarData(data, param)
{
		type = param["type"];
		var result;
		if(param["attr2"] == "")
		{
			result = (param["attr4"] == "") ? getData1(data, param["attr1"], "V", "C", param["label"]) : getData3(data, param["attr1"], param["attr3"], param["attr4"], "V", "C", param["label"]);      
		}
		else
		{
       result = (param["attr4"] == "") ? getData2(data, param["attr1"], param["attr2"], "V", "C", param["label"]) : getData4(data, param["attr1"], param["attr2"], param["attr4"]);
		}
		return result;
}

function reorder(arr)
{
	var result = new Array();
	var validation = ["V", "NF", "I"];
	arr.forEach(function(d) {
		result.splice(validation.indexOf(d.V), 0, d);
	});
	return result;	
}

function reorder_total(data)
{
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
	return data;
}
	
function getData4(data, dataVal, selectData, value)
{
    var result = new Array();
		if(data[dataVal] != undefined && data[dataVal][selectData] != undefined)
		{
			var myData = data[dataVal][selectData];
			myData = myData.sort(reorder_type);
         	myData.forEach(function(v) {
              var mytime = v.V; //add to stock code
                      var y0 = 0;
                      var countArr = new Array();
		      var arr = reorder(v[value]); 	
                      arr.forEach(function(d) {
                              countArr.push({mytime:mytime, name:labelBarArray[d.V], y0:y0, y1: y0+= +parseInt(d.C)});     
                      });
                      result.push({name: mytime, count: countArr, total:countArr[countArr.length - 1].y1});
         });
		}
    return result;
}	

	function getData3(data, dataVal, specificParam, value, name, count, label)
	{
		var result = new Array();
		data = data[dataVal].filter(function(row){ return row[specificParam]==value;});
		var attr;
		if(specificParam == "V") attr = "D";
		else attr = "V";
		if(data.length >0)
		{
		   data[0][attr].forEach(function(v) {			
			 var mytime = ((label=='Y') ? labelBarArray[v[name]] : v[name]); //add to stock code
				var y0 = 0;
				var countArr = new Array();
					countArr.push({mytime:mytime, name:v[name], y0:y0, y1: y0+= +parseInt(v[count])});	
          result.push({name: mytime, count: countArr, total:countArr[countArr.length - 1].y1});				
		   });          
		}
		result = reorder_total(result)
		return result;
	}
	
	function getData1(data, dataVal, dataPart, POCount, label)
	{
		var result = new Array();
	        if(data[dataVal] != undefined)
		{
		   data[dataVal].forEach(function(d) {
			var mytime = ((label=='Y') ? labelBarArray[d.V] : d.V); //add to stock code
			var y0 = 0;
			var countArr = new Array();
			countArr.push({mytime:mytime, name:d.V, y0:y0, y1: y0+= +parseInt(d[POCount])});	
      result.push({name: mytime, count: countArr, total:countArr[countArr.length - 1].y1});					
		   });	
          
		}
		
		return result;
	}
 
	
	function getData2(data, dataVal, selectData, dataPart, POCount, label)
	{
		var result = new Array();
		if(data[selectData] != undefined)
		{
		   data[selectData].forEach(function(v) {			
			var mytime = ((label=='Y') ? ((selectData == 'C') ? colLabels[v.V] : labelBarArray[v.V]) : v.V); //add to stock code			
				var y0 = 0;
				var countArr = new Array();
        var myData = v[dataVal];
        myData = myData.sort( compare );
				myData.forEach(function(d) {
					countArr.push({mytime:mytime, name:d.V, y0:y0, y1: y0+= +parseInt(d[POCount])});					
				});
        var y1 = (countArr[countArr.length - 1] != undefined) ? countArr[countArr.length - 1].y1 : 0;
        result.push({name: mytime, count: countArr, total:y1});
		  });
		}
		
		return result;
	}
