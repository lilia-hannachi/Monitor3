/*	Charts Properties	*/
var prefix_tree_width = 300;
var prefix_tree_height = 300;
var prefix_tree_margin = {top: 20, right: 55, bottom: 20, left: 220};
var bar_margin = {top: 80, right: 80, bottom: 5, left: 60};
var donut_width = 350;
var donut_height = 350;
var line_width = 380;
var line_height = 200;
var bar_width = 560;
var bar_height = 380;


var rir_labels = {"A":"ARIN", "R":"RIPE", "P":"APNIC", "F":"AFRINIC", "L":"LACNIC"};
var col_labels = {"I":"ISC", "E":"EQUIX", "L":"LINX", "N":"NWAX", "R3":"RouteViews3", "R4":"RouteViews4", "SP":"SAOPAULO", "SP2":"SAOPAULO2", "AF":"NAPAFRICA", "SF":"SFMIX", "SG":"SINGAPORE", "SD":"SYDNEY", "T":"TELXATL",
"D":"DIXIE(WIDE)", "K":"KIXP", "O6":"OREGON(V6)", "P":"PERTH", "O":"OREGON", "SX":"SOXRS", "J":"JINX"};
var addr_labels = {"6":"IPV6", "4":"IPV4"};
var hour_labels = {"00":"00", "06":"06", "12":"12", "18":"18"};
var invalid_labels = {"IM":"Invalid:ML", "IS":"Invalid:AS", "ISM":"Invalid:AS-ML"};
var time_label = "time_str";
var space = "&nbsp; &nbsp;&nbsp; &nbsp;";
var input_time = lastUpdate.substring(4, 6)+"/"+lastUpdate.substring(6, 8)+"/"+lastUpdate.substring(0, 4);
var input_hour = lastUpdate.substring(9, 11);

function time_format(time)
{
    return time.substring(0, 4)+"-"+time.substring(6, 8)+"-"+time.substring(4, 6)+":"+time.substring(9, 11);
}

function init_time_div()
{  
	var result = '<section class="section">';
	result += '<nav class="navbar navbar-toggleable-md navbar-expand-lg scrolling-navbar">';
	result += '<div class="nav navbar-nav mx-auto form-row">';
	result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block">Date : </span>';
	result += '<input id="datepicker" width="146" value="'+input_time+'"/></div>'+space;
	return result;
}

/* Check if the user already selected values	*/
function initial_selection(init_selected_elem, elem_str, obj_labels)
{
	var label, add_option="", option_disabled="";
	if(obj_labels[elem_str] == undefined)
	{
		add_option = "<option value=''> "+elem_str+" </option>";
		label = elem_str;
	}
	else
	{
		option_disabled="disabled";
		label = obj_labels[elem_str];
	}
	var str = "";
	if(init_selected_elem == elem_str)
	{
		str = "<option value='' "+option_disabled+" selected> "+label+" </option>";
	}
	else
	{
		str = "<option value='"+init_selected_elem+"' disabled selected> "+obj_labels[init_selected_elem]+" </option>";
		/*	Add option if the value is All and not version */
		str += add_option;
	}
	return str;
}

function init_elem_div(elem, init_selected_elem, elem_str, txtField, obj_labels)
{
	var result = space+'<div class="form-group mb-2"> <span class="nav-link  clearfix d-none d-sm-inline-block">'+txtField+' : </span>';
	result += '<select class="browser-default form-control" id="'+elem+'" name="'+elem+'">';
	
	result += initial_selection(init_selected_elem, elem_str, obj_labels);
	
        var keys = Object.keys(obj_labels);
        keys.sort();
    	keys.forEach(function(key)
    	{
    		result += '<option value="'+key+'">'+obj_labels[key]+'</option>';
    	});
	result += '</select></div>'; 
	return result;
}

function submit_div(init_version, init_rir, init_val, lastUpdate, page)
{
	var result = space+'<div style="height:115px; position:relative;">';
	result += '<button type="button" class="btn btn-primary submit_Search" onclick=submitAllFunction("'+init_version+'","'+init_rir+'","'+init_val+'","'+lastUpdate+'","'+page+'")> Submit </button>';
	result += '</div>';
	result += '</div></nav></section><br/>';
        return result;
}

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

