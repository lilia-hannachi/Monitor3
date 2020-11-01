var fs = require('fs');

/* Get home page        */

var mongoose = require('mongoose');
/*  Global BGP Analysis collection*/
var global_col = mongoose.model('', {}, 'globalBGP');

/*  Coverage Collection */
var coverage_Schema = ({Time:String, Pr:String, R:String, V:String, O:String, PC:Number, CPr:[{}]});
var coverage_col = mongoose.model('coverage', coverage_Schema, 'coverage');

/*  Top ASes according to number of Customers Collection */
var top_Cust_Schema = ({Time:String, dataVal:[{}]});
var top_Cust_Col = mongoose.model('topCustomer', top_Cust_Schema, 'topCustomer');

/*  To ASes according to number of Peers Collection */
var top_Peer_Schema = ({Time:String, dataVal:[{}]});
var top_Peer_Col = mongoose.model('topPeer', top_Peer_Schema, 'topPeer');

/*  Customers and Peers Collection */
var cust_Schema = ({T:String});
var cust_Col = mongoose.model('customer', cust_Schema, 'customer');

/* All RPKI-ROV Changes Collection */
var rov_Changes_Schema = ({T:String});
var rov_Changes_Col = mongoose.model('rpkiChanges', rov_Changes_Schema, 'rpkiChanges');

/* All RPKI-ROA Changes Collection */
var roa_Changes_Schema = ({T:String});
var roa_Changes_Col = mongoose.model('roa_prefixes', roa_Changes_Schema, 'roa_prefixes');

/*  Prefixes RPKI-ROV Changes Collection */
var pr_ROV_Schema = ({Pr:String, V:String, T:String, ROA:[{}]});
var pr_ROV_Col = mongoose.model('prefixVal', pr_ROV_Schema, 'prefixVal');

/*  Meta Data about specific ROA file Collection */ 
var roa_Schema = ({T:String, F:String});
var roa_Col = mongoose.model('roaVal', roa_Schema, 'roaVal');

/*  RPKI Data Objects Collection */
var repository_Schema = ({Time:String});
var repository_Col = mongoose.model('roaCount', repository_Schema, 'roaCount');

var val_Changes_Schema = ({Time:String});
var val_Changes_Col = mongoose.model('rpkiValChanges', val_Changes_Schema, 'rpkiValChanges');

var perPage = 100;

var time_reg_exp = /^\d{8}[.]\d{2}$/;
var rir_reg_exp = /^[\w]{1,3}$/;
var roa_file_reg_exp =  /^[\w-]+.roa$/;
var cert_file_reg_exp = /^[\w-]+.cer$/;
var roa_tree_reg_exp = /^[\s\w-.%]+$/;

var validation_labels = {"NF":"NF", "V":"V", "IS":"I", "IM":"I", "ISM":"I", "NFS":"NF", "ISS":"I"};

function checkPrefixReg(str)
{
  str = str.replace("_", "/");
  var ipv4_reg_exp = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
  var ipv6_reg_exp = /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;

  var reg1 = ipv4_reg_exp.exec(str);
  if(reg1 != null)
  {
    return reg1;
  }
  else
  {
    var reg2 = ipv6_reg_exp.exec(str);
    return reg2;
  }
}

/*	Updated to 2 weeks ago	*/
function date_month_ago(time)
{
  var date  = new Date(time.substring(0, 4)+"/"+time.substring(4, 6)+"/"+time.substring(6, 8));
//  date.setMonth(date.getMonth() - 2);
  date.setDate(date.getDate() - 15);
  var date2 = date.toISOString().substring(0, 10);
  return date2.substring(0, 4) + date2.substring(5, 7) + date2.substring(8, 10)+"."+time.substring(9, 11);
}

function getLastUpdate()
{
	var data = fs.readFileSync('./LastUpdate.txt');
	return data.toString().trim();
}

/*  Get data from DB in cas of RPKI Validation (IPV4, IPV6) */
function rovDB(req, res, selectField, htmlPage, param)
{    
  /* Get date one month ago	*/
  var time2 = date_month_ago(param["time"]);
  global_col.find({}, selectField, function(err, doc){
    val_Changes_Col.find({Time: {$gte: time2 , $lte: param["time"]}}, function(err2, doc2){
      res.render(htmlPage, { version: param["version"], data: JSON.stringify(doc), data2: JSON.stringify(doc2), time:param["time"], lastUpdate:param["lastUpdate"] });
    });
  });  
}

/*  Get data from DB in cas of RPKI Validation (IPV4, IPV6) */
function validDB(req, res, selectField, param, htmlPage)
{
  global_col.find({Time:param["time"]}, selectField, function(err, doc){
      res.render(htmlPage, { version: param["version"], data: JSON.stringify(doc), time:param["time"], lastUpdate:param["lastUpdate"] });
  });
}

/*  Get data from DB in cas of RPKI Validation (IPV4, IPV6) */
function notfoundDB(req, res, selectField, param, htmlPage)
{
  global_col.find({}, selectField, function(err, doc){
      res.render(htmlPage, { version: param["version"], data: JSON.stringify(doc), time:param["time"], lastUpdate:param["lastUpdate"] });
  });
}


