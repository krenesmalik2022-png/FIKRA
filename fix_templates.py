import re
import os

files = [
    r'c:\Users\Administrator\Documents\Desktop\AD1\html-css course\fikra\admin-dashboard.html',
    r'c:\Users\Administrator\Documents\Desktop\AD1\html-css course\fikra\org-dashboard.html'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def clean_var(match):
        var_content = match.group(1).replace('\n', '').strip()
        # Edge case: if there are commas in the match (like inside string methods), we still preserve it.
        return f'${{{var_content}}}'
        
    new_content = re.sub(r'\$\s+\{([^}]+)\}', clean_var, content)

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {os.path.basename(file_path)}')
    else:
        print(f'No issues found in {os.path.basename(file_path)}')
