import random
import string
import base64
from typing import Tuple


def generate_captcha_challenge() -> Tuple[str, str, str]:
    """
    Generates a 5-character alphanumeric captcha text, unique challenge token,
    and SVG markup string for rendering on the frontend without external image dependencies.
    """
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    captcha_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))

    # Generate an SVG string with random background noise lines & text distortion
    lines_svg = ""
    for _ in range(5):
        x1, y1 = random.randint(0, 150), random.randint(0, 50)
        x2, y2 = random.randint(0, 150), random.randint(0, 50)
        color = f"hsl({random.randint(0, 360)}, 70%, 50%)"
        lines_svg += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1.5" opacity="0.6"/>'

    chars_svg = ""
    for i, char in enumerate(captcha_text):
        x = 20 + (i * 25) + random.randint(-2, 2)
        y = 33 + random.randint(-4, 4)
        rot = random.randint(-15, 15)
        color = f"hsl({random.randint(180, 260)}, 80%, 35%)"
        chars_svg += f'<text x="{x}" y="{y}" transform="rotate({rot} {x} {y})" fill="{color}" font-family="monospace" font-size="24" font-weight="bold">{char}</text>'

    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50" style="background-color: #f1f5f9; border-radius: 8px;">
        {lines_svg}
        {chars_svg}
    </svg>"""

    # Encode SVG to base64 data URI
    svg_b64 = "data:image/svg+xml;base64," + base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
    return captcha_id, captcha_text, svg_b64
