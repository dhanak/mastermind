#!/bin/sh
grep -oP '^[a-záéíóöőúüű]{5}(?=(/|\s))' /usr/share/hunspell/hu_HU.dic | sort | uniq