function roa_prefix_submit()
{
	var prefix = document.getElementById("Prefix").value;
	var origin = document.getElementById("Origin").value;
	var time = document.getElementById("time").value;
	var e1 = document.getElementById("Hour");
	var hour = e1.options[e1.selectedIndex].value;
	if(hour == "" || time == "" || origin == "" || prefix=="")
        {
                alert("Prefix, Origin and Date must be filled out");
        }
	else
	{
		var time_str = time.substring(6, 10) + time.substring(0,2) + time.substring(3,5) +"."+ hour;
		var reg_prefix = checkPrefixReg(prefix);
  		var asn = parseInt(origin);
		if(!isNaN(asn) && reg_prefix != null)
		{		
			prefix = prefix.replace("/", "|");
                	window.location.href= '/ROAPrefix/'+prefix+'/'+origin+"/"+time_str;
		}
		else
		{
			alert("Prefix and Origin AS must be Valid");
		}
	}
}

function submit_ROV_Changes(type)
{
	var time1 = document.getElementById("time1").value;
	var time2 = document.getElementById("time2").value;
	var e1 = document.getElementById("Hour1");
	var hour1 = e1.options[e1.selectedIndex].value;
  hour1 = (hour1 == "" ? "00" : hour1);
        var e2 = document.getElementById("Hour2");
        var hour2 = e2.options[e2.selectedIndex].value;
        hour2 = (hour2 == "" ? "00" : hour2);
        
        if(hour1 == "" || hour2 == "" || time1 == "" || time2 == "")
        {
        	alert("Dates and hours must be filled out");
        }
        else
        {
		var time_str1 = time1.substring(6, 10) + time1.substring(0,2) + time1.substring(3,5) +"."+ hour1;
                var time_str2 = time2.substring(6, 10) + time2.substring(0,2) + time2.substring(3,5) +"."+ hour2;
        	if(time_str1 == time_str2)
                {
                	alert("Date1 and Date2 must be different");
                }
                else
                {
                        var dataSort = new Array();
                        dataSort.push(time_str1);
                        dataSort.push(time_str2);
                        dataSort = dataSort.sort();
			if(type == 0)
			{
                		window.location.href= '/ROVChang/'+dataSort[0]+"/"+dataSort[1];
			}
			if(type == 1)
			{
				window.location.href= '/ROAChang/'+dataSort[0]+"/"+dataSort[1];
			}
                }
        }
}

function time_changes_menu(type, label1, label2)
{
        var result = '<section class="section">';
        result += '<nav class="navbar navbar-toggleable-md navbar-expand-lg scrolling-navbar">';
        result += '<div class="nav navbar-nav mx-auto form-row">';
        result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block"> '+label1+' : </span>';
        result += '<input id="time1" width="200" /></div>'+space;
        result += space+init_elem_div("Hour1", input_hour, input_hour, "Hour", hour_labels)+space;
        result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block"> '+label2+' : </span>';
        result += '<input id="time2" width="200" value="'+input_time+'" /></div>'+space;
        result += space+init_elem_div("Hour2", input_hour, input_hour, "Hour", hour_labels);
        result += space+'<div style="height:115px; position:relative;">';
	result += '<button type="button" class="btn btn-primary submit_Search" onclick=submit_ROV_Changes('+type+')> Submit </button>';
        result += '</div>';
        result += '</div></nav></section><br/>';
        return result;
}


function rov_time_changes(type)
{
	var result = time_changes_menu(0, "From Date", "To Date");
        return result;
}

function roa_time_changes(type)
{
        var result = time_changes_menu(1, "Date 1 ", "Date 2");
        return result;
}

