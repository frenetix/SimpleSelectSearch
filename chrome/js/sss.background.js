// Todo's

var defaultConfig = {
	"newTab":true,
	"newTabSelected":true,
	"newTabPosition":"Last",
	"trackGA":true,
	"showBlog":true,
	"searchEngines" : [
	{"name":"Youtube","url":"http://www.youtube.com/results?search_query=%s&aq=f"},
	{"name":"IMDB","url":"http://www.imdb.com/find?q=%s&s=all"},
	{"name":"Wikipedia","url":"http://en.wikipedia.org/w/index.php?title=Special:Search&search=%s"}
	]
};

var amazonSites = [
{"language":"en-us","name":"Amazon","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=aps&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
{"language":"en-us","name":"Amazon Kindle","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-text&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
{"language":"de-de","name":"Amazon DE","url":"http://www.amazon.de/gp/search?ie=UTF8&keywords=%s&tag=sisese0b-21&index=aps&linkCode=ur2&camp=1638&creative=6742","type":"Comerce","language":"English"},
{"language":"es-es","name":"Amazon ES","url":"http://www.amazon.es/gp/search?ie=UTF8&keywords=%s&tag=sisese0c-21&index=aps&linkCode=ur2&camp=3626&creative=24790","type":"Comerce","language":"English"},
{"language":"it","name":"Amazon IT","url":"http://www.amazon.it/gp/search?ie=UTF8&keywords=%s&tag=sisese07-21&index=aps&linkCode=ur2&camp=3370&creative=23322","type":"Comerce","language":"English"},
{"language":"en-us","name":"Amazon Mp3","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
{"language":"en-us","name":"Amazon Music","url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
{"language":"en-gb","name":"Amazon UK","url":"http://www.amazon.co.uk/gp/search?ie=UTF8&keywords=%s&tag=sisese-21&index=aps&linkCode=ur2&camp=1634&creative=6738","type":"Comerce","language":"English"},
{"language":"en-ca","name":"Amazon Canada","url":"http://www.amazon.ca/gp/search?ie=UTF8&camp=15121&creative=330641&index=aps&keywords=%s&linkCode=ur2&tag=sisese0b-20","type":"Comerce","language":"English"}
];

var config = initializeConfig(localStorage["config"], defaultConfig);

function applyLocalization(tempConfig) {
	var languageFound = false;
	for (i in amazonSites){
		if (window.navigator.language.toLowerCase()==amazonSites[i].language) { 
			tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ amazonSites[i].name +'", "url": "'+ amazonSites[i].url +'"}'));
			languageFound = true;
		}
	}
	if (!languageFound) {
		tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ amazonSites[0].name +'", "url": "'+ amazonSites[0].url +'"}'));
		tempConfig.searchEngines.splice(tempConfig.searchEngines.length,0,JSON.parse('{"name": "'+ amazonSites[1].name +'", "url": "'+ amazonSites[1].url +'"}'));
	}
	return tempConfig;
}

function initializeConfig(localConfig, defaultConfig) {
	if (localConfig == undefined) {
			//future me: load defaultConfig from website, dynamically
				//see this, http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
				//but i guess it will be easier to just load a page with the JSON... except for performance
				localConfig = applyLocalization(defaultConfig);
			// insert code for localization for amazon here 
			// window.navigator.language



			localStorage["config"] = JSON.stringify(localConfig);

		}
		else {
			localConfig = JSON.parse(localConfig);

			//compares localConfig with defaultConfig
			for (var key in defaultConfig) {
				if (defaultConfig.hasOwnProperty(key)) {
					if (localConfig[key] == undefined) {
						console.log(key + " -> " + defaultConfig[key] + " ---> " + localConfig[key] );
						localConfig[key] = defaultConfig[key];
					}
				}
			}
		};
		return localConfig;
	}

	function genericSearch(info, tab, idSE) {

		var urlSE = config.searchEngines[idSE].url.replace(/%s/g, info.selectionText).replace(/%S/g, info.selectionText);


		if (config.searchEngines[idSE].incognito){
			chrome.windows.create({"url": urlSE, "incognito": true});
		}
		else if (config.newTab) { 
			//for "remember an update my created tabs" feature, here I'll store the ID of the created tab and then reuse it with an update. to store the ID of a created tab use a callback function on the tabs.create thing = function(Tab tab) {...};
			searchOnNewTab(urlSE, info, tab);
		}
		else {
			//Todo: Refactor this out of the else and use the newTab variable
			chrome.tabs.update(tab.id,{"url": urlSE});

		};
		trackGA(idSE);

	}

	function openOptions() {
		chrome.tabs.create({"url": "options.html"});
	}

	function openBlog() {
		chrome.tabs.create({"url": "http://simpleselectsearch.blogspot.com/"});
	}

	function checkboxOnClick() {
		if (config.newTab) {
			config.newTab=false;

		}
		else {
			config.newTab=true;

		};

		localStorage["config"] = JSON.stringify(config);
		// ToDo: do i need to save the whole object?

	}

	function bulkSearch(info, tab) {
		for (i = 0; i < config.searchEngines.length; ++i)
		{

			searchOnNewTab(i, info, tab);
			trackGA(i);
		}
	}

	function searchOnNewTab(urlSE, info, tab) {

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
	var title = chrome.i18n.getMessage("bg_searchStringOn");
	if (config.searchEngines.length > 1){
		var id = chrome.contextMenus.create({"title": title, "contexts":[context], "onclick": function(idSE) { return function(info, tab) {genericSearch(info, tab, idSE) } }(0)});
		for (i = 0; i < config.searchEngines.length; ++i)
		{
			var child = 	chrome.contextMenus.create(  {"title": config.searchEngines[i].name + ((config.searchEngines[i].incognito) ? " (i)" : ""), "parentId": id, "contexts":[context], "onclick": function(idSE) { return function(info, tab) {genericSearch(info, tab, idSE) } }(i)});
		}
		// separator
		var child = 	chrome.contextMenus.create(  {"type": "separator", "parentId": id, "contexts":[context] });
		//search on all
		var child = 	chrome.contextMenus.create(  {"title": chrome.i18n.getMessage("bg_searchEverywhere"), "parentId": id, "contexts":[context], "onclick": bulkSearch });
	  	// separator
	  	var child = 	chrome.contextMenus.create(  {"type": "separator", "parentId": id, "contexts":[context] });
		// check new tab
		var child =	chrome.contextMenus.create({"title": chrome.i18n.getMessage("bg_openOnNewTab"), "type": "checkbox", "checked": config.newTab, "parentId": id,  "contexts":[context], "onclick":checkboxOnClick});
		// options
		var child = 	chrome.contextMenus.create(  {"title": chrome.i18n.getMessage("bg_options"), "parentId": id, "contexts":[context], "onclick": openOptions });
		//Blog
		if (config.showBlog){
			var child = 	chrome.contextMenus.create(  {"type": "separator", "parentId": id, "contexts":[context] });
			var child = 	chrome.contextMenus.create(  {"title": chrome.i18n.getMessage("bg_extensionBlog"), "parentId": id, "contexts":[context], "onclick": openBlog });
		}
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

// initialize menu
createMenu ();

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


//open Options if first time

function onInstall() {
	chrome.tabs.create({"url": "options.html"});
}

function getVersion() {
	var details = chrome.app.getDetails();
	return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];

if (currVersion != prevVersion) {
    if (typeof prevVersion == 'undefined') {
    	onInstall();
    }
    localStorage['version'] = currVersion;

}
