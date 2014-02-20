/*jslint browser: true, continue: true, evil: true, indent: 4, maxerr: 999, newcap:true, nomen: true, plusplus: true, regexp: true, white: true */


//object bj loads the BackgroundPage object to reference from the options page
var bg = chrome.extension.getBackgroundPage();

//initialization variables for "My search engines" table (i need to confirm)
var focusIndex = 1;
var tableIndex = -1;

//object used in case Undo is pressed on impor/export settings
var undoConfig = bg.config;

// key code constants (RETURN and ESCAPE Keys) used for "MY search engines" table
var KEYCODE_ENTER = 13;
var KEYCODE_ESC = 27;

// @function options.loadOptions
    // @descr
    //  This function sets all html controls on options page according to the bg.config object.
	//
	// It binds click events to Right Hand menu.
	//
	// It binds click events to the html controls mentioned above
	//
	// It also runs drawTable() which writes the "My search engines" table.
	//
	// Originally, this function was run on "onPageLoad" but after manifest update, it's run on jQuery $(document).ready
	//
    // @warnings
	// I belive the following lie is wrong!
	// $("#newTab").on("change", trackGA);
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    //  will pure template render most of this stuff unnecesary? https://github.com/frenetix/SimpleSelectSearch/issues/7
	//
	// separate navigation from config edits stuff?

function loadOptions() {
		$('#newTab').attr("checked", bg.config.newTab);
		$('#newTabSelected').attr("checked", bg.config.newTabSelected);
		$('#trackGA').attr("checked", bg.config.trackGA);
		$('#showBlog').attr("checked", bg.config.showBlog);
		$("#newTabPosition").val(bg.config.newTabPosition);
	//binds for right hand menu
	$(".rightMenu li").click(function()
	{
		navSelectRightMenu(this);
	});
	//binds for advanced options
	$("#newTab").on("change", newTab);
	$("#newTabSelected").on("change", newTabSelected);
	$("#newTabPosition").on("change", newTabPosition);
	$("#showBlog").on("change", showBlog);
	$("#newTab").on("change", trackGA);

  	//binds for import/export
  	$("#eraseOptions").on("click", eraseOptions);
  	$("#importConfig").on("click", importConfig);
  	$("#undoLastImport").on("click", undoLastImport);

//	$(".contentContainer").html($(".content.searchEngines").html());
$(".content.searchEngines").fadeIn(2000);
drawOptions();

}

