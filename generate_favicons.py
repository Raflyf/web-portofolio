import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons():
    # Colors
    bg_color = (11, 15, 23, 255)       # Deep slate navy #0b0f17
    border_color = (16, 185, 129, 255) # Emerald green #10b981
    text_color = (255, 255, 255, 255)   # Pure white
    accent_glow = (16, 185, 129, 80)   # Emerald glow

    # 1. Create High-Res Master Image (512x512)
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle / circle background
    margin = 16
    draw.ellipse([margin, margin, size - margin, size - margin], fill=bg_color, outline=border_color, width=12)

    # Inner decorative glow circle
    glow_margin = 32
    draw.ellipse([glow_margin, glow_margin, size - glow_margin, size - glow_margin], outline=accent_glow, width=6)

    # Try loading a bold system font, fallback to default if not available
    font = None
    for font_name in ["arialbd.ttf", "segoeuib.ttf", "consola.ttf", "calibrib.ttf", "arial.ttf"]:
        try:
            font = ImageFont.truetype(font_name, 220)
            break
        except Exception:
            continue

    if font is None:
        font = ImageFont.load_default()

    # Draw "RF" monogram text centered
    text = "RF"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    text_x = (size - text_w) / 2 - bbox[0]
    text_y = (size - text_h) / 2 - bbox[1] - 16

    # Shadow/glow behind text
    draw.text((text_x + 4, text_y + 4), text, fill=(5, 150, 105, 180), font=font)
    # Main white text
    draw.text((text_x, text_y), text, fill=text_color, font=font)

    # Draw subtle terminal indicator dot at bottom
    dot_radius = 16
    dot_center_x = size / 2
    dot_center_y = size - 70
    draw.ellipse(
        [dot_center_x - dot_radius, dot_center_y - dot_radius, dot_center_x + dot_radius, dot_center_y + dot_radius],
        fill=border_color
    )

    # Ensure assets directory exists
    os.makedirs("assets", exist_ok=True)

    # 2. Save PNG variants
    sizes = {
        "assets/favicon-32x32.png": (32, 32),
        "assets/favicon-48x48.png": (48, 48),
        "assets/favicon-96x96.png": (96, 96),
        "assets/favicon-192x192.png": (192, 192),
        "assets/favicon-512x512.png": (512, 512),
        "assets/apple-touch-icon.png": (180, 180),
    }

    for path, (w, h) in sizes.items():
        resized = img.resize((w, h), Image.Resampling.LANCZOS)
        resized.save(path, format="PNG")
        print(f"Generated: {path}")

    # 3. Save multi-size favicon.ico (16, 32, 48)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    img.save("favicon.ico", format="ICO", sizes=ico_sizes)
    print("Generated: favicon.ico")

    # 4. Generate standalone crisp SVG Favicon
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="rfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#10b981" flood-opacity="0.4"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="#0b0f17" stroke="#10b981" stroke-width="12" />
  <circle cx="256" cy="256" r="210" fill="none" stroke="#10b981" stroke-width="2" stroke-opacity="0.25" />
  <text x="256" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="200" font-weight="900" fill="#ffffff" text-anchor="middle" filter="url(#glow)">RF</text>
  <circle cx="256" cy="420" r="16" fill="#10b981" />
</svg>'''

    with open("favicon.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Generated: favicon.svg")

if __name__ == "__main__":
    generate_icons()
