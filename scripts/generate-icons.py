"""Generates the PWA app icons (a simple dumbbell mark on the app's emerald
brand color). Run with: python scripts/generate-icons.py
"""
from PIL import Image, ImageDraw
import os

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')
os.makedirs(BASE_DIR, exist_ok=True)

BG_COLOR = (5, 46, 34, 255)       # deep emerald-tinted background (slate-950-ish but green)
MARK_COLOR = (52, 211, 153, 255)  # emerald-400, matches the app's accent color
WHITE = (255, 255, 255, 255)


def draw_dumbbell(size, scale=1.0, color=MARK_COLOR):
    """Draws a simple bold dumbbell silhouette centered in a `size`x`size` canvas."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2

    bar_h = size * 0.16 * scale
    bar_w = size * 0.46 * scale
    plate_w = size * 0.16 * scale
    plate_h = size * 0.46 * scale
    gap = bar_w / 2

    # center bar
    draw.rounded_rectangle(
        [cx - bar_w / 2, cy - bar_h / 2, cx + bar_w / 2, cy + bar_h / 2],
        radius=bar_h / 2,
        fill=color
    )
    # left plate
    draw.rounded_rectangle(
        [cx - gap - plate_w, cy - plate_h / 2, cx - gap, cy + plate_h / 2],
        radius=plate_w / 2.2,
        fill=color
    )
    # right plate
    draw.rounded_rectangle(
        [cx + gap, cy - plate_h / 2, cx + gap + plate_w, cy + plate_h / 2],
        radius=plate_w / 2.2,
        fill=color
    )
    return img


def make_icon(size, filename, bg=BG_COLOR, mark_color=MARK_COLOR, scale=1.0, square=True):
    canvas = Image.new('RGBA', (size, size), bg)
    if not square:
        # rounded square background (used for the "any" purpose icon)
        mask = Image.new('L', (size, size), 0)
        mdraw = ImageDraw.Draw(mask)
        radius = int(size * 0.22)
        mdraw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
        bg_layer = Image.new('RGBA', (size, size), bg)
        canvas = Image.composite(bg_layer, Image.new('RGBA', (size, size), (0, 0, 0, 0)), mask)

    mark = draw_dumbbell(size, scale=scale, color=mark_color)
    canvas.alpha_composite(mark)
    canvas.convert('RGBA').save(os.path.join(BASE_DIR, filename))
    print(f'wrote {filename} ({size}x{size})')


# "any" purpose icons - rounded-square background, safe to show anywhere
make_icon(512, 'icon-512.png', square=False, scale=1.0)
make_icon(192, 'icon-192.png', square=False, scale=1.0)

# maskable icon - full-bleed background (OS applies its own mask/rounding),
# mark scaled down so it stays inside the ~80% "safe zone"
make_icon(512, 'icon-512-maskable.png', square=True, scale=0.72)

# iOS home screen icon - iOS applies its own rounding, wants a plain square, no transparency
make_icon(180, 'apple-touch-icon.png', square=True, scale=1.0)

# browser tab favicon
make_icon(32, 'favicon.png', square=False, scale=1.0)

print('done')
