test:
	./node_modules/.bin/nodeunit test/*.js
	
docs:
	./node_modules/.bin/docco-husky  lib bin examples
	
.PHONY: test docs

