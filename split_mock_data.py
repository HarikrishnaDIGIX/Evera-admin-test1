import json

print("Reading large_mock_data.json...")
with open("large_mock_data.json", "r") as f:
    data = json.load(f)

print("Writing mock_tickets.json...")
with open("mock_tickets.json", "w") as f:
    json.dump(data["tickets"], f, indent=2)

print("Writing mock_bookings.json...")
with open("mock_bookings.json", "w") as f:
    json.dump(data["bookings"], f, indent=2)

print("Writing mock_payments.json...")
with open("mock_payments.json", "w") as f:
    json.dump(data["payments"], f, indent=2)

print("Successfully split the data into 3 separate files.")
