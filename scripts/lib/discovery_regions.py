#!/usr/bin/env python3
"""Search cells for Google Places discovery — Europe, Asia, Africa, Middle East."""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class SearchPoint:
    """One geographic anchor within a city/metro search cell."""

    lat: float
    lng: float
    radius_km: float
    label: str  # e.g. "London@grid-1-2" or "London@center"


@dataclass(frozen=True)
class SearchCell:
    """A geographic anchor for bounded Text Search."""

    name: str
    region: str
    country: str
    country_code: str
    lat: float
    lng: float
    radius_km: float = 30.0


# Extra queries appended per country (local language helps where English results are sparse/noisy)
LOCALIZED_QUERIES: dict[str, tuple[str, ...]] = {
    "GB": ("Buddhist centre", "Hindu mandir", "meditation centre"),
    "IE": ("Buddhist centre", "meditation centre"),
    "TR": ("Budist tapınak", "Zen meditasyon merkezi"),
    "JP": ("仏教寺院", "禅 寺院"),
    "KR": ("불교 사찰", "명상 센터"),
    "TH": ("วัด พุทธ", "วัด"),
    "VN": ("chùa Phật giáo", "thiền viện"),
    "CN": ("佛教寺庙", "禅修中心"),
    "TW": ("佛教寺廟", "禪修中心"),
    "HK": ("佛教寺廟", "禪修中心"),
    "IN": ("Buddhist vihara", "Hindu mandir", "ashram"),
    "EG": ("Buddhist meditation center", "Hindu temple"),
    "ZA": ("Buddhist centre", "Hindu temple"),
    "AE": ("Hindu temple", "Buddhist temple"),
    "IL": ("Buddhist center", "meditation center"),
    "FR": ("centre bouddhiste", "temple bouddhiste"),
    "DE": ("Buddhistisches Zentrum", "Buddhistisches Kloster"),
    "ES": ("templo budista", "centro budista"),
    "IT": ("tempio buddista", "centro buddhista"),
    "RU": ("Буддийский храм", "Буддийский центр"),
}


# Broad + tradition-specific text queries (overlap is OK — dedupe by googlePlaceId)
DISCOVERY_QUERIES: tuple[str, ...] = (
    "Buddhist temple",
    "Buddhist monastery",
    "Buddhist center",
    "Buddhist centre",
    "Buddhist meditation center",
    "Buddhist sangha",
    "dharma center",
    "Zen center",
    "Zen temple",
    "Tibetan Buddhist center",
    "Tibetan monastery",
    "Vipassana meditation center",
    "Theravada Buddhist temple",
    "Mahayana Buddhist temple",
    "Thai Buddhist temple",
    "Chinese Buddhist temple",
    "Kadampa meditation center",
    "Triratna Buddhist center",
    "Soka Gakkai center",
    "Plum Village meditation",
    "mindfulness meditation center",
    "Buddhist retreat center",
    "Hindu temple",
    "Hindu mandir",
    "Hindu ashram",
    "ISKCON temple",
    "Vedanta center",
    "Ramakrishna mission",
    "spiritual ashram",
)

NEARBY_PRIMARY_TYPES: tuple[str, ...] = ("buddhist_temple", "hindu_temple")


def queries_for_cell(cell: SearchCell) -> tuple[str, ...]:
    """Unique queries for a cell — base list + city/country context + localized."""
    seen: set[str] = set()
    ordered: list[str] = []

    def add(query: str) -> None:
        key = query.strip().lower()
        if key and key not in seen:
            seen.add(key)
            ordered.append(query.strip())

    for query in DISCOVERY_QUERIES:
        add(query)
    for query in LOCALIZED_QUERIES.get(cell.country_code, ()):
        add(query)

    # City-scoped queries surface suburban/small listings text search misses at country scale
    for template in (
        "Buddhist temple {city}",
        "Buddhist center {city}",
        "Hindu temple {city}",
        "Zen center {city}",
        "meditation center {city}",
        "ashram {city}",
    ):
        add(template.format(city=cell.name))

    return tuple(ordered)


