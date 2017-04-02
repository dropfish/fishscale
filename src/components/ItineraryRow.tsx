import * as _ from 'underscore';
import * as React from 'react';

import {
    BookingDetailsLink,
    Itinerary,
    PricingOption,
    BrowseQuoteResponse,
    Quote,
} from './../skyscanner';

export interface ItineraryRowProps {
    browseResponse: BrowseQuoteResponse;
    itineraryIndex: number;
}

export interface ItineraryRowState {
    quote: Quote;
}

export class ItineraryRow extends React.Component<ItineraryRowProps, ItineraryRowState> {
    constructor(props: ItineraryRowProps) {
        super(props);

        const quote = this.props.browseResponse.Quotes[this.props.itineraryIndex];
        this.state = {
            quote: quote,
        };
    }

    render() {
        // For now, we're only showing outbound legs. Later we'll probably
        // want to pass a QuoteLeg to something and have it render the leg
        // agnostically of whether it's inbound/outbound.
        const leg = this.state.quote.OutboundLeg;
        if (leg === undefined) {
            return null;
        }

        const outboundDate = new Date(leg.DepartureDate).toString();
        return (
            <div style={{border: "1px solid black"}}>
                Departs at: {outboundDate}
            </div>
        )
    }
}