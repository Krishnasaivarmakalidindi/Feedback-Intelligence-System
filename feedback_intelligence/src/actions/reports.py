import csv
from io import StringIO
from typing import List
from src.api.schemas import FeedbackCreate


def parse_feedback_csv_data(csv_data_string: str) -> List[FeedbackCreate]:
    """Parses raw text CSV inputs and maps fields to FeedbackCreate entities."""
    buffer = StringIO(csv_data_string)
    reader = csv.DictReader(buffer)
    parsed_records = []

    for row in reader:
        name = row.get("customer_name") or row.get("name")
        email = row.get("email")
        message = row.get("message")

        if not name or not email or not message:
            continue

        parsed_records.append(FeedbackCreate(
            customer_name=name.strip(),
            email=email.strip(),
            message=message.strip()
        ))

    return parsed_records
