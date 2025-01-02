"use client"

import { useEffect, useState } from "react"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { SignClient } from "@walletconnect/sign-client"
import { SignClient as SignClientType } from "@walletconnect/sign-client/dist/types/client"

import { Action } from "@/types/action"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

import { useToast } from "../ui/use-toast"

const chainId = 1
const address = OpenmeshAdminContract.address

interface WalletConnectActionProps {
  onAddAction: (action: Action) => any
}

export function WalletConnectAction({ onAddAction }: WalletConnectActionProps) {
  const { toast } = useToast()

  const accounts = [`eip155:${chainId}:${address}`]
  const [signClient, setSignClient] = useState<SignClientType | undefined>()
  const [sessionTopic, setSessionTopic] = useState<string[]>([])

  const setSessionProposalHandler = (signClient: SignClientType) => {
    signClient.on("session_proposal", async (event) => {
      console.log("session_proposal", event)
      const UNSUPPORTED_CHAINS = 5100

      let trySwitchToChain: string | undefined
      const wantToConnectAsChains =
        event.params.requiredNamespaces?.eip155?.chains
      if (wantToConnectAsChains) {
        if (!wantToConnectAsChains.includes(`eip155:${chainId}`)) {
          if (!wantToConnectAsChains.includes("eip155:1")) {
            console.error("dApp does not support Ethereum")
            toast({
              title: "Error",
              description: "dApp does not support Ethereum",
              variant: "destructive",
            })
            await signClient.reject({
              id: event.id,
              reason: {
                code: UNSUPPORTED_CHAINS,
                message: "Only Ethereum is supported currently.",
              },
            })
            return
          }

          trySwitchToChain = `eip155:${chainId}`
        }
      }

      const { acknowledged } = await signClient.approve({
        id: event.id,
        namespaces: {
          eip155: {
            accounts: accounts.concat(
              "eip155:1:0x0000000000000000000000000000000000000000"
            ),
            chains: ["eip155:1", `eip155:${chainId}`],
            methods: [
              "eth_sendTransaction",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4",
            ],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      })

      // Optionally await acknowledgement from dapp
      const session = await acknowledged()

      if (trySwitchToChain) {
        try {
          await signClient.emit({
            topic: session.topic,
            event: {
              name: "chainChanged",
              data: `eip155:${chainId}`,
            },
            chainId: `eip155:${chainId}`,
          })
        } catch (err) {
          console.error("Couldnt switch to supported chain")
          toast({
            title: "Error",
            description: "Couldnt switch to supported chain",
            variant: "destructive",
          })

          await signClient.disconnect({
            topic: session.topic,
            reason: {
              code: UNSUPPORTED_CHAINS,
              message: "Only Ethereum is supported currently.",
            },
          })
          return
        }
      }

      setSessionTopic(sessionTopic.concat([session.topic]))
    })
  }

  const setSessionRequestHandler = (signClient: SignClientType) => {
    signClient.on("session_request", async (event) => {
      console.log("session_request", event)
      if (event.params.request.method === "eth_sendTransaction") {
        if (
          event.params.request.params.at(0)?.from?.toLowerCase() !==
          address.toLowerCase()
        ) {
          // We cannot decide based on just address what transactionMethod / route the user wishes to take
          // However we could use "lastSelected" or something
          // Ideally prompt the user which route they'd like to use (show a list of incomming transaction with a dropdown for signer)
          console.warn(
            "Transaction request is for",
            event.params.request.params.at(0).from,
            "but we have",
            address,
            "selected"
          )
        }

        try {
          const args = event.params.request.params[0]
          const transactionRaw = {
            to: args.to,
            value: args.value ?? BigInt(0),
            data: args.data ?? "0x00",
          }

          console.log("added walletconnect tx", transactionRaw)
          onAddAction(transactionRaw)

          signClient.respond({
            topic: event.topic,
            response: {
              id: event.id,
              jsonrpc: "2.0",
              result:
                "0x4af6075caf8d1b210e407a2f28c0360b35f609e8fc5a33ca120573e20621d135",
            },
          })
        } catch (err: any) {
          console.error(err)

          const USER_REJECTED_REQUEST_CODE = 4001
          signClient.respond({
            topic: event.topic,
            response: {
              id: event.id,
              jsonrpc: "2.0",
              error: {
                code: USER_REJECTED_REQUEST_CODE, // Most likely "error"
                message: err?.message ?? "Unknown error",
              },
            },
          })
        }
      } else {
        const INVALID_METHOD_ERROR_CODE = 1001
        signClient.respond({
          topic: event.topic,
          response: {
            id: event.id,
            jsonrpc: "2.0",
            error: {
              code: INVALID_METHOD_ERROR_CODE,
              message: "Method not supported.",
            },
          },
        })
      }
    })
  }

  const setSessionDeleteHandler = (signClient: SignClientType) => {
    signClient.on("session_delete", async (event) => {
      console.log("session_delete", event)
      setSessionTopic(sessionTopic.filter((t) => t === event.topic))
    })
  }

  useEffect(() => {
    const fetch = async () => {
      const _signClient = await SignClient.init({
        projectId: "3b87f6929a35662250ba4cd8ac9ef56b",
        // optional parameters
        // relayUrl: "<YOUR RELAY URL>",
        metadata: {
          name: "Trustless Management Signer",
          description: siteConfig.description,
          url: "https://trustless.management/",
          icons: ["https://trustless.management/favicon.ico"],
        },
      })

      setSessionProposalHandler(_signClient)

      _signClient.on("session_event", (event) => {
        console.log("session_event", event)
      })

      setSessionRequestHandler(_signClient)

      _signClient.on("session_ping", (event) => {
        console.log("session_ping", event)
      })

      setSessionDeleteHandler(_signClient)

      setSignClient(_signClient)
    }

    fetch().catch(console.error)
  }, [])

  useEffect(() => {
    if (!signClient) {
      return
    }

    signClient.removeAllListeners("session_proposal")
    setSessionProposalHandler(signClient)

    for (let i = 0; i < sessionTopic.length; i++) {
      signClient
        .emit({
          topic: sessionTopic[i],
          event: {
            name: "accountsChanged",
            data: accounts,
          },
          chainId: `eip155:${chainId}`,
        })
        .catch(console.error)
    }
  }, [accounts, signClient])

  useEffect(() => {
    if (!signClient) {
      return
    }

    signClient.removeAllListeners("session_request")
    setSessionRequestHandler(signClient)
  }, [signClient])

  useEffect(() => {
    if (!signClient) {
      return
    }

    signClient.removeAllListeners("session_delete")
    setSessionDeleteHandler(signClient)
  }, [sessionTopic, signClient])

  const buttonClick = async () => {
    if (!signClient) {
      window.alert("Wallet connect not ready (yet).")
      return
    }

    const wcUri = window.prompt("Enter walletconnect url (wc://)")
    if (wcUri) {
      await signClient.core.pairing.pair({ uri: wcUri })
    }
  }

  return signClient && <Button onClick={buttonClick}>WC</Button>
}