/* Get Data for the selected attribute	*/
function attrData(arr_Val, attr, value, obj)
{
   if(arr_Val != undefined)
   {
     for(var j=0; j<arr_Val.length; j++)
     {
            if(arr_Val[j]["V"]==value)
            {
               obj[attr] = [arr_Val[j]];
            }
     }
   }	
}


/*  Get data from DB in cas of RPKI Validation (IPV4, IPV6) for either one Collector or one RIR */
function rovDB_1_Param(req, res, selectField, param, attr, htmlPage)
{
  var value = (attr=="R" ? param["rir"] : param["collector"]);
  var arr = new Array();
  global_col.find({}, selectField, function(err, doc){
      var vals = JSON.stringify(doc);
      var obj = JSON.parse(vals);
      for(var i=0; i<obj.length; i++)
      {
	if(obj[i][attr] != undefined)
	{
        	var subObj = {};
        	attrData(obj[i][attr], attr, value, subObj);
        	var date = (obj[i].Time);
        	subObj["Time"] = date;
        	arr.push(subObj); 
	} 
      } 
      var pageType = (attr=="R" ? "Region" : "Collector"); 
      res.render(htmlPage, { version: param["version"], value:value, data: JSON.stringify(arr), time:param["time"], lastUpdate:param["lastUpdate"], pageType:pageType });
  });
}



/*  Get data from DB in cas of RPKI Validation (IPV4, IPV6) for both the Collector and the RIR */
function rovDB_RIR_Collector(req, res, selectField, param, htmlPage)
{
  var arr = new Array();
  global_col.find({}, selectField, function(err, doc){
      var vals = JSON.stringify(doc);
      var obj = JSON.parse(vals);
      for(var i=0; i<obj.length; i++)
      {
        var subObj = {};
        attrData(obj[i]["R"], "R", param["rir"], subObj);
	attrData(obj[i]["C"], "C", param["collector"], subObj);
        var date = (obj[i].Time);
        subObj["Time"] = date;
        arr.push(subObj);
      }
      res.render(htmlPage, { version: param["version"], rir_value:param["rir"], col_value:param["collector"], data: JSON.stringify(arr), time:param["time"], lastUpdate:param["lastUpdate"] });
  });
}

/*  define the default list of attributes selected in case of ROV (IPV4, IPV6) */
function rov_Basic_Attr()
{
  var objSelect = {};
  objSelect["_id"] = 0;
  objSelect["Time"] = 1;
  return objSelect;
}


/*  define the default list of attributes selected in case of ROV (IPV4, IPV6) */
function rov_All_Object(ver, objSelect)
{
  objSelect["POV"+ver] = 1;
  objSelect["O"+ver] = 1;	
  if(ver=="4")
  {
    objSelect["NormO"+ver] = 1;
    objSelect["POVN"+ver] = 1;
  }	  
}

/*  define the default list of attributes selected in case of Valid ROV (IPV4, IPV6) */
function valid_All_Object(ver, objSelect)
{
  objSelect["POV"+ver] = 1;
  objSelect["O"+ver] = 1;
  objSelect["NormO"+ver] = 1;
  objSelect["NormC"+ver] = 1;	
  objSelect["Cnt"+ver] = 1;
  objSelect["PrLV"+ver] = 1;
  objSelect["PLV"+ver] = 1;
}

/*  define the list of attributes selected in case of ROV (IPV4, IPV6) with either one collector or one RIR */
function rov_1_Param_Object(ver, attr, objSelect)
{
  objSelect[attr+".V"] = 1;
  objSelect[attr+".D"+ver] = 1;
  if(ver=="4" && attr=="R")
    objSelect[attr+".DN"+ver] = 1;
}

/* Get list of attributes for invalid originations */
function invalids_Prefixes_Object(version, objSelect, page)
{
  var init = (perPage * page) - perPage;
  var end = init + perPage;

  objSelect["T_Pr"+version] = 1;
  objSelect["InvPr"+version+".Pr"] = 1;
  objSelect["InvPr"+version+".R"] = 1;
  objSelect["InvPr"+version+".V"] = 1;
  objSelect["InvPr"+version+".O"] = 1;
  objSelect["InvPr"+version+".PC"] = 1;
  objSelect["InvPr"+version+".C"] = 1;
  objSelect["InvPr"+version] = {$slice:[init, end]};  
}

/*  Selected attributes in cas of RPKI Validation (IPV4, IPV6) */
function rov(req, res, param) {
  var objSelect = rov_Basic_Attr();
  rov_All_Object(param["version"], objSelect);
  rovDB(req, res, objSelect, 'RPKI/RPKI', param);
}

/*  Selected attributes in cas of Valid RPKI ROV */
function notfound(req, res, param) {
  var objSelect = rov_Basic_Attr();
  valid_All_Object(param["version"], objSelect);
  notfoundDB(req, res, objSelect, param, "RPKI/NotFound");
}


