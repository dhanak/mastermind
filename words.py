#!env python
import json
import codecs
import re
import sys

words = []

def process(fn):
    page = False
    rx = re.compile(r'\[\[([a-záéíóöőüű]{5})\]\]')
    with open(fn, "r") as f:
        for line in f:
            if "<title>Index:Magyar/" in line:
                page = True
            elif "</page>" in line:
                page = False
            elif page:
                words.extend(rx.findall(line))

def main():
    if len(sys.argv) == 1:
        print(sys.argv[0], "<wikidump.xml>")
        exit()
        
    process(sys.argv[1])
    words.sort()
    print(words[:100])
    with open("words.json", "w") as f:
        json.dump(words, f, separators=(',', ':'))

if __name__ == "__main__":
    main()
