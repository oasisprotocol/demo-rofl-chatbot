FROM python:alpine3.17
ENV CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
WORKDIR /oracle
COPY . /oracle
RUN apk update && apk add python3-dev gcc libc-dev
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "main.py", "${CONTRACT_ADDRESS}"]
