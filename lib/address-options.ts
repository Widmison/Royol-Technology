export type CountryOption = { code: string; name: string };

/** USA, Canada, Haiti, DR, Mexico + Caribbean & Greater Antilles (English labels). */
export const DESTINATION_COUNTRIES: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "HT", name: "Haiti" },
  { code: "DO", name: "Dominican Republic (St. Domingue)" },
  { code: "PR", name: "Puerto Rico" },
  { code: "CU", name: "Cuba" },
  { code: "JM", name: "Jamaica" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "BS", name: "Bahamas" },
  { code: "BB", name: "Barbados" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "DM", name: "Dominica" },
  { code: "GD", name: "Grenada" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "AI", name: "Anguilla" },
  { code: "AW", name: "Aruba" },
  { code: "KY", name: "Cayman Islands" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "CW", name: "Curaçao" },
  { code: "SX", name: "Sint Maarten" },
  { code: "BQ", name: "Caribbean Netherlands (Bonaire / Saba / Statia)" },
  { code: "GP", name: "Guadeloupe" },
  { code: "MQ", name: "Martinique" },
  { code: "BL", name: "Saint Barthélemy" },
  { code: "MF", name: "Saint Martin" },
  { code: "MS", name: "Montserrat" },
  { code: "TC", name: "Turks and Caicos" },
  { code: "BM", name: "Bermuda" },
  { code: "BZ", name: "Belize" },
  { code: "GY", name: "Guyana" },
  { code: "SR", name: "Suriname" },
  { code: "GF", name: "French Guiana" },
  { code: "OTHER", name: "Other (type region below)" },
];

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const CA_PROVINCES: { code: string; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

/** Haiti — départements administratifs. */
export const HAITI_DEPARTMENTS: { code: string; name: string }[] = [
  { code: "Artibonite", name: "Artibonite" },
  { code: "Centre", name: "Centre" },
  { code: "Grand'Anse", name: "Grand'Anse" },
  { code: "Nippes", name: "Nippes" },
  { code: "Nord", name: "Nord" },
  { code: "Nord-Est", name: "Nord-Est" },
  { code: "Nord-Ouest", name: "Nord-Ouest" },
  { code: "Ouest", name: "Ouest (Port-au-Prince area)" },
  { code: "Sud", name: "Sud" },
  { code: "Sud-Est", name: "Sud-Est" },
];

export const DO_PROVINCES: { code: string; name: string }[] = [
  { code: "Distrito Nacional", name: "Distrito Nacional" },
  { code: "Santo Domingo", name: "Santo Domingo" },
  { code: "Santiago", name: "Santiago" },
  { code: "La Vega", name: "La Vega" },
  { code: "San Cristóbal", name: "San Cristóbal" },
  { code: "Puerto Plata", name: "Puerto Plata" },
  { code: "La Romana", name: "La Romana" },
  { code: "San Pedro de Macorís", name: "San Pedro de Macorís" },
  { code: "La Altagracia", name: "La Altagracia (Punta Cana)" },
  { code: "Espaillat", name: "Espaillat (Moca)" },
  { code: "Duarte", name: "Duarte" },
  { code: "Monseñor Nouel", name: "Monseñor Nouel" },
  { code: "Azua", name: "Azua" },
  { code: "Barahona", name: "Barahona" },
  { code: "Other", name: "Other province (describe in address)" },
];

export type RegionField =
  | { kind: "select"; label: string; options: { code: string; name: string }[] }
  | { kind: "text"; label: string; placeholder: string };

export function regionFieldForCountry(countryCode: string): RegionField {
  switch (countryCode) {
    case "US":
      return { kind: "select", label: "State", options: US_STATES };
    case "CA":
      return { kind: "select", label: "Province / territory", options: CA_PROVINCES };
    case "HT":
      return { kind: "select", label: "Department (département)", options: HAITI_DEPARTMENTS };
    case "DO":
      return { kind: "select", label: "Province", options: DO_PROVINCES };
    default:
      return {
        kind: "text",
        label: "State / province / parish",
        placeholder: "e.g. Castries, Bridgetown, Willemstad…",
      };
  }
}
