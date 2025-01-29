#!/bin/sh

PT=sapphire
NET=localnet

oasis net set-chain-context $NET
oasis acc allow paratime:$PT 20000 --account test:alice --network $NET -y
oasis acc deposit 20000 test:dave --account test:alice --paratime $PT --gas-price 0 --network $NET -y