// @function options.drawOptions
    // @descr
    // This function wites the "My search engines" table.
	//
	// It writes the HTML to a variable, then iterates the bg.config.searchEngines and embeads one <TR> per each item on that list
	//
	// It replaces the HTML of the <DIV> containing that table (#data_table) and resets all binds (to sort, click to edit, etc.)
	//
	// Finally, updates the value of the Import/Export textarea
	//
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // This is the first thing to go out with a pure template https://github.com/frenetix/SimpleSelectSearch/issues/7

    function drawOptions() {


	//border-radius not working
	var tableHTML = "<table id='tableSE' width='750px' class='ui-jqgrid-btable' style='border-radius: 4em;'>";
	var startRowHTML = "";
	if (tableIndex == -1) { //DISPLAY MODE
		startRowHTML = "<tr id='index' class='urlRow'><td class='dragHandle'></td><td class='nameCell' id='nameindex'>";
	}
	else { //EDIT MODE
		startRowHTML = "<tr id='index' class='reserved'><td></td><td class='nameCell reserved' id='nameindex'>";
	}

	var midRowHTML = "</td><td id='URLindex' class='URLCell reserved' '>";
	var editHTML = "<div class='action' ><a class='edit' id='editindex'><img src='images/edit.png' alt='"+chrome.i18n.getMessage("o_edit")+"' title='"+chrome.i18n.getMessage("o_edit")+"'></a></div> <div class='action' ><a class='delete' id='deleteindex'><button class='trash custom-appearance' title='Remove from extension'><span class='lid'></span><span class='can'></span></button></a></div>"
	var endRowHTML = "</td></tr>";

	//header
	tableHTML +=  "<tr class='header' ><td width='20px' align='center'>#</td><td width='150px'>" + chrome.i18n.getMessage("o_name") + "</td><td width='500px'>"+chrome.i18n.getMessage("o_searchURL")+"</td><td align='center' width='40px'><a class='newLine reserved'><img src='images/new.png' alt='"+chrome.i18n.getMessage("o_new")+"' title='"+chrome.i18n.getMessage("o_new")+"'></a></td></tr>"


	//body
	for (i = 0; i < bg.config.searchEngines.length; ++i)
	{
		if (i==tableIndex)
		{
			//EDIT MODE
			tableHTML += "<tr id='"+i+"' class='urlRow reserved'><td class='reserved'></td><td class='reserved'><div class='row reserved'><input class='reserved' type='text' id='se_names' name='se_names' value='"+bg.config.searchEngines[i].name+"'></div></td><td class='reserved'><input class='reserved' type='text' id='se_querystrings' name='se_querystrings' value='"+bg.config.searchEngines[i].url+"' ></td><td  align='center' class='reserved'><div class='action reserved' ><a class='reserved save'><img src='images/ok.png' class='reserved' alt='"+chrome.i18n.getMessage("o_ok")+"' title='"+chrome.i18n.getMessage("o_ok")+"'></a></div> <div class='action reserved' ><a class='reserved cancel'><img class='reserved' src='images/cancel.png' alt='"+chrome.i18n.getMessage("o_cancel")+"' title='"+chrome.i18n.getMessage("o_cancel")+"'></a></div></td></tr>";


		}
		else
		{
			//DISPLAY MODE
			tableHTML += startRowHTML.replace(/index/g, i)+bg.config.searchEngines[i].name+midRowHTML.replace(/index/g, i)+bg.config.searchEngines[i].url.replace(/%s/g, "<span class='searchString'>%s</span>").replace(/%S/g, "<span class='searchString'>%S</span>")+"</td><td  align='center' id='actions"+i+"'>"+editHTML.replace(/index/g, i)+endRowHTML;

		};
	}

	//footer
	tableHTML += "</table>";

	$('#data_table').html(tableHTML);

	if (focusIndex==1){
		$("#se_names").focus();
	}
	else{
		$("#se_querystrings").focus();
	}

	//sorting code
	if (tableIndex == -1 && bg.config.searchEngines.length > 1) {
		$('#tableSE').tableDnD({
			onDrop: function(table, row) {
				reSort();
			},
			dragHandle: "dragHandle"
		});

		$("#tableSE tr").hover(function() {
			if (!this.classList.contains('header')){
				$(this.cells[0]).addClass('showDragHandle');}
			}, function() {
				$(this.cells[0]).removeClass('showDragHandle');
			});


	}
	else {
		//this removes the move pointer when there's only one line and we don't want to sort it.
		$('#tableSE td.dragHandle').removeClass('dragHandle');
	}

	//disables focus options if new tab is not selected
	if (bg.config.newTab) {
		$('.newTabOptions').removeAttr('disabled');
	}
	else {
		$('.newTabOptions').attr('disabled','disabled');
	}

	$('#importExport').val(JSON.stringify(bg.config));

	binder();
}

// @function options.binder
    // @descr
    // This function binds click events to all of the features on the "My searc engine" table
	//
	// Called from drawOptions()
	//
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

    function binder(){
	//binds cells actions
	$(".URLCell").on("click", function(event){
		editMe(this.id.replace("URL",""),2);
		return false;

	});
	$(".nameCell").on("click", function(){
		editMe(this.id.replace("name",""));
		return false;
	});
	$(".edit").on("click", function(){
		editMe(this.id.replace("edit",""));
		return false;
	});
	$(".delete").on("click", function(){
		deleteMe(this.id.replace("delete",""));
		return false;
	});
	$(".cancel").on("click", function(){
		cancelMe();
		return false;
	});
	$(".newLine").on("click", function(){
		addMe();
		return false;
	});

}

