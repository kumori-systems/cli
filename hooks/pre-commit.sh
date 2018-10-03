#!/bin/bash
_before="$(git status)"
npm run build
_after="$(git status)"
export COLOR_GREEN='\e[0;32m'

if [ "$_before" != "$_after" ]; then
  git add lib/*
  echo "Source files recompiled and new files staged for this commit"
fi