function roa_prefix()
{
	var result = '<section class="section">';
        result += '<nav class="navbar navbar-toggleable-md navbar-expand-lg scrolling-navbar">';
        result += '<div class="nav navbar-nav mx-auto form-row">';

        result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block"> Selected ROA Prefix : </span>';
        result += '<input id="Prefix" width="100" /></div>'+space;
        
	result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block"> Origin AS : </span>';
        result += '<input id="Origin" width="100" /></div>'+space;

	result += '<div class="form-group col-md-2"> <span class="nav-link  clearfix d-none d-sm-inline-block"> Date : </span>';
        result += '<input id="time" width="200" value="'+input_time+'" /></div>'+space;
        result += space+init_elem_div("Hour", input_hour, input_hour, "Hour", hour_labels)+space;
        result += space+'<div style="height:115px; position:relative;">';
        result += '<button type="button" class="btn btn-primary submit_Search" onclick=roa_prefix_submit()> Submit </button>';
        result += '</div>';
        result += '</div></nav></section><br/>';
        return result;
}



function coverage_origin_Search()
{
	var result = space+'<div class="form-group mb-2"> <span class="nav-link  clearfix d-none d-sm-inline-block">Origin AS: </span> '+space;
        result += '<input type="text" class="form-control" id="AS_Input" size="7"></div>'+space;
        result += '<div style="height:115px; position:relative;">';
        result += '<button type="button" class="btn btn-primary submit_Search" onclick=origin_Search()>Submit</button>';
	result += '</div>';
	result += '</div></nav>';
        result += '</section><br/>';
        return result;
}

function origin_Search()
{
        var value = document.getElementById('AS_Input').value;
        /* Default Origin = 0	*/
 	value = (value=="" ? 0 : value);
	/* Get selected valued in each Time, Hour, RIR, Collector Family Address selections */
	var time = getTimeValue("datepicker", "Hour", lastUpdate);
    	var rir = getInputValue("RIR", "All");
    	var invalidROV = getInputValue("Collector", "All");
    	var version = getInputValue("Version", "4");
	var reg = new RegExp('^\\d+$');
        if(reg.test(value))
        {
        	window.location.href= '/CovO/'+time+"/"+rir+"/"+invalidROV+"/"+version+"/"+value;
        }
        else
        {
	    alert("AS Number Must be Integer");
        }
}

function submit_Repository(lastUpdate)
{
    /* Get selected valued in each Time, Hour, RIR, Collector Family Address selections */
    var time = getTimeValue("datepicker", "Hour", lastUpdate);
    var rir = getInputValue("RIR", "All");
    if(time != undefined)
    {
			window.location.href= "/RPKI/"+time+"/"+rir;
    }   
}

function repository_Selection(lastUpdate, init_rir)
{
    var result = init_time_div()+space;
    result += space+init_elem_div("Hour", input_hour, input_hour, "Hour", hour_labels);
    result += space+init_elem_div("RIR", init_rir, "All", "RIR", rir_labels);
    result += space+'<div style="height:115px; position:relative;">';
	  result += '<button type="button" class="btn btn-primary submit_Search" onclick=submit_Repository("'+lastUpdate+'")> Submit </button>';
	  result += '</div>';
	  result += '</div></nav></section><br/>';
    return result;
}

function selection_div(init_version, init_rir, init_val, lastUpdate, type)
{
        var result = init_time_div();
        result += init_elem_div("Hour", input_hour, input_hour, "Hour", hour_labels);
        result += init_elem_div("RIR", init_rir, "All", "RIR", rir_labels);
	if(type == 0)
	{
		/*	Collector Menu	*/
        	result += init_elem_div("Collector", init_val, "All", "Collector", col_labels);
	}
	else
	{
		/*	Invalid Menu	*/
		result += init_elem_div("Collector", init_val, "All", "Validation", invalid_labels);
	}
        result += init_elem_div("Version", init_version, "4", "Address", addr_labels);
        return result;

}

/* initialise div with Time, Hour, RIR, Collector Family Address selections */ 

function time_div(init_version, init_rir, init_col, lastUpdate, page)
{
	var result = selection_div(init_version, init_rir, init_col, lastUpdate, 0);
	result += submit_div(init_version, init_rir, init_col, lastUpdate, page);
	return result;
}

/* initialise div with Time, Hour, RIR, Invalid Type, and Family Address selections */

function coverage_div(init_version, init_rir, init_inv, lastUpdate, page)
{
        var result = selection_div(init_version, init_rir, init_inv, lastUpdate, 1); 
	result += submit_div(init_version, init_rir, init_inv, lastUpdate, page);
        return result;
}

