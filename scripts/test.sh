#!/usr/bin/env bash

set -ex

cd $(dirname $0)

./test-tutor-poc.sh

./test-tutorial.sh
