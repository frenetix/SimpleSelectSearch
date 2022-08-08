angular.module('sss', ['ngAnimate', 'ui.sortable', 'ngSanitize', 'ui.bootstrap', 'ui.utils']).service('sssService', function () {
    var service = this;

    service.i18n = function (key) {
        return service.bg.i18n(key);
    };

    service.defaultConfig = {
        "newTab": true,
        "newTabSelected": true,
        "newTabPosition": "Last",
        "trackGA": true,
        "searchEverywhere": true,
        "searchEverywhereGroups": false,
        "searchEngines": [
            {
                "name": "You.com",
                "url": "https://you.com/search?q=%s&fromSearchBar=true&utm_medium=cdpartner&utm_source=selectplussearch",
                "incognito": false,
                "plus": false,
                "group": null
            },
            {
                "name": "Youtube",
                "url": "https://www.youtube.com/results?search_query=%s&aq=f",
                "incognito": false,
                "plus": false,
                "group": null
            },
            {
                "name": "Wikipedia",
                "url": "https://en.wikipedia.org/w/index.php?title=Special:Search&search=%s",
                "incognito": false,
                "plus": false,
                "group": null
            }
        ]
    };

    service.featuredSearchEngines = [
        {
            "name": "YouCode",
            "url": "https://you.com/search?q=%s&fromSearchBar=true&tbm=youcode&utm_medium=cdpartner&utm_source=selectplussearch",
            "type": "IT",
            "language": "English",
            "highlight": true
        },
        {
            "name": "You.com Shopping",
            "url": "https://you.com/search?q=%s&fromSearchBar=true&tbm=shop&utm_medium=cdpartner&utm_source=selectplussearch",
            "type": "Commerce",
            "language": "English",
            "highlight": true
        },
        {
            "name": "Amazon",
            "url": "https://www.amazon.com/gp/search?ie=UTF8&keywords=%s&tag=sisese-20&index=aps&linkCode=ur2&camp=1789&creative=9325",
            "type": "Commerce",
            "language": "English"
        },
        {
            "name": "BBC",
            "url": "https://www.bbc.co.uk/search/?q=%s",
            "type": "News",
            "language": "English"
        },
        {
            "name": "Bing",
            "url": "https://www.bing.com/search?q=%s&go=&qs=n&sk=&sc=8-9&form=QBLH",
            "type": "Search tools",
            "language": "Multi"
        },
        {
            "name": "btjunkie",
            "url": "https://btjunkie.org/search?q=%s",
            "type": "Downloads",
            "language": "English"
        },
        {
            "name": "Chrome Extensions",
            "url": "https://chrome.google.com/webstore/search?q=%s",
            "type": "Tools",
            "language": "English"
        },
        {
            "name": "CNN",
            "url": "https://edition.cnn.com/search/?query=%s&primaryType=mixed&sortBy=date&intl=true",
            "type": "News",
            "language": "English"
        },
        {
            "name": "CodePlex",
            "url": "https://www.codeplex.com/site/search?query=%s&ac=8",
            "type": "IT",
            "language": "English"
        },
        {
            "name": "COOKPAD",
            "url": "https://cookpad.com/レシピ/%s ",
            "type": "Food",
            "language": "Japanese"
        },
        {
            "name": "Amashow",
            "url": "https://amashow.com/past.php?i=All&kwd=%s",
            "type": "Commerce",
            "language": "Japanese"
        },
        {
            "name": "DeviantArt",
            "url": "https://browse.deviantart.com/?qh=&section=&q=%s",
            "type": "Social",
            "language": "English"
        },
        {
            "name": "DMOZ",
            "url": "https://www.dmoz.org/search?q=%s",
            "type": "Knowledge",
            "language": "English"
        },
        {
            "name": "Facebook",
            "url": "https://www.facebook.com/search.php?q=%s&init=quick",
            "type": "Social",
            "language": "English"
        },
        {
            "name": "Gmail",
            "url": "https://mail.google.com/mail/#search/%s",
            "type": "Tools",
            "language": "English"
        },
        {
            "name": "Kickass",
            "url": "https://kickass.to/usearch/%s/",
            "type": "Download",
            "language": "English"
        },
        {
            "name": "Filmaffinity",
            "url": "https://www.filmaffinity.com/es/search.php?stext=%s&stype=all/",
            "type": "Movies",
            "language": "Español"
        },
        {
            "name": "Google",
            "url": "https://www.google.com/#q=%s&fp=1",
            "type": "Search tools",
            "language": "Multi"
        },
        {
            "name": "Google Docs",
            "url": "https://docs.google.com/#advanced-search/q=%s&view=0&hidden=1",
            "type": "Tools",
            "language": "English"
        },
        {
            "name": "Google Images",
            "url": "https://www.google.com/search?num=10&hl=en&site=imghp&tbm=isch&source=hp&q=%s",
            "type": "Tools",
            "language": "English"
        },
        {
            "name": "Google Translate En/Es",
            "url": "https://translate.google.com/?hl=en&ie=UTF8&text=%s&langpair=en|es#",
            "type": "Translation",
            "language": "Español"
        },
        {
            "name": "Google Translate En/It",
            "url": "https://translate.google.com/?hl=en&ie=UTF8&text=%s&langpair=en|it#",
            "type": "Translation",
            "language": "Italiano"
        },
        {
            "name": "Google Translate En/Pt",
            "url": "https://translate.google.com/?hl=en&ie=UTF8&text=%s&langpair=en|pt#",
            "type": "Translation",
            "language": "Português"
        },
        {
            "name": "Google ニュース",
            "url": "https://news.google.co.jp/news?hl=ja&ie=UTF-8&ned=jp&q=%s",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Google マップ",
            "url": "https://maps.google.co.jp/maps?hl=ja&ie=UTF-8&q=%s",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Google 画像検索",
            "url": "https://images.google.co.jp/images?hl=ja&ie=UTF-8&q=%s",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Google+",
            "url": "https://www.google.com/search?q=%s&hl=en&tbs=prfl:e&authuser=0&tok=RuSDPFgadUcK6QvAU9edEA",
            "type": "Social",
            "language": "English"
        },
        {
            "name": "GrooveShark",
            "url": "https://grooveshark.com/#/search?q=%s",
            "type": "Music",
            "language": "English"
        },
        {
            "name": "IMDB",
            "url": "https://www.imdb.com/find?s=all;q=%s",
            "type": "Movies",
            "language": "English"
        },
        {
            "name": "ISOHunt",
            "url": "https://isohunt.com/torrents/?ihq=%s",
            "type": "Downloads",
            "language": "English"
        },
        {
            "name": "Jigsaw",
            "url": "https://www.jigsaw.com/FreeTextSearch.xhtml?opCode=search&autoSuggested=true&freeText=%s",
            "type": "Business",
            "language": "English"
        },
        {
            "name": "jQuery plugins",
            "url": "https://plugins.jquery.com/search/node/%s",
            "type": "IT",
            "language": "English"
        },
        {
            "name": "Last.fm",
            "url": "https://www.last.fm/search?q=%s",
            "type": "Music",
            "language": "English"
        },
        {
            "name": "OKWave ",
            "url": "https://okwave.jp/searchkeyword/%s/?sc=true",
            "type": "Social",
            "language": "Japanese"
        },
        {
            "name": "OpenSubtitles",
            "url": "https://www.opensubtitles.org/pb/search2/sublanguageid-pob/moviename-%s",
            "type": "Movies",
            "language": "Português"
        },
        {
            "name": "Pandora",
            "url": "https://www.pandora.com/backstage?type=all&q=%s",
            "type": "Music",
            "language": "English"
        },
        {
            "name": "Rotten Tomatoes",
            "url": "https://www.rottentomatoes.com/search/full_search.php?search=%s",
            "type": "Movies",
            "language": "English"
        },
        {
            "name": "stackoverflow",
            "url": "https://stackoverflow.com/search?q=%s",
            "type": "IT",
            "language": "English"
        },
        {
            "name": "Tokyo Tosho",
            "url": "https://www.tokyotosho.info/search.php?terms=%s&type=0&size_min=&size_max=&username=",
            "type": "Anime",
            "language": "English"
        },
        {
            "name": "Torrentz.eu",
            "url": "https://torrentz.eu/search?f=%s",
            "type": "Downloads",
            "language": "English"
        },
        {
            "name": "TPB",
            "url": "https://thepiratebay.org/search/%s/0/7/0",
            "type": "Downloads",
            "language": "English"
        },
        {
            "name": "Twitter",
            "url": "https://twitter.com/#!/search/%s",
            "type": "Social",
            "language": "English"
        },
        {
            "name": "Urban Dictionary",
            "url": "https://www.urbandictionary.com/define.php?term=%s",
            "type": "Knowledge",
            "language": "English"
        },
        {
            "name": "Wikipedia",
            "url": "https://en.wikipedia.org/w/index.php?title=Special:Search&search=%s",
            "type": "Knowledge",
            "language": "English"
        },
        {
            "name": "Wikipedia ES",
            "url": "https://es.wikipedia.org/wiki/Special:Search?search=%s&go=Go",
            "type": "Knowledge",
            "language": "Español"
        },
        {
            "name": "Wikipedia JP",
            "url": "https://ja.wikipedia.org/wiki/%s ",
            "type": "Knowledge",
            "language": "Japanese"
        },
        {
            "name": "Word Reference En/Es",
            "url": "https://www.wordreference.com/enes/%s",
            "type": "Translation",
            "language": "Español"
        },
        {
            "name": "Word Reference En/It",
            "url": "https://www.wordreference.com/enit/%s",
            "type": "Translation",
            "language": "Italiano"
        },
        {
            "name": "Yahoo! ニュース",
            "url": "https://nsearch.yahoo.co.jp/search?p=%s&ei=UTF-8",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Yahoo! ブログ検索",
            "url": "https://blog.search.yahoo.co.jp/search?p=%s&ei=UTF-8",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Yahoo! 知恵袋",
            "url": "https://chiebukuro.search.yahoo.co.jp/search?p=%s&ei=UTF-8",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Yahoo! JP",
            "url": "https://search.yahoo.co.jp/search?p=%s&ei=UTF-8 ",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "Youtube",
            "url": "https://www.youtube.com/results?search_query=%s&aq=f",
            "type": "Social",
            "language": "English"
        },
        {
            "name": "リアルタイム検索",
            "url": "https://realtime.search.yahoo.co.jp/search?p=%s&ei=UTF-8 ",
            "type": "Search tools",
            "language": "Japanese"
        },
        {
            "name": "楽天",
            "url": "https://search.rakuten.co.jp/search/mall/%s/-/",
            "type": "Commerce",
            "language": "Japanese"
        },
        {
            "name": "Anime News Network",
            "url": "https://www.animenewsnetwork.com/search?q=%s&type=all",
            "type": "Anime",
            "language": "English"
        },
        {
            "name": "DramaWiki",
            "url": "https://wiki.d-addicts.com/index.php?title=Special:Search&search=%s",
            "type": "Knowledge",
            "language": "English"
        },
        {
            "name": "AsianMediaWiki",
            "url": "https://asianwiki.com/index.php?title=Special%3ASearch&search=%s&go=Go",
            "type": "Movies",
            "language": "English"
        }
    ];

    service.bg = chrome.extension.getBackgroundPage();

    if (typeof localStorage["config"] == "undefined") {
        service.bg.config = service.defaultConfig;
        localStorage["config"] = JSON.stringify(service.bg.config);
        service.bg.createMenu();
    }

    localStorage['newOptionsSeen'] = service.bg.currVersion;

});