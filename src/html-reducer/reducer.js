var fs = require('fs');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

const showdown = require('showdown');
const cheerio = require('cheerio');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const DIST_DIR = './dist';

const layout = require('./layout.html');
const converter = new showdown.Converter();

module.exports = function(s3) {
    const getUpdatedObject = S3.getObject({
        Bucket: s3.bucket.name,
        Key: s3.object.key
    }).promise();

    return getUpdatedObject.then((result, err) => {
        const $ = cheerio.load(layout);
        const markup = converter.makeHtml(result.Body.toString());

        $('article').html(markup);

        const html = $.html();
        const name = s3.object.key.replace('.md', '.html');

        console.log(html, name);

        return S3.putObject({
            Bucket: 'colonjs-site',
            Key: name,
            Body: html,
            ContentType: 'text/html',
            ACL: 'public-read',
        }).promise();
    });
}