/*	Selection for list of Invalid Prefixes with coverage details	*/
function coverage_Invalid_div(init_version, init_rir, init_inv, lastUpdate)
{
        var result = selection_div(init_version, init_rir, init_inv, lastUpdate, 1);
        result += coverage_origin_Search();
        return result;
}

/* Check if there is data available for the selected Collector	*/
function check_Col_Data(version, collector)
{
	/* There is no data if version is IPV4 and the selected collector is Oregon V6
 	 * Or version is IPV6 and the selected collector is either Oregon or KIXP*/ 
	if((version=="4" && collector=="O6") || (version=="6" && (collector=="O" || collector=="K")))
	{
		return false;
	}
	else
	{
		return true;
	}
}

function submitAllFunction(init_version, init_rir, init_col, lastUpdate, page)
{
    /* Get selected valued in each Time, Hour, RIR, Collector Family Address selections */
    var time = getTimeValue("datepicker", "Hour", lastUpdate);
    var rir = getInputValue("RIR", "All");
    var collector = getInputValue("Collector", "All");
    var version = getInputValue("Version", "4");

    if(time != undefined)
    {
	/*	Stay in the same page	*/
        if(init_version==version && init_rir==rir && init_col==collector)
	{
		timeFunction(time);
	}
	else
	{
		var col_data_availability = check_Col_Data(version, collector);

		if(col_data_availability)
		{
			window.location.href= page+"/"+time+"/"+rir+"/"+collector+"/"+version;
		}
		else
		{
			alert("There are no available IPV"+version+" data in the selected Collector");
		}
	}
    }
    
}

/* Get Time Selected by end-user       */
function getTimeValue(timeElem, hourElem, lastUpdate)
{
    var time = document.getElementById(timeElem).value;
    var hour = getInputValue(hourElem, "00");
    if(time == "")
    {
	return lastUpdate;
    }
    else
    {
        var time_str = time.substring(6, 10) + time.substring(0,2) + time.substring(3,5) +"."+ hour; 
	return compareDates(time_str, lastUpdate);
    }
}

/*	Compare the selected date and the last update time, if selected date is after our last update then send alert */
function compareDates(time_str, lastUpdate)
{
    var date1 = dateFormat(lastUpdate);
    var date2 = dateFormat(time_str);
    if(date2.getTime() > date1.getTime())
    {        
        document.getElementById("datepicker").value = input_time;
        alert("Selected Date is after our last update date, Please select another date");        
    }
    else
    {
 	return time_str;
    }
}

/*	JS Date Format YYYY/MM/DD	*/
function dateFormat(time)
{	
	var date  = new Date(time.substring(0, 4)+"/"+time.substring(4, 6)+"/"+time.substring(6, 8));
	date.setHours(time.substring(9, 11));
	return date;
}

/* Get value Selected by end-user	*/
function getInputValue(elem, defaultValue)
{
    var e1 = document.getElementById(elem);
    var value = e1.options[e1.selectedIndex].value;
    if(value == "")
    {
    	return defaultValue;
    }
    else
    {
    	return value;
    }
}


function page_title1(param)
{
    var result = '<section class="section"><div class="row"><div class="col">';
    result += '<nav class="navbar navbar-toggleable-md navbar-expand-lg scrolling-navbar"><div class="breadcrumb-dn mr-auto">';
    result += '<h5 id="title">'+param['title']+'</h5></div>';
    result += '<ul class="nav navbar-nav mx-auto">';
    result += '<li class="nav-item"><span class="nav-link clearfix d-none d-sm-inline-block"><B>Address Family:</B> '+param['version']+'</span></li>';
    return result;
}

function page_title2(param)
{       
    var result = space+'<li class="nav-item"><span class="nav-link clearfix d-none d-sm-inline-block"><B>Region:</B> '+param['rir']+'</span></li>';   
    result += space+'<li class="nav-item"><span class="nav-link clearfix d-none d-sm-inline-block" id="'+time_label+'"><B>Date:</B> '+param['time']+'</span></li>';    
    result += '</ul></nav></div></div></section><br/>';   
    return result;
}

