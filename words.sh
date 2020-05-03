#!/bin/sh
grep -oP '^[a-záéíóöőúüű]{5}(?=/)' /usr/share/hunspell/hu_HU.dic | sort | uniq