// @function options.reSort
    // @descr
    // This function updates the sort order to the bg.config.searchengines list.
	// The following is a literal translation from the original comments to this function... i don't really understand it now! :D
		//
		// create an empty JSON object
		// splice using bg.config.searchEngine per each row (??)
		// match bg.config.searchengines with the JSON object created
		//tempSearchEngines.splice(tempSearchEngines.length,0,bg.config.searchengines[$(this).attr('id')]);
		//
		// Originall spanish doc:
			//creo un obj json vacio
			//hago un splice con un bg.config.searchengine por cada row
			//igualo bg.config.searchengines con el obj que cree
			//tempSearchEngines.splice(tempSearchEngines.length,0,bg.config.searchengines[$(this).attr('id')]);
	//
	// Finally, it calls saveOptions()
	//
	// Called from drawOptions()
	//
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

    function reSort() {
    	var tmpJSON = {"searchEngines":[]};

    	$('tr.urlRow').each(function() {
    		tmpJSON.searchEngines.splice(tmpJSON.searchEngines.length,0,bg.config.searchEngines[$(this).attr('id')]);
    	});
    	bg.config.searchEngines = tmpJSON.searchEngines;
    	saveOptions();
    }

// @function options.editMe
    // @descr
    // It switches a row of "My search engines" table to edit mode.
	// It sets the global focusIndex and tableIndex values and then calls the drawOptions() function (which uses those gloval variables)
	// It binds the Return/escape to saveme/cancelme functions
	//
	//
	// Called from click events binded on binder() to several HTML elements
	//
    // @warnings
	//
	// @input
    //  0: index (INT)
		// Identifies the row index on the "My searc engines" table. 
		// It's used to set the value of the tableIndex global variable
	//  1: focus (INT) [opt]
		// Identifies the cell that will receive focus when on edit mode. It can be the name or url cell
		// It defaults to the name cell (1)
		//It's used to set the value of the focusIndex global variable
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

function editMe(index,focus) {
    	if (typeof focus == "undefined") {
    		focus = 1;
    	}
    	focusIndex = focus;

    	tableIndex = index;

    	drawOptions();

	//bindings
	$(':input').keyup(function(e) {
		if (e.keyCode == KEYCODE_ENTER) {
			saveMe();
			return false;
		}
		if (e.keyCode == KEYCODE_ESC) {
			cancelMe();
			return false;
		}
	});
	$(".save").on("click", function(){
		saveMe();
		return false;
	});
	$(document).off(); //weird double binding case... probably not necesary if DrawOptions() goes away
	$(document).on('click', function(event) {
		event.stopPropagation();
		if(event.target.className.indexOf("reserved")==-1) {
			saveMe();
		}
	});
}

// @function options.saveMe
    // @descr
    // This function saves data edited in "My search engines" table.
	// It impacts the data from the "My search engines" table to the bg.config.searchengines list
	//
	// It runs saveOptions() when done.
	//
	// Called from click events binded on editMe() to several HTML elements
	//
    // @warnings
	//
	// @input
    //  - 
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

function saveMe(){
    if((bg.config.searchEngines[tableIndex].name != $('#se_names').val()) || (bg.config.searchEngines[tableIndex].url != $('#se_querystrings').val())) 
    {
		bg.config.searchEngines[tableIndex].name = $('#se_names').val() ;
		bg.config.searchEngines[tableIndex].url = $('#se_querystrings').val() ;
		tempIndex = tableIndex ;
		tableIndex = -1;
		saveOptions();

		//the next is used for messages. 
		//ToDo: rename and probably encapsulate
		create("default", { title:'Saved!', text: bg.config.searchEngines[tempIndex ].name });
		$("#" + tempIndex ).effect("highlight", {}, 2500);
	}
	else
	{
		//Need to confirm why this is done. I believe it's to avoid saving something that's exactly the same as before.
		cancelMe();

	}
}

