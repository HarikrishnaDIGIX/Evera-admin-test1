import re

with open('../evera-admin-backend/app/api/finance.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add booking_repo import
if 'from app.db.crud_operations import refund_repo' in content:
    content = content.replace('from app.db.crud_operations import refund_repo', 'from app.db.crud_operations import refund_repo, booking_repo')

new_logic = '''    # Get all refunds from database to update status dynamically
    refunds = {r.transaction_id: r for r in refund_repo.get_multi(db, limit=1000)}
    
    bookings = booking_repo.get_multi(db, limit=1000)
    
    transactions = []
    for b in bookings:
        amount = b.amount or 0
        transactions.append({
            "id": f"PAY-{b.id}",
            "bookingId": f"B{b.id}",
            "vendorId": str(b.vendor_id),
            "customerId": str(b.user_id),
            "amount": amount,
            "status": "COMPLETED" if b.status == "COMPLETED" else "PENDING",
            "method": "CARD",
            "transactionId": f"TXN_{b.id}000",
            "createdAt": b.date or "",
            "tax": amount * 0.18,
            "commission": amount * 0.10,
            "platform_fee": 50,
            "net_amount": amount * 0.72 - 50,
            "serviceName": b.service_type,
            "category": "Service",
            "customer": {"name": "Customer", "email": "customer@example.com", "phone": ""},
            "vendor": {"name": "Vendor", "email": "vendor@example.com", "phone": ""},
            "bankDetails": {},
            "requestedAt": b.date,
            "acceptedAt": b.date,
            "settlement_time": "",
            "holding_status": "PENDING"
        })

    for p in transactions:
        if p["id"] in refunds:
            ref = refunds[p["id"]]
            p["refund_id"] = ref.id
            if ref.status.value == "PROCESSED":
                p["status"] = "REFUNDED"
                p["holding_status"] = "REFUNDED"
            elif ref.status.value == "REJECTED":
                pass
            else:
                p["status"] = "PROCESSING"
                p["holding_status"] = "PENDING_ACCEPTANCE"

    return transactions'''

content = re.sub(
    r'    # Get all refunds from database to update status dynamically.*?    return base_payments',
    new_logic,
    content,
    flags=re.DOTALL
)

with open('../evera-admin-backend/app/api/finance.py', 'w', encoding='utf-8') as f:
    f.write(content)
