import constant
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import  UploadFile
import os
from database import *
from S3 import *
from  promts import *

_engine = create_engine(constant.DATABASE_URL, max_overflow = -1, pool_size = -1, pool_timeout = -74101)
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

class Helper:
    
    
    # initialization of database
    
    @staticmethod
    def db_inital():
        print("db initial")
        create_database(_engine)
    

    @staticmethod
    def get_db():
        db = _SessionLocal()
        try:
            return db
        finally:
            db.close()


    @staticmethod
    def save_uploaded_file(upload_file: UploadFile, filename: str = None) -> str:
        if filename is None:
            filename = upload_file.filename
        else:
            # Get the file extension from the original filename
            _, ext = os.path.splitext(upload_file.filename)
            # Append the extension to the custom filename if it doesn't already have one
            if not filename.endswith(ext):
                filename += ext
        
        file_path = os.path.join(filename)
        with open(file_path, "wb") as buffer:
            buffer.write(upload_file.file.read())
        return file_path

    @staticmethod
    def delete_uploaded_file(file_path: str) -> bool:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        else:
            return False

    @staticmethod
    def initialize_db_with_preset_images():
        try:
            # Get all preset image links from S3
            obj = S3(constant.BUCKET_NAME)
            preset_image_urls = obj.get_image_links('presetimages',use_accelerate=True)
            image_urls = obj.get_image_links('images',use_accelerate=True)
            design_urls = obj.get_image_links('designstyles',use_accelerate=True)

            # Extract the filenames from the URLs
            preset = [url.split('/')[-1] for url in preset_image_urls]
            design_style = [url.split('/')[-1] for url in design_urls]

            # Initialize database session
            db = Helper.get_db()

            for url in image_urls:
                # Check if the image already exists in the database
                existing_image = db.query(Images).filter_by(image_url=url).first()

                if not existing_image:
                    # Create a new image entry in the database
                    create_image(db, url)

                    # Check if the filename is in the preset_image_urls
                    for preset_url in preset:
                        if preset_url in url:
                            create_preset_image(db, url)

                    # Check if the filename is in the design_urls and add design styles
                    for i, design_url in enumerate(design_style):
                        if design_url in url:
                        
                            # Ensure the index is within the bounds of PROMPTS
                            if i < len(PROMPTS):

                                create_design_style(db=db, style_name= DESIGN_STYLES[i], image_url=url, style_prompt=PROMPTS[i])
                                print(i)

                            else:
                                print(f"Warning: No prompt found for design style '{design_url}' at index {i}. Skipping this entry.")

        except Exception as e:
            # Handle exceptions and print error message for debugging
            print(f"An error occurred: {e}")
            raise
        finally:
            # Ensure the database session is closed
            db.close()


                        
    
        
        
        

        


    
