import * as _ from 'underscore';
import * as React from 'react';

import {
    BookingDetailsLink,
    Itinerary,
    PricingOption,
    BrowseQuoteResponse,
    Quote,
} from './../skyscanner';
import {
    ItineraryRow
} from './ItineraryRow';

export interface SearchResultsProps {
    itineraries?: Array<Itinerary>;
    browseResponse?: BrowseQuoteResponse;
}

export interface SearchResultsState {

}

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    constructor(props: SearchResultsProps) {
        super(props);

        this.state = {};
    }

    render() {
        // TODO(dfish): Fix the naming issue between itinerary and quote.
        let itineraries: Array<JSX.Element> = [];
        if (this.props.browseResponse !== undefined) {
            itineraries = this.props.browseResponse.Quotes.map(
                (quote: Quote, index: number) => {
                return (
                    <ItineraryRow
                        browseResponse={this.props.browseResponse}
                        itineraryIndex={index}
                    />
                );
            });
        }

        return (
            <div>
                {itineraries}
            </div>
        );
    }
}