/*  Selected attributes in cas of Valid RPKI ROV */
function valid(req, res, param) {
  var objSelect = rov_Basic_Attr();
  valid_All_Object(param["version"], objSelect);
  validDB(req, res, objSelect, param, "RPKI/Valid");
}

/*  Selected attributes in cas of Valid RPKI ROV */
function invalids(req, res, param) {
  var objSelect = rov_Basic_Attr();
  valid_All_Object(param["version"], objSelect);
  notfoundDB(req, res, objSelect, param, "RPKI/Invalid");
}

/* Get the appropriate attributes and data for coverage analysis */
function coverage(req, res, param) {
  var objSelect = rov_Basic_Attr();
  objSelect[param["attr"]+param["version"]] = 1;
  objSelect["T_Pr"+param["version"]] = 1;
  coverage_col.find({}, objSelect, function(err, doc){
     res.render(param["htmlPage"], { value:"", version: param["version"], data: JSON.stringify(doc), time:param["time"], lastUpdate:param["lastUpdate"] });
  });
}

/* Get list of invalid originations with their coverage details */
function invalid_Prefixes(req, res, param) {
  
  var objSelect = rov_Basic_Attr();
  invalids_Prefixes_Object(param["version"], objSelect, param["page"]);
  coverage_col.find({Time:param["time"]}, objSelect, function(err, doc){
     res.render(param["htmlPage"], { version: param["version"], data: JSON.stringify(doc), time:param["time"], lastUpdate:param["lastUpdate"], current:param["page"] });
  });
}

/* Get data from DB for Repository  */
function repository(res, lastUpdate, time)
{
  repository_Col.find({T:time}, function(err, doc){
        res.render('Repository/Repository', {  lastUpdate:lastUpdate, time:time, data: JSON.stringify(doc) });
  });
}

function selected_Repo_Time(dataSet, time_attr, time_val)
{
	var result = {};
	for(var i=0; i<dataSet.length; i++)
	{
		var objs = (dataSet[i].toJSON());
		if(objs[time_attr] == time_val)
		{
			return objs;
		}
	}
	return result;
}

function get_repo_prop(dataSet)
{
	var result = [];
	var i =0;
	for(var key in dataSet)
	{
		var obj = {};
		obj["V"] = key;
		obj["C"] = dataSet[key]
		result[i] = obj;
		i++; 
	}
	return result;
}

function get_repo_line_Data(dataSet, time)
{
	var result = {}
	result["Time"] = time;
	result[".cer"] = get_repo_prop(dataSet[".cer"]);
	result[".roa"] = get_repo_prop(dataSet[".roa"]);
	result[".crl"] = get_repo_prop(dataSet[".crl"]);
	result[".mft"] = get_repo_prop(dataSet[".mft"]);

	return result;
}

function selected_Repo_Data(dataSet, rir, time_attr)
{
	var result = [];
	for(var i=0; i<dataSet.length; i++)
        {
		var objs = (dataSet[i].toJSON());
		for(var index in objs["Data"])
		{
			if(objs["Data"][index]["V"] == rir )
			{
				result[i] = get_repo_line_Data(objs["Data"][index], objs[time_attr]);
			}
		}
	}
	return result;
}

function repository_Param(res, lastUpdate, time, rir){
  var attrObj = {};
  attrObj["_id"]=0;
  attrObj["Data"]=1;
  attrObj["T"]=1;
  attrObj["AS_Roa_"+rir]=1;
  attrObj["Prefix_Length4_"+rir]=1;
  attrObj["Prefix_Length6_"+rir]=1;
  attrObj["Prefix_ML4_"+rir]=1;
  attrObj["Top_AS_Prefix_"+rir]=1;
  attrObj["Top_AS_Roa_"+rir]=1;
  attrObj["Prefix_ML6_"+rir]=1;
  repository_Col.find({}, attrObj, function(err, doc){        
  	var data1 = selected_Repo_Time(doc, "T", time);
	var data2 = selected_Repo_Data(doc, rir, "T"); 
        res.render('Repository/Repository_RIR', { lastUpdate:lastUpdate, time:time, rir:rir, data1: JSON.stringify(data1), data2: JSON.stringify(data2) });
  });
}

function get_Filter_params(param, value, attr, array, index)
{
  if(param != value)
  {
        array[index] = {$eq: [ attr, param ]};
	index ++;
  }
 return index;
}

/*	Filter list of Invalid Prefixes with their coverage details according  */
function filter_Invalids_Attr(param)
{ 
  var array = new Array();
  var index = 0;
  index = get_Filter_params(param["origin"]+"", "0", "$$node.O", array, index);
  index = get_Filter_params(param["rir"], "All", "$$node.R", array, index);
  index = get_Filter_params(param["collector"], "All", "$$node.V", array, index);
  if(array.length == 1)
  {
	return array[0];
  }
  else
  {
	return {$and : array};
  }
}

