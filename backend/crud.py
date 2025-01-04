from database import *
import os
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

### image table ###

def create_image(db, image_url):
    try:
        image = Images(image_url=image_url)
        db.add(image)
        db.commit()
        # Return the image_id along with the image object
        return image.image_id
    except SQLAlchemyError as e:
        db.rollback()
        print(f"SQLAlchemyError creating image: {e}")
        # Raise an HTTP exception for database errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e}")
    except Exception as e:
        db.rollback()
        print(f"Error creating image: {e}")
        # Raise an HTTP exception for other errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error creating image: {e}")
    finally:
        db.close()

def create_preset_image(session, image_url):
    try:
        image = session.query(Images).filter_by(image_url=image_url).first()
        if image:
            preset_image = PresetImages(image_id=image.image_id)
            session.add(preset_image)
            session.commit()
            return preset_image
        else:
            print("Image not found. Please create the image first.")
    except Exception as e:
        session.rollback()
        print(f"Error creating preset image: {e}")
    finally:
        session.close()

def get_image_by_id(db, image_id: int):
    try:
        # Query the image by image_id
        image = db.query(Images).filter(Images.image_id == image_id).first()
        return image
    except Exception as e:
        print(f"Error retrieving image by id: {e}")
        return None
    
### preset image table ###

def check_image_in_preset_images(db, image_id: int):
    try:
        # Query the PresetImages table to check if the image exists
        preset_image = db.query(PresetImages).filter(PresetImages.image_id == image_id).first()
        
        if preset_image:
            return True, image_id
        else:
            return False, None
    except Exception as e:
        print(f"Error checking image in preset images: {e}")
        return False, None


def get_preset_images(db):
    try:
        # Query the PresetImages table and join with the Images table to get the image URLs and IDs
        preset_images = db.query(PresetImages.preset_image_id, Images.image_url)\
                          .join(Images, PresetImages.image_id == Images.image_id)\
                          .all()

        # Extract image URLs and IDs from the query result using list comprehension
        preset_image_data = [{"preset_image_id": image[0], "image_url": image[1]} for image in preset_images]
        
        # Return the result as a JSON object
        return {"preset_images": preset_image_data}
    except Exception as e:
        # Handle exceptions (e.g., database errors)
        print("An error occurred while retrieving preset images:", str(e))
        return {"error": str(e)}



def get_preset_images_by_id(db, preset_id: int):
    try:
        # Query the PresetImages table for the given preset_id and join with the Images table
        preset_images = db.query(Images.image_id, Images.image_url)\
                         .join(PresetImages, PresetImages.image_id == Images.image_id)\
                         .filter(PresetImages.preset_image_id == preset_id)\
                         .all()

        # Extract image URLs and image IDs from the query result using list comprehension
        preset_image_data = [{"image_id": image[0], "image_url": image[1]} for image in preset_images]

        # Return the result as a JSON object
        return {"preset_images": preset_image_data}
    except Exception as e:
        # Handle exceptions (e.g., database errors)
        print("An error occurred while retrieving preset images by preset_id:", str(e))
        return {"error": str(e)}

### design style table ###
        
def create_design_style(db, style_name, style_prompt, image_url):
    try:
        # Check if the image exists in the Images table
        image = db.query(Images).filter_by(image_url=image_url).first()
        if not image:
            # If the image does not exist, create it first
            image = Images(image_url=image_url)
            db.add(image)
            db.commit()

        # Create the design style
        design_style = DesignStyles(
            style_name = style_name,
            style_prompt = style_prompt,
            image_url = image_url
        )
        db.add(design_style)
        db.commit()

        return design_style
    except Exception as e:
        db.rollback()
        print(f"Error creating design style: {e}")
    finally:
        db.close()

def get_all_design_images_with_names(db):
    try:
        # Query all design styles from the DesignStyles table
        design_styles = db.query(DesignStyles).all()

        # Extract image URLs, names, and style IDs from design styles and format as JSON
        images_with_names = [
            {   
                "image_url": design_style.image_url,
                "style_id": design_style.style_id,
                "style_name": design_style.style_name
            }
            for design_style in design_styles
        ]

        return {"images_with_names": images_with_names}
    except Exception as e:
        print(f"Error retrieving images with names: {e}")

def get_style_prompt_by_id(db, style_id: int) -> str:
    try:
        style = db.query(DesignStyles).filter_by(style_id=style_id).first()
        if style:
            return style.style_prompt
        else:
            return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

### AI_Input table ###

def create_ai_input(
    db,
    input_image_id: int,
    is_preset_image: bool,
    is_output_image: bool,
    style_id: int,
    ai_creativity: float,
    number_of_designs: int,
    instructions: str = None
):
    try:
        # Create a new AIInput instance with the provided data
        ai_input = AIInput(
            input_image_id=input_image_id,
            Is_preset_image=is_preset_image,
            Is_output_image=is_output_image,
            style_id=style_id,
            ai_creativity=ai_creativity,
            number_of_designs=number_of_designs,
            instructions=instructions,
            created_at=datetime.utcnow()
        )

        # Add the new AIInput instance to the session and commit the transaction
        db.add(ai_input)
        db.commit()

        return ai_input.input_id
    except Exception as e:
        print(f"Error creating AI input: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating AI input")