def grid_points_for_cell(cell: SearchCell, grid_size: int = 3) -> list[SearchPoint]:
    """Split a metro cell into a grid — Google caps ~60 text results and 20 nearby per call."""
    if grid_size <= 1:
        return [
            SearchPoint(
                lat=cell.lat,
                lng=cell.lng,
                radius_km=cell.radius_km,
                label=f"{cell.name}@center",
            )
        ]

    n = grid_size
    lat_span = (cell.radius_km * 2) / 111.0
    lng_span = (cell.radius_km * 2) / (111.0 * max(0.2, abs(math.cos(math.radians(cell.lat)))))
    sub_radius = (cell.radius_km / n) * 1.35
    base_lat = cell.lat - (cell.radius_km / 111.0)
    base_lng = cell.lng - (cell.radius_km / 111.0) / max(0.2, abs(math.cos(math.radians(cell.lat))))

    points: list[SearchPoint] = []
    for row in range(n):
        for col in range(n):
            lat = base_lat + ((row + 0.5) * lat_span / n)
            lng = base_lng + ((col + 0.5) * lng_span / n)
            points.append(
                SearchPoint(
                    lat=round(lat, 6),
                    lng=round(lng, 6),
                    radius_km=sub_radius,
                    label=f"{cell.name}@grid-{row}-{col}",
                )
            )
    return points


def search_points_for_cell(cell: SearchCell, grid_size: int = 3) -> list[SearchPoint]:
    return grid_points_for_cell(cell, grid_size=grid_size)

