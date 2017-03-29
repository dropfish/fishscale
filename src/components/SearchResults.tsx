import * as _ from 'underscore';
import * as React from 'react';

import {
    BookingDetailsLink,
    Itinerary,
    PricingOption,
} from './../skyscanner';

export interface SearchResultsProps {
    itineraries: Array<Itinerary>;
}

export interface SearchResultsState {
    // TODO(dfish): Add some filters.
}

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    constructor(props: SearchResultsProps) {
        super(props);

        this.state = {};
    }

    render() {
        console.log('the props: ', this.props);
        if (this.props.itineraries.length === 0) {
            return <div></div>;
        }

        return (
            <div>
                {JSON.stringify(this.props.itineraries)}
            </div>
        );
    }
}