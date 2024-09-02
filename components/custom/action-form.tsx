"use client"

import { useState } from "react"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { encodeFunctionData, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { Action } from "@/types/action"
import { usePerformTransaction } from "@/hooks/usePerformTransaction"

import { FunctionCallForm } from "../action/function-call-form"
import { Button } from "../ui/button"
import { defaultChain } from "./web3-provider"

export function ActionForm() {
  const [actions, setAction] = useState<Action[]>([])
  const publicClient = usePublicClient({ chainId: defaultChain.id })
  const { performTransaction, performingTransaction } = usePerformTransaction({
    chainId: defaultChain.id,
  })

  return (
    <div>
      <FunctionCallForm
        publicClient={publicClient as PublicClient}
        onAddAction={(a) => setAction(actions.concat([a]))}
      />
      <Button
        onClick={() => {
          performTransaction({
            transaction: async () => {
              return {
                address: OpenmeshAdminContract.address,
                abi: OpenmeshAdminContract.abi,
                functionName: "multicall",
                args: [
                  actions.map((a) =>
                    encodeFunctionData({
                      abi: OpenmeshAdminContract.abi,
                      functionName: "performCall",
                      args: [a.to, a.value, a.data],
                    })
                  ),
                ],
              }
            },
          })
        }}
        disabled={performingTransaction}
      >
        Send
      </Button>
    </div>
  )
}
