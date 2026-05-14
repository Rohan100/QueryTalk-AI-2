import re

with open('core/database.py', 'r') as f:
    content = f.read()

# Replace demo.db with demo_v2.db
content = content.replace('"sqlite:///./demo.db"', '"sqlite:///./demo_v2.db"')

# Update init_db
new_init_db = """def init_db():
    if "sqlite" in str(engine.url):
        from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
        import datetime
        import random

        class User(Base):
            __tablename__ = "users"
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String, index=True)
            email = Column(String, unique=True, index=True)
            region = Column(String)
            segment = Column(Integer)
            acquisition_cost = Column(Float)
            signup_date = Column(Date)
            
        class Sale(Base):
            __tablename__ = "sales"
            id = Column(Integer, primary_key=True, index=True)
            user_id = Column(Integer, ForeignKey('users.id'))
            amount = Column(Float)
            date = Column(Date)
            
        Base.metadata.create_all(bind=engine)
        
        session = SessionLocal()
        if session.query(User).count() == 0:
            regions = ["NA", "EU", "APAC", "LATAM", "MEA"]
            segments = [1, 2, 3]
            users_to_add = []
            
            # Generate 50 users
            for i in range(1, 51):
                users_to_add.append(User(
                    name=f"User {i}",
                    email=f"user{i}@example.com",
                    region=random.choice(regions),
                    segment=random.choice(segments),
                    acquisition_cost=random.uniform(50.0, 400.0),
                    signup_date=datetime.date.today() - datetime.timedelta(days=random.randint(10, 365))
                ))
            
            session.add_all(users_to_add)
            session.commit()
            
            # Generate 500 sales over the last 12 months
            sales_to_add = []
            for i in range(500):
                sale_date = datetime.date.today() - datetime.timedelta(days=random.randint(0, 360))
                sales_to_add.append(Sale(
                    user_id=random.randint(1, 50),
                    amount=random.uniform(20.0, 500.0),
                    date=sale_date
                ))
                
            session.add_all(sales_to_add)
            session.commit()
        session.close()
"""

# Find and replace the init_db block
content = re.sub(r'def init_db\(\):[\s\S]*?def get_db\(\):', new_init_db + '\ndef get_db():', content)

with open('core/database.py', 'w') as f:
    f.write(content)
print("Updated database.py")
