#!/usr/bin/env python
import os, sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from config.tls import enable_system_trust_store

enable_system_trust_store()

from vela.cli.commands import CommandRunner


def main():
    CommandRunner().execute(sys.argv[1:])


if __name__ == "__main__":
    main()
