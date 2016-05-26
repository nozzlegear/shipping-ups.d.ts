declare module "shipping-ups"
{
    module UpsApi {
        export interface Config {
            environment: 'live' | 'sandbox';
            username: string;
            password: string;
            access_key: string;
            imperial: boolean; // set to false for metric
        }

        export interface Address {
            /**
             * Name of recipient or sender.
             */
            name: string;

            /**
             * Company name of recipient or sender.
             */
            company?: string;

            /**
             * Address line 1 of recipient or sender.
             */
            address_line_1: string;

            /**
             * Address line 2 of recipient or sender.
             */
            address_line_2?: string;

            /**
             * Address line 3 of recipient or sender.
             */
            address_line_3?: string;

            /**
             * City of recipient or sender.
             */
            city?: string;

            /**
             * 2-letter state code of recipient or sender.
             */
            state_code?: string;

            /**
             * Postal code of recipient or sender.
             */
            postal_code: string;

            /**
             * 2-letter country code of recipient or sender.
             */
            country_code: string;
        }

        export interface AddressValidation extends Address {
            /**
             * Can be 1, 2, or 3.
             * 1: Address validation
             * 2: Address classification
             * 3: Address validation and classification
             */
            request_option: number;
        }

        export interface AddressValidationResponse {
            Response: AddressValidationResponse.Response;
            ValidAddressIndicator: string;
            AmbiguousAddressIndicator: string;
            AddressClassification: AddressValidationResponse.AddressClassification;
            AddressKeyFormat: AddressValidationResponse.AddressKeyFormat;
        }

        export module AddressValidationResponse {
            export interface Response {
                TransactionReference: string;
                ResponseStatusCode: string;
                ResponseStatusDescription: string;
            }

            export interface AddressClassification {
                Code: string;
                Description: string;
            }

            export interface AddressClassification2 {
                Code: string;
                Description: string;
            }

            export interface AddressKeyFormat {
                AddressClassification: AddressClassification2;
                AddressLine: string;
                Region: string;
                PoliticalDivision2: string;
                PoliticalDivision1: string;
                PostcodePrimaryLow: string;
                PostcodeExtendedLow: string;
                CountryCode: string;
            }
        }

        export interface Dimensions {
            length: number;
            width: number;
            height: number;
        }

        export interface Package {
            /**
             * Optional, packaging type code.
             */
            packaging_type?: string;

            weight: number;

            description?: string;

            /**
             * Optional, can be 1 or 2.
             */
            delivery_confirmation_type?: number;

            insured_value?: number;

            /**
             * Integers: 0-108 for imperial, 0-270 for metric
             */
            dimensions?: Dimensions;
        }

        interface SenderOrRecipient {
            /**
             * Optional. 
             */
            phone_number?: string;

            /**
             * Optional
             */
            fax_number?: string;

            /**
             * Optional.
             */
            email_address?: string;

            /**
             * Optional.
             */
            tax_identification_number?: string;

            address: Address
        }

        export interface Sender extends SenderOrRecipient {
            name: string;

            shipper_number: string; // optional, but recommended for accurate rating 
        }

        export interface Recipient extends SenderOrRecipient {
            /**
             * Required for recipient.
             */
            company_name: string;

            /**
             * Optional.
             */
            attention_name?: string;

            /**
             * Optional, for specific locations.
             */
            location_id?: string;

            address: { residential?: boolean } & Address;
        }

        export interface RatesRequest {
            /**
             * Optional.
             */
            pickup_type?: 'daily_pickup' | 'customer_counter' | 'one_time_pickup' | 'on_call_air' | 'suggested_retail_rates' | 'letter_center' | 'air_service_center';

            /**
             * Optional, overwrites pickup_type. 
             */
            pickup_type_code?: string;

            /**
             * Optional, no information about what this does.
             */
            customer_classification?: string;

            shipper: Sender;

            ship_to: Recipient;

            /**
             * The person or company who imports and pays any duties due on the current shipment, required if 
             * Invoice of NAFTA CO is requested.
             */
            sold_to?: {
                /**
                 * Optional, applies to NAFTA CO form.
                 */
                option?: string;
            } & Recipient;

            /**
             * Optional, e.g. '03'. Will rate only this specific service. 
             */
            service?: string;

            /**
             * Optional, e.g. ['03', '04']. Will rate only those specific services. This makes multpile requests, so be careful with it!
             */
            services?: string[];

            return_service?: string;

            packages: Package[];
            
            /**
             * Whether UPS should return rates for saturday delivery or not.
             */
            saturday_delivery?: boolean;
        }
        
        export interface RateCharge {
            CurrencyCode: string;
            MonetaryValue: string;
        }
        
        export interface RateWeight {
            "UnitOfMeasurement": { 
                Code: string 
            }, 
            "Weight": string
        }

        export interface Rate {
            "Service": { 
                Name: string;
                Code: string;
                SaturdayDelivery: boolean;
            }, 
            "RatedShipmentWarning": string, 
            "BillingWeight": RateWeight,
            "TransportationCharges": RateCharge,
            "ServiceOptionsCharges": RateCharge,
            "TotalCharges": RateCharge,
            "GuaranteedDaysToDelivery": string, 
            "ScheduledDeliveryTime": string, 
            "RatedPackage": { 
                TransportationCharges: RateCharge,
                ServiceOptionsCharges: RateCharge,
                TotalCharges: RateCharge,
                Weight: string, 
                BillingWeight: RateWeight,
            }, 
            "NegotiatedRates": { 
                NetSummaryCharges: { 
                    GrandTotal: RateCharge
                } 
            }
        }

        export interface Response {
            ResponseStatusCode: number;
            ResponseStatusDescription: string;
        }

        export interface RatesResult {
            Response: Response;
            RatedShipment: Rate[];
        }
    }

    class UpsApi {
        constructor(config: UpsApi.Config);

        address_validation(address: UpsApi.AddressValidation, cb: (error: Error, data: UpsApi.AddressValidationResponse) => void): void;

        rates(data: UpsApi.RatesRequest, options: { negotiated_rates: boolean }, cb: (err: Error, data: UpsApi.RatesResult) => void);
    }

    export = UpsApi;
}
