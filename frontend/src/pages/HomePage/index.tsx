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
import { RevealContent } from '../../components/RevealContent'
import { ScrollToBottom } from '../../components/ScrollToBottom'
import { LoadingIcon } from '../../components/icons/LoadingIcon'

export const HomePage: FC = () => {
  const {
    state: { isConnected, isSapphire, isInteractingWithChain, isWaitingChatBot },
    getPromptsAnswers: web3GetPromptsAnswers,
    ask: web3Ask,
    clear: web3Clear,
  } = useWeb3()
  const [conversation, setConversation] = useState<PromptsAnswers | null>(null)
  const [conversationRevealLabel, setConversationRevealLabel] = useState<string>()
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [promptValue, setPromptValue] = useState<string>('')
  const [promptValueError, setPromptValueError] = useState<string>()
  const [hasBeenRevealedBefore, setHasBeenRevealedBefore] = useState(false)
  const [tempPrompt, setTempPrompt] = useState<string | null>(null)

  const fetchConversation = async () => {
    setConversationError(null)
    setConversationRevealLabel('Please sign message and wait...')

    try {
      const promptsAnswers = await web3GetPromptsAnswers()
      setConversation(promptsAnswers)
      setConversationRevealLabel(undefined)
      setHasBeenRevealedBefore(true)

      return Promise.resolve()
    } catch (ex) {
      setConversationError((ex as Error).message)
      setConversationRevealLabel('Something went wrong! Please try again...')

      throw ex
    }
  }

  useEffect(() => {
    if (isSapphire === null) {
      return
    }

    if (!isSapphire) {
      fetchConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSapphire])

  const handleRevealChanged = (): Promise<void> => {
    if (!isSapphire) {
      return Promise.resolve(void 0)
    }
    return fetchConversation()
  }

  const handleAsk = async () => {
    setPromptValueError(undefined)

    if (!promptValue) {
      setPromptValueError('Prompt is required!')

      return
    }

    try {
      await web3Ask(promptValue, () => {
        setTempPrompt(promptValue)
        setPromptValue('')
      })
      setTempPrompt(null)
      setPromptValue('')

      if (!hasBeenRevealedBefore) {
        setConversation(null)
        setConversationRevealLabel('Conversation history is inaccessible, sign a message to reveal it...')
      } else {
        fetchConversation()
      }
    } catch (ex) {
      setPromptValue(promptValue)
      setPromptValueError((ex as Error).message)
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
            <RevealContent
              className={classes.revealConversation}
              revealLabel={!!isSapphire && !!conversation ? undefined : conversationRevealLabel}
              onRevealChange={() => {
                if (!isInteractingWithChain) {
                  return handleRevealChanged()
                }

                return Promise.reject()
              }}
            >
              <div className={classes.conversation}>
                {!conversation?.prompts.length && !tempPrompt && (
                  <div className={StringUtils.clsx(classes.bubble, classes.alert)}>
                    No conversation history available
                  </div>
                )}
                {!!conversation?.prompts.length && conversation?.prompts.map(mapPrompts)}
                {tempPrompt && (
                  <div className={StringUtils.clsx(classes.bubble, classes.me)}>{tempPrompt}</div>
                )}
                {isWaitingChatBot && (
                  <div className={StringUtils.clsx(classes.bubble, classes.loading)}>
                    <LoadingIcon />
                  </div>
                )}
                <ScrollToBottom />
              </div>
            </RevealContent>

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
