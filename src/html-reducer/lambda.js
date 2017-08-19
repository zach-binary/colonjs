'use strict';

const reducer = require('./reducer');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

const updateHtmlObject = ({ fileName, contents }) => {
    return S3.putObject({
        Bucket: 'colonjs-site',
        Key: fileName,
        Body: contents,
        ContentType: 'text/html',
        ACL: 'public-read',
    }).promise();
};

exports.handler = function(event, context) {
    console.log('Processing updated object in s3');

    const record = event.Records && event.Records[0];
    if (!record) return context.fail('No records in event');
    if (!record.eventSource === 'aws:s3' || !record.s3) 
        return context.fail('Invalid Event Source');

    const s3 = record.s3;
    const getUpdatedObject = S3.getObject({
        Bucket: s3.bucket.name,
        Key: s3.object.key
    }).promise();

    getUpdatedObject
        .then(result => reducer(result, s3.object.key))
        .then(updateHtmlObject)
        .catch(err => {
            console.error(err);
            context.fail();
        })
        .then(() => context.done());
};