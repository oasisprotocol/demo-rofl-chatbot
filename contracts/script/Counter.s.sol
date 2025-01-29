// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ChatBot} from "../src/ChatBot.sol";

contract ChatBotScript is Script {
    ChatBot public chatBot;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // TODO
        chatBot = new ChatBot("example.com", hex"000000000000000000000000000000000000000000", address(0));

        vm.stopBroadcast();
    }
}
