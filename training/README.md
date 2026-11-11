# Fine-tuning the landscaping checkpoint

`train_text_to_image.py` is the Hugging Face Diffusers text-to-image fine-tuning script (Diffusers 0.28 dev). It freezes the VAE and CLIP text encoder and fine-tunes the U-Net with the standard noise-prediction loss.

## Data

433 landscape images with one caption each, in Hugging Face `ImageFolder` format:

```
Data/Training/
  metadata.jsonl      # {"file_name": "001.jpg", "text": "Suburban stone pathway. Lush green plants on sides. ..."}
  001.jpg
  002.jpg
  ...
```

Captions describe the visible landscaping elements (ground cover, pathways, hedges, decking, planting) in plain phrases.

## Launch configuration

```bash
accelerate launch train_text_to_image.py \
  --pretrained_model_name_or_path="stabilityai/stable-diffusion-2" \
  --train_data_dir="Data/Training" \
  --output_dir="stabilityai-sd2-landscaper-v0-7" \
  --resolution=512 --center_crop --random_flip \
  --train_batch_size=1 \
  --gradient_accumulation_steps=4 \
  --gradient_checkpointing \
  --max_train_steps=500 \
  --learning_rate=1e-5 \
  --max_grad_norm=1 \
  --lr_scheduler="constant" --lr_warmup_steps=0 \
  --mixed_precision="fp16" \
  --use_ema \
  --checkpointing_steps=50
```

Effective batch size is 4 on a single GPU. Checkpoints are written every 50 steps (`checkpoint-250` is the midpoint at global step 250). The final export is a complete Diffusers `StableDiffusionPipeline` with a DDIM scheduler and no safety checker.

## Notes

- The dataset and weights are not included in this repository.
- The checkpoint was served through an Automatic1111 img2img endpoint for masked editing; see `backend/imagemodel.py` for the inference settings.
