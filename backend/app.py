from flask import Flask, request, send_file
from flask_cors import CORS
import torch
from PIL import Image
from RealESRGAN import RealESRGAN
import time
import os

app = Flask(__name__)
CORS(app) 

def enhance_image_ai(image_path, output_path, scale=4):
    device = torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")

    model = RealESRGAN(device, scale=scale)

    model.load_weights(
        f"weights/RealESRGAN_x{scale}.pth",
        download=True
    )

    image = Image.open(image_path).convert("RGB")

    sr_image = model.predict(image)

    sr_image.save(output_path)

@app.route('/enhance', methods=['POST'])
def enhance():
    if 'image' not in request.files:
        return {'error': 'No image provided'}, 400
    
    file = request.files['image']
    scale = int(request.form.get('scale', 4))
    input_path = 'temp/temp_input.jpg'
    output_path = 'temp/temp_output.jpg'
    
    os.makedirs('temp', exist_ok=True)
    
    file.save(input_path)
    enhance_image_ai(input_path, output_path, scale=scale)
    return send_file(output_path, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4500, debug=True)