/* Get list of invalid originations with their coverage details  according to selected parameters	*/
function invalid_Prefixes_Param(req, res, param) 
{
  var objSelect = rov_Basic_Attr();
  invalids_Prefixes_Object(param["version"], objSelect, param["page"]);
  var valuesObj = filter_Invalids_Attr(param);
  var val1 = "InvPr"+param["version"];
  var val2 = "$"+val1;
   coverage_col.aggregate([{$match : {Time:param["time"]}}, {$project: {_id:0, val1: {$filter: {input: val2, as: "node", cond: valuesObj      }}}}])
  .then(function(prefixes)
            {
		res.render('Coverage/Sub_Invalid_Prefixes', { version: param["version"], data: JSON.stringify(prefixes), time:param["time"], lastUpdate:param["lastUpdate"], origin:param["origin"], rir:param["rir"], invalids:param["collector"] });
          });
}



/* When the end-user select either one collector or one RIR for ROV	*/
function rov_1_Param(req, res, param, attr, htmlPage)
{
  var objSelect = rov_Basic_Attr(); 
  rov_1_Param_Object(param["version"], attr, objSelect);
  rovDB_1_Param(req, res, objSelect, param, attr, htmlPage);
}


/* When the end-user select both a collector and a RIR for ROV     */
function rov_RIR_Collector(req, res, param, htmlPage) {
  var objSelect = rov_Basic_Attr();
  rov_1_Param_Object(param["version"], "R", objSelect);
  rov_1_Param_Object(param["version"], "C", objSelect);
  rovDB_RIR_Collector(req, res, objSelect, param, htmlPage);
}

/*  Check which page should be displayed for ROV with parameters	*/
function rov_Check_Param(req, res, param)
{
  if(param["rir"] == "All" && param["collector"] == "All")
  {
  	rov(req, res, param);
  }
  if(param["rir"] != "All" && param["collector"] == "All")
  {
        /*	select the attribute "R" with rir value */
	rov_1_Param(req, res, param, "R", "RPKI/RPKI_1_Param");
  }
  if(param["rir"] == "All" && param["collector"] != "All")
  {
	/*      select the attribute "C" with rir value */
        rov_1_Param(req, res, param, "C", "RPKI/RPKI_1_Param");
  }
  if(param["rir"] != "All" && param["collector"] != "All")
  {
        rov_RIR_Collector(req, res, param, "RPKI/RPKI_RIR_Col");
  }
}

/*  Check which page should be displayed for Valid ROV with parameters        */
function valid_Check_Param(req, res, param)
{
  if(param["rir"] == "All" && param["collector"] == "All")
  {
        valid(req, res, param);
  }
  if(param["rir"] != "All" && param["collector"] == "All")
  {
        /*      select the attribute "R" with rir value */
        rov_1_Param(req, res, param, "R", "RPKI/Valid_1_Param");
  }
  if(param["rir"] == "All" && param["collector"] != "All")
  {
        /*      select the attribute "C" with rir value */
        rov_1_Param(req, res, param, "C", "RPKI/Valid_1_Param");
  }
  if(param["rir"] != "All" && param["collector"] != "All")
  {
	rov_RIR_Collector(req, res, param, "RPKI/Valid_RIR_Col");        
  }
}

/*  Check which page should be displayed for Not-Found ROV with parameters        */
function notfound_Check_Param(req, res, param)
{
  if(param["rir"] == "All" && param["collector"] == "All")
  {
        notfound(req, res, param);
  }
  if(param["rir"] != "All" && param["collector"] == "All")
  {
        /*      select the attribute "R" with rir value */
        rov_1_Param(req, res, param, "R", "RPKI/NotFound_1_Param");
  }
  if(param["rir"] == "All" && param["collector"] != "All")
  {
        /*      select the attribute "C" with rir value */
        rov_1_Param(req, res, param, "C", "RPKI/NotFound_1_Param");
  }
  if(param["rir"] != "All" && param["collector"] != "All")
  {
        rov_RIR_Collector(req, res, param, "RPKI/NotFound_RIR_Col");
  }
}

/*  Check which page should be displayed for Invalid ROV with parameters        */
function invalid_Check_Param(req, res, param)
{
  if(param["rir"] == "All" && param["collector"] == "All")
  {
        invalids(req, res, param);
  }
  if(param["rir"] != "All" && param["collector"] == "All")
  {
        /*      select the attribute "R" with rir value */
        rov_1_Param(req, res, param, "R", "RPKI/Invalid_1_Param");
  }
  if(param["rir"] == "All" && param["collector"] != "All")
  {
        /*      select the attribute "C" with rir value */
        rov_1_Param(req, res, param, "C", "RPKI/Invalid_1_Param");
  }
  if(param["rir"] != "All" && param["collector"] != "All")
  {
        rov_RIR_Collector(req, res, param, "RPKI/Invalid_RIR_Col");
  }
}

/*  Check which page should be displayed for list of invalid originations with coverage details        */
function coverage_invalids_Check_Param(req, res, param)
{
  if(param["rir"] == "All" && param["collector"] == "All" && param["origin"]==0)
  {
        invalid_Prefixes(req, res, param);
  }
  else
  {
	invalid_Prefixes_Param(req, res, param);
  }
}

