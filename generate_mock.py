import json
import random
from datetime import datetime, timedelta

locations = ["Hyderabad", "Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Kolkata"]
categories = ["Plumbing", "Electrical", "Carpentry", "Cleaning", "Pest Control", "Painting", "Appliances"]
service_names = {
    "Plumbing": ["Pipe Repair", "Tap Leakage", "Drain Cleaning", "Water Tank Cleaning"],
    "Electrical": ["Wiring", "Switch Repair", "Fan Installation", "MCB Repair"],
    "Carpentry": ["Furniture Repair", "Door Lock Fix", "New Furniture Making"],
    "Cleaning": ["Deep Home Cleaning", "Sofa Cleaning", "Bathroom Cleaning"],
    "Pest Control": ["Termite Control", "Cockroach Control", "General Pest Control"],
    "Painting": ["Interior Painting", "Exterior Painting", "Wall Care"],
    "Appliances": ["AC Repair", "Washing Machine Repair", "Refrigerator Repair"]
}

first_names = ["Amit", "Ramesh", "Suresh", "Priya", "Sneha", "Rahul", "Vikram", "Anjali", "Rohit", "Neha", "Karan", "Pooja", "Arun", "Divya"]
last_names = ["Sharma", "Kumar", "Singh", "Reddy", "Verma", "Gupta", "Patel", "Nair", "Iyer", "Jain", "Das"]

def random_date(start_date, end_date):
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_hours = random.randrange(24)
    random_minutes = random.randrange(60)
    return start_date + timedelta(days=random_number_of_days, hours=random_hours, minutes=random_minutes)

start_date = datetime(2025, 1, 1)
end_date = datetime(2026, 6, 1)

def generate_users(count):
    users = []
    for i in range(count):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        users.append({
            "user_id": f"USR-{101+i}",
            "name": f"{fname} {lname}",
            "email": f"{fname.lower()}.{lname.lower()}{random.randint(1,99)}@example.com",
            "phone": f"+91-{random.randint(6000000000, 9999999999)}",
            "registered_at": random_date(start_date, end_date).strftime("%Y-%m-%d %H:%M:%S"),
            "status": random.choice(["Active", "Active", "Active", "Inactive"])
        })
    return users

def generate_workers(count):
    workers = []
    for i in range(count):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        workers.append({
            "worker_id": f"WRK-{201+i}",
            "name": f"{fname} {lname}",
            "specialization": random.sample(categories, random.randint(1, 3)),
            "phone": f"+91-{random.randint(6000000000, 9999999999)}",
            "status": random.choice(["Active", "Active", "On Leave", "Inactive"]),
            "rating": round(random.uniform(3.5, 5.0), 1),
            "jobs_completed": random.randint(0, 500)
        })
    return workers

def generate_vendors(count):
    vendors = []
    for i in range(count):
        fname = random.choice(first_names)
        vendors.append({
            "vendor_id": f"VND-{101+i}",
            "name": f"{random.choice(locations)} {random.choice(categories)} Supplies",
            "contact_person": f"{fname} {random.choice(last_names)}",
            "phone": f"+91-{random.randint(6000000000, 9999999999)}",
            "category": "Material Supplier",
            "status": "Active"
        })
    return vendors

def generate_admins(count):
    admins = []
    roles = ["Operations Manager", "Dispatcher", "Support Executive", "Finance Manager"]
    departments = ["Support", "Logistics", "Finance", "Operations"]
    for i in range(count):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        admins.append({
            "admin_id": f"OPS-{1+i:03d}",
            "name": f"{fname} {lname}",
            "role": random.choice(roles),
            "department": random.choice(departments),
            "email": f"{fname.lower()}.{lname.lower()}@evera.com"
        })
    return admins

def generate_bookings(count, users, workers):
    bookings = []
    for i in range(count):
        cat = random.choice(categories)
        b_date = random_date(start_date, end_date)
        bookings.append({
            "booking_id": f"BKG-{5001+i}",
            "customer_id": random.choice(users)["user_id"],
            "service_category": cat,
            "service_name": random.choice(service_names[cat]),
            "booking_date": b_date.strftime("%Y-%m-%d %H:%M:%S"),
            "scheduled_date": (b_date + timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d %H:%M:%S"),
            "status": random.choice(["Pending", "Ongoing", "Completed", "Completed", "Cancelled"]),
            "location": random.choice(locations),
            "amount": random.randint(500, 5000),
            "payment_status": random.choice(["Pending", "Paid", "Paid", "Failed"]),
            "assigned_worker": random.choice(workers)["worker_id"]
        })
    return bookings

def generate_tickets(count, users, workers, admins, vendors):
    tickets = []
    for i in range(count):
        c_date = random_date(start_date, end_date)
        cat = random.choice(categories)
        tickets.append({
            "ticket_id": f"TKT-{1001+i}",
            "title": f"{cat} Issue reported",
            "description": f"Customer reported an issue regarding {cat.lower()}.",
            "category": cat,
            "priority": random.choice(["High", "Medium", "Low"]),
            "status": random.choice(["Open", "In Progress", "Resolved", "Closed"]),
            "created_by": random.choice(users)["user_id"],
            "assigned_worker": random.choice(workers)["worker_id"] if random.random() > 0.2 else None,
            "assigned_admin": random.choice(admins)["admin_id"],
            "vendor": random.choice(vendors)["vendor_id"] if random.random() > 0.8 else None,
            "created_at": c_date.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": (c_date + timedelta(hours=random.randint(1, 48))).strftime("%Y-%m-%d %H:%M:%S"),
            "expected_completion": (c_date + timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d"),
            "location": random.choice(locations),
            "amount": random.randint(500, 10000)
        })
    return tickets

def generate_finances(count, bookings, vendors, users, admins):
    finances = []
    for i in range(count):
        is_income = random.random() > 0.3
        t_date = random_date(start_date, end_date)
        if is_income:
            bkg = random.choice(bookings)
            finances.append({
                "transaction_id": f"TXN-{9001+i}",
                "reference_id": bkg["booking_id"],
                "type": "Income",
                "category": "Service Payment",
                "amount": bkg["amount"],
                "currency": "INR",
                "status": "Completed" if random.random() > 0.1 else "Pending",
                "payment_method": random.choice(["Credit Card", "UPI", "Bank Transfer", "Cash"]),
                "transaction_date": t_date.strftime("%Y-%m-%d %H:%M:%S"),
                "user_id": bkg["customer_id"]
            })
        else:
            finances.append({
                "transaction_id": f"TXN-{9001+i}",
                "reference_id": random.choice(vendors)["vendor_id"],
                "type": "Expense",
                "category": "Vendor Payout",
                "amount": random.randint(2000, 20000),
                "currency": "INR",
                "status": "Completed",
                "payment_method": "Bank Transfer",
                "transaction_date": t_date.strftime("%Y-%m-%d %H:%M:%S"),
                "user_id": random.choice(admins)["admin_id"]
            })
    return finances

print("Generating data...")
users = generate_users(100)
workers = generate_workers(100)
vendors = generate_vendors(100)
admins = generate_admins(100)
bookings = generate_bookings(100, users, workers)
tickets = generate_tickets(500, users, workers, admins, vendors)
finances = generate_finances(100, bookings, vendors, users, admins)

data = {
    "tickets": tickets,
    "bookings": bookings,
    "finances": finances,
    "users": users,
    "workers": workers,
    "vendors": vendors,
    "admins": admins
}

with open("large_mock_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("large_mock_data.json successfully generated.")