// @function options.cancelMe
    // @descr
    // This function exits the edit mode of "My search engines" table without saving.
    // If the table was on edit mode because of a new line is being added (addMe()) it deletes the cancelled new row calling deleteMe()
	//
	// It runs drawOptions() when done.
	//
	// Called from click events binded on editMe() and binder() to several HTML elements
	// Also called from editMe() and saveMe()
	//
    // @warnings
	//
	// @input
    //  - 
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -


function cancelMe() {
	$(document).off();
	if(bg.config.searchEngines[tableIndex].name==""){
		deleteMe(tableIndex,false);
	}
	else{
		tableIndex = -1;
		drawOptions();
	}
}

// @function options.deleteMe
    // @descr
    // This function deletes an item from the bg.config.searchEngines list, specified by the row index from the "My search engines" table.
	// Since the same function is used both for deleting, as for to cancelling a new addition, it requires or not confirmation (in that order). This is specified as an optional parameter.
	//
	// Called from click events binded on binder() to the delete icon (used for actually deleting) and also a click event binded on cancelMe() (used for deleting an "unborn" new row)
	//
    // @warnings
	//
	// @input
    //  0: index (INT)
		// Identifies the row index on the "My searc engines" table. 
	//  1: needsConfirmation (BOL) [opt]
		// Indicates if a confirm dialog is required.
		// It defaults to true.
    // @output
    //  Always false. (I wonder why? :))
    // @see
    //  -
    // @todo
    // -
    

function deleteMe(index,needsConfirmation){
	//default needsConfirmation is true
	if (typeof needsConfirmation == "undefined") {
		needsConfirmation = true;
	}
	if (needsConfirmation) {
		var answer = confirm(chrome.i18n.getMessage("o_sureYouWantToDelete"));
	}
	if (answer||!needsConfirmation){
		bg.config.searchEngines.splice(index,1);
		tableIndex = -1;
		saveOptions();
	}
	return false;
}

// @function options.addMe
    // @descr
    // This function appends a new row to the "My search engines" table and re-draws the table in edit mode
	// Called from click event binded on binder() to the add icon 
	//
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -
   
function addMe() {
	tableIndex = bg.config.searchEngines.length;
	//isn't there a better way???
	bg.config.searchEngines.splice(bg.config.searchEngines.length,0,JSON.parse('{"name": "", "url": ""}'));
	drawOptions();
}

// @function options.addImport
    // @descr
    // This function appends a new row to the "My search engines" imported from the "Featured search engines" table
	// Called from double click event binded to the #externalURLTable jqGrid
	// This function tracks on Google Analitycs
	//
    // @warnings
	//
	// @input
    //  0: ret (obj) This object is created by the jqGrid. It contains a single row from that table.
    // @output
    //  -
    // @see
    //  http://www.trirand.com/blog/
    // @todo
    // currently using jqGrid  4.4.1... it's an outdated version. If continue to be used, it should be updated to latest stable.
   
function addImport(ret) {

	bg.config.searchEngines.splice(bg.config.searchEngines.length,0,JSON.parse('{"name": "'+ret.name+'", "url": "'+ret.url+'"}'));

	saveOptions();
	bg._gaq.push(['_trackEvent', 'Options', 'Add Import', ret.name]);

}

// @function options.newTab
    // @descr
    // This function switches the bg.config.newTab value on/off
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Pure template renders this unnecesary?

function newTab(){
	bg.config.newTab = $('#newTab').is(':checked');

	saveOptions();
}

// @function options.newTabSelected
    // @descr
    // This function switches the bg.config.newTabSelected value on/off
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Pure template renders this unnecesary?

function newTabSelected(){
	bg.config.newTabSelected = $('#newTabSelected').is(':checked');
	saveOptions();
}

