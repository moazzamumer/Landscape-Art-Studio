from pydantic import BaseModel
from typing import Optional
from fastapi import FastAPI, File, UploadFile

class InputDesign(BaseModel):
    input_image1: UploadFile = File()
    input_image2: Optional[UploadFile] = File(None)
    is_preset_image: bool
    is_output_image: bool
    style_id: int
    ai_creativity: float
    number_of_designs: int
    instructions: str

class SavedImage(BaseModel):
    output_id:int