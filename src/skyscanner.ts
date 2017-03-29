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

export interface Itinerary {
    OutboundLegId: string;
    InboundLegId: string;
    PricingOptions: Array<PricingOption>;
    BookingDetailsLink: BookingDetailsLink;
}