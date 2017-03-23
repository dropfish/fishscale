import * as _ from 'underscore';
import * as PubNub from './../../node_modules/pubnub/dist/web/pubnub';
import * as React from 'react';

export interface SearchResultsProps {
    pnChannel: string;
}

export interface SearchResultsState {
    pubnub: any;
    itineraries: any; // TODO(dfish): Create interface and put it in a constants file.
}

export class SearchResults extends React.Component<SearchResultsProps, SearchResultsState> {
    constructor(props: SearchResultsProps) {
        super(props);

        const pubnub = new PubNub({
            subscribeKey: 'sub-c-d4324024-0f6a-11e7-8d31-0619f8945a4f'
        });

        this.state = {
            pubnub: pubnub,
            itineraries: [],
        }
    }

    componentDidMount() {
        if (this.props.pnChannel === '') {
            return;
        }

        this.state.pubnub.addListener({
            message: (message: any) => {
                console.log("New Message!!", message);
                this.setState(_.extend(this.state, {itineraries: message}));
            },
        });

        console.log("subscribing to ", this.props.pnChannel);
        this.state.pubnub.unsubscribeAll();
        this.state.pubnub.subscribe({
            channels: [this.props.pnChannel],
        });
    }

    render() {
        // TODO(dfish): Hide this if itineraries is empty.
        return (
            <div>
                {this.state.itineraries}
            </div>
        );
    }
}