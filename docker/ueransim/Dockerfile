FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y \
    git \
    cmake \
    g++ \
    make \
    libsctp-dev \
    lksctp-tools \
    iproute2 \
    iputils-ping && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /ueransim

COPY UERANSIM/ .

RUN make

ENV PATH="/ueransim/build:${PATH}"

WORKDIR /config

CMD ["/bin/bash"]