// @function options.newTabPosition
    // @descr
    // This function updates the bg.config.newTabPosition value
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Pure template renders this unnecesary?

function newTabPosition () {
	bg.config.newTabPosition = $("#newTabPosition").val();
	saveOptions();
}

// @function options.trackGA
    // @descr
    // This function switches the "Track with Google Analytics" (bg.config.trackGA) option on/off
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Pure template renders this unnecesary?

function trackGA(){
	bg.config.trackGA = $('#trackGA').is(':checked');
	saveOptions();
}

// @function options.showBlog
    // @descr
    // This function switches the "Show Blog" (bg.config.showBlog) option on/off
    // Miaws if turned off :)
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Pure template renders this unnecesary?

function showBlog(){
	bg.config.showBlog = $('#showBlog').is(':checked');
	if (!bg.config.showBlog){alert('Miaw! :o(');}
		saveOptions();
	}

// @function options.saveOptions
    // @descr
    // This function equals localStorage["config"] to bg.config
    //
    // @warnings
	//
	// @input
    //  0: needsReDrawOptions (Boolean) [opt]
    	// defaults to true
    	// defines if the drawOptions() function needs to be run before this function ends
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

function saveOptions(needsReDrawOptions) {
	//default needsReDrawOptions is true
	if (typeof needsReDrawOptions == "undefined") {
		needsReDrawOptions = true;
	}

	localStorage["config"] = JSON.stringify(bg.config);

	bg.createMenu ();
	//chrome.contextMenus.removeAll(function() {bg.createMenu ();});

	if (needsReDrawOptions) {
		drawOptions();
	}
}

// @function options.eraseOptions
    // @descr
    // This function restes the bg.config object running the bg.initializeConfig() function.
    // 
    // Called from click binding to #eraseOptions button on loadOptions()
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // -

function eraseOptions() {
	localStorage.removeItem("config");
	bg.config = bg.initializeConfig(undefined, bg.defaultConfig);
	chrome.contextMenus.removeAll(function() {bg.createMenu ();});
	location.reload();
}

// @function options.importConfig
    // @descr
    // This function imports settings pasted within the #importExport textarea.
    // It stores current config to a undoConfig global variable, then parses the JSON on the textarea and updates bg.config.
    // Then navigates to the "My search engines" table so users can see updates there.
    //
    // Called from click binding to #importConfig button on loadOptions()
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Implement Try/Catch where indicated

function importConfig() {
	if (confirm(chrome.i18n.getMessage("o_confirmImport"))) {
		bg._gaq.push(['_trackEvent', 'Options', 'Import Config', 'Import Config']);
		undoConfig = bg.config;
		bg.config = JSON.parse($('#importExport').val());
		alert(chrome.i18n.getMessage("o_importSuccesfull"));
		saveOptions();
		//ToDo: try/catch here
		navSelectRightMenu($(".rightMenu li.searchEngines"));
	}

}

// @function options.undoLastImport
    // @descr
    // This function restores config to the state previous to the last import.
    // It equals bg.config to the undoConfig global variable
    //
    // Then navigates to the "My search engines" table so users can see updates there.
    //
    // Called from click binding to #undoLastImport button on loadOptions()
    //
    // @warnings
	//
	// @input
    //  -
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Implement try/catch where indicated

function undoLastImport() {
	if (bg.config != undoConfig) {
		if (confirm(chrome.i18n.getMessage("o_confirmRestore"))) {
			bg._gaq.push(['_trackEvent', 'Options', 'Undo Import', 'Undo Import']);
			bg.config = undoConfig;
			alert(chrome.i18n.getMessage("o_restoreSuccesfull"));
			saveOptions();
		//ToDo: implement Try/Catch here
		navSelectRightMenu($(".rightMenu li.searchEngines"));
	}
}
else {
	alert(chrome.i18n.getMessage("o_nothingToRestore"));
}

}

