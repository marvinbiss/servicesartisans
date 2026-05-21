.PHONY: install test all dry-run-all clean

install:
	@echo "Zero npm deps required (Node 18+ native APIs only)"

test:
	node --test ./test/*.test.mjs

all: dry-run-all

dry-run-all:
	node bin/submit-all.mjs --dry-run

clean:
	rm -rf manifest-out/*
