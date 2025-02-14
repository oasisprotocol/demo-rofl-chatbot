// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {Answer, ChatBot} from "../src/ChatBot.sol";
import {Subcall} from "@oasisprotocol/sapphire-contracts/contracts/Subcall.sol";

contract ChatBotTest is Test {
    ChatBot public chatBot;
    address public user;
    address public _oracle;
    string public domain;

    function setUp() public {
        domain = "example.com";
        _oracle = address(0x123);
        user = address(0x456);
        bytes21 roflAppID = bytes21(0);
        chatBot = new ChatBot(domain, roflAppID, _oracle);
    }

    function test_appendPrompt() public {
        vm.startPrank(user);
        chatBot.appendPrompt("Hello");
        string[] memory prompts = chatBot.getPrompts("", user);
        assertEq(prompts.length, 1);
        assertEq(prompts[0], "Hello");
        vm.stopPrank();
    }

    function test_clearPrompt() public {
        vm.startPrank(user);
        chatBot.appendPrompt("Hello");
        chatBot.clearPrompt();
        string[] memory prompts = chatBot.getPrompts("", user);
        Answer[] memory answers = chatBot.getAnswers("", user);
        assertEq(prompts.length, 0);
        assertEq(answers.length, 0);
        vm.stopPrank();
    }

    function test_submitAnswer() public {
        vm.startPrank(user);
        chatBot.appendPrompt("Hello");
        vm.stopPrank();

        vm.startPrank(_oracle);
        chatBot.submitAnswer("Test answer", 0, user);
        Answer[] memory answers = chatBot.getAnswers("", user);
        assertEq(answers.length, 1);
        assertEq(answers[0].answer, "Test answer");
        assertEq(answers[0].promptId, 0);

        vm.expectRevert(ChatBot.PromptAlreadyAnswered.selector);
        chatBot.submitAnswer("Test answer too late", 0, user);
        vm.stopPrank();
    }

    function test_Revert_unauthorizedPromptAccess() public {
        vm.expectRevert(ChatBot.UnauthorizedUserOrOracle.selector);
        address unauthorizedUser = address(0);
        vm.startPrank(unauthorizedUser);
        chatBot.getPrompts("", user);
        vm.stopPrank();
    }
}
