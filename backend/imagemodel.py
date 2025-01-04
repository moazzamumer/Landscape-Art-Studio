import os
import cv2
import base64
import requests
import json
#from super_image import ImageLoader,DrlnModel,EdsrModel
from PIL import Image,ImageFilter


class ImageProcessing:
    def __init__(self,  style_prompt,data_path="." ):
        self.data_path = data_path
        self.style_prompt = style_prompt
        
    def process_image(self, image_path):
        print(os.path.join(self.data_path, image_path))
        img = cv2.imread(os.path.join(self.data_path, image_path))
        img = cv2.resize(img, [512, 512])
        _, modified_image = cv2.imencode(".png", img)
        img_b64 = base64.b64encode(modified_image).decode("utf-8")
        return img_b64
    
    def process_mask(self, mask_path):
        mask = cv2.imread(os.path.join(self.data_path, mask_path))
        mask = cv2.resize(mask, [512, 512])
        _, modified_mask = cv2.imencode(".png", mask)
        mask_b64 = base64.b64encode(modified_mask).decode("utf-8")
        return mask_b64
    
    def process_prompt(self):
        return  self.style_prompt
    
    def send_request(self, actual_image_path, mask_path ,cfg = 9 , number_of_images = 1):
        url = "https://regankirk-landscapeai.hf.space"
        img_b64 = self.process_image(actual_image_path)
        mask_b64 = self.process_mask(mask_path)
        prompt = self.process_prompt()
        
        sd_model = 'landscaperAi'
        denoise_strength = 0.80
        cfg = cfg
        steps = 120
        
        sd_b64_list = list()
        post_req = f"{url}/sdapi/v1/img2img"

        NEGATIVE_PROMPT = "Exclude all forms of wildlife, domestic animals, and humans, along with their related activities and objects. Avoid man-made structures such as buildings, bridges, and vehicles, as well as water features like ponds, lakes, and rivers. Do not include atmospheric phenomena such as clouds, rain, or celestial bodies, and remove non-vegetative elements like sand and snow. Exclude all urban elements like roads and street lights, and garden accessories such as benches and statues. Focus strictly on landscaping elements, limiting the color palette to natural and earthy tones, and emphasizing lush greenery, flowering plants, and stone pathways."
 
    
        for i in range(number_of_images):
            sd_payload = {
                "prompt": prompt,
                "negative_prompt": NEGATIVE_PROMPT,
                "sampler": "Euler",
                "sd_model_checkpoint": sd_model,
                "init_images": [img_b64],
                "mask": mask_b64,
                "denoising_strength": denoise_strength,
                "steps":steps,
                "cfg_scale": cfg,
                "sd_vae":"None",
                "inpainting_fill":1,
                "inpaint_full_res_padding":3
                
            }
            
            response = requests.post(post_req, json=sd_payload)
            
            
            sd_response = response.json()

            

#            b64_image = sd_response["images"][0]
            
            sd_img_b64 = sd_response["images"][0]

            with open("pipeline.png", "wb") as f:
                f.write(base64.b64decode(sd_img_b64))

            rescale_factor = 2
            steps = 80
            
            us_payload = {
                "denoising_strength": 0.05,
                "cfg_scale": 15,
                "sd_model_checkpoint": sd_model,
                "prompt": f"Highly Very Detailed, {prompt}",
                "negative_prompt": "",
                "init_images": [sd_img_b64],
                "sampler_index": "Euler a",
                "steps": steps,
                "script_name": "SD upscale",
                "script_args": [None, 64, "R-ESRGAN 4x+", rescale_factor],
                "inpainting_fill":1
            }

            img = Image.open("pipeline.png")
            img = img.resize([1024,1024], Image.Resampling.LANCZOS)

            img = img.filter(ImageFilter.SMOOTH)
            img = img.filter(ImageFilter.SHARPEN)

            img.save(f"upscaled_{i}{os.path.basename(actual_image_path)}")

            
#            post_req = f"{url}/sdapi/v1/img2img"
#            response = requests.post(post_req, json=us_payload)
#            us_response = response.json()
            
#            with open(f"upscaled_{i}{os.path.basename(actual_image_path)}", "wb") as f:
#                f.write(base64.b64decode(us_response["images"][0]))
#            image = Image.open("pipeline.png")
#
#            model = EdsrModel.from_pretrained('eugenesiow/edsr-base', scale=2)
#            inputs = ImageLoader.load_image(image)
#            preds = model(inputs)

#            ImageLoader.save_image(preds,f"upscaled_{i}{os.path.basename(actual_image_path)}")

