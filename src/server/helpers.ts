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
import {
    BookingDetailsLink,
    Itinerary,
    PricingOption,
} from './../skyscanner';

const PubNub = require('pubnub');
const pubnub = new PubNub({
    publishKey: PUBNUB_PUB_KEY,
    subscribeKey: PUBNUB_SUB_KEY,
});

const MAX_RETRIES_FOR_INITIAL_DATA = 3;
const MAX_POLLS_FOR_ALL_RESULTS = 10;

/**
 * Poll Skyscanner for live flight prices and publish the flight data to the PubNub channel
 * that the client is subscribed to.
 */
export function pollLiveFlightData(
        location: string,
        pnChannel: string,
        callCount?: number) {
    const options = {
        url: location + '?' + querystring.stringify({
            apiKey: SKYSCANNER_FAKE_API_KEY
        }),
        headers: {
            'Accept': 'application/json',
        },
    };

    function pollAgain() {
        if (callCount === undefined) {
            callCount = 0;
        }

        // TODO(dfish): Verify the client is still alive via PubNub presence occupancy.
        pollLiveFlightData(location, pnChannel, callCount + 1);
    }

    function callback(error: string, response: RequestResponse, body: string) {
        console.log("got response from pollLiveFlightData");
        if (error) {
            console.log('error', error);
            return;
        }

        // TODO(dfish): This is a temporary check. Eventually we may want to handle this differently.
        if (body.length === 0) {
            // If the body is empty, the session has been created but there's no data yet.
            // Skyscanner recommends waiting a second before proceeding, so that's what
            // we'll do.
            if (callCount > MAX_RETRIES_FOR_INITIAL_DATA) {
                console.log(`Tried to fetch data ${MAX_RETRIES_FOR_INITIAL_DATA} times, giving up.`);
            } else {
                setTimeout(pollAgain, 1000);
                return;
            }
        }
        const bodyJSON = JSON.parse(body);
        console.log('length of body', body.length);

        // Schema available at https://skyscanner.github.io/slate/#polling-the-results
        publishFlightResultsToClient(bodyJSON.Itineraries, pnChannel);

        // If we haven't received all the data, let's poll again soon.
        // Note: This hasn't been tested sessions requiring multiple poll requests.
        console.log(bodyJSON.Status);
        if (bodyJSON.Status === "UpdatesPending") {
            if (callCount > MAX_POLLS_FOR_ALL_RESULTS) {
                console.log(`Tried to fetch data ${MAX_POLLS_FOR_ALL_RESULTS} times, giving up.`);
            } else {
                setTimeout(pollAgain, 1000);
                return;
            }
        } else {
            // TODO(dfish): Tell the client to unsubscribe?
            console.log("Done polling results");
        }
    };

    request.get(options, callback);
}

function publishFlightResultsToClient(itineraries: Array<Itinerary>, pnChannel: string) {
    console.log('sending this: ', itineraries.slice(0, 1))
    pubnub.publish({
        message: {
            itineraries: itineraries.slice(0, 1),
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
}