import * as React from 'react';
import * as _ from 'underscore';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosPromise, AxiosResponse
} from 'axios';

import {
    BrowseQuoteResponse,
} from './../skyscanner';

export interface SearchBoxProps {
    onCachedResultsFetched: (browseResponse: BrowseQuoteResponse) => void
    onSearchSubmit: (pnChannel: string) => void;
}

export interface SearchBoxState {
    originPlace: string;
    destinationPlace: string;
    outboundPartialDate: string;
    inboundPartialDate: string;
}

export class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    constructor(props: SearchBoxProps) {
        super(props);
        this.state = {
            originPlace: '',
            destinationPlace: '',
            outboundPartialDate: '',
            inboundPartialDate: '',
        }
    }

    render() {
        console.log(this.state);
        return (
            <div>
                From:
                <input
                    type='text'
                    value={this.state.originPlace}
                    onChange={this.handleOriginChange}
                />
                To:
                <input
                    type='text'
                    value={this.state.destinationPlace}
                    onChange={this.handleDestinationChange}
                />
                Depart:
                <input
                    type='text'
                    value={this.state.outboundPartialDate}
                    onChange={this.handleOutboundDateChange}
                />
                Return:
                <input
                    type='text'
                    value={this.state.inboundPartialDate}
                    onChange={this.handleInboundDateChange}
                />
                <button type='button' onClick={this.onSearchClick}>
                    Search
                </button>
            </div>
        )
    }

    handleOriginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {originPlace: event.target.value}));
    }

    handleDestinationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {destinationPlace: event.target.value}));
    }

    handleOutboundDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {outboundPartialDate: event.target.value}));
    }

    handleInboundDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {inboundPartialDate: event.target.value}));
    }

    fetchLiveResults = () => {
        axios.get('/create_session', {
            params: {
                originPlace: this.state.originPlace,
                destinationPlace: this.state.destinationPlace,
                outboundPartialDate: this.state.outboundPartialDate,
                inboundPartialDate: this.state.inboundPartialDate,
            }
        }).then((response: AxiosResponse) => {
                console.log(response.data);
                if (response.data.status === 'OK') {
                    this.props.onSearchSubmit(response.data.pnChannel);
                } else {
                    console.log("Failed to create session");
                }
            }
        ).catch((error: AxiosError) => {
                console.log(error);
            }
        );
    }

    fetchCachedResults = () => {
        axios.get('/browse_flights', {
            params: {
                originPlace: this.state.originPlace,
                destinationPlace: this.state.destinationPlace,
                outboundPartialDate: this.state.outboundPartialDate,
                inboundPartialDate: this.state.inboundPartialDate,
            }
        }).then((response: AxiosResponse) => {
                console.log(response.data);
                if (response.data.status === 'OK') {
                    this.props.onCachedResultsFetched(
                        JSON.parse(response.data.browseResponse)
                    );
                } else {
                    console.log("Failed to browse flights");
                }
            }
        ).catch((error: AxiosError) => {
                console.log(error);
            }
        );
    }

    onSearchClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
        // TODO(dfish): Do basic error-checking before submitting.
        this.fetchCachedResults();
    }
}

