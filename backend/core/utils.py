import datetime
from django.db.models import Max

def generate_qms_id(model_class, field_name, prefix):
    """
    Generates a unique ID like DEV-2026-001.
    Format: PREFIX-YYYY-SEQ
    """
    current_year = datetime.date.today().year
    prefix_with_year = f"{prefix}-{current_year}-"
    
    # Find the max ID currently in the DB that starts with this prefix
    # We filter specifically for the current year to reset sequence annually
    existing_ids = model_class.objects.filter(
        **{f"{field_name}__startswith": prefix_with_year}
    ).aggregate(max_id=Max(field_name))['max_id']

    if existing_ids:
        # Extract the sequence number (last 3 digits) and increment
        # Example: DEV-2026-005 -> 5
        try:
            sequence = int(existing_ids.split('-')[-1]) + 1
        except ValueError:
            sequence = 1
    else:
        sequence = 1

    # Return formatted string: DEV-2026-001
    return f"{prefix_with_year}{sequence:03d}"