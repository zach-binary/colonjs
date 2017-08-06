'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const BUCKET_NAME = 'colonjs';

const ApiBuilder = require('claudia-api-builder'),
    api = new ApiBuilder();

module.exports = api;

api.post('/', (request) => {
    const body = request.body;
    console.log(`Uploading ${body.fileName} to ${BUCKET_NAME}`);

    const putObject = S3.putObject({
        Bucket: BUCKET_NAME,
        Key: body.fileName,
        Body: body.markdown,
    }).promise();

    return putObject.then((err, data) => {
        console.log('Finished Uploading to s3', BUCKET_NAME);
        console.log(err, data);
    });
})

