import { FC, KeyboardEventHandler, useEffect, useState, Fragment, useRef } from 'react'
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
    state: { isConnected, isInteractingWithChain, authInfo },
    getPromptsAnswers: web3GetPromptsAnswers,
    ask: web3Ask,
    clear: web3Clear,
  } = useWeb3()
  const [isWaitingChatBot, setIsWaitingChatBot] = useState(false)
  const [conversation, setConversation] = useState<PromptsAnswers | null | undefined>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [promptValue, setPromptValue] = useState<string>('')
  const [promptValueError, setPromptValueError] = useState<string>()
  const [tempPrompt, setTempPrompt] = useState<string | null>(null)
  const retryAbortControllerRef = useRef<AbortController | null>()

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
    if (!authInfo) {
      setConversation(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInfo])

  useEffect(() => {
    if (retryAbortControllerRef.current && !retryAbortControllerRef.current.signal.aborted) {
      retryAbortControllerRef.current.abort()
      setIsWaitingChatBot(false)
      setTempPrompt(null)
    }

    if (isConnected) {
      fetchConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, authInfo])

  const handleAsk = async () => {
    if (isWaitingChatBot) return

    setPromptValueError(undefined)

    if (!promptValue) {
      setPromptValueError('Prompt is required!')

      return
    }

    retryAbortControllerRef.current = new AbortController()

    try {
      await web3Ask(promptValue)

      setIsWaitingChatBot(true)
      setTempPrompt(promptValue)
      setPromptValue('')

      const promptsAnswers = await retry(
        web3GetPromptsAnswers,
        _conversation => {
          // Take one prompt in the future, or take the latest one submitted
          const lastPromptId = Math.max(
            conversation?.prompts.length ?? 0,
            (_conversation?.prompts.length ?? 0) - 1
          )

          if (_conversation?.answers.find(({ promptId }) => lastPromptId === promptId)) {
            return _conversation
          }

          throw new Error('Conversation has not been updated!')
        },
        50,
        6000,
        retryAbortControllerRef.current?.signal
      )

      if (!retryAbortControllerRef.current?.signal.aborted) {
        setConversation(promptsAnswers)
        setTempPrompt(null)
        setPromptValue('')
      }
    } catch (ex) {
      if (!retryAbortControllerRef.current?.signal.aborted) {
        setPromptValue(promptValue)
        setPromptValueError((ex as Error).message)
      }
    } finally {
      setIsWaitingChatBot(false)
      retryAbortControllerRef.current = null
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
    const answerToPromptId = conversation?.answers?.find(({ promptId }) => promptId === i)

    return (
      <Fragment key={i}>
        <div className={StringUtils.clsx(classes.bubble, classes.me)}>
          <div>{prompt}</div>
        </div>
        {answerToPromptId && (
          <div className={classes.bubble}>
            <div>
              <Markdown>{answerToPromptId.answer}</Markdown>
            </div>
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
              {conversation === undefined && (
                <div className={StringUtils.clsx(classes.bubble, classes.alert)}>
                  <div>Approve signature request, in order to view conversation history</div>
                </div>
              )}
              {conversation && !conversation.prompts.length && !tempPrompt && (
                <div className={StringUtils.clsx(classes.bubble, classes.alert)}>
                  <div>No conversation history available</div>
                </div>
              )}
              {!!conversation?.prompts.length && conversation?.prompts.map(mapPrompts)}
              {tempPrompt && (
                <div className={StringUtils.clsx(classes.bubble, classes.me)}>
                  <div>{tempPrompt}</div>
                </div>
              )}
              {isWaitingChatBot && (
                <div className={StringUtils.clsx(classes.bubble, classes.loading)}>
                  <div>
                    <LoadingIcon />
                  </div>
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
