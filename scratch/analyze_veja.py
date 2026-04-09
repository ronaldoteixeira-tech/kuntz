from PIL import Image
from collections import Counter

img = Image.open('assets/images/veja.png').convert('RGBA')
datas = img.getdata()

# Count unique colors
colors = Counter(datas)
# Show top 10 colors
for color, count in colors.most_common(10):
    print(f'Color: {color}, Count: {count}')