function page_title(param)
{
	var result = page_title1(param);
	result += space+'<li class="nav-item"><span class="nav-link clearfix d-none d-sm-inline-block"><B>Collector:</B> '+param['col']+'</span></li>';         
    result += page_title2(param);   
    return result;
}

function get_Json_button(div_name, file_name)
{    
        return '<button type="button" class="btn btn-info" onclick= downloadJSONFile("'+div_name+'","'+file_name+'.json")>JSON</button>';
}

function save_Image(div_name, img_title)
{
    var file_name = img_title+".png"; 
    saveSvgAsPng(div_name, file_name,{"backgroundColor":"white"});
}

function chart_basic_div(param, type)
{
    var col = (type==0 ? 6 : 12);
    var div_name = param["div_name"]+"s";
    var img_title = param["title"].replace(/\s/g, "_");
    var result ='<div class="col-xl-'+col+'"><div class="card card-info"><div class="card-header">';
    result += '<div class="header-block"><h5 class="title">'+ param["title"] +'</h5></div></div>';
    result += '<div class="card-block"><div id="'+param["div_name"]+'"></div>';
    result += '<div id="'+param["legend"]+'"></div>';
    result += '</div>';
    result += '<div class="card-footer text-center" id="footer_'+param["div_name"]+'">';
    result += '<button type="button" class="btn btn-info" onclick=save_Image('+div_name+',"'+img_title+'")>PNG</button>';
    result += (type!=2 ? get_Json_button(param["div_name"], img_title) : "");
    result += '<button type="button" class="btn btn-info" data-toggle="collapse" data-target="#Desc_'+param["div_name"]+'">Description</button>';
    result += '<div id="Desc_'+param["div_name"]+'" class="collapse in">'+ param["desc"]+'</div></div></div></div>';
    return result;
}

function chart_div(param)
{	
    var result = chart_basic_div(param, 1);
    return result; 
}

function chart_div_without_JSON(param)
{
    var result = chart_basic_div(param, 2);   
    return result;
}


function table_div(div_name)
{
	result = '<section class="section"><div class="row"><div class="col-xl-12">';
	result += '<div class="card card-info table-responsive"><div class="card-block"><div id="'+div_name+'"></div>';
    	result += '</div></div></div></div></section><br/>';                    
    	return result;  
}


/*	Button color for the ROV validation values	*/
function getValValue(value, class_val)
{
    if(value != undefined)
		return "<td><button class='disabled btn btn-rounded btn-sm "+class_val+"'>"+value+"</button></td>";
    else
        return "<td><button type='button' class='disabled btn btn-rounded btn-sm "+class_val+"'> 0 </button></td>";
}

function subLine()
{
    return " <th> Error </th><th> Warning </th><th> Valid </th> ";
}

function getColor(val, class_name)
{
    var active = (val==0) ? "disabled" : "";
    return "<td><button style='padding:0.5rem;' type='button' class='btn btn-rounded "+class_name+" "+active+"'> <strong style='color:black;'>"+val+"</strong></button></td>";
}


function generate_repo_Table(divName, data)
{   
    var table = "<table class='table'><thead class='thead-dark text-center'><tr><B><th rowspan=2>RIR</th><th colspan=3>.cer</th><th colspan=3>.roa</th><th colspan=3>.mft</th><th colspan=3>.crl</th></B></tr>";   
    table += "<tr>"+subLine()+subLine()+subLine()+subLine()+"</tr></thead>";

    for(var i=0; i<data.length; i++)
    {
        var val = data[i];
        table += "<tr><td>"+rir_labels[val["V"]]+"</td>"+getColor(val[".cer"]["e"], "btn-danger")+getColor(val[".cer"]["w"], "btn-warning")+getColor(val[".cer"]["v"], "btn-success");
        table += getColor(val[".roa"]["e"], "btn-danger")+getColor(val[".roa"]["w"], "btn-warning")+getColor(val[".roa"]["v"], "btn-success");
        table += getColor(val[".mft"]["e"], "btn-danger")+getColor(val[".mft"]["w"], "btn-warning")+getColor(val[".mft"]["v"], "btn-success");
        table += getColor(val[".crl"]["e"], "btn-danger")+getColor(val[".crl"]["w"], "btn-warning")+getColor(val[".crl"]["v"], "btn-success");
        table += "</tr>";
    }
    table += "</table>";
    document.getElementById(divName).innerHTML = table;        
}

