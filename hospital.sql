CREATE DATABASE hospital_db;
USE hospital_db;


#DOCTER TABLE /DATA

CREATE TABLE doctors (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50),
  specialty  VARCHAR(50),
  experience INT,
  city       VARCHAR(30)
);

INSERT INTO doctors (name, specialty, experience, city)
VALUES
  ('Dr. Sharma', 'Cardiology', 10, 'Mumbai'),
  ('Dr. Patil', 'Neurology', 8, 'Pune'),
  ('Dr. Khan', 'Orthopedic', 15, 'Nashik'),
  ('Dr. Mehta', 'Cardiology', 5, 'Mumbai'),
  ('Dr. Joshi', 'Pediatrics', 12, 'Pune');




#PATIENT TABLE / DATA

CREATE TABLE patients (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(50),
  age       INT,
  disease   VARCHAR(50),
  city      VARCHAR(30)
);

#INSERT INTO patients (name, age, disease, city)
INSERT INTO patients (name, age, disease, city)
VALUES
  ('Rahul', 35, 'Heart Disease', 'Mumbai'),
  ('Priya', 28, 'Migraine', 'Pune'),
  ('Amit', 45, 'Bone Fracture', 'Nashik'),
  ('Sneha', 12, 'Fever', 'Mumbai'),
  ('Rohan', 52, 'Heart Disease', 'Pune'),
  ('Kavya', 8, 'Fever', 'Nashik'),
  ('Arjun', 38, 'Back Pain', 'Mumbai');


#Appointments Table / DATA

CREATE TABLE appointments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  doctor_id  INT,
  date       DATE,
  status     VARCHAR(20)
);


INSERT INTO appointments (patient_id, doctor_id, date, status)
VALUES
  (1, 1, '2024-01-15', 'Completed'),
  (2, 2, '2024-01-16', 'Completed'),
  (3, 3, '2024-01-17', 'Completed'),
  (4, 5, '2024-01-18', 'Pending'),
  (5, 1, '2024-01-19', 'Completed'),
  (6, 5, '2024-01-20', 'Pending'),
  (7, 3, '2024-01-21', 'Completed');




#Medicines Table /DATA
CREATE TABLE medicines (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(50),
  price    INT,
  stock    INT,
  category VARCHAR(30)
);


INSERT INTO medicines (name, price, stock, category)
VALUES
  ('Aspirin', 50, 200, 'Cardiology'),
  ('Ibuprofen', 30, 150, 'General'),
  ('Paracetamol', 20, 500, 'General'),
  ('Amoxicillin', 80, 100, 'Antibiotic'),
  ('Metformin', 60, 120, 'Diabetes'),
  ('Atorvastatin', 90, 80, 'Cardiology'),
  ('Cetirizine', 25, 300, 'General');


#BILL TABLE / DATA

CREATE TABLE bills (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  patient_id     INT,
  appointment_id INT,
  amount         INT,
  payment_status VARCHAR(20)
);

INSERT INTO bills (patient_id, appointment_id, amount, payment_status)
VALUES
  (1, 1, 1500, 'Paid'),
  (2, 2, 1200, 'Paid'),
  (3, 3, 2000, 'Paid'),
  (4, 4, 800, 'Pending'),
  (5, 5, 1800, 'Paid'),
  (6, 6, 600, 'Pending'),
  (7, 7, 1600, 'Paid');


USE hospital_db;

-- Appointments table update
ALTER TABLE appointments ADD treatment VARCHAR(100);
ALTER TABLE appointments ADD charges INT DEFAULT 0;

-- Bills table update  
ALTER TABLE bills ADD treatment_charges INT DEFAULT 0;
ALTER TABLE bills ADD medicine_charges INT DEFAULT 0;

USE hospital_db;
SELECT * FROM appointments;

USE hospital_db;
SELECT * FROM appointments;


USE hospital_db;

INSERT INTO bills (patient_id, appointment_id, amount, payment_status)
SELECT a.patient_id, a.id, a.charges, 'Pending'
FROM appointments a
LEFT JOIN bills b ON a.id = b.appointment_id
WHERE b.id IS NULL AND a.charges > 0;


USE hospital_db;

ALTER TABLE patients ADD mobile VARCHAR(15);
ALTER TABLE patients ADD address VARCHAR(100);
ALTER TABLE patients ADD blood_group VARCHAR(5);


USE hospital_db;

CREATE TABLE beds (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  bed_number VARCHAR(10),
  ward      VARCHAR(30),
  status    VARCHAR(20) DEFAULT 'Available',
  patient_id INT DEFAULT NULL
);



INSERT INTO beds (bed_number, ward, status)
VALUES
  ('B001', 'General', 'Available'),
  ('B002', 'General', 'Available'),
  ('B003', 'ICU', 'Available'),
  ('B004', 'ICU', 'Available'),
  ('B005', 'Private', 'Available'),
  ('B006', 'Private', 'Available'),
  ('B007', 'General', 'Available'),
  ('B008', 'ICU', 'Available');


USE hospital_db;
ALTER TABLE doctors ADD consultation_fee INT DEFAULT 500;

UPDATE doctors SET consultation_fee = 800 WHERE specialty = 'Cardiology';
UPDATE doctors SET consultation_fee = 700 WHERE specialty = 'Neurology';
UPDATE doctors SET consultation_fee = 900 WHERE specialty = 'Orthopedic';
UPDATE doctors SET consultation_fee = 600 WHERE specialty = 'Pediatrics';
UPDATE doctors SET consultation_fee = 500 WHERE consultation_fee IS NULL;