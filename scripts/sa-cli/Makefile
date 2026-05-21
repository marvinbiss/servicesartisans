.PHONY: install test smoke

install:
	cd $(CURDIR) && npm install --no-audit --no-fund || true

test:
	node --test "test/*.test.mjs"

smoke:
	node bin/sa-rge-os.mjs --help
	node bin/sa-rge-os.mjs --version