/*	Get values associated with each parameters */
function getParameters(req)
{
  var result = {};
  result["lastUpdate"] = getLastUpdate();
  result["time"] = req.params.Time;
  result["reg_time"] = time_reg_exp.exec(result["time"]);
  result["rir"] = req.params.RIR;
  result["reg_rir"] = rir_reg_exp.exec(result["rir"]);
  result["collector"] = req.params.Collector;
  result["reg_collector"] = rir_reg_exp.exec(result["collector"]);
  result["version"] = parseInt(req.params.Version);
  return result;
}

/***********	Coverage with Parameters	******************/

function filter_coverage1(attr, value)
{
  var filter = {}, project = {};
  filter["cond"] = {$eq: [ "$$node.V", value]}  ;
  filter["as"]="node";
  filter["input"]="$"+attr;
  project["$filter"] = filter;
  return project;
}

/* Get the appropriate attributes and data for coverage analysis with user' selection	*/
function coverage_1_Param(req, res, param, type) 
{
  var attr = param["attr"]+param["version"];
  var objSelect = rov_Basic_Attr();  
  objSelect["T_Pr"+param["version"]] = 1;
  objSelect[attr] = filter_coverage1(attr, param["value"]);
  if(type == 2)
  {
	var attr2 = param["attr2"]+param["version"];
	objSelect[attr2] = filter_coverage1(attr2, param["value2"]);
  }
  coverage_col.aggregate([{$project: objSelect }])  
  .then(function(doc){
     res.render(param["htmlPage"], { value:param["value"], value2:param["value2"], version: param["version"], data: JSON.stringify(doc), time:param["time"], lastUpdate:param["lastUpdate"] });    	
  });
}


function coverage_Check_Function(req, res, htmlPage, attr)
{
  var param = getParameters(req);
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]))
  {
        if(param["rir"] == "All" && param["collector"] == "All")
        {
                param["htmlPage"] = htmlPage;
                param["attr"] = attr;
                coverage(req, res, param);
        }
        else
        {
		if(param["rir"] != "All" && param["collector"] == "All")
  		{
			param["htmlPage"] = "Coverage/Coverage_RIR";
			param["attr"] = "CvR";
			param["value"] = param["rir"];
			param["value2"] = "";
			coverage_1_Param(req, res, param, 1);
  		}
  		if(param["rir"] == "All" && param["collector"] != "All")
  		{
			param["htmlPage"] = "Coverage/Coverage_Validation";
			param["attr"] = "CvV";
			param["value"] = param["collector"];
			param["value2"] = "";
                        coverage_1_Param(req, res, param, 1);
  		}
  		if(param["rir"] != "All" && param["collector"] != "All")
  		{
			param["htmlPage"] = "Coverage/Coverage_RIR_Validation";
                        param["attr"] = "CvR";
			param["attr2"] = "CvV";
                        param["value"] = param["rir"];
                        param["value2"] = param["collector"];
                        coverage_1_Param(req, res, param, 2);
  		}
        }
  }
  else
  {
        res.render('error');
  }
}

/* Filter the validation changes based on the used choice (included in the URL)	*/
function checkValidationChanges(data, validation_changes, result)
{
	var select = 0;
	for(var j=0; j<data.doc.length; j++)
        {
        	var val = validation_labels[data.doc[j].D1["V"]]+"_"+validation_labels[data.doc[j].D2["V"]];
                if(val == validation_changes)
                {
                	select = 1;
                }
        }
        if(select ==1)
        {
        	result.push(data)
        }

}


/*  Index Pages*/
module.exports.index = function(req, res) {
  var lastUpdate = getLastUpdate();
  res.render("index", {lastUpdate: lastUpdate});
}

module.exports.methodology= function(req, res) {
  var lastUpdate = getLastUpdate();
  res.render("methodology", {lastUpdate: lastUpdate});
}

module.exports.contact= function(req, res) {
  var lastUpdate = getLastUpdate();
  res.render("contact", {lastUpdate: lastUpdate});
}


/*  ROV for IPV4 */
module.exports.rov_Charts = function(req, res) {
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate};
  rov(req, res, param);
}


/*  ROV with selected parameteres */
module.exports.rov_Param = function(req, res) {
  var param = getParameters(req);
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]))
  {
	rov_Check_Param(req, res, param);
  }
  else
  {
        res.render('error');
  }
}

/* Valid ROV P/O Pairs  */
module.exports.invalid_Charts = function(req, res) {
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate};
  invalids(req, res, param);
}
/*  Valid ROV with selected parameteres */
module.exports.invalid_Param = function(req, res) {
  var param = getParameters(req);
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]))
  {
        invalid_Check_Param(req, res, param);
  }
  else
  {
        res.render('error');
  }
}


/* Not-Found ROV P/O Pairs  */
module.exports.notfound_Charts = function(req, res) {
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate};
  notfound(req, res, param);
}
/*  Valid ROV with selected parameteres */
module.exports.notfound_Param = function(req, res) {
  var param = getParameters(req);
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]))
  {
        notfound_Check_Param(req, res, param);
  }
  else
  {
        res.render('error');
  }
}

