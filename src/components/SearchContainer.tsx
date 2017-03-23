import * as _ from 'underscore';
import * as React from 'react';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosPromise, AxiosResponse
} from 'axios';

import { SearchBox } from "./SearchBox";
import { SearchResults } from "./SearchResults";

export interface SearchContainerProps {}

export interface SearchContainerState {
    pnChannel: string;
}

export class SearchContainer extends React.Component<SearchContainerProps, SearchContainerState> {
    constructor(props: SearchContainerProps) {
        super(props);

        this.state = {
            pnChannel: '',
        }
    }

    initializeSearchResults = (pnChannel: string) => {
        console.log('initializeSearchResults', pnChannel);
        this.setState(_.extend(this.state, { pnChannel: pnChannel }));
    }

    render() {
        return (
            <div className="container">
                <SearchBox
                    onSearchSubmit={this.initializeSearchResults}
                />
                <SearchResults
                    pnChannel={this.state.pnChannel}
                />
            </div>
        )
    }
}