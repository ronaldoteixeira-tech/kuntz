import os
from PIL import Image

input_path = 'assets/images/veja.png'
output_path = 'assets/images/veja-transparent.png'

try:
    img = Image.open(input_path)
    img = img.convert('RGBA')
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        # diff checks how non-white the pixel is. White is g=255,b=255 so diff=0
        # White should be transparent (alpha=0), red/black should be opaque (alpha=255)
        diff = 255 - min(g, b)
        
        if diff < 15:
            # It's basically white/background
            newData.append((0, 0, 0, 0))
        else:
            # Scale alpha so the transition is smooth
            alpha = max(0, min(255, int(diff * 1.5)))
            newData.append((0, 0, 0, alpha)) # Output black shape with correct alpha. Filter will turn it gold.

    img.putdata(newData)
    img.save(output_path, 'PNG')
    print('SUCCESS')
except Exception as e:
    print(f'ERROR: {e}')
