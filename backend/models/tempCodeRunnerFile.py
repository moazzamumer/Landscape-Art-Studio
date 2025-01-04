if not existing_image:
               create_image(db, url)
               if url in preset_image_urls:
                    create_preset_image(db, url)
                    
