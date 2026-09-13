INSERT INTO "students" ("name", "email", "phone", "department", "roll_no", "year", "attendance", "fees_status") VALUES
  ('Aditya Kumar', 'aditya@college.edu', '9876543210', 'Computer Science', '21CS001', 3, 87, 'Paid'),
  ('Priya Sharma', 'priya@college.edu', '9876543211', 'Electronics', '21EC001', 3, 92, 'Paid'),
  ('Ravi Patel', 'ravi@college.edu', '9876543212', 'Mechanical', '21ME001', 3, 74, 'Pending'),
  ('Sneha Mehta', 'sneha@college.edu', '9876543213', 'Civil', '21CV001', 2, 95, 'Paid'),
  ('Kiran Nair', 'kiran@college.edu', '9876543214', 'Computer Science', '22CS001', 2, 81, 'Pending'),
  ('Anjali Singh', 'anjali@college.edu', '9876543215', 'Information Technology', '21IT001', 3, 88, 'Paid'),
  ('Mohit Gupta', 'mohit@college.edu', '9876543216', 'Computer Science', '23CS001', 1, 70, 'Pending'),
  ('Divya Reddy', 'divya@college.edu', '9876543217', 'Electronics', '22EC001', 2, 90, 'Paid')
ON CONFLICT ("email") DO NOTHING;