// @function options.navSelectRightMenu
    // @descr
    // This function is used for Right Hand Menu navigation. 
    // It unselects all menu items and hides current seleced content.
    // Then selects the one clicked and fades in the correspondin content.
    //
    // This function is called from click binding on loadOptions()
    // Also called directly from importConfig() and undoLastImport()
    //
    // @warnings
	//
	// @input
    //  0: element (jQuery object) a specific LI element within the .rightMenu UL 
    	// eg: $(".rightMenu li.searchEngines")
    // @output
    //  -
    // @see
    //  -
    // @todo
    // Confirm if drawOptions() is necesary every time

function navSelectRightMenu (element) {
	$(".rightMenu li").removeClass("selected");
	//$(".contentContainer").html($(".content." + $(element).attr('class')).html());
	$(".content").hide();
	$(".content." + $(element).attr('class').replace('translate ','')).fadeIn(1000);
	$(element).addClass("selected");
	// is this necesary every time?
	drawOptions();

}



//google analytics code
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-23660432-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();

//Initialization

function create( template, vars, opts ){
	return $container.notify("create", template, vars, opts);
}

$(function(){
	$container = $("#container").notify();
});

jQuery(document).ready(function() {

	if (bg.messageVersion != "") {
		create("default", { title:chrome.i18n.getMessage("o_thankYou"), text: bg.messageVersion});
		bg.messageVersion ="";
	}

//Other Search Engines related code
jQuery("#externalURLTable").jqGrid({
	data: mydata,
	datatype: "local",
	height: 'auto',
	rowNum: 100,
	rowList: [10,20,30],
	colNames:[chrome.i18n.getMessage('o_name'), chrome.i18n.getMessage('o_searchURL'),chrome.i18n.getMessage('o_type'),chrome.i18n.getMessage('o_language')],
	colModel:[

	{name:'name',index:'name', width:150},
	{name:'url',index:'url', width:600},
	{name:'type',index:'type', width:100, hidden: true},
	{name:'language',index:'language', width:100, hidden: true},

	],
	pager: "#pexternalURLTable",
	viewrecords: true,
	sortname: 'name',
	ondblClickRow: function(id){
		var ret = jQuery("#externalURLTable").jqGrid('getRowData',id);
		addImport(ret);},
		grouping : true,
		groupingView : {
			groupField : ['type'],
			groupColumnShow : [false],
			groupText : ['<b>{0} - {1} Item(s)</b>'],
			groupCollapse : false,
			groupOrder: ['asc']
		},
		caption: chrome.i18n.getMessage('o_moreSearchEngines')

	});

jQuery("#chngroup").change(function(){
	var vl = $(this).val();
	if(vl) {
		if(vl == "clear") {
			jQuery("#externalURLTable").jqGrid('groupingRemove',true);
		} else {

				//jQuery("#externalURLTable").setGridParam('grouping',1).trigger('reloadGrid');
				jQuery("#externalURLTable").jqGrid('groupingGroupBy',vl).trigger('reloadGrid');
			}
		}
	});

jQuery("#externalURLTable").jqGrid('groupingRemove',true);
jQuery("#externalURLTable").setGridParam({sortname:'name'}).trigger('reloadGrid');

	//pass a URL from one table to another
	jQuery("#addURL").click( function(){
		var id = jQuery("#externalURLTable").jqGrid('getGridParam','selrow');
		if (id)	{
			var ret = jQuery("#externalURLTable").jqGrid('getRowData',id);
			addImport(ret);
		} else { alert(chrome.i18n.getMessage('o_selectAURL'));}
	});

	$(".translate").each(function(){
		this.textContent = chrome.i18n.getMessage(this.id);
	});
	$(".translateHTML").each(function(i,e){
		$(e).html(chrome.i18n.getMessage(e.id));
	});
	$(".translateVAL").each(function(){
		this.value = chrome.i18n.getMessage(this.id);
	});

});



$(document).ready(function() {

	loadOptions();
	$("#currentVersion").text("Version: " + bg.currVersion);
});
