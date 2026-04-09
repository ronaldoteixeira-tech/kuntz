import os
from PIL import Image

input_path = 'assets/images/veja.png'
output_path = 'assets/images/veja-gold-ready.png'

try:
    img = Image.open(input_path)
    img = img.convert('RGBA')
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        
        # Check if the pixel is white or very close to white (background)
        # Using a threshold for red, green, and blue
        if r > 240 and g > 240 and b > 240:
            newData.append((0, 0, 0, 0)) # Fully transparent
        else:
            # It's part of the logo (red or black)
            # We want to make it black so it works with the golden filter
            # But we preserve the original alpha if it's not 255
            newData.append((0, 0, 0, a))

    img.putdata(newData)
    img.save(output_path, 'PNG')
    print(f'SUCCESS: saved to {output_path}')
except Exception as e:
    print(f'ERROR: {e}')
