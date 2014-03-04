/*jslint browser: true, continue: true, evil: true, indent: 4, maxerr: 999, newcap:true, nomen: true, plusplus: true, regexp: true, white: true */
/*global $, SSS, defaultConfig, amazonSites, config */

// @object background.SSS
// @descr
//  Global object which keeps in one place all required by extension's functions
// @warnings
//  * CODE IS IN REFACTORING PROCESS - __DO NOT USE IT__ UNTIL REFACTORING IS FINISHED!!!

var SSS;

// @function background.initializeExtensionsData
// @descr
//  This function fill global objects with data required to proper working other extension's functions.
//  In fact - this is huge config object.
// @warnings
//  * It should be always plain JavaScript object, as we're using jQuery.isEmptyObject in intialization
// @input
//  -
// @output
//  -
// @see
//  * http://api.jquery.com/jQuery.isEmptyObject/
// @todo
//  * Many of options are hardcoded (vide: search engines, amazon support urls) - put them all into browser database, may involve ajax request on install

function initializeExtensionsData () {
    "use strict";

    // fill the SSS object with data if it's empty (uninitialized)
    if ($.isEmptyObject (SSS)) {
        SSS = {
            // config to be used if user ever reset own settings to defaults, on extension install or when something went wrong and couldn't find in browser
            // database stored user's config
            configDefault : {
                "newTab"         : true,
                "newTabSelected" : true,
                "trackGA"        : true,
                "showBlog"       : true,
                "newTabPosition" :"Last",
                "searchEngines"  : [
                    {"name":"Youtube",      "url":"http://www.youtube.com/results?search_query=%s&aq=f" },
                    {"name":"IMDB",         "url":"http://www.imdb.com/find?q=%s&s=all" },
                    {"name":"Wikipedia",    "url":"http://en.wikipedia.org/w/index.php?title=Special:Search&search=%s" }
                ]
            },
            // user's stored current configuration
            configCurrent : JSON.stringify (localStorage["sssConfigCurrent"]),
            // user's configuration before his last changes, literally: config previous to SSS.configCurrent
            configPrevious : JSON.stringify (localStorage["sssConfigPrevious"]),
            // Amazon support developer sites
            amazonSites : [
                {"language":"en-us",    "name":"Amazon",        "url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=aps&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
                {"language":"en-us",    "name":"Amazon Kindle", "url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-text&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
                {"language":"de-de",    "name":"Amazon DE",     "url":"http://www.amazon.de/gp/search?ie=UTF8&keywords=%s&tag=sisese0b-21&index=aps&linkCode=ur2&camp=1638&creative=6742","type":"Comerce","language":"English"},
                {"language":"es-es",    "name":"Amazon ES",     "url":"http://www.amazon.es/gp/search?ie=UTF8&keywords=%s&tag=sisese0c-21&index=aps&linkCode=ur2&camp=3626&creative=24790","type":"Comerce","language":"English"},
                {"language":"it",       "name":"Amazon IT",     "url":"http://www.amazon.it/gp/search?ie=UTF8&keywords=%s&tag=sisese07-21&index=aps&linkCode=ur2&camp=3370&creative=23322","type":"Comerce","language":"English"},
                {"language":"en-us",    "name":"Amazon Mp3",    "url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=digital-music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
                {"language":"en-us",    "name":"Amazon Music",  "url":"http://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=music&linkCode=ur2&camp=1789&creative=9325","type":"Comerce","language":"English"},
                {"language":"en-gb",    "name":"Amazon UK",     "url":"http://www.amazon.co.uk/gp/search?ie=UTF8&keywords=%s&tag=sisese-21&index=aps&linkCode=ur2&camp=1634&creative=6738","type":"Comerce","language":"English"},
                {"language":"en-ca",    "name":"Amazon Canada", "url":"http://www.amazon.ca/gp/search?ie=UTF8&camp=15121&creative=330641&index=aps&keywords=%s&linkCode=ur2&tag=sisese0b-20","type":"Comerce","language":"English"}
            ],
            extensionSites : [
                {"language":"en-us",    "name":chrome.i18n.getMessage("sss_extensionsOptions"),      "url":"options.html"},
                {"language":"en-us",    "name":chrome.i18n.getMessage("sss_extensionsOfficialBlog"), "url":"http://simpleselectsearch.blogspot.com/"}
            ]
        };
    }
}

// initialize SSS object
initializeExtensionsData ();

// Create menu items

// @function background.createMenu
// @descr
//  This function creates context menu (under Right Mouse Button) with search engines defined by user.
// @input
//  -
// @output
//  -
// @todo:
//  * menuId - check if there really need to be called genericSearch in "onClick"
//  * ambigous (0) after function (idSE) {} - check documentation

function createMenu () {
    "use strict";

    var menuId, separatorData, title;

    // what is going to be displayed in Google Chrome main context level
    title = chrome.i18n.getMessage("bg_searchStringOn");

    // clear any previously generated menus
    chrome.contextMenus.removeAll();

    menuId = chrome.contextMenus.create ({
        "title"    : title,
        "contexts" : ["selection"],
        "onclick"  : function (idSE) {
            return function (info, tab) {
                genericSearch (info, tab, idSE)
            }
        } (0)
    });

    // parameters for further separators creation
    separatorData = { "type": "separator", "parentId": menuId, "contexts": ["selection"] };

    // if there are any search enginescreating options in menu with defined search engines
    if (!$.isEmptyObject (SSS.configCurrent.searchEngines)) {
        for (i = 0; i < config.searchEngines.length; ++i) {
            chrome.contextMenus.create ({
                "title"    : SSS.currentConfig.searchEngines[i].name,
                "parentId" : menuId,
                "contexts" :["selection"],
                "onclick"  : function (idSE) {
                    return function (info, tab) {
                        genericSearch (info, tab, idSE)
                    }
                } (i)
            });
        }
    }
    // if there are no defined search engines by user, draw default SSS extension search engines
    else {
        for (i = 0; i < SSS.configDefault.searchEngines.length; ++i) {
            chrome.contextMenus.create ({
                "title"    : SSS.configDefault.searchEngines[i].name,
                "contexts" : ["selection"],
                "onclick"  : function (idSE) {
                    return function (info, tab) {
                        genericSearch (info, tab, idSE)
                    }
                } (i) }
            );
        }
    }

    // separator
    chrome.contextMenus.create (separatorData);

    // search in all engines option in menu
    if (SSS.configCurrent.menuShowSearchAll) {
        chrome.contextMenus.create ({
            "title"    : chrome.i18n.getMessage ("bg_searchEverywhere"),
            "parentId" : id,
            "contexts" : ["selection"],
            "onclick"  : bulkSearch ()
        });

        // separator
        chrome.contextMenus.create (separatorData);
    }

    // check new tab
    if (SSS.configCurrent.menuShowNewTab) {
        chrome.contextMenus.create ({
            "title"    : chrome.i18n.getMessage ("bg_openOnNewTab"),
            "type"     : "checkbox",
            "checked"  : config.newTab,
            "parentId" : menuId,
            "contexts" : ["selection"],
            "onclick"  : checkboxOnClick ()
        });

        // separator
        chrome.contextMenus.create (separatorData);
    }

    // options
    if (SSS.configCurrent.menuShowOptions) {
        chrome.contextMenus.create ({
            "title"    : chrome.i18n.getMessage ("bg_options"),
            "parentId" : menuId,
            "contexts" : ["selection"],
            "onclick"  : openOptions ()
        });

        // separator
        chrome.contextMenus.create (separatorData);
    }

    // go to SSS extension's blog
    if (SSS.configCurrent.menuShowBlog) {
        chrome.contextMenus.create ({
            "title"    : chrome.i18n.getMessage("bg_extensionBlog"),
            "parentId" : menuId,
            "contexts" : ["selection"],
            "onclick"  : openBlog ()
        });
    }
}

// initialize menu
createMenu ();

// @TODO: CODE BELOW STILL NEEDS TO BE REFACTORED - all this was left in a mess on purpose until full refactoring is over

    // var config = initializeConfig(localStorage["config"], defaultConfig);

    // function initializeConfig(localConfig, defaultConfig) {
    //     if (localConfig == undefined) {
    //         //future me: load defaultConfig from website, dynamically
    //             //see this, http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
    //             //but i guess it will be easier to just load a page with the JSON... except for performance
    //         localConfig = applyLocalization(defaultConfig);
    //         // insert code for localization for amazon here
    //         // window.navigator.language

    //         localStorage["config"] = JSON.stringify(localConfig);

    //     }
    //     else {
    //         localConfig = JSON.parse(localConfig);

    //         //compares localConfig with defaultConfig
    //         for (var key in defaultConfig) {
    //           if (defaultConfig.hasOwnProperty(key)) {
    //             if (localConfig[key] == undefined) {
    //                 console.log(key + " -> " + defaultConfig[key] + " ---> " + localConfig[key] );
    //                 localConfig[key] = defaultConfig[key];
    //             }
    //           }
    //         }
    //     };
    //     return localConfig;
    // }

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


function genericSearch(info, tab, idSE) {

    if (config.newTab) { //for "remember an update my created tabs" feature, here I'll store the ID of the created tab and then reuse it with an update. to store the ID of a created tab use a callback function on the tabs.create thing = function(Tab tab) {...};
        searchOnNewTab(idSE, info, tab);
    }
    else {
        //Todo: Refactor this out of the else and use the newTab variable
        chrome.tabs.update(tab.id,{"url": config.searchEngines[idSE].url.replace(/%s/g, info.selectionText).replace(/%S/g, info.selectionText)});

    };
    trackGA(idSE);

}

// function openOptions() {
//     chrome.tabs.create({"url": "options.html"});
// }

// function openBlog() {
//     chrome.tabs.create({"url": "http://simpleselectsearch.blogspot.com/"});
// }

function checkboxOnClick() {
  if (config.newTab) {
        config.newTab=false;

    }
    else {
        config.newTab=true;

    };

    localStorage["config"] = JSON.stringify(config);
    //aca deberia ser newTab=estado del check Menu

}

function bulkSearch(info, tab) {
    for (i = 0; i < config.searchEngines.length; ++i)
               {

                searchOnNewTab(i, info, tab);
                trackGA(i);
               }
}

function searchOnNewTab(newTabIndex, info, tab) {

    var newTab = {"url": config.searchEngines[newTabIndex].url.replace(new RegExp("%s", "g"), info.selectionText).replace(new RegExp("%S", "g"), info.selectionText)}

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
    messageVersion = chrome.i18n.getMessage("bg_installMessage");
    chrome.tabs.create({"url": "options.html"});
  }

  function onUpdate() {
      //console.log(prevVersion);
      if (prevVersion != "0.2.1") {
        messageVersion = chrome.i18n.getMessage("bg_updateMessage").replace("{VersionNumber}",currVersion);
        chrome.tabs.create({"url": "options.html"});
    }
  }

  function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
  }

  // Check if the version has changed.
  var currVersion = getVersion();
  var prevVersion = localStorage['version']
  var messageVersion = "";
  if (currVersion != prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion == 'undefined') {
      onInstall();
    } else {
      onUpdate();
    }
    localStorage['version'] = currVersion;
  }
