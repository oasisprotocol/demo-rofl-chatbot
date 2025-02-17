import { FC, useEffect, useState } from 'react'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import classes from './index.module.css'
import { useWeb3 } from '../../hooks/useWeb3'
import { RevealInput } from '../../components/Input/RevealInput'
import { PromptsAnswers } from '../../types'
import { StringUtils } from '../../utils/string.utils'

export const HomePage: FC = () => {
  const {
    state: { isConnected, isSapphire, isInteractingWithChain, isWaitingChatBot, account },
    getPromptsAnswers: web3GetPromptsAnswers,
    ask: web3Ask,
    clear: web3Clear,
  } = useWeb3()
  const [message, setMessage] = useState<PromptsAnswers | null>(null)
  const [messageValue, setMessageValue] = useState<string>('')
  const [messageRevealLabel, setMessageRevealLabel] = useState<string>()
  const [messageError, setMessageError] = useState<string | null>(null)
  const [messageValueError, setMessageValueError] = useState<string>()
  const [hasBeenRevealedBefore, setHasBeenRevealedBefore] = useState(false)

  const fetchMessage = async () => {
    setMessageError(null)
    setMessageRevealLabel('Please sign message and wait...')

    try {
      let promptsAnswers = await web3GetPromptsAnswers()
      promptsAnswers.htmlContent = '';
      for (let i=0; i<promptsAnswers.prompts.length; i++) {
        promptsAnswers.htmlContent += promptsAnswers.prompts[i]+"<br/>"
        if (i<promptsAnswers.answers.length) {
          promptsAnswers.htmlContent += promptsAnswers.answers[i] + "<br/>"
        }
      }
      setMessage(promptsAnswers)
      setMessageRevealLabel(undefined)
      setHasBeenRevealedBefore(true)

      return Promise.resolve()
    } catch (ex) {
      setMessageError((ex as Error).message)
      setMessageRevealLabel('Something went wrong! Please try again...')

      throw ex
    }
  }

  useEffect(() => {
    if (isSapphire === null) {
      return
    }

    if (!isSapphire) {
      fetchMessage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSapphire])

  const handleRevealChanged = (): Promise<void> => {
    if (!isSapphire) {
      return Promise.resolve(void 0)
    }
    return fetchMessage()
  }

  const handleAsk = async () => {
    setMessageValueError(undefined)

    if (!messageValue) {
      setMessageValueError('Message is required!')

      return
    }

    try {
      await web3Ask(messageValue)
      setMessageValue('')

      if (!hasBeenRevealedBefore) {
        setMessage(null)
        setMessageRevealLabel('Tap to reveal')
      } else {
        fetchMessage()
      }
    } catch (ex) {
      setMessageValueError((ex as Error).message)
    }
  }

  const handleClear = async () => {
    try {
      await web3Clear()
      setMessage(null)
    } catch (ex) {
      setMessageValueError((ex as Error).message)
    }
  }

  return (
    <div className={classes.homePage}>
      <Card header={<h2>C10l ChatBot 🤖</h2>}>
        {isConnected && (
          <>
            <div className={classes.activeMessageText}>
              <h3>Conversation history</h3>
            </div>
            {message?.prompts.map((object, i) => <div>{object}<div style={{marginLeft: 50 + 'px'}}>{(i<message?.answers.length) ? message?.answers[i].answer: ''}</div></div>)}
            {isSapphire && !message && (
            <RevealInput
              disabled
              reveal={false}
              revealLabel={!!isSapphire && !!message ? undefined : messageRevealLabel}
              onRevealChange={() => {
                if (!isInteractingWithChain) {
                  return handleRevealChanged()
                }

                return Promise.reject()
              }}
            />
            )}
            {messageError && <p className="error">{StringUtils.truncate(messageError)}</p>}
            <div className={classes.setMessageText}>
              <h3>Ask me anything</h3>
            </div>
            <Input
              value={messageValue}
              onChange={setMessageValue}
              error={messageValueError}
              disabled={isInteractingWithChain}
            />
            <div className={classes.setMessageActions}>
              <Button disabled={isInteractingWithChain || isWaitingChatBot} onClick={handleAsk}>
                {isInteractingWithChain ? 'Submitting...' : isWaitingChatBot ? 'Waiting for answer' : 'Ask'}
              </Button>
              <Button disabled={isInteractingWithChain || isWaitingChatBot} onClick={handleClear}>
                Clear
              </Button>
            </div>
          </>
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