/* Valid ROV P/O Pairs  */
module.exports.valid_Charts = function(req, res) {
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate};
  valid(req, res, param);
}

/*  Valid ROV with selected parameteres */
module.exports.valid_Param = function(req, res) {
  var param = getParameters(req);
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]))
  {
        valid_Check_Param(req, res, param);
  }
  else
  {
        res.render('error');
  }
}

/*	Coverage for Invalid Originations	*/
module.exports.coverage_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate, attr:"Cv", htmlPage:'Coverage/Coverage'};
  coverage(req, res, param);
}

/*	Coverage for Invalid Originations with user' selection      */
module.exports.coverage_Param = function(req, res){
  coverage_Check_Function(req, res, "Coverage/Coverage", "Cv");
}

/*	Coverage path details for invalid originations	*/
module.exports.coverage_Details_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate, attr:"T_Path", htmlPage:'Coverage/Coverage_Details'};
  coverage(req, res, param);
}

/*      Coverage path details for invalid originations with user' selection */
module.exports.coverage_Details_Param = function(req, res){
  coverage_Check_Function(req, res, "Coverage/Coverage_Details", "T_Path");
}

/*      Coverage validation details for invalid originations  */
module.exports.coverage_validation_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate, attr:"CvV", htmlPage:'Coverage/Coverage_Validation'};
  coverage(req, res, param);
}

/*      Coverage validation details for invalid originations with user' selection */
module.exports.coverage_validation_Param = function(req, res){
  coverage_Check_Function(req, res, "Coverage/Coverage_Validation", "CvV");
}

/*      Coverage RIR details for invalid originations  */
module.exports.coverage_rir_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  var param = {"version":"4", "time":lastUpdate, "lastUpdate":lastUpdate, attr:"CvR", htmlPage:'Coverage/Coverage_RIR'};
  coverage(req, res, param);
}

/*      Coverage RIR details for invalid originations with user' selection */
module.exports.coverage_rir_Param = function(req, res){
  coverage_Check_Function(req, res, "Coverage/Coverage_RIR", "CvR");
}

/*      List of invalid originations with their coverage details  */
module.exports.coverage_invalids_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;
  var reg_time = time_reg_exp.exec(time);
  var version = parseInt(req.params.Version);
  var page = req.params.Page;
  if(!isNaN(page) && !isNaN(version) && reg_time != null)
  {
  	var param = {"htmlPage":"Coverage/Invalid_Prefixes", "page":page, "version":version, "time":time, "lastUpdate":lastUpdate};
  	invalid_Prefixes(req, res, param);
  }
  else
  {
	res.render('error');
  }
}

/*      List of invalid originations with their coverage details  (without parameters)*/
module.exports.coverage_invalids_Chart = function(req, res){
  var lastUpdate = getLastUpdate();
  var param = {"htmlPage":"Coverage/Invalid_Prefixes", "page":1, "version":4, "time":lastUpdate, "lastUpdate":lastUpdate};
  invalid_Prefixes(req, res, param);
}

/*      List of invalid originations with their coverage details  */
module.exports.coverage_invalids_Param = function(req, res){
  var param = getParameters(req);
  param["origin"] = parseInt(req.params.Origin);
  param["htmlPage"]="Coverage/Invalid_Prefixes";
  param["page"]=1;
  if(param["reg_time"] != null && param["reg_rir"] != null &&  param["reg_collector"] != null && !isNaN(param["version"]) && !isNaN(param["origin"]))
  {
        coverage_invalids_Check_Param(req, res, param);
  }
  else
  {
        res.render('error');
  }

}

/*  Get coverage details for a spesific Prefix	*/
module.exports.coverage_One_Prefix = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;
  var version = parseInt(req.params.Version);
  var reg_time = time_reg_exp.exec(time);
  var prefix = (req.params.Prefix).replace("_", "/");
  var reg_prefix = checkPrefixReg(prefix); 
  if(reg_time != null && reg_prefix != null && !isNaN(version))
  {
        var obj = {};
	obj["InvPr"+version] = { $elemMatch: {Pr:prefix}};  
	coverage_col.find({Time:time}, obj, function(err, doc){  	
      		res.render("Coverage/Coverage_One_Prefix.html", { prefix: prefix, time: time, version: version, data: JSON.stringify(doc), lastUpdate:lastUpdate });
	});
  }
  else
  {
        res.render('error');
  }
}

/*	Select time1 and time2 for ROV Validation changes	*/
module.exports.rov_time_changes = function(req, res){
  var lastUpdate = getLastUpdate();
  res.render('RPKIChanges/ROV_Time_Changes', {lastUpdate:lastUpdate});
}

/*      Select time1 and time2 for ROA Prefix changes       */
module.exports.roa_time_changes = function(req, res){
  var lastUpdate = getLastUpdate();
  res.render('RPKIChanges/ROA_Time_Changes', {lastUpdate:lastUpdate});
}


