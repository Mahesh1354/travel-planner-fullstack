package com.travelplanner.backend.service;

import com.amadeus.Amadeus;
import com.amadeus.Params;
import com.amadeus.exceptions.ResponseException;
import com.amadeus.resources.FlightOfferSearch;
import com.amadeus.resources.Hotel;
import com.amadeus.resources.HotelOfferSearch;
import com.amadeus.resources.Location;
import com.travelplanner.backend.dto.amadeus.FlightOfferDTO;
import com.travelplanner.backend.dto.amadeus.AirportDTO;
import com.travelplanner.backend.dto.amadeus.HotelOfferDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AmadeusService {

    private final Amadeus amadeus;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final int MAX_DAYS_AHEAD = 365;
    private static final int BATCH_SIZE = 5;
    private static final int MAX_HOTELS_PER_CITY = 15;

    @Cacheable(value = "flightOffers", key = "#origin + #destination + #departureDate")
    public List<FlightOfferDTO> searchFlights(
            String origin,
            String destination,
            String departureDate,
            String returnDate,
            int adults,
            String cabinClass) {

        try {
            log.info("Searching flights from {} to {} on {}", origin, destination, departureDate);

            // FIXED: Use current date for validation
            LocalDate today = LocalDate.now();
            LocalDate departDate = LocalDate.parse(departureDate, DATE_FORMATTER);

            // Validate date is not in the past
            if (departDate.isBefore(today)) {
                log.warn("Departure date {} is in the past. Please use a future date.", departureDate);
                return new ArrayList<>();
            }

            // Validate date is not too far in the future
            if (departDate.isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
                log.warn("Departure date {} is beyond {} days. Please use a date within {} days.",
                        departureDate, MAX_DAYS_AHEAD, MAX_DAYS_AHEAD);
                return new ArrayList<>();
            }

            Params params = Params.with("originLocationCode", origin)
                    .and("destinationLocationCode", destination)
                    .and("departureDate", departureDate)
                    .and("adults", String.valueOf(adults))
                    .and("max", "50");

            if (returnDate != null && !returnDate.isEmpty()) {
                try {
                    LocalDate returnDt = LocalDate.parse(returnDate, DATE_FORMATTER);
                    if (!returnDt.isBefore(departDate)) {
                        params.and("returnDate", returnDate);
                    } else {
                        log.warn("Return date {} is before departure date", returnDate);
                    }
                } catch (DateTimeParseException e) {
                    log.warn("Invalid return date format: {}", returnDate);
                }
            }

            if (cabinClass != null && !cabinClass.isEmpty()) {
                params.and("travelClass", cabinClass.toUpperCase());
            }

            log.debug("Amadeus flight search params: {}", params);
            FlightOfferSearch[] flightOffers = amadeus.shopping.flightOffersSearch.get(params);

            return Arrays.stream(flightOffers)
                    .map(this::mapFlightToDTO)
                    .collect(Collectors.toList());

        } catch (ResponseException e) {
            log.error("Amadeus API error in flight search: {}", e.getMessage());
            log.error("Response code: {}", e.getResponse().getStatusCode());
            log.error("Response body: {}", e.getResponse().getBody());
            return new ArrayList<>();
        } catch (DateTimeParseException e) {
            log.error("Invalid date format: {}", departureDate);
            return new ArrayList<>();
        }
    }

    @Cacheable(value = "airports", key = "#keyword")
    public List<AirportDTO> searchAirports(String keyword) {
        try {
            log.info("Searching airports for keyword: {}", keyword);

            Params params = Params.with("keyword", keyword)
                    .and("subType", "AIRPORT")
                    .and("page[limit]", "20");

            log.debug("Amadeus params: {}", params);

            Location[] locations = amadeus.referenceData.locations.get(params);

            log.info("Found {} airports for keyword: {}", locations.length, keyword);

            return Arrays.stream(locations)
                    .map(this::mapAirportToDTO)
                    .collect(Collectors.toList());

        } catch (ResponseException e) {
            log.error("Amadeus API error for keyword '{}'", keyword);
            log.error("Response code: {}", e.getResponse().getStatusCode());
            log.error("Response body: {}", e.getResponse().getBody());
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Unexpected error searching airports: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Cacheable(value = "hotelOffers", key = "#cityCode + #checkIn + #checkOut")
    public List<HotelOfferDTO> searchHotels(
            String cityCode,
            String checkIn,
            String checkOut,
            int guests,
            int rooms) {

        try {
            log.info("Searching hotels with cityCode: {}, checkIn: {}, checkOut: {}",
                    cityCode, checkIn, checkOut);

            // FIXED: Validate dates are in the future
            LocalDate today = LocalDate.now();
            LocalDate checkInDate = LocalDate.parse(checkIn, DATE_FORMATTER);
            LocalDate checkOutDate = LocalDate.parse(checkOut, DATE_FORMATTER);

            if (checkInDate.isBefore(today)) {
                log.warn("Check-in date {} is in the past. Please use a future date.", checkIn);
                return new ArrayList<>();
            }

            if (checkOutDate.isBefore(checkInDate) || checkOutDate.isBefore(today.plusDays(1))) {
                log.warn("Invalid date range: {} to {}", checkIn, checkOut);
                return new ArrayList<>();
            }

            // Step 1: Get hotel IDs by city
            Params hotelParams = Params.with("cityCode", cityCode)
                    .and("radius", "50")
                    .and("radiusUnit", "KM")
                    .and("hotelSource", "ALL");

            com.amadeus.resources.Hotel[] hotels = amadeus.referenceData.locations.hotels.byCity.get(hotelParams);

            if (hotels == null || hotels.length == 0) {
                log.warn("No hotels found for city code: {}", cityCode);
                return new ArrayList<>();
            }

            log.info("Found {} hotels in city {}", hotels.length, cityCode);

            // Step 2: Get hotel IDs - take more than we need since some may be invalid
            List<String> allHotelIds = Arrays.stream(hotels)
                    .limit(MAX_HOTELS_PER_CITY)
                    .map(Hotel::getHotelId)
                    .filter(id -> id != null && !id.isEmpty())
                    .collect(Collectors.toList());

            log.info("Total hotel IDs collected: {}", allHotelIds.size());

            // Step 3: Try searching with batches of hotel IDs
            List<HotelOfferDTO> allResults = new ArrayList<>();

            for (int i = 0; i < allHotelIds.size(); i += BATCH_SIZE) {
                int end = Math.min(i + BATCH_SIZE, allHotelIds.size());
                List<String> batchIds = allHotelIds.subList(i, end);

                try {
                    List<HotelOfferDTO> batchResults = searchHotelBatch(
                            batchIds, checkIn, checkOut, guests, rooms);
                    allResults.addAll(batchResults);
                    log.debug("Batch {} found {} offers", i / BATCH_SIZE + 1, batchResults.size());

                    // Small delay to avoid rate limiting
                    Thread.sleep(200);
                } catch (Exception e) {
                    log.warn("Batch search failed for IDs: {}, continuing...", batchIds);
                }
            }

            log.info("Total hotel offers found: {}", allResults.size());
            return allResults;

        } catch (ResponseException e) {
            log.error("Amadeus API error in hotel search: {}", e.getMessage());
            log.error("Response code: {}", e.getResponse().getStatusCode());
            log.error("Response body: {}", e.getResponse().getBody());
            return new ArrayList<>();
        } catch (DateTimeParseException e) {
            log.error("Invalid date format: {} or {}", checkIn, checkOut);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Unexpected error in hotel search: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Search for a batch of hotel IDs
     */
    private List<HotelOfferDTO> searchHotelBatch(
            List<String> hotelIds,
            String checkIn,
            String checkOut,
            int guests,
            int rooms) {

        try {
            if (hotelIds.isEmpty()) {
                return new ArrayList<>();
            }

            Params offerParams = Params.with("hotelIds", String.join(",", hotelIds))
                    .and("checkInDate", checkIn)
                    .and("checkOutDate", checkOut)
                    .and("adults", String.valueOf(guests))
                    .and("roomQuantity", String.valueOf(rooms))
                    .and("currency", "USD")
                    .and("bestRateOnly", "true")
                    .and("includeClosed", "false")
                    .and("rateType", "RACK,RUN_OF_HOUSE,NEGOTIATED,PUBLIC");

            log.debug("Searching hotel batch with params: {}", offerParams);
            HotelOfferSearch[] hotelOffers = amadeus.shopping.hotelOffersSearch.get(offerParams);

            if (hotelOffers == null || hotelOffers.length == 0) {
                return new ArrayList<>();
            }

            return Arrays.stream(hotelOffers)
                    .map(this::mapHotelToDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (ResponseException e) {
            if (e.getResponse().getStatusCode() == 400) {
                log.debug("Batch search failed - likely no offers for these hotels");
            } else {
                log.debug("Batch search error: {} - {}", e.getResponse().getStatusCode(), e.getMessage());
            }
            return new ArrayList<>();
        }
    }

    private FlightOfferDTO mapFlightToDTO(FlightOfferSearch offer) {
        try {
            FlightOfferDTO.FlightOfferDTOBuilder builder = FlightOfferDTO.builder()
                    .id(offer.getId())
                    .price(Double.parseDouble(offer.getPrice().getTotal()))
                    .currency(offer.getPrice().getCurrency())
                    .availableSeats(offer.getNumberOfBookableSeats());

            if (offer.getItineraries() != null && offer.getItineraries().length > 0) {
                var itinerary = offer.getItineraries()[0];
                builder.duration(itinerary.getDuration());

                if (itinerary.getSegments() != null && itinerary.getSegments().length > 0) {
                    var segment = itinerary.getSegments()[0];
                    builder.airline(segment.getCarrierCode())
                            .flightNumber(segment.getNumber())
                            .origin(segment.getDeparture().getIataCode())
                            .destination(segment.getArrival().getIataCode())
                            .departureTime(segment.getDeparture().getAt())
                            .arrivalTime(segment.getArrival().getAt())
                            .stops(segment.getNumberOfStops());
                }
            }

            if (offer.getTravelerPricings() != null && offer.getTravelerPricings().length > 0) {
                var pricing = offer.getTravelerPricings()[0];
                if (pricing.getFareDetailsBySegment() != null &&
                        pricing.getFareDetailsBySegment().length > 0) {
                    builder.cabinClass(pricing.getFareDetailsBySegment()[0].getCabin());
                }
            }

            return builder.build();
        } catch (Exception e) {
            log.error("Error mapping flight offer: {}", e.getMessage());
            return null;
        }
    }

    private AirportDTO mapAirportToDTO(Location location) {
        try {
            AirportDTO.AirportDTOBuilder builder = AirportDTO.builder()
                    .code(location.getIataCode())
                    .name(location.getName());

            if (location.getAddress() != null) {
                builder.city(location.getAddress().getCityName())
                        .country(location.getAddress().getCountryName());
            }

            if (location.getGeoCode() != null) {
                builder.latitude(location.getGeoCode().getLatitude())
                        .longitude(location.getGeoCode().getLongitude());
            }

            return builder.build();
        } catch (Exception e) {
            log.error("Error mapping airport: {}", e.getMessage());
            return null;
        }
    }

    private HotelOfferDTO mapHotelToDTO(HotelOfferSearch offer) {
        try {
            HotelOfferDTO.HotelOfferDTOBuilder builder = HotelOfferDTO.builder()
                    .hotelId(offer.getHotel().getHotelId())
                    .hotelName(offer.getHotel().getName());

            Object hotel = offer.getHotel();
            Class<?> hotelClass = hotel.getClass();

            // Get Address
            extractHotelAddress(hotel, hotelClass, builder);

            // Get Rating
            extractHotelRating(hotel, hotelClass, builder);

            // Get GeoCode
            extractHotelGeoCode(hotel, hotelClass, builder);

            // Get Offers and Price
            if (offer.getOffers() != null && offer.getOffers().length > 0) {
                var hotelOffer = offer.getOffers()[0];
                var price = hotelOffer.getPrice();

                builder.pricePerNight(Double.parseDouble(price.getTotal()))
                        .currency(price.getCurrency());

                if (price.getVariations() != null &&
                        price.getVariations().getAverage() != null) {
                    try {
                        String averageTotal = price.getVariations().getAverage().getTotal();
                        if (averageTotal != null && !averageTotal.isEmpty()) {
                            builder.availableRooms(Integer.parseInt(averageTotal));
                        }
                    } catch (NumberFormatException e) {
                        log.debug("Could not parse available rooms");
                        builder.availableRooms(0);
                    }
                }
            }

            // Get Amenities
            extractHotelAmenities(hotel, hotelClass, builder);

            // Get Description
            extractHotelDescription(hotel, hotelClass, builder);

            return builder.build();
        } catch (Exception e) {
            log.error("Error mapping hotel offer: {}", e.getMessage());
            return null;
        }
    }

    private void extractHotelAddress(Object hotel, Class<?> hotelClass, HotelOfferDTO.HotelOfferDTOBuilder builder) {
        try {
            Method getAddressMethod = hotelClass.getMethod("getAddress");
            Object address = getAddressMethod.invoke(hotel);
            if (address != null) {
                Class<?> addressClass = address.getClass();

                try {
                    Method getLinesMethod = addressClass.getMethod("getLines");
                    String[] lines = (String[]) getLinesMethod.invoke(address);
                    if (lines != null && lines.length > 0) {
                        builder.address(lines[0]);
                    }
                } catch (Exception e) {
                    log.debug("Could not get address lines");
                }

                try {
                    Method getCityNameMethod = addressClass.getMethod("getCityName");
                    String city = (String) getCityNameMethod.invoke(address);
                    if (city != null) {
                        builder.city(city);
                    }
                } catch (Exception e) {
                    log.debug("Could not get city name");
                }

                try {
                    Method getCountryCodeMethod = addressClass.getMethod("getCountryCode");
                    String country = (String) getCountryCodeMethod.invoke(address);
                    if (country != null) {
                        builder.country(country);
                    }
                } catch (Exception e) {
                    log.debug("Could not get country code");
                }
            }
        } catch (Exception e) {
            log.debug("Could not get hotel address");
        }
    }

    private void extractHotelRating(Object hotel, Class<?> hotelClass, HotelOfferDTO.HotelOfferDTOBuilder builder) {
        try {
            Method getRatingMethod = hotelClass.getMethod("getRating");
            Object ratingObj = getRatingMethod.invoke(hotel);
            if (ratingObj != null) {
                String rating = ratingObj.toString();
                if (!rating.isEmpty()) {
                    try {
                        builder.rating(Double.parseDouble(rating));
                    } catch (NumberFormatException e) {
                        log.debug("Could not parse rating: {}", rating);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not get hotel rating");
        }
    }

    private void extractHotelGeoCode(Object hotel, Class<?> hotelClass, HotelOfferDTO.HotelOfferDTOBuilder builder) {
        try {
            Method getGeoCodeMethod = hotelClass.getMethod("getGeoCode");
            Object geoCode = getGeoCodeMethod.invoke(hotel);
            if (geoCode != null) {
                Class<?> geoCodeClass = geoCode.getClass();

                try {
                    Method getLatitudeMethod = geoCodeClass.getMethod("getLatitude");
                    Object lat = getLatitudeMethod.invoke(geoCode);
                    if (lat != null) {
                        if (lat instanceof Double) {
                            builder.latitude((Double) lat);
                        } else if (lat instanceof String) {
                            builder.latitude(Double.parseDouble((String) lat));
                        }
                    }
                } catch (Exception e) {
                    log.debug("Could not get latitude");
                }

                try {
                    Method getLongitudeMethod = geoCodeClass.getMethod("getLongitude");
                    Object lng = getLongitudeMethod.invoke(geoCode);
                    if (lng != null) {
                        if (lng instanceof Double) {
                            builder.longitude((Double) lng);
                        } else if (lng instanceof String) {
                            builder.longitude(Double.parseDouble((String) lng));
                        }
                    }
                } catch (Exception e) {
                    log.debug("Could not get longitude");
                }
            }
        } catch (Exception e) {
            log.debug("Could not get hotel geocode");
        }
    }

    private void extractHotelAmenities(Object hotel, Class<?> hotelClass, HotelOfferDTO.HotelOfferDTOBuilder builder) {
        try {
            Method getAmenitiesMethod = hotelClass.getMethod("getAmenities");
            Object amenitiesObj = getAmenitiesMethod.invoke(hotel);
            if (amenitiesObj != null) {
                if (amenitiesObj instanceof String[]) {
                    String[] amenities = (String[]) amenitiesObj;
                    if (amenities.length > 0) {
                        builder.amenities(Arrays.asList(amenities));
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not get hotel amenities");
        }
    }

    private void extractHotelDescription(Object hotel, Class<?> hotelClass, HotelOfferDTO.HotelOfferDTOBuilder builder) {
        try {
            Method getDescriptionMethod = hotelClass.getMethod("getDescription");
            Object description = getDescriptionMethod.invoke(hotel);
            if (description != null) {
                Class<?> descriptionClass = description.getClass();
                try {
                    Method getTextMethod = descriptionClass.getMethod("getText");
                    String text = (String) getTextMethod.invoke(description);
                    if (text != null && !text.isEmpty()) {
                        builder.description(text);
                    }
                } catch (Exception e) {
                    log.debug("Could not get description text");
                }
            }
        } catch (Exception e) {
            log.debug("Could not get hotel description");
        }
    }
}