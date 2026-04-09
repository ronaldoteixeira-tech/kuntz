import os
from PIL import Image

# Path to the "original" file with the fake checkerboard
input_path = 'assets/images/veja.png'

try:
    img = Image.open(input_path)
    img = img.convert('RGBA')
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item
        
        # Only keep pixels that are clearly reddish (the logo)
        # Red is roughly (200+, <50, <50)
        # The background checkerboard is grey/white (equal-ish R, G, B)
        if r > 150 and g < 100 and b < 100:
            # We also make it black to be 100% sure the CSS filter works perfectly
            # (though brightness(0) would do it anyway)
            newData.append((0, 0, 0, a))
        else:
            newData.append((0, 0, 0, 0)) # Fully transparent

    img.putdata(newData)
    img.save(input_path, 'PNG')
    print(f'SUCCESS: Original {input_path} has been cleaned with a stricter reddish threshold.')
except Exception as e:
    print(f'ERROR: {e}')


