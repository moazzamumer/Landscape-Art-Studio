from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI,  File, UploadFile
from models.helper import Helper
import uvicorn
from crud import *
from S3 import *
from model import *
import os
import uuid  # for generating random strings

from imagemodel import *


app = FastAPI()
port = 8000

origins = [
    "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/Get_Preset_Input_Images")
def get_preset_image():
    return get_preset_images(db = Helper.get_db())

@app.get("/Get_Design_Styles")
def get_design_styles():
    return get_all_design_images_with_names(db = Helper.get_db())

@app.post("/Generate_Output_Designs")
def generate_output_designs(
    style_id: int, 
    ai_creativity: float, 
    number_of_designs: int,  
    ai_instruction: str , 
    input_image1: UploadFile = File(None),  # Making input_image1 optional
    mask: UploadFile = File(),  
    preset_id = None, 
    output_id = None 
):
    style_prompt = get_style_prompt_by_id(db = Helper.get_db() , style_id = style_id)
    style_prompt = style_prompt + '\n' + ai_instruction if style_prompt !='' else ai_instruction
    model_obj = ImageProcessing(style_prompt=style_prompt)
    mask_path = Helper.save_uploaded_file(mask)
    s3_obj = S3(constant.BUCKET_NAME)
    
    print(style_prompt)
    if preset_id == None and output_id == None:
        image_path = None
        if input_image1:
            # Generate a random filename
            random_filename = str(uuid.uuid4())
            # Get the file extension from the original filename
            filename, file_extension = os.path.splitext(input_image1.filename)
            # Concatenate the random string and the file extension
            random_filename_with_extension = random_filename + file_extension
            # Save the file with the new filename
            image_path = Helper.save_uploaded_file(input_image1, filename=random_filename_with_extension)
            image_link = s3_obj.upload_to_s3(image_path, 'images',use_accelerate=True)
            input_image_id = create_image(Helper.get_db(), image_link)
            print("input_image_id", input_image_id)
            ai_input_id = create_ai_input(
                Helper.get_db(),
                input_image_id,
                is_preset_image=False,
                is_output_image=False,
                style_id=style_id,
                ai_creativity=ai_creativity,
                number_of_designs=number_of_designs,
                instructions=ai_instruction
            )
            print("ai input_id", ai_input_id)
        else:
            return {"error": "No input image provided"}


    elif preset_id is not None and output_id == None:
        result = get_preset_images_by_id(Helper.get_db(), preset_id)
        if "preset_images" in result:
            preset_images = result["preset_images"]
            for preset_image in preset_images:
                image_id = preset_image["image_id"]
                image_url = preset_image["image_url"]
            print(image_url)
            image_path = s3_obj.download_image(image_url, '.')
            print(image_path)
            ai_input_id = create_ai_input(
                Helper.get_db(),
                image_id,
                is_preset_image=True,
                is_output_image=False,
                style_id=style_id,
                ai_creativity=ai_creativity,
                number_of_designs=number_of_designs,
                instructions=ai_instruction
            )
        else:
            return {"error": "No preset images found in the result."}

    elif preset_id == None and output_id is not None:
        print(output_id)
        saved_id, image_id, output_image_id, image_url = get_save_image_url_by_output_id(Helper.get_db(), output_id)

        image_path = s3_obj.download_image(image_url, '.')
        print(image_url)
        print("saved_id = ",saved_id)
        ai_input_id = create_ai_input(
            Helper.get_db(),
            output_image_id,
            is_preset_image=False,
            is_output_image=True,
            style_id=style_id,
            ai_creativity=ai_creativity,
            number_of_designs=number_of_designs,
            instructions=ai_instruction
        )
    else:
        return {"error": "Select preset_id or output_id not both"}
    
    model_obj.process_image(image_path)
    print(image_path)
    model_obj.process_mask(mask_path)
    model_obj.process_prompt()
    model_obj.send_request(image_path, mask_path, ai_creativity,number_of_designs)
    
    output_ids = []
    output_image_ids = []
    image_links = []

    for i in range(number_of_designs):
        image_link = s3_obj.upload_to_s3(f"upscaled_{i}{os.path.basename(image_path)}", 'images',use_accelerate=True)
        output_image_id = create_image(Helper.get_db(), image_link)
        output_id = create_ai_output(Helper.get_db(), ai_input_id, output_image_id)

        output_ids.append(output_id)
        output_image_ids.append(output_image_id)
        image_links.append(image_link)

        Helper.delete_uploaded_file(f"upscaled_{i}{os.path.basename(image_path)}")

    Helper.delete_uploaded_file(image_path)
    Helper.delete_uploaded_file(mask_path)

    return {"output_ids": output_ids, "output_image_ids": output_image_ids, "image_links": image_links}
    
@app.post('/Save_Output_Image')
def save_output_image(output_id:int):
    return(create_save(Helper.get_db(),output_id))
    
@app.put('/Save_Algorithm_Feedback')
def save_algo_feedback(output_id:int , feedback:str):
    return(update_feedback(Helper.get_db(),output_id,feedback))
    
@app.get('/Get_Saved_Images')
def get_saved_image():
    return(get_saved_images(Helper.get_db()))

@app.post('/Delete_Saved_Image')
def delete_saved_image(saved_output_id:int):
    return(delete_saved_output(Helper.get_db(),saved_output_id))

if __name__ == "__main__":
    
    # Run the command
    uvicorn.run("init:app", host = "0.0.0.0", port = port, reload = True)
