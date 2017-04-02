/**
 * Module containing helper functions for the server.
 */

import * as request from 'request';
import * as querystring from 'querystring';
import { RequestResponse } from 'request';
import {
    PUBNUB_PUB_KEY,
    PUBNUB_SUB_KEY,
    SKYSCANNER_KEY,
} from './secrets';
import {
    BookingDetailsLink,
    Itinerary,
    LivePricePollingQuery,
    LivePricePollingResponse,
    PricingOption,
} from './../skyscanner';

const PubNub = require('pubnub');
const pubnub = new PubNub({
    publishKey: PUBNUB_PUB_KEY,
    subscribeKey: PUBNUB_SUB_KEY,
});

const MAX_RETRIES_FOR_INITIAL_DATA = 3;
const MAX_POLLS_FOR_ALL_RESULTS = 10;

let scoredFlights: { [index: string]: Array<Object>} = {};

/**
 * Poll Skyscanner for live flight prices and publish the flight data to the PubNub channel
 * that the client is subscribed to.
 */
export function pollLiveFlightData(
        location: string,
        pnChannel: string,
        callCount: number = 0): void {
    const options = {
        url: location + '?' + querystring.stringify({
            apiKey: SKYSCANNER_KEY
        }),
        headers: {
            'Accept': 'application/json',
        },
    };

    function pollAgain(): void {
        // TODO(dfish): Verify the client is still alive via PubNub presence occupancy.
        pollLiveFlightData(location, pnChannel, callCount + 1);
    }

    function callback(error: string, response: RequestResponse, body: string): void {
        console.log("got response from pollLiveFlightData");

        if (error) {
            console.log('error', error);
            return;
        }

        console.log('length of body', body.length);
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

        const pollingResponse: LivePricePollingResponse = JSON.parse(body);
        handleFlightResults(pollingResponse, pnChannel);

        // If we haven't received all the data, let's poll again soon.
        // Note: This hasn't been tested sessions requiring multiple poll requests.
        console.log(pollingResponse.Status);
        if (pollingResponse.Status === "UpdatesPending") {
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

/**
 * Publishes the flight results to the client.
 * TODO(dfish): Figure out what we're actually going to send to the client.
 */
function publishFlightResultsToClient(searchQueryKey: string, pnChannel: string): void {
    const itineraries = scoredFlights[searchQueryKey];
    console.log('sending this: ', itineraries)
    pubnub.publish({
        message: {
            itineraries: itineraries,
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

/**
 * Saves flight results, generates scores, and publishes the result to the client.
 */
function handleFlightResults(pollingResponse: LivePricePollingResponse, pnChannel: string): void {
    // 0. Generate the searchQueryKey
    const searchQueryKey = getSearchQueryKey(pollingResponse.Query);

    // 1. Add results to scoredFlights
    addItinerariesToScoredFlights(searchQueryKey, pollingResponse.Itineraries);

    // 2. Pull real scores from database
    scoreFlights(searchQueryKey);

    // 3. Publish results to client
    publishFlightResultsToClient(searchQueryKey, pnChannel);
}

/**
 * Adds itineraries to the scoredFlights map.
 */
function addItinerariesToScoredFlights(searchQueryKey: string, itineraries: Array<Itinerary>): void {
    let results = [];

    for (const itinerary of itineraries) {
        results.push({
            InboundLegId: itinerary.InboundLegId,
            OutboundLegId: itinerary.OutboundLegId,
            Price: itinerary.PricingOptions[0].Price,
        });
    }

    console.log("results:");
    console.log(results);

    if (searchQueryKey in scoredFlights) {
        scoredFlights[searchQueryKey] = scoredFlights[searchQueryKey].concat(results);
    } else {
        scoredFlights[searchQueryKey] = results;
    }

    console.log("scoredFlights:");
    console.log(scoreFlights);
}

/**
 * Looks up flight scores for the searchQueryKey and adds them to scoredFlights.
 */
function scoreFlights(searchQueryKey: string): void {

}

/**
 * To be used as a primary key for retrieving search results.
 */
function getSearchQueryKey(pollingQuery: LivePricePollingQuery): string {
    return JSON.stringify(pollingQuery);
}

function getCachedFlights() {

}