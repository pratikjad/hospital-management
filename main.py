from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
import mysql.connector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

SECRET_KEY = "hospital_secret_key_2024"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

USERS = {
    "admin": {"password": pwd_context.hash("admin123"), "role": "admin"},
    "user": {"password": pwd_context.hash("user123"), "role": "user"}
}

def get_db():
    db = mysql.connector.connect(
        host="sql12.freesqldatabase.com",
        user="sql12829740",
        password="m2y5mYjw4R",
        database="sql12829740"
    )
    return db

def create_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token!")

@app.get("/")
def home():
    return {"message": "Hospital API चालू आहे!"}

@app.post("/login")
def login(data: dict):
    username = data.get("username")
    password = data.get("password")
    if username not in USERS:
        raise HTTPException(status_code=401, detail="Wrong username or password!")
    user = USERS[username]
    if not pwd_context.verify(password, user["password"]):
        raise HTTPException(status_code=401, detail="Wrong username or password!")
    token = create_token({"username": username, "role": user["role"]})
    return {"token": token, "role": user["role"]}

@app.get("/doctors")
def get_doctors():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctors")
    doctors = cursor.fetchall()
    db.close()
    return {"doctors": doctors}

@app.post("/doctors/add")
def add_doctor(data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO doctors (name, specialty, experience, city, consultation_fee) VALUES (%s, %s, %s, %s, %s)",
        (data["name"], data["specialty"], data["experience"], data["city"], data.get("consultation_fee", 500))
    )
    db.commit()
    db.close()
    return {"message": "Doctor added!"}

@app.put("/doctors/update/{doctor_id}")
def update_doctor(doctor_id: int, data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE doctors SET name=%s, specialty=%s, experience=%s, city=%s, consultation_fee=%s WHERE id=%s",
        (data["name"], data["specialty"], data["experience"], data["city"], data.get("consultation_fee", 500), doctor_id)
    )
    db.commit()
    db.close()
    return {"message": "Doctor updated!"}

