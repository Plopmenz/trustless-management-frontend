"use client"

import { useState } from "react"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { encodeFunctionData, PublicClient } from "viem"
import { usePublicClient } from "wagmi"

import { Action } from "@/types/action"
import { usePerformTransaction } from "@/hooks/usePerformTransaction"

import { FunctionCallForm } from "../action/function-call-form"
import { ShowAction } from "../action/show-action"
import { AaveETHSupplyAction } from "../action/template/aave-eth-supply-action"
import { AaveUSDTBorrowAction } from "../action/template/aave-usdt-borrow-action"
import { ETHTransferAction } from "../action/template/eth-transfer-action"
import { SOpenMintAction } from "../action/template/sopen-mint-action"
import { USDCTransferAction } from "../action/template/usdc-transfer-action"
import { USDTTransferAction } from "../action/template/usdt-transfer-action"
import { WalletConnectAction } from "../action/walletconnect-action"
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
      <div className="flex flex-col gap-1">
        <span>Ashton wallet: 0xaAEE3682E94aE1A2D818EaC932b23a15D6cE76E0</span>
        <span>Greta wallet: 0x498c8Aa386f29a396296c8458ff79ea2533873C0</span>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xl">Add Actions</span>

        <WalletConnectAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />

        <FunctionCallForm
          publicClient={publicClient as PublicClient}
          onAddAction={(a) => setAction(actions.concat([a]))}
        />

        <USDTTransferAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
        <USDCTransferAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
        <ETHTransferAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
        <AaveETHSupplyAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
        <AaveUSDTBorrowAction
          onAddAction={(a) => setAction(actions.concat([a]))}
        />
        <SOpenMintAction onAddAction={(a) => setAction(actions.concat([a]))} />
      </div>
    </div>
  )
}
