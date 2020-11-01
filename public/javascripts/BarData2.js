var valLabels = {"Total":"Total", "NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "I":"Invalid", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML", "NF":"Not-Found", "V":"Valid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-Set"};

var parseDate = d3.time.format("%Y%m%d.%H").parse;

function compare( a, b ) {
  if ( a.C < b.C ){
    return -1;
  }
  if ( a.C > b.C ){
    return 1;
  }
  return 0;
}

function sortByDateAscending(a, b) {
	if(a != null && b != null)
	{
		return a.Time - b.Time;
	}
}

function getBarData(data, dataVal, subSelect)
{
	data = data.sort(sortByDateAscending);

	var data = data.filter(function(row){ return row["Time"]>"20200930.00";});
	var result = new Array();
	for(var i=0; i<data.length; i++)
	{
		if(data[i] != null)
		{
			if(data[i][subSelect] != undefined)
			{
    				var mytime = data[i].Time;
				var y0 = 0;
                                var countArr = new Array();
				var myData = data[i][subSelect];
        			myData = myData.sort( compare );
				myData.forEach(function(d) {
					countArr.push({mytime:mytime, name:d.V, y0:y0, y1: y0+= +parseInt(d[dataVal])});
				});
				var y1 = (countArr[countArr.length - 1] != undefined) ? countArr[countArr.length - 1].y1 : 0;
                                result.push({name: mytime, count: countArr, total:y1});
			}
		}
	}
	console.log(result);
	return result;
}

