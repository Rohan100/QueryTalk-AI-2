import os
import re

def html_to_jsx(html_content):
    content = html_content.replace('class=', 'className=')
    content = content.replace('for=', 'htmlFor=')
    content = content.replace('<!--', '{/*')
    content = content.replace('-->', '*/}')
    
    # Self-closing tags
    content = re.sub(r'<input([^>]+?)(?<!/)>', r'<input\1 />', content)
    content = re.sub(r'<img([^>]+?)(?<!/)>', r'<img\1 />', content)
    content = re.sub(r'<hr([^>]+?)(?<!/)>', r'<hr\1 />', content)
    content = re.sub(r'<br([^>]+?)(?<!/)>', r'<br\1 />', content)
    
    # Fix stroke-width for SVGs if any
    content = content.replace('stroke-width=', 'strokeWidth=')
    content = content.replace('stroke-linecap=', 'strokeLinecap=')
    content = content.replace('stroke-linejoin=', 'strokeLinejoin=')
    content = content.replace('fill-rule=', 'fillRule=')
    content = content.replace('clip-rule=', 'clipRule=')
    
    return content

files = ['QueryTalk_AI_-_Connect_Database.html', 'QueryTalk_AI_-_Login.html', 'QueryTalk_AI_-_Chat_Dashboard.html']

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    body_start = html.find('<body')
    if body_start != -1:
        body_start = html.find('>', body_start) + 1
        body_end = html.find('</body>')
        body_content = html[body_start:body_end].strip()
        
        jsx = html_to_jsx(body_content)
        
        comp_name = file.replace('QueryTalk_AI_-_', '').replace('.html', '').replace('_', '')
        if comp_name == "ConnectDatabase":
            comp_name = "ConnectDatabase"
        
        out_path = f"../frontend/src/components/{comp_name}Stitch.jsx"
        with open(out_path, 'w', encoding='utf-8') as out:
            out.write(f"import React from 'react';\n\nexport default function {comp_name}Stitch() {{\n  return (\n    <div className=\"font-body-sm text-body-sm antialiased overflow-hidden h-screen w-screen flex items-center justify-center relative\">\n{jsx}\n    </div>\n  );\n}}\n")
