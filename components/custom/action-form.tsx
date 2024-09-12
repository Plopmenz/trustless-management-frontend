"use client"

import { useState } from "react"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { encodeFunctionData, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { Action } from "@/types/action"
import { usePerformTransaction } from "@/hooks/usePerformTransaction"

import { FunctionCallForm } from "../action/function-call-form"
import { ShowAction } from "../action/show-action"
import { USDTTransferAction } from "../action/template/usdt-transfer-action"
import { Button } from "../ui/button"
import { defaultChain } from "./web3-provider"

export function ActionForm() {
  const [actions, setAction] = useState<Action[]>([])
  const publicClient = usePublicClient({ chainId: defaultChain.id })
  const { performTransaction, performingTransaction } = usePerformTransaction({
    chainId: defaultChain.id,
  })

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <span className="text-xl">Current Actions</span>
        {actions.map((a, i) => (
          <ShowAction key={i} action={a} />
        ))}
        <Button
          className="max-w-48"
          onClick={() => {
            performTransaction({
              simulate: false,
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
      <div className="flex flex-col gap-3">
        <span className="text-xl">Add Actions</span>
        {/* <FunctionCallForm
        publicClient={publicClient as PublicClient}
        onAddAction={(a) => setAction(actions.concat([a]))}
      /> */}
        <USDTTransferAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
      </div>
    </div>
  )
}