function generate_repo_rir_Table(divName, data, rir)
{
   
    var table = "<table class='table'><thead class='thead-dark'>";
    table += "<tr><th>"+rir_label[rir]+"</th><th> Error </th><th> Warning </th><th> Valid </th></tr>";

    for(var i=0; i<data.length; i++)
    {
        var val = data[i];
        if(val["V"] == rir)
        {              
            table += "<tr><th>.cer</th>"+getColor(val[".cer"]["e"], "btn-danger")+getColor(val[".cer"]["w"], "btn-warning")+getColor(val[".cer"]["v"], "btn-success")+"</tr>";
            table += "<tr><th>.roa</th>"+getColor(val[".roa"]["e"], "btn-danger")+getColor(val[".roa"]["w"], "btn-warning")+getColor(val[".roa"]["v"], "btn-success")+"</tr>";
            table += "<tr><th>.mft</th>"+getColor(val[".mft"]["e"], "btn-danger")+getColor(val[".mft"]["w"], "btn-warning")+getColor(val[".mft"]["v"], "btn-success")+"</tr>";
            table += "<tr><th>.crl</th>"+getColor(val[".crl"]["e"], "btn-danger")+getColor(val[".crl"]["w"], "btn-warning")+getColor(val[".crl"]["v"], "btn-success")+"</tr>";
        }
    }

    table += "</thead></table>";
    document.getElementById(divName).innerHTML = table;        
}

function changes_ROA_Filter(version)
{
        var result = '<section class="section"  id="filterDiv'+version+'" style="display:none;">';
        result += '<div class="row"> <div class="col-xl-12"> <nav class="navbar navbar-toggleable-md navbar-expand-lg scrolling-navbar">';
        result += '<div class="nav navbar-nav mx-auto form-row"> <div class="form-group col-md-2"> <label>Origin </label> &nbsp; &nbsp;';
        result += '<select id="Origin'+version+'" class="browser-default form-control dropdown-primary" multiple style="max-width:100px"></select></div>&nbsp; &nbsp;';
        result += '<div class="form-group col-md-2"> <label>Max Length </label> &nbsp; &nbsp;';
        result += '<select id="ML'+version+'" class="browser-default form-control dropdown-primary" multiple style="max-width:100px"></select></div>&nbsp; &nbsp;';
        result += '<div class="form-group col-md-2"> <label>N<span>&#176;</span> Changes </label> &nbsp; &nbsp;';
        result += '<select id="Count'+version+'" class="browser-default form-control dropdown-primary" multiple style="max-width:100px"></select> </div>&nbsp; &nbsp;';
        result += '<div class="form-group col-md-3"> <label>Validation </label> &nbsp; &nbsp;';
        result += '<select id="ValChang'+version+'" class="browser-default form-control dropdown-primary" multiple style="max-width:200px"></select> </div>&nbsp; &nbsp;';
        result += '<div style="height:160px; position:relative;"><button type="submit" class="btn btn-primary btn-md submit_Search" style="margin:0;" onclick=submitFunction('+version+')> Filter Data</button>';
        result += '</div> </div> </nav> </div> </div> </section> <br/>';
	return result;
}


function changes_ROA_Table(version)
{
	var result = '<section class="section" id="Prefixes'+version+'"  style="display:none;"> <div class="row"> <div class="col-xl-12">';
        result += '<div class="card card-info table-responsive table-responsive-sm table-responsive-md" id="table'+version+'"></div>';
        result += '</div></div></section><br/>';
	return result;
}

function Changes_ROA_Bar(version, type, title)
{
	var result = '<div class="col-xl-6" id="Chart'+version+type+'" style="display:none;"> <div class="card card-info">';
        result += '<div class="card-header"> <div class="header-block">';
	result += '<h5 class="title">  <B> '+title+' </B></h5> </div> </div>';
        result += '<div class="card-block"> <div id="div_Chart'+version+type+'"></div><div id="Time'+version+type+'"></div>';
        result += '</div> </div> </div>';
	return result;
}
