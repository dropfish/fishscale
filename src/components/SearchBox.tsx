import * as React from 'react';
import * as _ from 'underscore';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosPromise, AxiosResponse
} from 'axios';
import {
    Moment,
} from 'moment';
import * as Select from 'react-select';

import {
    BrowseQuoteResponse,
} from './../skyscanner';
import {
    DateRangePicker,
} from 'react-dates';

export interface SearchBoxProps {
    onCachedResultsFetched: (browseResponse: BrowseQuoteResponse) => void
    onSearchSubmit: (pnChannel: string) => void;
}

type FocusedInput = 'startDate'
    | 'endDate'
    | null;

interface OnDatesChangeArg {
    startDate: Moment;
    endDate: Moment;
    focusedInput: FocusedInput;
}

export interface SearchBoxState {
    originPlace: string;
    destinationPlace: string;
    outboundPartialDate?: Moment;
    inboundPartialDate?: Moment;
    focusedInput: FocusedInput;
}

export class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    constructor(props: SearchBoxProps) {
        super(props);
        this.state = {
            originPlace: '',
            destinationPlace: '',
            focusedInput: null,
        }
    }


    render() {
        console.log(this.state);
        console.log(Select);
        const items = [
            {
                name: 'Maine',
                value: 'maine'
            },
            {
                name: 'Ohio',
                value: 'ohio'
            },
            {
                name: 'Arkansas',
                value: 'arkansas'
            },
        ];

        var options = [
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' }
        ];

        function logChange(val: any) {
            console.log("Selected: " + val);
        }

        return (
            <div>
                From:
                <Select
                    name="form-field-name"
                    value="one"
                    options={options}
                    onChange={logChange}
                />
                To:
                <input
                    type='text'
                    value={this.state.destinationPlace}
                    onChange={this.handleDestinationChange}
                />
                <DateRangePicker
                    startDate={this.state.outboundPartialDate}
                    startDatePlaceholderText="Departure date"
                    endDate={this.state.inboundPartialDate}
                    endDatePlaceholderText="Return date"
                    onDatesChange={this.onDatesChange}
                    focusedInput={this.state.focusedInput}
                    onFocusChange={this.onFocusChange}
                    minimumNights={0}
                />
                <button type='button' onClick={this.onSearchClick}>
                    Search
                </button>
            </div>
        )
    }

    getItemValue = (item: any) => {
        return item.value;
    };

    renderItem = (item: any, isHighlighted: boolean, styles: object) => {
        return item.name;
    };

    onDatesChange = (onDatesChangeArg: OnDatesChangeArg) => {
        let nextFocusedInput: FocusedInput;
        if (onDatesChangeArg.startDate !== this.state.outboundPartialDate) {
            // User has just picked a new startDate, so we shift focus to endDate.
            // Note: The new startDate can actually be the same date as before, but
            // due to the creation of a new "Moment" object, it gets treated as new.
            nextFocusedInput = 'endDate';
        } else {
            nextFocusedInput = null;
        }

        this.setState(_.extend(this.state, {
            outboundPartialDate: onDatesChangeArg.startDate,
            inboundPartialDate: onDatesChangeArg.endDate,
            focusedInput: nextFocusedInput,
        }));
    };

    onFocusChange = (focusedInput: FocusedInput) => {
        this.setState(_.extend({ focusedInput: focusedInput }));
    }

    handleOriginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {originPlace: event.target.value}));
    }

    handleDestinationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState(_.extend(this.state, {destinationPlace: event.target.value}));
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

