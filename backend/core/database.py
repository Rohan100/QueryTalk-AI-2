import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./demo.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    if "sqlite" in str(engine.url):
        from sqlalchemy import Column, Integer, String, Float
        class User(Base):
            __tablename__ = "users"
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String, index=True)
            email = Column(String, unique=True, index=True)
            revenue = Column(Float)
        
        Base.metadata.create_all(bind=engine)
        
        session = SessionLocal()
        if session.query(User).count() == 0:
            session.add_all([
                User(name="Alice Smith", email="alice@example.com", revenue=1500.0),
                User(name="Bob Johnson", email="bob@example.com", revenue=2100.5),
                User(name="Charlie Brown", email="charlie@example.com", revenue=950.0),
                User(name="Diana Prince", email="diana@example.com", revenue=3200.75),
                User(name="Evan Wright", email="evan@example.com", revenue=1100.0),
            ])
            session.commit()
        session.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_schema_info():
    metadata = MetaData()
    metadata.reflect(bind=engine)
    schema_details = []
    for table_name, table in metadata.tables.items():
        columns = [f"{col.name} ({col.type})" for col in table.columns]
        schema_details.append(f"Table: {table_name}\nColumns: {', '.join(columns)}")
    return "\n\n".join(schema_details)
