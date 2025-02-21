import { FC, KeyboardEventHandler, useEffect, useState, Fragment } from 'react'
import Markdown from 'react-markdown'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import classes from './index.module.css'
import { useWeb3 } from '../../hooks/useWeb3'
import { PromptsAnswers } from '../../types'
import { StringUtils } from '../../utils/string.utils'
import { DeleteIcon } from '../../components/icons/DeleteIcon'
import { SendIcon } from '../../components/icons/SendIcon'
import { ScrollToBottom } from '../../components/ScrollToBottom'
import { LoadingIcon } from '../../components/icons/LoadingIcon'
import { retry } from '../../utils/retry'

export const HomePage: FC = () => {
  const {
    state: { isConnected, isInteractingWithChain },
    getPromptsAnswers: web3GetPromptsAnswers,
    ask: web3Ask,
    clear: web3Clear,
  } = useWeb3()
  const [isWaitingChatBot, setIsWaitingChatBot] = useState(false)
  const [conversation, setConversation] = useState<PromptsAnswers | null>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [promptValue, setPromptValue] = useState<string>('')
  const [promptValueError, setPromptValueError] = useState<string>()
  const [tempPrompt, setTempPrompt] = useState<string | null>(null)

  const fetchConversation = async () => {
    setConversationError(null)

    try {
      const promptsAnswers = await web3GetPromptsAnswers()
      setConversation(promptsAnswers)

      return promptsAnswers
    } catch (ex) {
      setConversationError((ex as Error).message)

      throw ex
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const handleAsk = async () => {
    if (isWaitingChatBot) return

    setPromptValueError(undefined)

    if (!promptValue) {
      setPromptValueError('Prompt is required!')

      return
    }

    try {
      await web3Ask(promptValue)

      setIsWaitingChatBot(true)
      setTempPrompt(promptValue)
      setPromptValue('')

      const promptsAnswers = await retry(
        web3GetPromptsAnswers,
        _conversation => {
          if (_conversation.answers.length > (conversation?.answers.length ?? 0)) {
            return _conversation
          }

          throw new Error('Conversation has not been updated!')
        },
        10,
        5000
      )
      setConversation(promptsAnswers)

      setTempPrompt(null)
      setPromptValue('')
    } catch (ex) {
      setPromptValue(promptValue)
      setPromptValueError((ex as Error).message)
    } finally {
      setIsWaitingChatBot(false)
    }
  }

  const handleTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = e => {
    const { shiftKey, key } = e

    if (key === 'Enter' && !shiftKey) {
      handleAsk()
    }
  }

  const handleClear = async () => {
    try {
      await web3Clear()
      fetchConversation()
    } catch (ex) {
      setPromptValueError((ex as Error).message)
    }
  }

  const mapPrompts = (prompt: string, i: number) => {
    return (
      <Fragment key={i}>
        <div className={StringUtils.clsx(classes.bubble, classes.me)}>{prompt}</div>
        {i < (conversation?.answers?.length ?? 0) && (
          <div className={classes.bubble}>
            <Markdown>{conversation?.answers[i].answer}</Markdown>
          </div>
        )}
      </Fragment>
    )
  }

  return (
    <div className={classes.homePage}>
      <Card header={<h2>C10l ChatBot 🤖</h2>}>
        {isConnected && (
          <div className={classes.cardContent}>
            <div className={classes.conversation}>
              {!conversation?.prompts.length && !tempPrompt && (
                <div className={StringUtils.clsx(classes.bubble, classes.alert)}>
                  No conversation history available
                </div>
              )}
              {!!conversation?.prompts.length && conversation?.prompts.map(mapPrompts)}
              {tempPrompt && <div className={StringUtils.clsx(classes.bubble, classes.me)}>{tempPrompt}</div>}
              {isWaitingChatBot && (
                <div className={StringUtils.clsx(classes.bubble, classes.loading)}>
                  <LoadingIcon />
                </div>
              )}
              <ScrollToBottom />
            </div>

            <div className={classes.cardContentInput}>
              <textarea
                placeholder="Ask your question here..."
                className={classes.textareaInput}
                value={promptValue}
                onChange={({ target: { value } }) => setPromptValue(value)}
                onKeyDown={handleTextareaKeyDown}
                disabled={isInteractingWithChain}
              />
              <div className={classes.promptActions}>
                <Button
                  size="small"
                  disabled={isInteractingWithChain || isWaitingChatBot}
                  onClick={handleAsk}
                >
                  <SendIcon />
                </Button>
                <Button
                  size="small"
                  color="danger"
                  disabled={isInteractingWithChain || isWaitingChatBot}
                  onClick={handleClear}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </div>
            {promptValueError && <p className="error">{StringUtils.truncate(promptValueError)}</p>}
            {conversationError && <p className="error">{StringUtils.truncate(conversationError)}</p>}
          </div>
        )}
        {!isConnected && (
          <>
            <div className={classes.connectWalletText}>
              <p>Please connect your wallet to get started.</p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
