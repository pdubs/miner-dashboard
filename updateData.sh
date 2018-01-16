#!/bin/bash

# continually runs updateData and retries as necessary until actually finished

until node updateData.js | tee /dev/stderr | grep -m 1 "COMPLETE"; do : ; done