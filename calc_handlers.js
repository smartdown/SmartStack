const smartdown = window.smartdown;

function calcWikidataImageUtil(thumb, key, body, done) {
  function lookupComplete() {
    /* eslint no-invalid-this: 0 */
    var lookupResult = this.responseText;
    // console.log('lookupResult', JSON.parse(lookupResult));
    var parsedResult = JSON.parse(lookupResult).query.pages;

    var thumbs = [];
    parsedResult.forEach(function(val, idx) {
      if (thumb && val.thumbnail) {
        thumbs.push(val.thumbnail.source);
      }
      else if (!thumb && val.original) {
        thumbs.push(val.original.source);
      }
    });
    thumbs.elementType = 'image';
    done(thumbs);
  }

  var wdKey = body;
  if (body.indexOf('[') === 0) {
    var possibleJSONArray = JSON.parse(body);
    if (Array.isArray(possibleJSONArray)) {
      wdKey = '';
      possibleJSONArray.forEach(function(val, idx) {
        wdKey += val;
        if (idx < possibleJSONArray.length - 1) {
          wdKey += '|';
        }
      });
    }
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", lookupComplete);

  // https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&format=json&prop=pageimages&titles=Albert+Einstein&piprop=thumbnail%7Cname%7Coriginal&pithumbsize=300
  // /w/api.php?action=query&format=json&prop=pageimages&titles=Albert+Einstein&piprop=thumbnail%7Cname%7Coriginal&pithumbsize=300

  var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageimages%7Cpageterms&format=json&origin=*&wbptterms=description&redirects=&formatversion=2';
  url += '&titles=' + encodeURI(wdKey);
  url += '&piprop=thumbnail%7Cname%7Coriginal&pithumbsize=300';

/*
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", lookupComplete);
  var url = 'https://en.wikipedia.org/w/api.php?action=query&formatversion=2&prop=pageimages%7Cpageterms&';
  url += 'titles=' + encodeURI(wdKey);
  url += '&pilimit=3&piprop=thumbnail&wbptterms=description&redirects=&format=json&origin=*';
*/

  oReq.open('GET', url);
  oReq.send();
}

function calcWikidataImages(key, body, done) {
  return calcWikidataImageUtil(false, key, body, done);
}


function calcWikidataThumbs(key, body, done) {
  return calcWikidataImageUtil(true, key, body, done);
}

function calcWikidata(key, body, done) {
  function lookupComplete() {
    /* eslint no-invalid-this: 0 */
    var lookupResult = this.responseText;
    // console.log('calcWikidata', JSON.parse(lookupResult));
    var parsedResult = JSON.parse(lookupResult).query.pages;
    // console.log('calcWikidata parsedResult', parsedResult);

    var info = [];
    window.lodashEach(parsedResult, function(val, idx) {
      // console.log('...val', val);
      info.push({
        title: val.displaytitle,
        url: val.canonicalurl
      });
    });
    info.elementType = 'title/url';
    done(info);
  }

  var wdKey = body;
  if (body.indexOf('[') === 0) {
    var possibleJSONArray = JSON.parse(body);
    if (Array.isArray(possibleJSONArray)) {
      wdKey = '';
      possibleJSONArray.forEach(function(val, idx) {
        wdKey += val;
        if (idx < possibleJSONArray.length - 1) {
          wdKey += '|';
        }
      });
    }
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", lookupComplete);

  var url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&origin=*&redirects=';
  url += '&titles=' + encodeURI(wdKey);
  url += '&inprop=displaytitle%7Curl';

  // var url = 'https://en.wikipedia.org/w/api.php?action=query&formatversion=2&prop=pageimages%7Cpageterms&';
  // url += 'titles=' + encodeURI(wdKey);
  // url += '&pilimit=3&piprop=thumbnail&wbptterms=description&redirects=&format=json&origin=*';

  oReq.open('GET', url);
  oReq.send();
}

smartdown.defaultCalcHandlers = {
  wikidataImages: calcWikidataImages,
  wikidataThumbs: calcWikidataThumbs,
  wikidata: calcWikidata
};
