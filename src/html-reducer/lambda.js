'use strict';

const reducer = require('./reducer');

exports.handler = function(event, context) {
    console.log('Processing updated object in s3');
    console.log(JSON.stringify(event));

    const record = event.Records && event.Records[0];
    if (!record) return context.fail('No records in event');
    if (!record.eventSource === 'aws:s3' || !record.s3) 
        return context.fail('Invalid Event Source');

    reducer(record.s3)
        .then(() => context.done());
};