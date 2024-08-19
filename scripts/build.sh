#!/bin/bash

# Bump version
npm version patch --git-tag-version false >/dev/null

npm pack
