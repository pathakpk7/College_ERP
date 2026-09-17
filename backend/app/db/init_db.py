from app.db.database import Base, engine

def init_db():
    """Ensure all database tables exist without auto-generating mock records."""
    Base.metadata.create_all(bind=engine)
    print("Database schema verified and ready for real data on Neon PostgreSQL.")

if __name__ == "__main__":
    init_db()