# (name, country, country_code, lat, lng, region, radius_km optional)
_CELL_ROWS: list[tuple] = [
    # —— Europe ——
    ("London", "United Kingdom", "GB", 51.5074, -0.1278, "Europe"),
    ("Manchester", "United Kingdom", "GB", 53.4808, -2.2426, "Europe"),
    ("Edinburgh", "United Kingdom", "GB", 55.9533, -3.1883, "Europe"),
    ("Dublin", "Ireland", "IE", 53.3498, -6.2603, "Europe"),
    ("Paris", "France", "FR", 48.8566, 2.3522, "Europe"),
    ("Lyon", "France", "FR", 45.7640, 4.8357, "Europe"),
    ("Marseille", "France", "FR", 43.2965, 5.3698, "Europe"),
    ("Berlin", "Germany", "DE", 52.5200, 13.4050, "Europe"),
    ("Munich", "Germany", "DE", 48.1351, 11.5820, "Europe"),
    ("Hamburg", "Germany", "DE", 53.5511, 9.9937, "Europe"),
    ("Frankfurt", "Germany", "DE", 50.1109, 8.6821, "Europe"),
    ("Cologne", "Germany", "DE", 50.9375, 6.9603, "Europe"),
    ("Amsterdam", "Netherlands", "NL", 52.3676, 4.9041, "Europe"),
    ("Rotterdam", "Netherlands", "NL", 51.9244, 4.4777, "Europe"),
    ("Brussels", "Belgium", "BE", 50.8503, 4.3517, "Europe"),
    ("Zurich", "Switzerland", "CH", 47.3769, 8.5417, "Europe"),
    ("Geneva", "Switzerland", "CH", 46.2044, 6.1432, "Europe"),
    ("Vienna", "Austria", "AT", 48.2082, 16.3738, "Europe"),
    ("Rome", "Italy", "IT", 41.9028, 12.4964, "Europe"),
    ("Milan", "Italy", "IT", 45.4642, 9.1900, "Europe"),
    ("Florence", "Italy", "IT", 43.7696, 11.2558, "Europe"),
    ("Madrid", "Spain", "ES", 40.4168, -3.7038, "Europe"),
    ("Barcelona", "Spain", "ES", 41.3874, 2.1686, "Europe"),
    ("Lisbon", "Portugal", "PT", 38.7223, -9.1393, "Europe"),
    ("Stockholm", "Sweden", "SE", 59.3293, 18.0686, "Europe"),
    ("Oslo", "Norway", "NO", 59.9139, 10.7522, "Europe"),
    ("Copenhagen", "Denmark", "DK", 55.6761, 12.5683, "Europe"),
    ("Helsinki", "Finland", "FI", 60.1699, 24.9384, "Europe"),
    ("Warsaw", "Poland", "PL", 52.2297, 21.0122, "Europe"),
    ("Krakow", "Poland", "PL", 50.0647, 19.9450, "Europe"),
    ("Prague", "Czech Republic", "CZ", 50.0755, 14.4378, "Europe"),
    ("Budapest", "Hungary", "HU", 47.4979, 19.0402, "Europe"),
    ("Athens", "Greece", "GR", 37.9838, 23.7275, "Europe"),
    ("Bucharest", "Romania", "RO", 44.4268, 26.1025, "Europe"),
    ("Sofia", "Bulgaria", "BG", 42.6977, 23.3219, "Europe"),
    ("Belgrade", "Serbia", "RS", 44.7866, 20.4489, "Europe"),
    ("Zagreb", "Croatia", "HR", 45.8150, 15.9819, "Europe"),
    ("Ljubljana", "Slovenia", "SI", 46.0569, 14.5058, "Europe"),
    ("Tallinn", "Estonia", "EE", 59.4370, 24.7536, "Europe"),
    ("Riga", "Latvia", "LV", 56.9496, 24.1052, "Europe"),
    ("Vilnius", "Lithuania", "LT", 54.6872, 25.2797, "Europe"),
    ("Kyiv", "Ukraine", "UA", 50.4501, 30.5234, "Europe"),
    ("Moscow", "Russia", "RU", 55.7558, 37.6173, "Europe", 40.0),
    ("Saint Petersburg", "Russia", "RU", 59.9311, 30.3609, "Europe"),
    ("Istanbul", "Turkey", "TR", 41.0082, 28.9784, "Middle East", 35.0),
    ("Ankara", "Turkey", "TR", 39.9334, 32.8597, "Middle East"),
    # —— Middle East ——
    ("Tel Aviv", "Israel", "IL", 32.0853, 34.7818, "Middle East"),
    ("Jerusalem", "Israel", "IL", 31.7683, 35.2137, "Middle East"),
    ("Haifa", "Israel", "IL", 32.7940, 34.9896, "Middle East"),
    ("Dubai", "United Arab Emirates", "AE", 25.2048, 55.2708, "Middle East"),
    ("Abu Dhabi", "United Arab Emirates", "AE", 24.4539, 54.3773, "Middle East"),
    ("Doha", "Qatar", "QA", 25.2854, 51.5310, "Middle East"),
    ("Riyadh", "Saudi Arabia", "SA", 24.7136, 46.6753, "Middle East", 40.0),
    ("Jeddah", "Saudi Arabia", "SA", 21.4858, 39.1925, "Middle East"),
    ("Kuwait City", "Kuwait", "KW", 29.3759, 47.9774, "Middle East"),
    ("Manama", "Bahrain", "BH", 26.2235, 50.5876, "Middle East"),
    ("Muscat", "Oman", "OM", 23.5880, 58.3829, "Middle East"),
    ("Amman", "Jordan", "JO", 31.9454, 35.9284, "Middle East"),
    ("Beirut", "Lebanon", "LB", 33.8938, 35.5018, "Middle East"),
    ("Tehran", "Iran", "IR", 35.6892, 51.3890, "Middle East", 40.0),
    ("Baghdad", "Iraq", "IQ", 33.3152, 44.3661, "Middle East", 35.0),
    ("Erbil", "Iraq", "IQ", 36.1911, 44.0091, "Middle East"),
    # —— Africa ——
    ("Cairo", "Egypt", "EG", 30.0444, 31.2357, "Africa", 40.0),
    ("Alexandria", "Egypt", "EG", 31.2001, 29.9187, "Africa"),
    ("Casablanca", "Morocco", "MA", 33.5731, -7.5898, "Africa"),
    ("Marrakech", "Morocco", "MA", 31.6295, -7.9811, "Africa"),
    ("Rabat", "Morocco", "MA", 34.0209, -6.8416, "Africa"),
    ("Tunis", "Tunisia", "TN", 36.8065, 10.1815, "Africa"),
    ("Algiers", "Algeria", "DZ", 36.7538, 3.0588, "Africa"),
    ("Lagos", "Nigeria", "NG", 6.5244, 3.3792, "Africa", 35.0),
    ("Abuja", "Nigeria", "NG", 9.0765, 7.3986, "Africa"),
    ("Accra", "Ghana", "GH", 5.6037, -0.1870, "Africa"),
    ("Nairobi", "Kenya", "KE", -1.2921, 36.8219, "Africa"),
    ("Addis Ababa", "Ethiopia", "ET", 9.0320, 38.7469, "Africa"),
    ("Dar es Salaam", "Tanzania", "TZ", -6.7924, 39.2083, "Africa"),
    ("Kampala", "Uganda", "UG", 0.3476, 32.5825, "Africa"),
    ("Kigali", "Rwanda", "RW", -1.9403, 29.8739, "Africa"),
    ("Johannesburg", "South Africa", "ZA", -26.2041, 28.0473, "Africa"),
    ("Cape Town", "South Africa", "ZA", -33.9249, 18.4241, "Africa"),
    ("Durban", "South Africa", "ZA", -29.8587, 31.0218, "Africa"),
    ("Pretoria", "South Africa", "ZA", -25.7479, 28.2293, "Africa"),
    ("Harare", "Zimbabwe", "ZW", -17.8252, 31.0335, "Africa"),
    ("Lusaka", "Zambia", "ZM", -15.3875, 28.3228, "Africa"),
    ("Maputo", "Mozambique", "MZ", -25.9692, 32.5732, "Africa"),
    ("Bamako", "Mali", "ML", 12.6392, -8.0029, "Africa", 35.0),
    ("Dakar", "Senegal", "SN", 14.7167, -17.4677, "Africa"),
    ("Abidjan", "Ivory Coast", "CI", 5.3600, -4.0083, "Africa"),
    ("Kinshasa", "DR Congo", "CD", -4.4419, 15.2663, "Africa", 35.0),
    ("Luanda", "Angola", "AO", -8.8390, 13.2894, "Africa"),
    ("Antananarivo", "Madagascar", "MG", -18.8792, 47.5079, "Africa"),
    ("Port Louis", "Mauritius", "MU", -20.1609, 57.5012, "Africa"),
    # —— Asia ——
    ("Tokyo", "Japan", "JP", 35.6762, 139.6503, "Asia"),
    ("Osaka", "Japan", "JP", 34.6937, 135.5023, "Asia"),
    ("Kyoto", "Japan", "JP", 35.0116, 135.7681, "Asia"),
    ("Seoul", "South Korea", "KR", 37.5665, 126.9780, "Asia"),
    ("Busan", "South Korea", "KR", 35.1796, 129.0756, "Asia"),
    ("Beijing", "China", "CN", 39.9042, 116.4074, "Asia", 40.0),
    ("Shanghai", "China", "CN", 31.2304, 121.4737, "Asia", 40.0),
    ("Guangzhou", "China", "CN", 23.1291, 113.2644, "Asia"),
    ("Chengdu", "China", "CN", 30.5728, 104.0668, "Asia"),
    ("Hong Kong", "Hong Kong", "HK", 22.3193, 114.1694, "Asia"),
    ("Taipei", "Taiwan", "TW", 25.0330, 121.5654, "Asia"),
    ("Bangkok", "Thailand", "TH", 13.7563, 100.5018, "Asia"),
    ("Chiang Mai", "Thailand", "TH", 18.7883, 98.9853, "Asia"),
    ("Hanoi", "Vietnam", "VN", 21.0278, 105.8342, "Asia"),
    ("Ho Chi Minh City", "Vietnam", "VN", 10.8231, 106.6297, "Asia"),
    ("Phnom Penh", "Cambodia", "KH", 11.5564, 104.9282, "Asia"),
    ("Siem Reap", "Cambodia", "KH", 13.3633, 103.8564, "Asia"),
    ("Vientiane", "Laos", "LA", 17.9757, 102.6331, "Asia"),
    ("Yangon", "Myanmar", "MM", 16.8661, 96.1951, "Asia"),
    ("Mandalay", "Myanmar", "MM", 21.9588, 96.0891, "Asia"),
    ("Kathmandu", "Nepal", "NP", 27.7172, 85.3240, "Asia"),
    ("Pokhara", "Nepal", "NP", 28.2096, 83.9856, "Asia"),
    ("Colombo", "Sri Lanka", "LK", 6.9271, 79.8612, "Asia"),
    ("Kandy", "Sri Lanka", "LK", 7.2906, 80.6337, "Asia"),
    ("Dhaka", "Bangladesh", "BD", 23.8103, 90.4125, "Asia", 35.0),
    ("Chittagong", "Bangladesh", "BD", 22.3569, 91.7832, "Asia"),
    ("Delhi", "India", "IN", 28.6139, 77.2090, "Asia", 40.0),
    ("Mumbai", "India", "IN", 19.0760, 72.8777, "Asia", 40.0),
    ("Bangalore", "India", "IN", 12.9716, 77.5946, "Asia"),
    ("Chennai", "India", "IN", 13.0827, 80.2707, "Asia"),
    ("Kolkata", "India", "IN", 22.5726, 88.3639, "Asia"),
    ("Hyderabad", "India", "IN", 17.3850, 78.4867, "Asia"),
    ("Ahmedabad", "India", "IN", 23.0225, 72.5714, "Asia"),
    ("Pune", "India", "IN", 18.5204, 73.8567, "Asia"),
    ("Varanasi", "India", "IN", 25.3176, 82.9739, "Asia"),
    ("Rishikesh", "India", "IN", 30.0869, 78.2676, "Asia"),
    ("Haridwar", "India", "IN", 29.9457, 78.1642, "Asia"),
    ("Dharamshala", "India", "IN", 32.2190, 76.3234, "Asia"),
    ("Leh", "India", "IN", 34.1526, 77.5770, "Asia", 35.0),
    ("Jaipur", "India", "IN", 26.9124, 75.7873, "Asia"),
    ("Lucknow", "India", "IN", 26.8467, 80.9462, "Asia"),
    ("Islamabad", "Pakistan", "PK", 33.6844, 73.0479, "Asia"),
    ("Karachi", "Pakistan", "PK", 24.8607, 67.0011, "Asia", 35.0),
    ("Lahore", "Pakistan", "PK", 31.5204, 74.3587, "Asia"),
    ("Kabul", "Afghanistan", "AF", 34.5553, 69.2075, "Asia", 35.0),
    ("Tashkent", "Uzbekistan", "UZ", 41.2995, 69.2401, "Asia"),
    ("Almaty", "Kazakhstan", "KZ", 43.2220, 76.8512, "Asia"),
    ("Bishkek", "Kyrgyzstan", "KG", 42.8746, 74.5698, "Asia"),
    ("Ulaanbaatar", "Mongolia", "MN", 47.8864, 106.9057, "Asia", 40.0),
    ("Jakarta", "Indonesia", "ID", -6.2088, 106.8456, "Asia", 40.0),
    ("Bali Ubud", "Indonesia", "ID", -8.5069, 115.2625, "Asia"),
    ("Surabaya", "Indonesia", "ID", -7.2575, 112.7521, "Asia"),
    ("Kuala Lumpur", "Malaysia", "MY", 3.1390, 101.6869, "Asia"),
    ("Penang", "Malaysia", "MY", 5.4141, 100.3288, "Asia"),
    ("Singapore", "Singapore", "SG", 1.3521, 103.8198, "Asia"),
    ("Manila", "Philippines", "PH", 14.5995, 120.9842, "Asia"),
    ("Cebu", "Philippines", "PH", 10.3157, 123.8854, "Asia"),
    ("Davao", "Philippines", "PH", 7.1907, 125.4553, "Asia"),
    ("Thimphu", "Bhutan", "BT", 27.4728, 89.6390, "Asia", 35.0),
    ("Male", "Maldives", "MV", 4.1755, 73.5093, "Asia"),
    ("Baku", "Azerbaijan", "AZ", 40.4093, 49.8671, "Middle East"),
    ("Tbilisi", "Georgia", "GE", 41.7151, 44.8271, "Middle East"),
    ("Yerevan", "Armenia", "AM", 40.1792, 44.4991, "Middle East"),
]


def _row_to_cell(row: tuple) -> SearchCell:
    name, country, code, lat, lng, region = row[:6]
    radius = row[6] if len(row) > 6 else 30.0
    return SearchCell(
        name=name,
        region=region,
        country=country,
        country_code=code,
        lat=lat,
        lng=lng,
        radius_km=radius,
    )


SEARCH_CELLS: tuple[SearchCell, ...] = tuple(_row_to_cell(row) for row in _CELL_ROWS)

REGION_ALIASES = {
    "europe": "Europe",
    "asia": "Asia",
    "africa": "Africa",
    "middle-east": "Middle East",
    "middle_east": "Middle East",
    "me": "Middle East",
}


def cells_for_regions(regions: list[str] | None) -> list[SearchCell]:
    if not regions or "all" in {r.lower() for r in regions}:
        return list(SEARCH_CELLS)
    wanted = {REGION_ALIASES.get(r.lower(), r) for r in regions}
    return [cell for cell in SEARCH_CELLS if cell.region in wanted]
