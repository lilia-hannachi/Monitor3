var valArray = {"NF|V":"Not-Found|Valid", "NF|I":"Not-Found|Invalid", "V|NF":"Valid|Not-Found", "V|I":"Valid|Invalid", "I|NF":"Invalid|Not-Found", "I|V":"Invalid|Valid", "NF":"Not-Found", "V":"Valid", "I":"Invalid", "ISS":"Invalid:AS-Set", "NFS":"Not-Found:AS-SET", "IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"invalid:AS-ML"};
/*
 *      * Returns a json-like object.
 *           */
    function getDonutData(sampleData, dataPart, selectData, value1, version) {
                var dataset = new Array();
                if(selectData != "")
                {
                        sampleData = sampleData[dataPart].filter(function(row){ return row["V"]==selectData;});
                        dataPart = "D"+version;
                        if(value1 != "")
                        {
                                sampleData = sampleData[0][dataPart].filter(function(row){ return row["V"]==value1;});
                        }
                        sampleData = sampleData[0];
                }
                var data = new Array();
                var total = 0;
	      if(sampleData!= undefined && sampleData[dataPart] != undefined)
	      {
                if(sampleData[dataPart].length == 0)
                {
                        data.push({
                                "value": valArray[sampleData["V"]],
                                "count": parseInt(sampleData["C"])
                        });
/*
                        total += parseInt(sampleData[dataPart]["C"]);
                        data.push({
                                "value": valArray[sampleData[dataPart]["V"]],
                                "count": parseInt(sampleData[dataPart]["C"])
                        });
*/
                }
                else
                {
                        for (var j = 0; j < sampleData[dataPart].length; j++) {
                                var value = parseInt(sampleData[dataPart][j]["C"]);
                                total += value;
                                data.push({
                                        "value": valArray[sampleData[dataPart][j]["V"]],
                                        "count": parseInt(sampleData[dataPart][j]["C"])
                                });
                        }

                }
	     }
                dataset.push({
                        "type": "RPKI-ROV",
                        "data": data,
                        "total": total
                });
        return dataset;
    }