### AIOutput_table ###
def check_image_in_output_table(db, image_id: int):
    try:
        # Query the AIOutput table to check if the image exists
        output_image = db.query(AIOutput).filter(AIOutput.output_image_id == image_id).first()
        
        if output_image:
            return True, image_id
        else:
            return False, None
    except Exception as e:
        print(f"Error checking image in output table: {e}")
        return False, None
    
def create_ai_output(db, input_id: int, output_image_id: int, feedback: str = None) -> AIOutput:
    try:
        ai_output = AIOutput(input_id=input_id, output_image_id=output_image_id, feedback=feedback)
        db.add(ai_output)
        db.commit()
        return ai_output.output_id
    except Exception as e:
        print(f"Error creating output image: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error creating output image")
    
def update_feedback(db, output_id: int, feedback: str):
    try:
        # Retrieve the AIOutput object with the given output_id
        output = db.query(AIOutput).filter(AIOutput.output_id == output_id).first()
        
        # If output exists, update the feedback and update the updated_at timestamp
        if output:
            output.feedback = feedback
            output.updated_at = datetime.utcnow()
            db.commit()
            return True
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Output with ID {output_id} not found")
    except Exception as e:
        print(f"Error updating feedback for output {output_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error updating feedback")

### saved output ###
def create_save(db, output_id: int):
    try:
        # Create a new SavedOutput object
        saved_output = SavedOutput(output_id=output_id, saved_at=datetime.utcnow())

        # Add the new object to the session
        db.add(saved_output)

        # Commit the transaction
        db.commit()

        return {"message": f"Output ID {output_id} stored successfully in the database."}

    except Exception as e:
        # Rollback the transaction in case of error
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error storing output ID {output_id}: {str(e)}")

def get_saved_images(db):
    
    # Join the SavedOutput, AIOutput, and Images tables to retrieve the required data
    saved_images = db.query(SavedOutput.saved_output_id, AIOutput.output_id, AIOutput.output_image_id, AIOutput.feedback, Images.image_url)\
                        .join(AIOutput, SavedOutput.output_id == AIOutput.output_id)\
                        .join(Images, AIOutput.output_image_id == Images.image_id)\
                        .all()
    
    # If saved images are found, return the result
    if saved_images:
        saved_images_data = []
        for saved_output_id, output_id, output_image_id, feedback, image_url in saved_images:
            saved_images_data.append({
                "Saved_Output_ID": saved_output_id,
                "Output_ID": output_id,
                "Output_Image_ID": output_image_id,
                "Feedback": feedback,
                "Image_URL": image_url
            })
        return saved_images_data
    else:
        return {}
        
    
def delete_saved_output(db, saved_output_id):
    try:
        saved_output = db.query(SavedOutput).filter_by(saved_output_id=saved_output_id).first()
        if saved_output:
            db.delete(saved_output)
            db.commit()
            return {"message": f"Saved output with ID {saved_output_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"No saved output found with ID {saved_output_id}")
    except Exception as e:
        db.rollback()
        print(f"Error deleting saved output: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while deleting the saved output")
    
def get_saved_image_info(db,saved_output_id):
    try:
        # Query the SavedOutput table to get the AIOutput ID
        saved_output = db.query(SavedOutput).filter(SavedOutput.saved_output_id == saved_output_id).first()
        if saved_output:
            ai_output_id = saved_output.output_id

            # Query the AIOutput table to get the AIInput ID and output_image_id
            ai_output = db.query(AIOutput).filter(AIOutput.output_id == ai_output_id).first()
            if ai_output:
                ai_input_id = ai_output.input_id
                output_image_id = ai_output.output_image_id

                # Query the AIInput table to get the image_id
                ai_input = db.query(AIInput).filter(AIInput.input_id == ai_input_id).first()
                if ai_input:
                    image_id = ai_input.input_image_id

                    # Query the Images table to get the image URL
                    image = db.query(Images).filter(Images.image_id == image_id).first()
                    if image:
                        image_url = image.image_url
                        return {"image_id": image_id, "image_url": image_url}
                    else:
                        return {"error": "Image not found"}
                else:
                    return {"error": "AIInput not found"}
            else:
                return {"error": "AIOutput not found"}
        else:
            return {"error": "SavedOutput not found"}
    except Exception as e:
        return {"error": str(e)}
    
def get_save_image_url_by_output_id(db, output_id):
    try:
        # Query the database to get the specific saved image by output_id
        saved_image = db.query(SavedOutput.saved_output_id, AIOutput.output_id, AIOutput.output_image_id, AIOutput.feedback, Images.image_url)\
                         .join(AIOutput, SavedOutput.output_id == AIOutput.output_id)\
                         .join(Images, AIOutput.output_image_id == Images.image_id)\
                         .filter(AIOutput.output_id == output_id)\
                         .first()

        # If saved image is found, return the saved_output_id, output_id, output_image_id, and image_url
        if saved_image:
            print("output_image_id = ",saved_image.output_image_id)
            print("output_id=", saved_image.output_id)
            return saved_image.saved_output_id, saved_image.output_id, saved_image.output_image_id, saved_image.image_url
            
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No saved image found for output_id {output_id}")
    except HTTPException as http_exception:
        # Re-raise HTTPException if it was caught
        raise http_exception
    except Exception as e:
        print(f"Error retrieving saved images: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving saved images")
