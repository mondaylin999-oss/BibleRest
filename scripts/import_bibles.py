"""Convert official Wordproject offline text packs to plain structured JSON.
Usage: python scripts/import_bibles.py path/to/kj_new.zip path/to/my_new.zip
Text only: no website scripts, styling, tracking, or executable content is retained.
"""
import sys,re,json,zipfile,html
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def clean(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]*>','',s))).strip()
def convert(path):
 result=[]
 with zipfile.ZipFile(path) as z:
  entries={}
  for n in z.namelist():
   m=re.search(r'/(\d{2})/(\d+)\.htm$',n)
   if m: entries[(int(m[1]),int(m[2]))]=n
  for b in range(1,67):
   chapters=[];name=''
   for (book,c),entry in sorted(entries.items()):
    if book!=b:continue
    s=z.read(entry).decode('utf-8-sig',errors='replace')
    if c==1:name=clean(re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S)[1])
    section=s[s.index('id="textBody"'):];section=section[:section.index('</div>')]
    verses=[]
    matches=list(re.finditer(r'<span\s+class="verse"\s+id="(\d+)"[^>]*>.*?</span>',section,re.S))
    for i,m in enumerate(matches):
     body=section[m.end():matches[i+1].start() if i+1<len(matches) else (section.find('</p>',m.end()) if '</p>' in section[m.end():] else len(section))]
     verses.append({'n':int(m[1]),'text':clean(body)})
    assert verses and all(v['text'] and '\ufffd' not in v['text'] for v in verses),(b,c)
    assert c==len(chapters)+1,(b,c)
    chapters.append(verses)
   assert chapters,b
   result.append({'id':b,'name':name,'chapters':chapters})
 return result
if __name__=='__main__':
 out=root/'public'/'data';out.mkdir(parents=True,exist_ok=True)
 catalog=[]
 for lang,path in zip(['en','my'],sys.argv[1:]):
  data=convert(path)
  (out/f'{lang}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf8')
  print(lang,len(data),sum(len(b['chapters']) for b in data),sum(len(c) for b in data for c in b['chapters']))
  for i,b in enumerate(data):
   if lang=='en':catalog.append({'id':b['id'],'en':b['name'],'chapters':len(b['chapters'])})
   else:catalog[i]['my']=b['name']
 (root/'lib'/'books.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf8')