@app.delete("/doctors/delete/{doctor_id}")
def delete_doctor(doctor_id: int, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM doctors WHERE id=%s", (doctor_id,))
    db.commit()
    db.close()
    return {"message": "Doctor deleted!"}

@app.get("/patients")
def get_patients(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM patients")
    patients = cursor.fetchall()
    db.close()
    return {"patients": patients}

@app.post("/patients/add")
def add_patient(data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO patients (name, age, disease, city, mobile, address, blood_group) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data["name"], data["age"], data["disease"], data["city"], data.get("mobile", ""), data.get("address", ""), data.get("blood_group", ""))
    )
    db.commit()
    db.close()
    return {"message": "Patient added!"}

@app.put("/patients/update/{patient_id}")
def update_patient(patient_id: int, data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE patients SET name=%s, age=%s, disease=%s, city=%s, mobile=%s, address=%s, blood_group=%s WHERE id=%s",
        (data["name"], data["age"], data["disease"], data["city"], data.get("mobile", ""), data.get("address", ""), data.get("blood_group", ""), patient_id)
    )
    db.commit()
    db.close()
    return {"message": "Patient updated!"}

@app.delete("/patients/delete/{patient_id}")
def delete_patient(patient_id: int, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM patients WHERE id=%s", (patient_id,))
    db.commit()
    db.close()
    return {"message": "Patient deleted!"}

@app.get("/stats")
def get_stats(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM doctors")
    doctors = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM patients")
    patients = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM appointments")
    appointments = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM bills WHERE payment_status='Pending'")
    pending_bills = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM bills WHERE payment_status='Paid'")
    paid_bills = cursor.fetchone()[0]
    db.close()
    return {"doctors": doctors, "patients": patients, "appointments": appointments, "pending_bills": pending_bills, "paid_bills": paid_bills}

@app.get("/appointments")
def get_appointments(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.id, p.name AS patient_name, d.name AS doctor_name,
               a.date, a.status, a.treatment, a.charges
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN doctors d ON a.doctor_id = d.id
        ORDER BY a.date DESC
    """)
    appointments = cursor.fetchall()
    db.close()
    return {"appointments": appointments}

@app.post("/appointments/add")
def add_appointment(data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO appointments (patient_id, doctor_id, date, status, treatment, charges) VALUES (%s, %s, %s, %s, %s, %s)",
        (data["patient_id"], data["doctor_id"], data["date"], data["status"], data["treatment"], data["charges"])
    )
    apt_id = cursor.lastrowid
    cursor.execute(
        "INSERT INTO bills (patient_id, appointment_id, amount, payment_status) VALUES (%s, %s, %s, %s)",
        (data["patient_id"], apt_id, data["charges"], "Pending")
    )
    db.commit()
    db.close()
    return {"message": "Appointment added!"}

@app.put("/appointments/update/{apt_id}")
def update_appointment(apt_id: int, data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE appointments SET status=%s, treatment=%s, charges=%s WHERE id=%s",
        (data["status"], data["treatment"], data["charges"], apt_id)
    )
    db.commit()
    db.close()
    return {"message": "Appointment updated!"}

@app.get("/bills/pending")
def get_pending_bills(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT b.id, p.name AS patient_name,
               COALESCE(d.name, 'N/A') AS doctor_name,
               a.date, a.treatment,
               a.charges AS treatment_charges,
               b.amount, b.payment_status
        FROM bills b
        INNER JOIN patients p ON b.patient_id = p.id
        INNER JOIN appointments a ON b.appointment_id = a.id
        LEFT JOIN doctors d ON a.doctor_id = d.id
        WHERE b.payment_status = 'Pending'
    """)
    bills = cursor.fetchall()
    db.close()
    return {"pending_bills": bills}

@app.put("/bills/pay/{bill_id}")
def pay_bill(bill_id: int, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE bills SET payment_status='Paid' WHERE id=%s", (bill_id,))
    db.commit()
    db.close()
    return {"message": "Bill paid!"}

@app.get("/bills/calculate/{appointment_id}")
def calculate_bill(appointment_id: int, token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT a.*, p.name AS patient_name, p.age, p.disease, p.blood_group, p.mobile,
               d.name AS doctor_name, d.specialty, d.consultation_fee
        FROM appointments a
        INNER JOIN patients p ON a.patient_id = p.id
        INNER JOIN doctors d ON a.doctor_id = d.id
        WHERE a.id = %s
    """, (appointment_id,))
    apt = cursor.fetchone()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found!")
    consultation_fee = apt["consultation_fee"] or 500
    treatment_charges = apt["charges"] or 0
    total = consultation_fee + treatment_charges
    db.close()
    return {"appointment": apt, "consultation_fee": consultation_fee, "treatment_charges": treatment_charges, "total": total}

@app.post("/bills/generate")
def generate_bill(data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id FROM bills WHERE appointment_id=%s", (data["appointment_id"],))
    existing = cursor.fetchone()
    if existing:
        cursor.execute(
            "UPDATE bills SET amount=%s, payment_status='Pending' WHERE appointment_id=%s",
            (data["total"], data["appointment_id"])
        )
    else:
        cursor.execute(
            "INSERT INTO bills (patient_id, appointment_id, amount, payment_status) VALUES (%s, %s, %s, 'Pending')",
            (data["patient_id"], data["appointment_id"], data["total"])
        )
    db.commit()
    db.close()
    return {"message": "Bill generated!"}

@app.get("/beds")
def get_beds(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT b.*, p.name AS patient_name
        FROM beds b
        LEFT JOIN patients p ON b.patient_id = p.id
    """)
    beds = cursor.fetchall()
    db.close()
    return {"beds": beds}

@app.get("/beds/stats")
def get_bed_stats(token=Depends(verify_token)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM beds")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM beds WHERE status='Available'")
    available = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM beds WHERE status='Occupied'")
    occupied = cursor.fetchone()[0]
    db.close()
    return {"total": total, "available": available, "occupied": occupied}

@app.put("/beds/assign/{bed_id}")
def assign_bed(bed_id: int, data: dict, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE beds SET status='Occupied', patient_id=%s WHERE id=%s", (data["patient_id"], bed_id))
    db.commit()
    db.close()
    return {"message": "Bed assigned!"}

@app.put("/beds/free/{bed_id}")
def free_bed(bed_id: int, token=Depends(verify_token)):
    if token["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only!")
    db = get_db()
    cursor = db.cursor()
    cursor.execute("UPDATE beds SET status='Available', patient_id=NULL WHERE id=%s", (bed_id,))
    db.commit()
    db.close()
    return {"message": "Bed freed!"}
