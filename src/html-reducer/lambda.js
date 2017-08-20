'use strict';

const reducer = require('./reducer');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const CloudFront = new AWS.CloudFront();

const updateHtmlObject = ({ fileName, contents }) => {
    return S3.putObject({
        Bucket: 'colonjs-site',
        Key: fileName,
        Body: contents,
        ContentType: 'text/html',
        ACL: 'public-read',
    }).promise();
};

const invalidateHtmlObject = (fileName) =>
    CloudFront.createInvalidation({
        DistributionId: 'EYTT8IXUJ5LIA',
        InvalidationBatch: {
            Paths: {
                Items: [`/${fileName}`],
                Quantity: 1,
            },
            CallerReference: new Date().getTime().toString(),
        },
    }).promise();

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


    let fileName;
    getUpdatedObject
        .then(result => reducer(result, s3.object.key))
        .then(result => {
            fileName = result.fileName;
            updateHtmlObject(result);
        })
        .then(result => invalidateHtmlObject(fileName))
        .catch(context.fail)
        .then(() => context.done());
};