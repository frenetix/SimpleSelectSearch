var _MENU_OPTIONS_MESSAGE =  " (minor updates)";// function generates the actual URL combining the selected text with the search engine config
//
// fixes stuff like & in search string
// plus vs %20
// replace %s with search string
function createURL(idSE, info) {
	var selectedText = encodeURIComponent(info.selectionText); 
	if (config.searchEngines[idSE].plus) 
		selectedText = selectedText.replace(/%20/g, "+"); 
	return config.searchEngines[idSE].url.replace(/%s/g, selectedText).replace(/%S/g, selectedText); 
}

// standard search function
function genericSearch(info, tab, idSE) {
	var urlSE = createURL(idSE, info);
	if (config.searchEngines[idSE].incognito){
		chrome.windows.create({"url": urlSE, "incognito": true});
	}
	else if (config.newTab) { 
		// ToDo: for "remember an update my created tabs" feature, here I'll store the ID of the created tab and then reuse it with an update. to store the ID of a created tab use a callback function on the tabs.create thing = function(Tab tab) {...};
		searchOnNewTab(urlSE, tab);
	}
	else {
		chrome.tabs.update(tab.id,{"url": urlSE});
	};
	trackGA(idSE);
}

// opens options.html
function openOptions() {
	chrome.tabs.create({"url": "options.html"});
}

// Enables/disables Open in new tab
function checkOnNewTab() {
	config.newTab = !config.newTab;
	localStorage["config"] = JSON.stringify(config);
	// ToDo: do i need to save the whole object?
}


// Search everywhere!
function bulkSearch(info, tab) {
	for (i = 0; i < config.searchEngines.length; ++i)
	{
		searchOnNewTab(createURL(i, info), tab);
		// ToDo: if incognito open in incognito
		trackGA(i);
	}
}

// Open results in new tab
function searchOnNewTab(urlSE, tab) {
	var newTab = {"url": urlSE, openerTabId: tab.id};
	if (config.newTabPosition == "First") {
		newTab.index = 0;
	}
	else if (config.newTabPosition == "Next") {
		newTab.index = tab.index +1;
	}
	else if (config.newTabPosition == "Previous") {
		newTab.index = tab.index;
	}
	newTab.active = config.newTabSelected;
	chrome.tabs.create(newTab);
}


//Tracks google analytics
function trackGA(idSE) {
	if (config.trackGA) {
		_gaq.push(['_trackEvent', 'Search Click', config.searchEngines[idSE].name, config.searchEngines[idSE].url]);
	}
	else{
		_gaq.push(['_trackEvent', 'Search Click', 'Confidential', 'Confidential']);
	}
}

// Create menu items
function createMenu () {
	chrome.contextMenus.removeAll();
	var context = "selection";
	var title = i18n("bg_searchStringOn");
	if (config.searchEngines.length > 1){
		var id = chrome.contextMenus.create({"title": title, "contexts":[context], "onclick": function(idSE) { return function(info, tab) {genericSearch(info, tab, idSE) } }(0)});
		for (i = 0; i < config.searchEngines.length; ++i)
		{
			var child = 	chrome.contextMenus.create(  {"title": config.searchEngines[i].name + ((config.searchEngines[i].incognito) ? " (i)" : ""), "parentId": id, "contexts":[context], "onclick": function(idSE) { return function(info, tab) {genericSearch(info, tab, idSE) } }(i)});
		}
		// separator
		createMenuSeparator(id, context);
		//search on all
		var child = 	chrome.contextMenus.create(  {"title": i18n("bg_searchEverywhere"), "parentId": id, "contexts":[context], "onclick": bulkSearch });
	  	// separator
	  	createMenuSeparator(id, context);
		// check new tab
		var child =	chrome.contextMenus.create({"title": i18n("bg_openOnNewTab"), "type": "checkbox", "checked": config.newTab, "parentId": id,  "contexts":[context], "onclick":checkOnNewTab});
		// options
		var optionsText = i18n("bg_options");
		if (newOptionsSeen != currVersion)
			optionsText += _MENU_OPTIONS_MESSAGE;
		var child =	chrome.contextMenus.create(  {"title": optionsText, "parentId": id, "contexts":[context], "onclick": openOptions });
	}
	else
	{
		title = title + " ";
		for (i = 0; i < config.searchEngines.length; ++i)
		{
			var id = chrome.contextMenus.create({"title": title + config.searchEngines[i].name, "contexts":[context], "onclick": function(idSE) { return function(info, tab) {genericSearch(info, tab, idSE) } }(i) });
		}
	}
}

function createMenuSeparator(id, context) {
	var child = 	chrome.contextMenus.create(  {"type": "separator", "parentId": id, "contexts":[context] });

}
function i18n("key"){
	chrome.i18n.getMessage("key");
}
// Google Analytics stuff

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-23660432-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    //ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

//open Options if first time or updates happened
function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];
var newOptionsSeen = localStorage['newOptionsSeen'];

if (currVersion != prevVersion)
	localStorage['version'] = currVersion;

var config = {};
if (typeof localStorage["config"] == 'undefined') {
	openOptions();
}
else {
	config = JSON.parse(localStorage["config"]);
	// Initialize menu
	createMenu ();
}

function allEmptyGroups() {
	for(var i=0; i<config.searchEngines.length; i++) {
		if(config.searchEngines[i].group !== "none") return false;
	}
	return true;
}