# def test_():
#     print("helllo")


# class MathUtils:
#     test_()
#     @staticmethod
#     def add(x, y):
#         return x + y

#     @staticmethod
#     def subtract(x, y):
#         return x - y

#     @staticmethod
#     def multiply(x, y):
#         return x * y

#     @staticmethod
#     def divide(x, y):
#         if y == 0:
#             raise ValueError("Division by zero")
#         return x / y

# # Using the static methods without creating an instance of MathUtils
# print(MathUtils.add(5, 3))        # Output: 8
# print(MathUtils.subtract(5, 3))   # Output: 2
# print(MathUtils.multiply(5, 3))   # Output: 15
# print(MathUtils.divide(10, 2))    # Output: 5.0

import boto3




# def get_all_preset_image_links(bucket_name, directory='presetimages'):
#         # Initialize S3 client
#         s3 = boto3.client('s3')
#         try:
#             # List objects in the bucket
#             response = s3.list_objects_v2(Bucket=bucket_name, Prefix=directory+'/')
#             if 'Contents' in response:
#                 object_links = []
#                 for obj in response['Contents']:
#                     object_key = obj['Key']
#                     object_link = f"https://{bucket_name}.s3.amazonaws.com/{object_key}"
#                     object_links.append(object_link)
#                 return object_links[1:]
#             else:
#                 return []
#         except Exception as e:
#             print("Error listing objects in the bucket:", e)
#             return []

# Example usage
# bucket_name = 'landscapeai'
# preset_image_links = get_all_preset_image_links(bucket_name)
# for link in preset_image_links:
#     print(link)


# from sdwebui.imagemodel import *
# import subprocess

# import time

# modelobj = ImageProcessing()
# image_path = 'actual.jpg'
# mask_path = 'mask.png'


# modelobj.process_image(image_path)
# modelobj.process_mask(mask_path)
# modelobj.process_prompt()
# modelobj.send_request(image_path,mask_path)
import constant
import boto3
import os
from urllib.parse import urlparse



# def download_image_from_s3(image_url, destination_dir):
#     # Parse the S3 URL to extract the bucket name and key
#     parsed_url = urlparse(image_url)
#     bucket_name = constant.BUCKET_NAME
#     key = parsed_url.path.lstrip('/')

#     # Initialize the S3 client
#     s3 = boto3.client('s3')

#     # Get the image file name from the URL
#     filename = os.path.basename(key)

#     # Define the local file path for downloading the image
#     local_file_path = os.path.join(destination_dir, filename)

#     try:
#         # Download the image file from S3
#         with open(local_file_path, 'wb') as f:
#             s3.download_fileobj(bucket_name, key, f)
#         return filename
#     except Exception as e:
#         print(f"Error downloading image from S3: {e}")
#         return None

# # Example usage:
# image_url = "https://landscapeai.s3.amazonaws.com/images/image0.jpg "
# destination_directory = "."
# filename = download_image_from_s3(image_url, destination_directory)
# if filename:
#     print(f"Image downloaded successfully with filename: {filename}")
# else:
#     print("Failed to download image from S3.")

import requests
import os

def download_image(url, save_dir):
    """
    Download an image from the given URL and save it to the specified directory.

    Args:
    - url (str): The URL of the image to download.
    - save_dir (str): The directory where the downloaded image will be saved.

    Returns:
    - str: The filename of the downloaded image if successful, else None.
    """
    try:
        # Send a GET request to download the image
        response = requests.get(url)
        if response.status_code == 200:
            # Extract the filename from the URL
            filename = os.path.basename(url)
            # Construct the full file path for saving
            save_path = os.path.join(save_dir, filename)
            # Write the image content to a file
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return filename
        else:
            print(f"Failed to download image from {url}. HTTP status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

# Example usage:
image_url = "https://landscapeai.s3.amazonaws.com/images/Beach.jpg"
save_directory = "."
downloaded_filename = download_image(image_url, save_directory)
if downloaded_filename:
    print(f"Image downloaded successfully: {downloaded_filename}")
else:
    print("Failed to download image.")
