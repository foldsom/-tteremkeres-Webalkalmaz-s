#!/usr/bin/env python3
"""Google Places -> SQL seed exporter for Restaurants.

Use with CLI args or a JSON config file.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"


def _request_json(url: str, payload: dict, api_key: str, field_mask: str) -> dict:
    req = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": field_mask,
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Google API error HTTP {exc.code}: {body}") from exc


def _sql_escape(value: str) -> str:
    return value.replace("'", "''")


def _sanitize_filename(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9._-]+", "-", text)
    return text.strip("-") or "places"


def _normalize_description(editorial_summary: dict | None, rating: float | None, user_rating_count: int | None) -> str:
    if editorial_summary and editorial_summary.get("text"):
        return editorial_summary["text"]

    parts = ["Imported from Google Places"]
    if rating is not None:
        parts.append(f"rating: {rating}")
    if user_rating_count is not None:
        parts.append(f"reviews: {user_rating_count}")
    return " | ".join(parts)


def fetch_places(api_key: str, query: str, max_results: int, language_code: str) -> list[dict]:
    payload = {
        "textQuery": query,
        "maxResultCount": max_results,
        "languageCode": language_code,
    }

    field_mask = ",".join(
        [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.rating",
            "places.userRatingCount",
            "places.editorialSummary",
            "places.types",
        ]
    )

    response = _request_json(SEARCH_URL, payload, api_key, field_mask)
    return response.get("places", [])


def generate_sql(places: list[dict]) -> str:
    now = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    lines = [
        "-- Auto-generated from Google Places API",
        "BEGIN TRANSACTION;",
    ]

    for place in places:
        name = place.get("displayName", {}).get("text", "Unknown")
        address = place.get("formattedAddress", "Unknown address")
        location = place.get("location", {})
        latitude = location.get("latitude", 0)
        longitude = location.get("longitude", 0)
        description = _normalize_description(
            place.get("editorialSummary"),
            place.get("rating"),
            place.get("userRatingCount"),
        )

        lines.append(
            "INSERT INTO Restaurants (Name, Description, Address, Latitude, Longitude, CreatedAt) "
            f"VALUES ('{_sql_escape(name)}', '{_sql_escape(description)}', "
            f"'{_sql_escape(address)}', {latitude}, {longitude}, '{now}');"
        )

    lines.append("COMMIT;")
    return "\n".join(lines) + "\n"


def _load_config(path: pathlib.Path | None) -> dict:
    if not path:
        return {}

    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    return json.loads(path.read_text(encoding="utf-8"))


def _arg_or_config(arg_value, config: dict, key: str, required: bool = False, default=None):
    value = arg_value if arg_value is not None else config.get(key, default)
    if required and (value is None or value == ""):
        raise ValueError(f"Missing required value for: {key}")
    return value


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=pathlib.Path, default=None, help="Path to JSON config file")
    parser.add_argument("--api-key", default=None, help="Google Maps API key")
    parser.add_argument("--query", default=None, help='Search text, e.g. "étterem Budapest"')
    parser.add_argument("--max-results", type=int, default=None, help="Maximum places to fetch")
    parser.add_argument("--language-code", default=None, help="Language code (default: hu)")
    parser.add_argument("--output-json", type=pathlib.Path, default=None, help="Raw Places JSON output")
    parser.add_argument("--output-sql", type=pathlib.Path, default=None, help="Generated SQL output")

    args = parser.parse_args()
    config = _load_config(args.config)

    api_key = _arg_or_config(args.api_key, config, "apiKey", required=True)
    query = _arg_or_config(args.query, config, "query", required=True)
    max_results = _arg_or_config(args.max_results, config, "maxResults", default=20)
    language_code = _arg_or_config(args.language_code, config, "languageCode", default="hu")

    output_json = _arg_or_config(args.output_json, config, "outputJson", default=None)
    output_sql = _arg_or_config(args.output_sql, config, "outputSql", default=None)

    safe_query = _sanitize_filename(query)
    output_json_path = pathlib.Path(output_json) if output_json else pathlib.Path(f"backend/{safe_query}_places_raw.json")
    output_sql_path = pathlib.Path(output_sql) if output_sql else pathlib.Path(f"backend/{safe_query}_places_seed.sql")

    places = fetch_places(api_key=api_key, query=query, max_results=int(max_results), language_code=language_code)
    sql_content = generate_sql(places)

    output_json_path.parent.mkdir(parents=True, exist_ok=True)
    output_sql_path.parent.mkdir(parents=True, exist_ok=True)

    output_json_path.write_text(json.dumps(places, ensure_ascii=False, indent=2), encoding="utf-8")
    output_sql_path.write_text(sql_content, encoding="utf-8")

    print(f"Fetched places: {len(places)}")
    print(f"Raw JSON: {output_json_path}")
    print(f"SQL seed: {output_sql_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
