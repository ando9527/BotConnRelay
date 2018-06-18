project = relay-ws-server
image = docker.kumay.net/$(project):latest
build:
	docker build -t $(image) .

push:
	docker push $(image)

all: build push

.PHONY: build push all