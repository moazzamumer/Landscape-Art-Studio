import boto3
import constant
from crud import *
import os
import requests
import uuid

from urllib.parse import urlparse


class S3:
    def __init__(self , bucket_name):
        self.bucket_name = bucket_name
        self.s3 = boto3.client('s3')
        

    def get_image_links(self, directory, use_accelerate=False):
        try:
            # Check if acceleration is enabled for the bucket
            accelerate_config = self.s3.get_bucket_accelerate_configuration(Bucket=self.bucket_name)
            accelerate_enabled = accelerate_config.get('Status') == 'Enabled' if accelerate_config else False

            # List objects in the bucket
            response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=directory+'/')

            if 'Contents' in response:
                object_links = []
                for obj in response['Contents']:
                    object_key = obj['Key']
                    # Construct object link with accelerate endpoint if enabled
                    if use_accelerate and accelerate_enabled:
                        object_link = f"https://{self.bucket_name}.s3-accelerate.amazonaws.com/{object_key}"
                    else:
                        object_link = f"https://{self.bucket_name}.s3.amazonaws.com/{object_key}"
                    object_links.append(object_link)
                return object_links[1:]
            else:
                return []
        except Exception as e:
            print("Error listing objects in the bucket:", e)
            return []    
    
    def upload_to_s3(self, file_path, directory_name, use_accelerate=False):
        try:
            # Extract file name from the file path
            file_name = os.path.basename(file_path)

            # Upload the file to the specified directory in the bucket
            self.s3.upload_file(file_path, self.bucket_name, f"{directory_name}/{file_name}")

            # Construct the object link
            object_key = f"{directory_name}/{file_name}"
            # Construct object link with accelerate endpoint if enabled
            if use_accelerate:
                accelerate_config = self.s3.get_bucket_accelerate_configuration(Bucket=self.bucket_name)
                accelerate_enabled = accelerate_config.get('Status') == 'Enabled' if accelerate_config else False
                if accelerate_enabled:
                    object_link = f"https://{self.bucket_name}.s3-accelerate.amazonaws.com/{object_key}"
                else:
                    object_link = f"https://{self.bucket_name}.s3.amazonaws.com/{object_key}"
            else:
                object_link = f"https://{self.bucket_name}.s3.amazonaws.com/{object_key}"

            print(f"File uploaded successfully to {object_link}")
            return object_link
        except FileNotFoundError as e:
            print(f"File not found: {file_path}")
            return None
        except Exception as e:
            print(f"Error uploading file to S3: {e}")
            return None
            
    def download_recent_object(self, directory_name, download_dir):
    # Create a Boto3 client for S3
        try:
            # List objects in the bucket with the specified directory prefix
            response = self.s3.list_objects_v2(Bucket=self.bucket_name, Prefix=f"{directory_name}/")

            # Get the most recently modified object
            sorted_objects = sorted(response['Contents'], key=lambda x: x['LastModified'], reverse=True)
            if sorted_objects:
                object_key = sorted_objects[0]['Key']
                file_name = os.path.basename(object_key)
                download_path = os.path.join(download_dir, file_name)

                # Download the object
                self.s3.download_file(self.bucket_name, object_key, download_path)
                relative_path = f"./{file_name}"
                print(f"Downloaded: {relative_path}")
                return relative_path, file_name
            else:
                print(f"No objects found in directory: {directory_name}")
        
        except Exception as e:
            print(f"Error: {e}")
            return None, None


    def download_image_from_s3(self,image_url, destination_dir):
        # Parse the S3 URL to extract the bucket name and key
        parsed_url = urlparse(image_url)
        bucket_name = parsed_url.netloc
        key = parsed_url.path.lstrip('/')

        

        # Get the image file name from the URL
        filename = os.path.basename(key)

        # Define the local file path for downloading the image
        local_file_path = os.path.join(destination_dir, filename)

        try:
            # Download the image file from S3
            self.s3.download_file(bucket_name, key, local_file_path)
            return filename
        except Exception as e:
            print(f"Error downloading image from S3: {e}")
            return None

    def download_image(self, url, save_dir):
        try:
            # Send a GET request to download the image
            response = requests.get(url)
            if response.status_code == 200:
                # Generate a unique identifier
                unique_identifier = str(uuid.uuid4())
                # Extract the filename from the URL
                filename = os.path.basename(url)
                # Combine the unique identifier with the filename
                unique_filename = f"{unique_identifier}_{filename}"
                # Construct the full file path for saving
                save_path = os.path.join(save_dir, unique_filename)
                # Write the image content to a file
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                return unique_filename
            else:
                print(f"Failed to download image from {url}. HTTP status code: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error downloading image from {url}: {e}")
            return None


