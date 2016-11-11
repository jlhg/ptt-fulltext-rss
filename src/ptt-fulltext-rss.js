/* Credit: https://gist.github.com/thinkAmi */

function doGet(e) {
  var b = e.parameter.b;
  var rss = makeRss();
  var timezone = 'GMT+8:00';
  var language = 'zh-TW';
  var atomLink = ScriptApp.getService().getUrl();
  var link = 'http://rss.ptt.cc/' + b + '.xml';
  var rssLink = link;
  var xml = UrlFetchApp.fetch(rssLink).getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  var atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  var rssTitle = root.getChild('title', atom).getText();
  var entries = root.getChildren('entry', atom);

  rss.setLink(link);
  rss.setLanguage(language);
  rss.setAtomlink(atomLink);
  rss.setTitle(rssTitle);
  rss.setDescription(rssTitle);

  for (var i = 0; i < entries.length; i++) {
    var title = entries[i].getChild('title', atom).getText();
    var url = entries[i].getChild('id', atom).getText();
    var pubDate = entries[i].getChild('published', atom).getText();
    var html = UrlFetchApp.fetch(url).getContentText();
    Logger.log(url);

    var p = /<div id="main-content" class="bbs-screen bbs-content"><div class="article-metaline"><span class="article-meta-tag">作者<\/span><span class="article-meta-value">(.+?)<\/span><\/div>(<div class="article-metaline-right"><span class="article-meta-tag">看板<\/span><span class="article-meta-value">(.+?)<\/span><\/div>)?<div class="article-metaline"><span class="article-meta-tag">標題<\/span><span class="article-meta-value">(.+?)<\/span><\/div>(<div class="article-metaline"><span class="article-meta-tag">時間<\/span><span class="article-meta-value">(.+?)<\/span><\/div>)?([^]*?)<span class="f2">※ (發信站|編輯)/;
    var m = p.exec(html);
    var aAuthor = m[1];
    var aBoard = m[3];
    var aTitle = m[4];
    var aDate = m[6];
    var aContent = m[7];
    var desc = '<pre>';
    if (aBoard) {
      desc += '看板：' + aBoard + "\n";
    }

    desc += '作者：' + aAuthor + "\n" + '標題：' + aTitle + "\n";

    if (aDate) {
      desc += '時間：' + aDate + "\n";
    }

    desc += aContent + '</pre>';

    Logger.log(aAuthor);
    Logger.log(aBoard);
    Logger.log(aTitle);
    Logger.log(aDate);

    rss.addItem({
      title: title,
      link: url,
      description: desc,
      pubDate: formatDate(pubDate),
      timezone: timezone,
    });
  }

  return ContentService.createTextOutput(rss.toString())
  .setMimeType(ContentService.MimeType.RSS);
}

var makeRss = function(){
  var channel = XmlService.createElement('channel');
  var root = XmlService.createElement('rss')
  .setAttribute('version', '2.0')
  .setAttribute('xmlnsatom', "http://www.w3.org/2005/Atom")
  .addContent(channel);

  var title = '';
  var link = '';
  var description = '';
  var language = '';
  var atomlink = '';
  var items = {};

  var createElement = function(element, text){
    return XmlService.createElement(element).setText(text);
  };


  return {
    setTitle: function(value){ title = value; },
    setLink: function(value){ link = value; },
    setDescription: function(value){ description = value; },
    setLanguage: function(value){ language = value; },
    setAtomlink: function(value){ atomlink = value; },

    addItem: function(args){
      if (typeof args.title === 'undefined') { args.title = ''; }
      if (typeof args.link === 'undefined') { args.link = ''; }
      if (typeof args.description === 'undefined') { args.description = ''; }
      if (!(args.pubDate instanceof Date)) { throw 'pubDate Missing'; }
      if (typeof args.timezone === 'undefined') { args.timezone = "GMT"; }
      if (typeof args.guid === 'undefined' && typeof args.link === 'undefined') { throw 'GUID ERROR'; }

      var item = {
        title: args.title,
        link: args.link,
        description: args.description,
        pubDate: Utilities.formatDate(args.pubDate, args.timezone, "EEE, dd MMM yyyy HH:mm:ss Z"),
        guid: args.guid === 'undefined' ? args.link : args.link
      };

      items[item.guid] = item;
    },

    toString: function(){
      channel.addContent(XmlService.createElement("atomlink")
                         .setAttribute('href', atomlink)
                         .setAttribute('rel', 'self')
                         .setAttribute('type', 'application/rss+xml')
                        );

      channel.addContent(createElement('title', title));
      channel.addContent(createElement('link', link));
      channel.addContent(createElement('description', description));
      channel.addContent(createElement('language', language));


      for (var i in items) {
        channel.addContent(
          XmlService
          .createElement('item')
          .addContent(createElement('title', items[i].title))
          .addContent(createElement('link', items[i].link))
          .addContent(createElement('description', items[i].description))
          .addContent(createElement('pubDate', items[i].pubDate))
          .addContent(createElement('guid', items[i].guid))
        );
      }

      var document = XmlService.createDocument(root);
      var xml = XmlService.getPrettyFormat().format(document);

      var result = xml.replace('xmlnsatom', 'xmlns:atom')
      .replace('<atomlink href=','<atom:link href=');

      return result;
    }
  };
};

var formatDate = function(dateString) {
  var p = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z/;
  var m = p.exec(dateString);
  var year = m[1];
  var month = m[2];
  var day = m[3];
  var hour = m[4];
  var minute = m[5];
  var second = m[6];
  return new Date(year, month - 1, day, hour, minute, second);
};
