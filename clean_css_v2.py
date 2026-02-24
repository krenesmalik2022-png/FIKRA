import os

files = [
    r"c:\Users\Administrator\Documents\Desktop\AD1\html-css course\fikra\style.css",
    r"c:\Users\Administrator\Documents\Desktop\AD1\html-css course\fikra\tactical-dash.css"
]

for f in files:
    try:
        with open(f, 'rb') as file:
            content_bytes = file.read()
            
        # find .theme-toggle in utf-16le
        idx = content_bytes.find(b'.\x00t\x00h\x00e\x00m\x00e')
        if idx == -1:
            idx = content_bytes.find(b'\x00.\x00t\x00h\x00e\x00m\x00e')
            
        if idx != -1:
            # truncate before the weird bytes
            # also strip out previous newlines or spaces to be safe
            clean_bytes = content_bytes[:idx]
            clean_content = clean_bytes.decode('utf-8', errors='ignore')
            clean_content = clean_content.rstrip('\x00 \r\n\t') + '\n\n'
            
            if 'style.css' in f:
                clean_content += """.theme-toggle-btn {
    margin-right: 8px;
    width: 36px;
    padding: 0;
    justify-content: center;
}

.opacity-1 { opacity: 1; }
.bg-purple { background: #7b2fff; }
.bg-cyan { background: #00d2ff; }
.bg-gold { background: #ffd700; }
.bg-red { background: #ff3b3b; }
.bg-green { background: #00c97e; }
.bg-orange { background: #ff8c00; }

.canvas-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
}
"""
            else:
                clean_content += """.theme-toggle-btn {
    margin-right: 8px;
    width: 36px;
    padding: 0;
    justify-content: center;
}

.opacity-1 { opacity: 1; }
.w-0 { width: 0%; }
"""
            with open(f, 'w', encoding='utf-8') as file:
                file.write(clean_content)
            print(f"Fixed {f}")
        else:
            print(f"Pattern not found in {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
