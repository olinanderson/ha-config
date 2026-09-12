#!/usr/bin/env python
"""Crude PDF text extractor: inflate FlateDecode streams and pull text-showing operators.
No external deps (poppler/pdftotext unavailable here).

Usage: python extract_pdf_text.py <file.pdf> [keyword ...]
"""
import sys
import re
import zlib

path = sys.argv[1]
keywords = sys.argv[2:] or ["volt", "profile", "half", "absorption", "parallel", "lithium"]

data = open(path, "rb").read()
chunks = []
for m in re.finditer(rb"stream\r?\n", data):
    start = m.end()
    end = data.find(b"endstream", start)
    if end < 0:
        continue
    try:
        inflated = zlib.decompress(data[start:end])
    except Exception:
        continue
    pieces = []
    for tm in re.finditer(rb"\((?:\\.|[^\\()])*\)", inflated):
        raw = tm.group(0)[1:-1]
        pieces.append(raw.decode("latin-1"))
    if pieces:
        chunks.append(" ".join(pieces))

full = "\n".join(chunks)


def unescape_octal(s):
    # \ddd octal escapes -> chars. Done without a regex-replace callback to avoid
    # pattern-escaping pitfalls.
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 3 < len(s) and s[i + 1:i + 4].isdigit():
            try:
                out.append(chr(int(s[i + 1:i + 4], 8)))
                i += 4
                continue
            except ValueError:
                pass
        out.append(s[i])
        i += 1
    return "".join(out)


full = unescape_octal(full)
full = full.replace("\\(", "(").replace("\\)", ")")
print(f"extracted chars: {len(full)}")

for kw in keywords:
    hits = [m.start() for m in re.finditer(re.escape(kw), full, re.IGNORECASE)]
    print(f"\n{'='*90}\n### {kw!r} — {len(hits)} hits")
    shown = 0
    last = -9999
    for h in hits:
        if h - last < 200:
            continue
        last = h
        seg = full[max(0, h - 220):h + 320]
        seg = " ".join(seg.split())
        print(f"  ...{seg}...")
        shown += 1
        if shown >= 6:
            break
