export interface PricingOption {
    Agents: Array<number>;
    QuoteAgeInMinutes: number;
    Price: number;
    DeeplinkUrl: string;
}

export interface BookingDetailsLink {
    Uri: string;
    Body: string;
    Method: string;
}

export interface Leg {
    Id: string;
    SegmentIds: Array<number>;
    OriginStation: number;
    DestinationStation: number;
    Departure: string;
    Arrival: string;
    Duration: number
    JourneyMode: JourneyMode;
    Stops: Array<number>;
    Carriers: Array<number>;
    OperatingCarriers: Array<number>;
    Directionality: Directionality,
    FlightNumbers: Array<{ [ index: string ] : string | number }>;
}

// For some reason, this is different from Leg.
export interface QuoteLeg {
    CarrierIds: Array<number>;
    OriginId: number;
    DestinationId: number;
    DepartureDate: string;
}

export interface Segment {
    Id: number;
    OriginStation: number;
    DestinationStation: number;
    DepartureDateTime: string;
    ArrivalDateTime: string;
    Carrier: number;
    OperatingCarrier: number;
    Duration: number;
    FlightNumber: number;
    JourneyMode: JourneyMode;
    Directionality: Directionality;
}

export interface Carrier {
    Id: number;
    Code: string;
    Name: string;
    ImageUrl: string;
    DisplayCode: string;
}

export interface Agent {
    Id: number;
    Name: string;
    ImageUrl: string;
    Status: LivePollingStatus;
    OptimisedForMobile: boolean;
    BookingNumber: string;
    Type: AgentType;
}

export interface Place {
    Id: number;
    ParentId: number;
    Code: string;
    Type: PlaceType;
    Name: string;
}

export interface Currency {
    Code: string;
    Symbol: string;
    ThousandsSeparator: string;
    DecimalSeparator: string;
    SymbolOnLeft: boolean;
    SpaceBetweenAmountAndSymbol: boolean;
    RoundingCoefficient: number;
    DecimalDigits: number;
}

export interface Itinerary {
    OutboundLegId: string;
    InboundLegId: string;
    PricingOptions: Array<PricingOption>;
    BookingDetailsLink: BookingDetailsLink;
}

export type PlaceType =
    "Airport";

export type AgentType =
    "TravelAgent";

export interface LivePricePollingQuery {
    Country: string;
    Currency: string;
    Locale: string;
    Adults: number;
    Children: number;
    Infants: number;
    OriginPlace: string;
    DestinationPlace: string;
    OutboundDate: string;
    InboundDate: string;
    LocationSchema: LocationSchema,
    CabinClass: CabinClass;
    GroupPricing: boolean;
}

export type LocationSchema =
    "Default";

export type CabinClass =
    "Economy";

export type LivePollingStatus =
    "UpdatesPending" |
    "UpdatesComplete";

export type JourneyMode =
    "Flight";

export type Directionality =
    "Outbound" |
    "Inbound";

export interface LivePricePollingResponse {
    SessionKey: string;
    Query: LivePricePollingQuery;
    Status: LivePollingStatus;
    Itineraries: Array<Itinerary>;
    Legs: Array<Leg>;
    Segments: Array<Segment>;
    Carriers: Array<Carrier>;
    Agents: Array<Agent>;
    Places: Array<Place>;
    Currencies: Array<Currency>;
}

export interface BrowseQuoteResponse {
    Quotes: Array<Quote>;
    Carriers: Array<Carrier>;
    Places: Array<Place>;
    Currencies: Array<Currency>;
}

export interface Quote {
    QuoteId: number;
    MinPrice: number;
    Direct: boolean;
    OutboundLeg: QuoteLeg;
    InboundLeg: QuoteLeg;
    QuoteDateTime: string;
}