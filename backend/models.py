# backend/models.py
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os, json

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///thinkhire.db')
Base = declarative_base()

class Match(Base):
    __tablename__ = 'matches'
    id = Column(Integer, primary_key=True)
    title = Column(String(256))
    company = Column(String(256))
    url = Column(String(1024))
    matched_skills = Column(String(512))
    raw = Column(Text)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
Session = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)

def save_match(m):
    s = Session()
    mm = Match(
        title=(m.get('title') or '')[:256],
        company=(m.get('company') or '')[:256],
        url=(m.get('url') or '')[:1024],
        matched_skills=",".join(m.get('matched_skills') or []),
        raw=json.dumps(m.get('raw') or {})
    )
    s.add(mm)
    s.commit()
    s.close()

def get_all_matches(limit=50):
    s = Session()
    res = s.query(Match).order_by(Match.id.desc()).limit(limit).all()
    s.close()
    return res
