/* global smartdown */
/* global window */
/* global smartdownBaseURL */
/* global smartdownDefaultHome */
/* global smartdownGistPathPrefix */
/* global smartdownGistHashPrefix */
/* global smartdownRawPrefix */
/* global smartdownOutputDivSelector */
/* global smartdownMedia */
/* global XMLHttpRequest */
/* eslint no-var: 0 */

var darkMode = false;

function starter(basePrefix) {
  var defaultHome = 'Home';
  var baseURL = 'https://smartdown.site/';
  var resourceURL = baseURL + 'lib/resources/';
  var rawPrefix = window.location.origin + window.location.pathname;
  var gistPathPrefix = '';
  var gistHashPrefix = 'gist/';
  var outputDivSelector = '#smartdown-output';
  var media = {
    cloud: '/gallery/resources/cloud.jpg',
    badge: '/gallery/resources/badge.svg',
    hypercube: '/gallery/resources/Hypercube.svg',
    StalactiteStalagmite: '/gallery/resources/StalactiteStalagmite.svg',
    church: '/gallery/resources/church.svg',
    lighthouse: '/gallery/resources/lighthouse.svg',
    barn: '/gallery/resources/barn.svg',
    'medieval-gate': '/gallery/resources/medieval-gate.svg'
  };
  var multiparts = {};
  var inhibitHash = '';
  var gistOrg = '';
  var gistID = '';


  if (typeof smartdownBaseURL === 'string') {
    baseURL = smartdownBaseURL;
  }
  if (typeof smartdownResourceURL === 'string') {
    resourceURL = smartdownResourceURL;
  }
  if (typeof smartdownDefaultHome === 'string') {
    defaultHome = smartdownDefaultHome;
  }
  if (typeof smartdownGistPathPrefix === 'string') {
    gistPathPrefix = smartdownGistPathPrefix;
  }
  if (typeof smartdownGistHashPrefix === 'string') {
    gistHashPrefix = smartdownGistHashPrefix;
  }
  if (typeof smartdownRawPrefix === 'string') {
    rawPrefix = smartdownRawPrefix;
  }
  if (typeof smartdownOutputDivSelector === 'string') {
    outputDivSelector = smartdownOutputDivSelector;
  }

  if (typeof smartdownMedia === 'object') {
    media = Object.assign(media, smartdownMedia);
  }

  var lastLoadedRawPrefix = rawPrefix;

  /* Common code above between inline/blocks helpers */

  function cardLoaded(sourceText, cardKey, cardURL) {
    if (cardKey === 'README') {
      sourceText += `\n---\n\n[Back to Home](:@${defaultHome})\n`;
  // `
  // ---

  // [Back to Home](:@${defaultHome})
  // `;
    }
    multiparts = smartdown.partitionMultipart(sourceText);
    var output = document.querySelectorAll(outputDivSelector)[0];
    inhibitHash = '#' + cardKey;
    if (lastLoadedRawPrefix !== rawPrefix) {
      inhibitHash = '#' + cardURL;
      // console.log('inhibitHash', inhibitHash);
    }
    if (inhibitHash !== window.location.hash) {
      // console.log('inhibitHash', inhibitHash, window.location.hash);
      window.location.hash = inhibitHash;
    }
    if (darkMode) {
      window.location.search = '?dark=1';
      // window.location.replace('?dark=1');
    }
    // console.log('cardLoaded', cardKey, window.location.hash, window.location.search, window.location);

    smartdown.setHome(multiparts._default_, output, function() {
      document.body.scrollTop = 0; // For Chrome, Safari and Opera
      document.documentElement.scrollTop = 0; // For IE and Firefox

      if (!output.id) {
        output.id = 'smartdown-output-' + String(Math.random()).slice(2);
      }
      smartdown.startAutoplay(output);
    });
  }

  function loadAsyncCard(cardKey, cardURL) {
    // console.log('loadAsyncCard', cardKey, cardURL);
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
      cardLoaded(this.responseText, cardKey, cardURL);
    });
    oReq.open("GET", cardURL);
    oReq.send();
  }



  function relativeCardLoader(cardKey) {
    // console.log('relativeCardLoader', cardKey);
    cardKey = cardKey.replace(/^#/g, '');
    // console.log('# cardKey', cardKey);
    // console.log('# lastLoadedRawPrefix', lastLoadedRawPrefix);
    // console.log('# gistPathPrefix', gistPathPrefix);
    // console.log('# gistHashPrefix', gistHashPrefix);
    // console.log('# window.location.pathname', window.location.pathname);
    var re = '^/?(' + gistPathPrefix + ')?' + gistHashPrefix + '([^/]+)/([^/]+)(/(\\w*))?$';
    // var re = `^/?(${gistPathPrefix})?${gistHashPrefix}([^/]+)/([^/]+)(/(\\w*))?$`;
    // console.log('re', re);
    var gistRE = new RegExp(re, 'g');
    var match = gistRE.exec(cardKey);
    if (match) {
      gistOrg = match[2];
      gistID = match[3];
      var newCardKey = match[5] || 'Home';
      // console.log('cardKey', cardKey, gistOrg, gistID, newCardKey);
      cardKey = newCardKey;
    }

    var part = multiparts[cardKey];
    if (part) {
      var output = document.querySelectorAll(outputDivSelector)[0];
      smartdown.setHome(part, output, function() {
        if (!output.id) {
          output.id = 'smartdown-output-' + String(Math.random()).slice(2);
        }
        smartdown.startAutoplay(output);
      });
    }
    else if (cardKey.indexOf('http') === 0) {
      gistOrg = '';
      gistID = '';
      var endOfPath = cardKey.lastIndexOf('/');
      if (endOfPath > 0) {
        lastLoadedRawPrefix = cardKey.slice(0, endOfPath + 1);
        // console.log('...lastLoadedRawPrefix1', lastLoadedRawPrefix);
      }
      loadAsyncCard(cardKey, cardKey);
    }
    else if (cardKey.indexOf('/') === 0) {
      gistOrg = '';
      gistID = '';
      lastLoadedRawPrefix = rawPrefix;
      // console.log('...lastLoadedRawPrefix2', lastLoadedRawPrefix);
      loadAsyncCard(cardKey, cardKey);
    }
    else if (gistOrg !== '' && gistID !== '') {
      var gistAPIBase = 'https://api.github.com/gists/' + gistID;
      // console.log('gistAPIBase', gistAPIBase);

      var oReq = new XMLHttpRequest();
      oReq.addEventListener("load", function() {
        var gistResponse = JSON.parse(this.responseText);
        // console.log('gist Response', gistResponse);
        var gistFile = gistResponse.files[cardKey + '.md'];
        // console.log('gistFile', gistFile);
        var gistFileURL = gistFile.raw_url;
        cardKey = gistHashPrefix + gistOrg + '/' + gistID + '/' + cardKey;
        loadAsyncCard(cardKey, gistFileURL);
      });
      oReq.open("GET", gistAPIBase);
      oReq.send();
    }
    else {
      gistOrg = '';
      gistID = '';
      var suffix = (cardKey === '') ? '' : (cardKey + '.md');
      var cardURL = lastLoadedRawPrefix + suffix;
      loadAsyncCard(cardKey, cardURL);
    }
  }

  function loadHome(baseHash) {
    var hash = window.location.hash;
    if (baseHash) {
      var hashElements = hash.split('/');
      // console.log('hashElements', hashElements);
      var baseHashElements = baseHash.split('/');
      // console.log('baseHashElements', baseHashElements);

      hash = baseHash;
      if (baseHashElements.length === 4 &&
          hashElements.length === 4) {
        baseHashElements[3] = hashElements[3];
        hash = baseHashElements.join('/');
        // console.log('newHash', hash);
      }
    }
    var search = window.location.search;
    // console.log('loadHome', hash, search);
    var args = '';
    var argsPos = hash.indexOf('?');
    if (argsPos >= 0) {
      args = hash.slice(argsPos);
      hash = hash.slice(0, argsPos);
      // console.log('loadHome hashargs', hash, args, window.location.search);
      darkMode = (args === '?dark=1');
    }

    if (search === '?dark=1') {
      darkMode = true;
    }

    var container = document.getElementById('smartdown-outer-container');
    if (container) {
      if (darkMode) {
        container.classList.add('smartdown-dark');
      }
      else {
        container.classList.remove('smartdown-dark');
      }
    }

    if (hash === '') {
      hash = defaultHome;
    }
    relativeCardLoader(hash);
  }

  var calcHandlers = smartdown.defaultCalcHandlers;
  var replace = rawPrefix;
  function gistPrefix() {
    var result = lastLoadedRawPrefix;
    var hash = window.location.hash;
    var args = '';
    var argsPos = hash.indexOf('?');
    if (argsPos >= 0) {
      args = hash.slice(argsPos);
      hash = hash.slice(0, argsPos);
      // console.log('gistPrefix hashargs', hash, args, window.location.search);
    }

    if (gistPathPrefix.length > 0 && window.location.pathname.endsWith(gistPathPrefix)) {
      var re = '^/?(' + gistPathPrefix + ')?' + gistHashPrefix + '([^/]+)/([^/]+)(/(\\w*))?$';
      var gistRE = new RegExp(re, 'g');
      var match = gistRE.exec(hash);
      if (match) {
        var gistOrg = match[2].replace('#', '');
        var gistID = match[3];
        result = 'https://gist.githubusercontent.com/' + gistOrg + '/' + gistID + '/raw/';
      }
    }
    else if (gistHashPrefix.length > 0 && hash.indexOf('#' + gistHashPrefix) === 0) {
      var re = '^#' + gistHashPrefix + '([^/]+)/([^/]+)(/(\\w*))?$';
      var gistRE = new RegExp(re, 'g');
      var match = gistRE.exec(hash);
      if (match) {
        var gistOrg = match[1];
        var gistID = match[2];
        result = 'https://gist.githubusercontent.com/' + gistOrg + '/' + gistID + '/raw/';
      }
    }

    return result;
  }


  const linkRules = [
      {
        prefix: '/block/',
        replace: gistPrefix
      },
      {
        prefix: 'block/',
        replace: gistPrefix
      },
      {
        prefix: 'assets/',
        replace: replace + 'assets/'
      },
      {
        prefix: '/assets/',
        replace: replace + 'assets/'
      },
      {
        prefix: 'content/',
        replace: replace + 'content/'
      },
      {
        prefix: '/content/',
        replace: replace + 'content/'
      },
      {
        prefix: '/gallery/resources/',
        replace: resourceURL === '' ? '/gallery/resources/' : resourceURL
      },
      {
        prefix: '/resources/',
        replace: resourceURL === '' ? '/resources/' : resourceURL
      },
  ];

  function locationHashChanged() {
    // console.log('locationHashChanged', window.location.hash, inhibitHash);
    var hash = window.location.hash;
    var args = '';
    var argsPos = hash.indexOf('?');
    if (argsPos >= 0) {
      args = hash.slice(argsPos);
      hash = hash.slice(0, argsPos);
      darkMode = (args === '?dark=1');
      var container = document.getElementById('smartdown-outer-container');
      if (container) {
        if (darkMode) {
          container.classList.add('smartdown-dark');
        }
        else {
          container.classList.remove('smartdown-dark');
        }
      }
    }

    if (inhibitHash !== hash) {
      // console.log('...locationHashChanged', window.location.hash, hash, inhibitHash);
      var cardKey = hash.slice(1);

      if (cardKey === '') {
        cardKey = defaultHome;
      }
      relativeCardLoader(cardKey);
    }

    return false;
  }

  window.onhashchange = locationHashChanged;
  // window.onpopstate = locationHashChanged;

  function loadHomeDefault() {
    loadHome(basePrefix);
  }
  smartdown.initialize(media, baseURL, loadHomeDefault, relativeCardLoader, calcHandlers, linkRules);
};

window.smartdownStarter = starter;
