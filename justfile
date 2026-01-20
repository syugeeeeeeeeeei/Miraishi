# justfile
set shell := ["bash", "-c"]

_default:
	@just -l

archive:
	@mkdir -p archive
	@git archive HEAD -o "archive/miraishi-$(date +%Y%m%d%H%M%S).zip"