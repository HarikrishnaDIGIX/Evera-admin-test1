import json
import random
from datetime import datetime, timedelta

locations = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"]
categories = ["VENUE", "CATERING", "PHOTOGRAPHY", "DECORATION", "DJ_MUSIC", "MAKEUP"]
service_types = {
    "VENUE": ["Resort Wedding Venue", "Banquet Hall", "Farmhouse", "Luxury Hotel"],
    "CATERING": ["Premium Buffet Catering", "Live Chaat Counters", "Standard Course Meal"],
    "PHOTOGRAPHY": ["Wedding Photography", "Pre-wedding Shoot", "Cinematography", "Drone Coverage"],
    "DECORATION": ["Floral Decoration", "Theme Lighting", "Mandap Decor"],
    "DJ_MUSIC": ["DJ & Sound System", "Live Band", "Sangeet Setup"],
    "MAKEUP": ["Bridal Makeup", "Party Makeup"]
}

first_names = ["Amit", "Ramesh", "Suresh", "Priya", "Sneha", "Rahul", "Vikram", "Anjali", "Rohit", "Neha", "Karan", "Pooja", "Arun", "Divya", "Alice", "Bob", "Charlie", "Diana"]
last_names = ["Sharma", "Kumar", "Singh", "Reddy", "Verma", "Gupta", "Patel", "Nair", "Iyer", "Jain", "Das", "Johnson", "Smith", "Brown"]

def random_date(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_hours = random.randrange(24)
    random_minutes = random.randrange(60)
    return start_date + timedelta(days=random_number_of_days, hours=random_hours, minutes=random_minutes)

start_date = datetime(2023, 1, 1)
end_date = datetime(2023, 12, 31)

def generate_bookings(count):
    bookings = []
    for i in range(count):
        cat = random.choice(categories)
        service = random.choice(service_types[cat])
        b_date = random_date(start_date, end_date)
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        bookings.append({
            "id": f"b{1000+i}",
            "customerName": f"{fname} {lname}",
            "serviceType": service,
            "date": b_date.strftime("%b %d, %I:%M %p"),
            "status": random.choice(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
            "amount": random.randint(15000, 500000),
            "provider": f"{random.choice(first_names)} {random.choice(last_names)}",
            "location": f"Sector {random.randint(1,50)}, {random.choice(locations)}",
            "bookingDetails": {
                "packageName": f"Premium {service} Package",
                "pricingType": random.choice(["Per Event", "Per Day", "Per Guest"]),
                "addons": [f"Addon {random.randint(1,5)}"]
            }
        })
    return bookings

def generate_tickets(count, bookings):
    tickets = []
    for i in range(count):
        c_date = random_date(start_date, end_date)
        bkg = random.choice(bookings)
        tickets.append({
            "id": f"t{1000+i}",
            "ticketNumber": f"T-2023-{1000+i}",
            "customerId": f"c{random.randint(1,100)}",
            "customerName": bkg["customerName"],
            "customerEmail": f"{bkg['customerName'].split()[0].lower()}@example.com",
            "subject": f"Issue with {bkg['serviceType']}",
            "description": f"Customer reported an issue regarding the {bkg['serviceType']} booking.",
            "category": random.choice(["SERVICE_QUALITY", "PAYMENT", "TECHNICAL", "VENDOR"]),
            "priority": random.choice(["LOW", "MEDIUM", "HIGH", "URGENT"]),
            "status": random.choice(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
            "createdAt": c_date.strftime("%Y-%m-%d %H:%M"),
            "updatedAt": (c_date + timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M"),
            "tags": ["issue", "support"],
            "assignedDepartment": random.choice(["CUSTOMER_SUPPORT", "FINANCE_SUPPORT", "TECHNICAL_SUPPORT", "OPERATIONS"]),
            "attachments": [],
            "comments": [],
            "assignedWorkerId": f"sw{random.randint(1,5)}",
            "assignedTo": f"admin-{random.randint(1,5)}",
            "assignedToName": "Support Agent",
            "escalationLevel": "NONE",
            "providerName": bkg["provider"],
            "timelineActions": []
        })
    return tickets

def generate_payments(count, bookings):
    payments = []
    for i in range(count):
        bkg = bookings[i % len(bookings)]
        t_date = random_date(start_date, end_date)
        payments.append({
            "id": f"p{1000+i}",
            "bookingId": bkg["id"],
            "vendorId": f"v{random.randint(1,50)}",
            "customerId": f"c{random.randint(1,50)}",
            "amount": bkg["amount"],
            "status": random.choice(["COMPLETED", "PENDING", "PROCESSING", "REFUNDED"]),
            "method": random.choice(["UPI", "CARD", "NET_BANKING", "WALLET"]),
            "transactionId": f"TXN{100000+i}",
            "createdAt": t_date.strftime("%Y-%m-%d %H:%M"),
            "tax": int(bkg["amount"] * 0.18),
            "commission": int(bkg["amount"] * 0.1),
            "platform_fee": int(bkg["amount"] * 0.05),
            "net_amount": bkg["amount"] - int(bkg["amount"] * 0.1) - int(bkg["amount"] * 0.05),
            "customer": {
                "name": bkg["customerName"],
                "email": f"{bkg['customerName'].split()[0].lower()}@example.com",
                "phone": f"+91 {random.randint(8000000000, 9999999999)}"
            },
            "vendor": {
                "name": bkg["provider"],
                "email": f"vendor{i}@events.com",
                "phone": f"+91 {random.randint(8000000000, 9999999999)}",
                "rating": round(random.uniform(3.5, 5.0), 1),
                "joinedDate": "Jan 2023",
                "totalJobs": random.randint(10, 200)
            },
            "bankDetails": {
                "account_no": f"{random.randint(100000000000, 999999999999)}",
                "bank_name": "HDFC Bank",
                "ifsc_code": "HDFC0001234"
            },
            "requestedAt": t_date.strftime("%b %d, %Y %I:%M %p"),
            "holding_status": random.choice(["SETTLED", "ESCROW", "REFUNDED"])
        })
    return payments

print("Generating Event Planning app data...")
bookings = generate_bookings(100)
tickets = generate_tickets(500, bookings)
payments = generate_payments(100, bookings)

data = {
    "tickets": tickets,
    "bookings": bookings,
    "payments": payments
}

with open("large_mock_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("large_mock_data.json successfully generated with application-specific data.")
