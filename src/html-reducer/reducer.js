var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

const showdown = require('showdown');
const cheerio = require('cheerio');

const layout = require('./layout.html');
const converter = new showdown.Converter();

module.exports = function (result, fileName) {
    console.log('Converting ', fileName, ' to Html');
    const $ = cheerio.load(layout);
    const markup = converter.makeHtml(result.Body.toString());

    $('article').html(markup);

    const html = $.html();
    const name = fileName.replace('.md', '.html');

    return { contents: html, fileName: name };
}