/*	Get All ROV Validation Changes	*/
module.exports.rov_all_changes = function(req, res){
  var lastUpdate = getLastUpdate();
  var time1 = req.params.Time1;
  var time2 = req.params.Time2;
  var reg1 = time_reg_exp.exec(time1);
  var reg2 = time_reg_exp.exec(time2);
  if(reg1 != null && reg2 != null)
  {
        rov_Changes_Col.aggregate([{$match : {T2:{$gt:time1, $lte:time2}}},{$group : {_id : {"Pr":"$Pr"} , doc: { $push: {T2:"$T2", T1:"$T1", D1:"$D1", D2:"$D2"} }}}])
        .then(function (doc)
              { 
                res.render('RPKIChanges/ROV_All_Changes', {lastUpdate:lastUpdate, Time1:time1, Time2:time2, data: JSON.stringify(doc)});
              });
  }
  else
  {
    res.render('error');
  }
}

/*      Get All ROA Prefix Changes  */
module.exports.roa_all_changes = function(req, res){
  var lastUpdate = getLastUpdate();
  var time1 = req.params.Time1;
  var time2 = req.params.Time2;
  var reg1 = time_reg_exp.exec(time1);
  var reg2 = time_reg_exp.exec(time2);
  if(reg1 != null && reg2 != null)
  {
        roa_Changes_Col.aggregate([{$match : {$or:[{T:time1}, {T:time2}]}},{$project : {_id:0, T:1, Pr:1, ML:1, AS:1, SKI:1}},{$group : {_id : {"Pr":"$Pr", "ML":"$ML", "AS":"$AS"} , doc: { $push: {T:"$T"}}, count: { $sum: 1 }}},{$match: {"count": {"$eq": 1}}},{$group : {_id : {"Pr":"$_id.Pr"} , docs: { $push: {T:"$doc.T", AS:"$_id.AS", ML:"$_id.ML"} }}}])//, {allowDiskUse:true})
        .then(function (doc)
              {
                res.render('RPKIChanges/ROA_All_Changes', {lastUpdate:lastUpdate, Time1:time1, Time2:time2, data: JSON.stringify(doc)});
              });
  }
  else
  {
    res.render('error');
  }
}


/*      Get Filtered ROV Validation Changes  */
module.exports.filtered_rov_changes = function(req, res){
  var lastUpdate = getLastUpdate();
  var time1 = req.params.Time1;
  var time2 = req.params.Time2;
  var version = parseInt(req.params.Version);
  var val1 = rir_reg_exp.exec(req.params.Validation1);
  var val2 = rir_reg_exp.exec(req.params.Validation2);
  var reg1 = time_reg_exp.exec(time1);
  var reg2 = time_reg_exp.exec(time2);
  if(reg1 != null && reg2 != null && !isNaN(version) && val1 != null && val2 != null)
  {
        rov_Changes_Col.aggregate([{$match : {T2:{$gt:time1, $lte:time2}}},{$group : {_id : {"Pr":"$Pr"} , doc: { $push: {T2:"$T2", T1:"$T1", D1:"$D1", D2:"$D2"} }}}])
        .then(function (doc)
              {
		  var data = [];
		  for(var i=0; i< doc.length; i++)
		  {
			var prefix = doc[i]._id["Pr"];
			var isIPV6 = (prefix.includes(":")) ? 1 : 0;
			if(version == 6 && isIPV6 == 1)
			{
				checkValidationChanges(doc[i], val1+"_"+val2, data);
			}
			if(version == 4 && isIPV6 == 0)
			{
				checkValidationChanges(doc[i], val1+"_"+val2, data);
			}
		  }
                res.render('RPKIChanges/Filtered_ROV_Changes', {lastUpdate:lastUpdate, Time1:time1, Time2:time2, data: JSON.stringify(data)});
              });
  }
  else
  {
    res.render('error');
  }
}


/*	Let the user select specific Prefix for ROV Changes	*/
module.exports.prefix_selection = function (req, res){
  var lastUpdate = getLastUpdate();
  res.render('Prefix_Validation/Prefix_Selection', {lastUpdate:lastUpdate});
}

/*      Let the user select specific Prefix for ROV Changes     */
module.exports.prefix_roa_selection = function (req, res){
  var lastUpdate = getLastUpdate();
  res.render('RPKIChanges/Prefix_Selection', {lastUpdate:lastUpdate});
}

/*	Get Time Line ROV Changes for one Prefix	*/
module.exports.prefix_Validation_Chart = function(req, res){
  var lastUpdate = getLastUpdate();
  var prefix = req.params.Prefix;
  prefix = prefix.replace("|", "/");
  var reg_prefix = checkPrefixReg(prefix);
  if(reg_prefix != null)
  {
	pr_ROV_Col.find({"Pr":prefix}, function(err, doc){
      		res.render('Prefix_Validation/Prefix_Validation', {prefix:prefix, lastUpdate:lastUpdate, data:JSON.stringify(doc) });
    	});  
  }
  else
  {
    res.render('error');
  }
}


