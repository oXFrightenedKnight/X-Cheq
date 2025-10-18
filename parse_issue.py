from bs4 import BeautifulSoup
with open('issue1813.html', 'r', encoding='utf-8', errors='ignore') as f:
    soup = BeautifulSoup(f, 'html.parser')
for comment in soup.select('article'):
    text = comment.get_text('\n', strip=True)
    if 'Object.defineProperty' in text or 'workerSrc' in text or 'Vite' in text or 'entry' in text:
        author = comment.select_one('a.author')
        author_name = author.get_text(strip=True) if author else 'unknown'
        print('---')
        print(author_name)
        print(text)

