import zlib
import struct
import math
import os

def write_png(buf, width, height):
    # Reverse the vertical line order if necessary or keep as is. 
    # Standard PNG is top-to-bottom.
    
    # 1. Signature
    png_sig = b'\x89PNG\r\n\x1a\n'
    
    # 2. IHDR
    # Width, Height, BitDepth(8), ColorType(6=RGBA), Compression(0), Filter(0), Interlace(0)
    ihdr_data = struct.pack('!I I B B B B B', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    ihdr = struct.pack('!I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('!I', ihdr_crc)
    
    # 3. IDAT
    # Basic uncompressed data: for each scanline: FilterByte(0) + RowData
    raw_data = b''
    for y in range(height):
        # Filter type 0 (None)
        raw_data += b'\x00'
        row_pixels = buf[y]
        for x in range(width):
            r, g, b_val, a = row_pixels[x]
            raw_data += struct.pack('BBBB', r, g, b_val, a)
            
    compressed_data = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    idat = struct.pack('!I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('!I', idat_crc)
    
    # 4. IEND
    iend_crc = zlib.crc32(b'IEND')
    iend = struct.pack('!I', 0) + b'IEND' + struct.pack('!I', iend_crc)
    
    return png_sig + ihdr + idat + iend

def generate_icon(size):
    # Professional Blue: #007bff (0, 123, 255)
    # White: #ffffff
    
    buf = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    
    center = size / 2
    radius = size / 2 * 0.9
    
    for y in range(size):
        for x in range(size):
            # Distance from center
            dx = x - center + 0.5
            dy = y - center + 0.5
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Anti-aliasing logic (simple)
            alpha = 0
            if dist < radius - 0.5:
                alpha = 255
            elif dist < radius + 0.5:
                alpha = int(255 * (radius + 0.5 - dist))
            
            if alpha > 0:
                # Shield/Circle Blue Background
                buf[y][x] = (0, 123, 255, alpha)
                
    # Draw 'T' or Shield symbol in White
    # Let's draw a simple Shield shape or checkmark? 
    # A simple 'T' is easiest to look good at 16px.
    # Actually, let's do a white checkmark.
    
    # Checkmark logic
    # Points approx for a check
    def in_check(cx, cy):
        # Simple math for checkmark shape
        # Convert to unit coordinates (0-1) inside the circle
        ux = (cx - center) / (radius * 1.5)
        uy = (cy - center) / (radius * 1.5)
        
        # Checkmark strokes
        # 1. Short leg
        # 2. Long leg
        
        # Rotated rectangle approach or simple pixel logic
        # Let's simple pixel logic for robustness
        # Checking against line segments with thickness
        
        # Line 1: (-0.4, 0.1) to (-0.1, 0.4)
        # Line 2: (-0.1, 0.4) to (0.5, -0.4)
        
        thickness = 0.15 * size  # scale thickness with size
        
        # But this is hard without a rasterizer.
        # Let's do a simple letter 'T' for TrustL.
        
        # T Vertical
        in_vert = abs(cx - center) < (0.15 * size) and \
                  (cy > center - 0.3 * size) and (cy < center + 0.3 * size)
        
        # T Horizontal
        in_horz = (cy < center - 0.15 * size) and \
                  (cy > center - 0.45 * size) and \
                  abs(cx - center) < (0.35 * size)
                  
        return in_vert or in_horz

    for y in range(size):
        for x in range(size):
             if in_check(x+0.5, y+0.5):
                 # Blend white on top
                 # Existing color
                 base = buf[y][x]
                 # If base alpha is 0, we are outside circle (don't draw T there)
                 if base[3] > 10:
                     # Mix white (255,255,255) with base
                     # Simple logic: just set to white
                      buf[y][x] = (255, 255, 255, base[3])

    return buf

sizes = [16, 48, 128]
output_dir = r"c:\Users\digit\OneDrive\Desktop\TrustL\extension\icons"
os.makedirs(output_dir, exist_ok=True)

for s in sizes:
    pixels = generate_icon(s)
    data = write_png(pixels, s, s)
    with open(os.path.join(output_dir, f"icon{s}.png"), "wb") as f:
        f.write(data)
    print(f"Generated icon{s}.png")

print("All icons generated successfully.")
