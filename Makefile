test:
	./node_modules/.bin/nodeunit test/*.js
	
docs:
	./node_modules/.bin/docco-husky  *.js lib
	
.PHONY: test docs

