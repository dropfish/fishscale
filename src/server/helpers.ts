/**
 * Module containing helper functions for the server.
 */

import * as request from 'request';
import * as querystring from 'querystring';
import { RequestResponse } from 'request';
import {
    PUBNUB_PUB_KEY,
    PUBNUB_SUB_KEY,
    SKYSCANNER_API_KEY,
    SKYSCANNER_FAKE_API_KEY,
} from './secrets';

const PubNub = require('pubnub');
const pubnub = new PubNub({
    publishKey: PUBNUB_PUB_KEY,
    subscribeKey: PUBNUB_SUB_KEY,
});

/**
 * Poll Skyscanner for live flight prices and publish the flight data to the PubNub channel
 * that the client is subscribed to.
 */
export function pollLiveFlightData(location: string, pnChannel: string) {
    const options = {
        url: location + '?' + querystring.stringify({
            apiKey: SKYSCANNER_FAKE_API_KEY
        }),
        headers: {
            'Accept': 'application/json',
        },
    };

    function callback(error: string, response: RequestResponse, body: any) {
        console.log("got response from pollLiveFlightData");
        if (error) {
            console.log('error', error);
            return;
        }

        // TODO(dfish): Repeatedly poll.
        // TODO(dfish): Only poll while the occupany of the channel > 1.
        // TODO(dfish): Only poll while there is more data to be had.

        console.log('body', body);
        console.log('response', response);

        // Schema available at https://skyscanner.github.io/slate/#polling-the-results
        const results = JSON.parse(body);

        console.log('itineraries', results.Itineraries.slice(100));
        pubnub.publish({
            message: {
                flightData: results.Itineraries.slice(100),
            },
            channel: pnChannel,
        }, function (status: any, response: any) {
                if (status.error) {
                    // handle error
                    console.log(status);
                } else {
                    console.log("message Published w/ timetoken", response.timetoken);
                }
            }
        );

        // If we haven't received all the data, let's poll again soon.
        // Note: This hasn't been tested sessions requiring multiple poll requests.
        console.log(body.status);
        if (body.status === "UpdatesPending") {
            setTimeout(pollLiveFlightData, 1000);
        } else {
            // TODO(dfish): Tell the client to unsubscribe?
            console.log("Done polling results");
        }
    };

    request.get(options, callback);
}