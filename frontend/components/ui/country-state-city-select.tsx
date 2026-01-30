"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country, State, City } from "country-state-city";
import { MapPin } from "lucide-react";

export interface CountryStateCityValue {
  country: string;
  state: string;
  city: string;
}

export interface CountryStateCitySelectProps {
  value: CountryStateCityValue;
  onChange: (value: CountryStateCityValue) => void;
  disabled?: boolean;
  required?: boolean;
  showLabels?: boolean;
  countryDisabled?: boolean;
  countryLabel?: string;
  stateLabel?: string;
  cityLabel?: string;
  className?: string;
}

export const CountryStateCitySelect = React.forwardRef<
  HTMLDivElement,
  CountryStateCitySelectProps
>(
  (
    {
      value,
      onChange,
      disabled = false,
      required = false,
      showLabels = true,
      countryDisabled = false,
      countryLabel = "Country",
      stateLabel = "State",
      cityLabel = "City",
      className = "",
    },
    ref
  ) => {
   
    
    // Local state for countries, states, and cities
    const [countries, setCountries] = React.useState<
      Array<{ isoCode: string; name: string; flag: string }>
    >([]);
    const [states, setStates] = React.useState<
      Array<{ isoCode: string; name: string }>
    >([]);
    const [cities, setCities] = React.useState<Array<{ name: string }>>([]);

    // Track selected codes
    const [selectedCountryCode, setSelectedCountryCode] =
      React.useState<string>("");
    const [selectedStateCode, setSelectedStateCode] = React.useState<string>("");
    
   
    // Initialize country code from value
    React.useEffect(() => {
      if (value.country && countries.length > 0) {
        const foundCountry = countries.find(
          (c) => c.name.toLowerCase() === value.country.toLowerCase()
        );
        if (foundCountry) {
          setSelectedCountryCode(foundCountry.isoCode);
        }
      }
    }, [value.country, countries]);

    // Load states when country code changes
    React.useEffect(() => {
      if (selectedCountryCode) {
        const countryStates = State.getStatesOfCountry(selectedCountryCode);
        setStates(countryStates);
      } else {
        setStates([]);
      }
    }, [selectedCountryCode]);

    // Initialize state code from value
    React.useEffect(() => {
      if (value.state && selectedCountryCode && states.length > 0) {
        const foundState = states.find(
          (s) => s.name.toLowerCase() === value.state.toLowerCase()
        );
        if (foundState) {
          setSelectedStateCode(foundState.isoCode);
        }
      }
    }, [value.state, selectedCountryCode, states]);

    // Load cities when state code changes
    React.useEffect(() => {
      if (selectedCountryCode && selectedStateCode) {
        const stateCities = City.getCitiesOfState(
          selectedCountryCode,
          selectedStateCode
        );
        setCities(stateCities);
      } else {
        setCities([]);
      }
    }, [selectedCountryCode, selectedStateCode]);

    const handleCountryChange = (countryCode: string) => {
      setSelectedCountryCode(countryCode);
      setSelectedStateCode("");
      const country = countries.find((c) => c.isoCode === countryCode);
      onChange({
        country: country?.name || "",
        state: "",
        city: "",
      });
    };

    const handleStateChange = (stateCode: string) => {
      setSelectedStateCode(stateCode);
      const state = states.find((s) => s.isoCode === stateCode);
      onChange({
        ...value,
        state: state?.name || "",
        city: "",
      });
    };

    const handleCityChange = (cityName: string) => {
      onChange({
        ...value,
        city: cityName,
      });
    };

    return (
      <div ref={ref} className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {/* Country */}
        <div className="space-y-2">
          {showLabels && (
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {countryLabel}
              {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={selectedCountryCode}
            onValueChange={handleCountryChange}
            disabled={disabled || countryDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div className="space-y-2">
          {showLabels && (
            <Label>
              {stateLabel}
              {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          <Select
            value={selectedStateCode}
            onValueChange={handleStateChange}
            disabled={disabled || !selectedCountryCode}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedCountryCode ? "Select state" : "Select country first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {states.length > 0 ? (
                states.map((state) => (
                  <SelectItem key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-states" disabled>
                  No states available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {value.state && (
            <p className="text-xs text-muted-foreground">
              ✓ Selected: {value.state}
            </p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          {showLabels && (
            <Label>
              {cityLabel}
              {required && <span className="text-destructive">*</span>}
            </Label>
          )}
          {cities.length > 0 ? (
            <Select
              value={value.city}
              onValueChange={handleCityChange}
              disabled={disabled || !selectedStateCode}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedStateCode ? "Select city" : "Select state first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={value.city}
              onChange={(e) => handleCityChange(e.target.value)}
              placeholder="Enter city manually"
              disabled={disabled}
            />
          )}
        </div>
      </div>
    );
  }
);

CountryStateCitySelect.displayName = "CountryStateCitySelect";
