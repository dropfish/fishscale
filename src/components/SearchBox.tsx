import * as React from 'react';
import * as _ from 'underscore';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosPromise, AxiosResponse
} from 'axios';

export interface SearchBoxProps {}

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

    onSearchClick = (event: React.SyntheticEvent<HTMLButtonElement>) => {
        console.log('clicked!');
        
        axios.get('/search_flights', {
            params: {
                originPlace: this.state.originPlace,
                destinationPlace: this.state.destinationPlace,
                outboundPartialDate: this.state.outboundPartialDate,
                inboundPartialDate: this.state.inboundPartialDate,
            }
        }).then(
            function(response: AxiosResponse) {
                console.log(response);
            }
        ).catch(
            function(error: AxiosError) {
                console.log(error);
            }
        );

    }
}
