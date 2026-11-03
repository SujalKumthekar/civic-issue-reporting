import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Navigation, Building2 } from 'lucide-react';

const LocationAutocomplete = ({
    value,
    onChange,
    placeholder = 'Search for a location...',
    id = 'location',
    name = 'location',
    required = false,
    accentColor = 'secondary',
    userArea = '',
    userTaluka = '',
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    const ringColor = accentColor === 'red'
        ? 'focus-within:ring-red-400/40 focus-within:border-red-400'
        : 'focus-within:ring-secondary/40 focus-within:border-secondary';

    // Build location context
    const locationContext = [userArea, userTaluka, 'Maharashtra, India']
        .filter(Boolean)
        .join(', ');

    const searchLocation = useCallback((query) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query || query.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);

        debounceRef.current = setTimeout(async () => {
            try {
                const localQuery = locationContext
                    ? `${query}, ${locationContext}`
                    : query;

                // Two parallel searches:
                // 1. Nominatim — localized with area context, bounded to Pune District
                // 2. Photon — fast POI search biased to Pune coordinates
                const [nominatimRes, photonRes] = await Promise.allSettled([
                    fetch(
                        `https://nominatim.openstreetmap.org/search?` +
                        `q=${encodeURIComponent(localQuery)}&` +
                        `format=json&` +
                        `addressdetails=1&` +
                        `namedetails=1&` +
                        `countrycodes=in&` +
                        `limit=5&` +
                        `viewbox=73.2,19.4,75.1,17.8&` +
                        `bounded=1&` +
                        `dedupe=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    ).then(r => r.json()),

                    fetch(
                        `https://photon.komoot.io/api/?` +
                        `q=${encodeURIComponent(query + ', ' + (userTaluka || 'Pune'))}&` +
                        `lat=18.52&lon=73.85&` +
                        `limit=5&` +
                        `lang=en`
                    ).then(r => r.json()),
                ]);

                const results = new Map();

                // Process Nominatim results
                if (nominatimRes.status === 'fulfilled') {
                    nominatimRes.value.forEach((item) => {
                        const short = buildNominatimShortName(item);
                        const key = short.toLowerCase().replace(/\s+/g, ' ').trim();
                        if (!results.has(key)) {
                            results.set(key, {
                                displayName: item.display_name,
                                shortName: short,
                                type: getPlaceType(item),
                                source: 'nominatim',
                            });
                        }
                    });
                }

                // Process Photon results
                if (photonRes.status === 'fulfilled' && photonRes.value?.features) {
                    photonRes.value.features.forEach((feature) => {
                        const props = feature.properties || {};
                        const short = buildPhotonShortName(props);
                        const key = short.toLowerCase().replace(/\s+/g, ' ').trim();
                        if (!results.has(key)) {
                            results.set(key, {
                                displayName: buildPhotonFullName(props),
                                shortName: short,
                                type: props.osm_value || props.type || 'place',
                                source: 'photon',
                            });
                        }
                    });
                }

                const formatted = Array.from(results.values()).slice(0, 7);
                setSuggestions(formatted);
                setIsOpen(formatted.length > 0);
                setHighlightedIndex(-1);
            } catch {
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 350);
    }, [locationContext, userTaluka]);

    // --- Name builders ---

    const buildNominatimShortName = (item) => {
        const parts = [];
        const addr = item.address || {};
        const nameDetails = item.namedetails || {};

        const placeName = nameDetails.name || nameDetails['name:en'] || nameDetails['name:mr'];
        const specific = placeName || addr.amenity || addr.shop || addr.office ||
            addr.building || addr.tourism || addr.leisure || addr.historic;
        if (specific && specific !== 'yes') parts.push(specific);

        if (addr.house_number && addr.road) {
            parts.push(`${addr.house_number}, ${addr.road}`);
        } else if (addr.road && !parts.includes(addr.road)) {
            parts.push(addr.road);
        }

        const local = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential;
        if (local && !parts.includes(local)) parts.push(local);

        const place = addr.village || addr.town || addr.city;
        if (place && !parts.includes(place)) parts.push(place);

        if (parts.length === 0) {
            return item.display_name.split(',').slice(0, 3).join(', ').trim();
        }

        return parts.join(', ');
    };

    const buildPhotonShortName = (props) => {
        const parts = [];
        if (props.name) parts.push(props.name);

        if (props.housenumber && props.street) {
            parts.push(`${props.housenumber}, ${props.street}`);
        } else if (props.street && !parts.includes(props.street)) {
            parts.push(props.street);
        }

        const local = props.locality || props.district;
        if (local && !parts.includes(local)) parts.push(local);

        const city = props.city || props.town || props.village;
        if (city && !parts.includes(city)) parts.push(city);

        return parts.length > 0 ? parts.join(', ') : (props.name || 'Unknown');
    };

    const buildPhotonFullName = (props) => {
        return [
            props.name, props.housenumber, props.street,
            props.locality, props.district,
            props.city || props.town || props.village,
            props.county, props.state, props.country,
        ].filter(Boolean).join(', ');
    };

    const getPlaceType = (item) => {
        const addr = item.address || {};
        if (addr.amenity) return addr.amenity;
        if (addr.shop) return 'shop';
        if (addr.office) return 'office';
        if (addr.building && addr.building !== 'yes') return addr.building;
        if (addr.tourism) return 'tourism';
        if (addr.historic) return 'historic';
        if (item.type) return item.type;
        return 'place';
    };

    const getTypeLabel = (type) => {
        const labels = {
            'school': '🏫 School', 'college': '🎓 College', 'university': '🎓 University',
            'hospital': '🏥 Hospital', 'clinic': '🏥 Clinic',
            'bank': '🏦 Bank', 'atm': '🏧 ATM',
            'police': '🚔 Police', 'post_office': '📮 Post Office',
            'townhall': '🏛️ Karyalaya', 'community_centre': '🏛️ Community Center',
            'pharmacy': '💊 Pharmacy',
            'temple': '🛕 Temple', 'mosque': '🕌 Mosque', 'church': '⛪ Church',
            'place_of_worship': '🛕 Worship Place',
            'shop': '🛒 Shop', 'supermarket': '🛒 Supermarket',
            'office': '🏢 Office', 'government': '🏛️ Govt Office',
            'restaurant': '🍽️ Restaurant', 'cafe': '☕ Cafe',
            'fuel': '⛽ Petrol Pump', 'bus_station': '🚌 Bus Stand', 'bus_stop': '🚏 Bus Stop',
            'park': '🌳 Park', 'garden': '🌺 Garden',
            'library': '📚 Library', 'cinema': '🎬 Cinema',
            'residential': '🏘️ Residential', 'village': '🏘️ Village', 'town': '🏙️ Town',
            'hotel': '🏨 Hotel', 'guest_house': '🏨 Guest House',
            'road': '🛣️ Road',
        };
        return labels[type] || null;
    };

    const handleSelect = (suggestion) => {
        onChange(suggestion.shortName);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <div className={`relative rounded-xl border border-neutral-200 bg-white transition-all duration-200 focus-within:ring-2 ${ringColor}`}>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-neutral-400" />
                </div>
                <input
                    id={id}
                    name={name}
                    type="text"
                    required={required}
                    autoComplete="off"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        searchLocation(e.target.value);
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-10 py-3 rounded-xl bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {isSearching && <Loader2 size={16} className="animate-spin text-neutral-400" />}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="py-1 max-h-72 overflow-y-auto">
                        {suggestions.map((suggestion, index) => {
                            const typeLabel = getTypeLabel(suggestion.type);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelect(suggestion)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                                        index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-neutral-50'
                                    }`}
                                >
                                    <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                                        index === highlightedIndex ? 'bg-secondary/10' : 'bg-neutral-100'
                                    }`}>
                                        {typeLabel
                                            ? <span>{typeLabel.split(' ')[0]}</span>
                                            : <Navigation size={13} className={index === highlightedIndex ? 'text-secondary' : 'text-neutral-400'} />
                                        }
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-semibold leading-tight ${
                                            index === highlightedIndex ? 'text-secondary' : 'text-neutral-800'
                                        }`}>
                                            {suggestion.shortName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {typeLabel && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 whitespace-nowrap">
                                                    {typeLabel.split(' ').slice(1).join(' ')}
                                                </span>
                                            )}
                                            <p className="text-[11px] text-neutral-400 truncate">
                                                {suggestion.displayName}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <Building2 size={10} />
                            {userArea
                                ? <>Searching near <span className="font-semibold text-neutral-500">{userArea}</span>, {userTaluka}</>
                                : 'Searching nearby locations'
                            }
                        </p>
                        <p className="text-[10px] text-neutral-300">OpenStreetMap</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationAutocomplete;
