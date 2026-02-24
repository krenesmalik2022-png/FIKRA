import os

files = [
    r"c:\Users\Administrator\Documents\Desktop\AD1\html-css course\fikra\org-dashboard.css"
]

for f in files:
    try:
        with open(f, 'rb') as file:
            content_bytes = file.read()
            
        # find .org-label in utf-16le
        idx = content_bytes.find(b'.\x00 \x00o\x00r\x00g')
        if idx == -1:
            idx = content_bytes.find(b'\x00.\x00 \x00o\x00r\x00g')
        if idx == -1:
            idx = content_bytes.find(b'.\x00o\x00r\x00g')
            
        if idx != -1:
            # truncate before the weird bytes
            clean_bytes = content_bytes[:idx]
            clean_content = clean_bytes.decode('utf-8', errors='ignore')
            clean_content = clean_content.rstrip('\x00 \r\n\t') + '\n\n'
            
            clean_content += """.org-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    margin-right: 12px;
}

.empty-msg {
    grid-column: 1 / -1;
    padding: 100px;
    text-align: center;
    color: var(--text-muted);
}
"""
            with open(f, 'w', encoding='utf-8') as file:
                file.write(clean_content)
            print(f"Fixed {f}")
        else:
            print(f"Pattern not found in {f}")
    except Exception as e:
        print(f"Error processing {f}: {e}")
