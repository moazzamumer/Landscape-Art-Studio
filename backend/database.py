from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, TIMESTAMP, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from fastapi import HTTPException
from starlette import status
from faker import Faker
from random import choice, randint



Base = declarative_base()

def create_database(engine):
    Base.metadata.create_all(bind=engine)
    print("Database created successfully.")


class Images(Base):
    __tablename__ = 'images'

    image_id = Column(Integer, primary_key=True)
    image_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime


class PresetImages(Base):
    __tablename__ = 'preset_images'

    preset_image_id = Column(Integer, primary_key=True)
    image_id = Column(Integer, ForeignKey('images.image_id'))
    created_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime

    # Define relationship with Images table
    image = relationship("Images")

class DesignStyles(Base):
    __tablename__ = 'design_styles'

    style_id = Column(Integer, primary_key=True)
    style_name = Column(String(255))
    style_prompt = Column(String(2500), nullable=True)
    image_url = Column(String(255))  # Add ForeignKey constraint
    created_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime

    # Define relationship with Images table
    #image = relationship("Images")



class AIInput(Base):
    __tablename__ = 'ai_input'

    input_id = Column(Integer, primary_key=True)
    input_image_id = Column(Integer, ForeignKey('images.image_id'))  # Add ForeignKey constraint
    Is_preset_image = Column(Boolean, nullable=False)
    Is_output_image = Column(Boolean, nullable=False)
    style_id = Column(Integer, ForeignKey('design_styles.style_id'))  # Assuming you also have a DesignStyles table
    ai_creativity = Column(Float, nullable=False)
    number_of_designs = Column(Integer, nullable=False)
    instructions = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime

    # Define relationship with Images table
    image = relationship("Images")

    # Define relationship with DesignStyles table
    style = relationship("DesignStyles")


class AIOutput(Base):
    __tablename__ = 'ai_output'

    output_id = Column(Integer, primary_key=True)
    input_id = Column(Integer, ForeignKey('ai_input.input_id'), nullable=False)
    output_image_id = Column(Integer)
    feedback = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime
    updated_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime

    # Define relationship with AIInput table
    ai_input = relationship("AIInput")


class SavedOutput(Base):
    __tablename__ = 'saved_output'

    saved_output_id = Column(Integer, primary_key=True)
    output_id = Column(Integer, ForeignKey('ai_output.output_id'), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)  # Change to DateTime

    # Define relationship with AIOutput table
    ai_output = relationship("AIOutput")


