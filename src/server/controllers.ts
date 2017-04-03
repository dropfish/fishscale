/**
 * Module containing controller functions for the server.
 */

import * as secrets from './secrets';
import * as express from 'express';
import * as request from 'request';
import * as querystring from 'querystring';

import { BrowseQuoteResponse } from './../skyscanner';

/**
 * Endpoint for browsing cached flights via Skyscanner.
 */
export function browse_flights(req: express.Request, res: express.Response) {
    const country = 'UK',
        currency = 'GBP',
        locale = 'en-GB',
        originPlace = 'EDI',
        destinationPlace = 'LHR',
        outboundPartialDate = '2017-05-30',
        inboundPartialDate = '2017-06-02';
    const options = {
        url: `http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/${country}/${currency}/${locale}/${originPlace}/${destinationPlace}/${outboundPartialDate}/${inboundPartialDate}?` + querystring.stringify({apiKey: secrets.SKYSCANNER_KEY}),
        headers: {
            'Accept': 'application/json',
        },
    };

    function callback(error: string, response: request.RequestResponse, body: BrowseQuoteResponse) {
        if (error) {
            console.log('error', error);
            res.send({
                status: 'ERROR',
            });
        } else {
            console.log(body)
            res.send({
                status: 'OK',
                browseResponse: body,
            });
        }
    }

    request.get(options, callback);
}