/*      Get Time Line ROV Changes for one Prefix        */
module.exports.roa_prefix = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;
  var reg = time_reg_exp.exec(time);
  var prefix = req.params.Prefix;
  prefix = prefix.replace("|", "/");
  var reg_prefix = checkPrefixReg(prefix);
  var origin = parseInt(req.params.Origin);

  if(reg != null && !isNaN(origin) && reg_prefix != null)
  {
        roa_Changes_Col.findOne({"Pr":prefix}, {_id:0, Fr:1, To:1}).then(function (doc){
		var data = doc.toJSON();
		var from = data.Fr;
		var to = data.To;
//		roa_Changes_Col.find({$or:[ {$and:[ {Fr: {$lte : from}, To: {$gte:to}}, {$or:[{T:time1}, {T:time2}]} ]}, {$and:[ {Fr: {$gte : from}, To: {$lte:to}}, {$or:[{T:time1}, {T:time2}]} ]} ]}, function(err, doc2){
          	roa_Changes_Col.find({$or:[ {$and:[ {Fr: {$lte : from}, To: {$gte:to}, T:time} ]}, {$and:[ {Fr: {$gte : from}, To: {$lte:to}, T:time} ]} ]}, function(err, doc2){
		       res.render('RPKIChanges/ROA_Prefix', {lastUpdate:lastUpdate, Time:time, Origin:origin, Prefix:prefix, From:from, To:to, data: JSON.stringify(doc2)});
         	});       
              });
  }
  else
  {
    res.render('error');
  }

}

/* Get The ROA File	*/
module.exports.roa = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;
  var roa_File = req.params.ROA; 
  
  var reg_time = time_reg_exp.exec(time);
  var reg_roa_File = roa_file_reg_exp.exec(roa_File);
  if(reg_time != null && reg_roa_File != null)
  {
    roa_Col.find({F:roa_File, T:time}, function(err, doc){
      res.render('Prefix_Validation/Roa_Details', {lastUpdate:lastUpdate, Time:time, data:JSON.stringify(doc) });
    });
  }
  else
  {
    res.render('error');
  }
}

/* Get Certificate Details	*/
module.exports.certificate = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;
  var cert = req.params.Cert; 
  var tree = req.params.Hierarchy;

  var reg_time = time_reg_exp.exec(time);
  var reg_cert = cert_file_reg_exp.exec(cert);
  var reg_tree = roa_tree_reg_exp.exec(tree);

  if(reg_time != null && reg_cert != null && reg_tree != null)
  {
    roa_Col.find({F:cert, T:time}, function(err, doc){
      res.render('Prefix_Validation/Certificate_Details', {lastUpdate:lastUpdate, Time:time, Tree:tree, data:JSON.stringify(doc) });
    });
  }
  else
  {
    res.render('error');
  }

}

/* Get Less Specific Prefixes according to User' selection */
module.exports.less_Prefixes = function(req, res){
  var lastUpdate = getLastUpdate();
  var prefix = req.params.Prefix;
  var from = Number(req.params.From);
  var to = Number(req.params.To); 
  
  var reg_time = checkPrefixReg(prefix);
  if(reg_time != null && !isNaN(from) && !isNaN(to))
  {
    pr_ROV_Col.find({$and: [{F: {$lte : from}, To: {$gte:to}}]}, {Pr:1, O:1, '_id':0}, function(err, doc){
      res.render('Prefix_Validation/Specific_Prefixes', {lastUpdate:lastUpdate, Prefix:prefix, Type:"Less", data:JSON.stringify(doc) });
      });
  }
  else
  {
    res.render('error');
  }
}

/* Get More Specific Prefixes according to User' selection */
module.exports.more_Prefixes = function(req, res){
  var lastUpdate = getLastUpdate();
  var prefix = req.params.Prefix;
  var from = Number(req.params.From);
  var to =  Number(req.params.To); 
  
  var reg_time = checkPrefixReg(prefix);
  if(reg_time != null && !isNaN(from) && !isNaN(to))
  {
    pr_ROV_Col.find({$and: [{F: {$gte : from}, To: {$lte:to}}]}, {Pr:1, O:1, '_id':0, F:1, To:1}, function(err, doc){
      res.render('Prefix_Validation/Specific_Prefixes', {lastUpdate:lastUpdate, Prefix:prefix, Type:"More", data:JSON.stringify(doc) });
      });
  }
  else
  {
    res.render('error');
  }
}

/*	Get RPKI Repository Analysis	*/
module.exports.repository_Charts = function(req, res){
  var lastUpdate = getLastUpdate();
  repository(res, lastUpdate, lastUpdate);
}

/*	Get RPKI Repository Analysis with parameters	*/
module.exports.repository_Param = function(req, res){
  var lastUpdate = getLastUpdate();
  var time = req.params.Time;  
  var rir = req.params.RIR;
  var reg_time = time_reg_exp.exec(time);
  var reg_rir = rir_reg_exp.exec(rir);

  if(reg_time != null && reg_rir != null)
  {       
     if(rir=="All")
     {
	repository(res, lastUpdate, time);
     }
     else
     {
	repository_Param(res, lastUpdate, time, rir);
     }
  }
  else
  {
    res.render('error');
  }
}


