def detect_volume_anomaly_with_severity(daily_trend: list) -> tuple[str, str]:
    """Inspects daily ingestion timelines to determine if feedback counts indicate a critical volume spike."""
    if len(daily_trend) < 14:
        return "none", "Not enough data for anomaly detection"

    recent_period = daily_trend[-7:]
    previous_period = daily_trend[-14:-7]

    recent_average = sum(item["count"] for item in recent_period) / 7
    previous_average = sum(item["count"] for item in previous_period) / 7

    if previous_average == 0:
        if recent_average >= 5:
            return "high", "Feedback volume surged from low baseline"
        if recent_average >= 3:
            return "medium", "Recent feedback volume elevated from low baseline"
        return "none", "No anomaly detected"

    ratio = recent_average / previous_average if previous_average > 0 else 1

    if ratio >= 2.0 and recent_average >= 5:
        return "high", "Critical feedback volume spike detected"
    if ratio >= 1.5 and recent_average >= 3:
        return "medium", "Feedback volume increased significantly"
    if ratio <= 0.5 and previous_average >= 3:
        return "low", "Feedback volume decreased"

    return "none", "No anomaly detected"
