import { FC, useState } from "react"
import { EthFowardContract } from "@/contracts/EthFoward"
import { encodeFunctionData, isAddress, parseEther } from "viem"

import { Action } from "@/types/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface ETHTransferActionProps {
  onAddAction: (action: Action) => any
}
export const ETHTransferAction: FC<ETHTransferActionProps> = ({
  onAddAction,
}) => {
  const { toast } = useToast()
  const [receiver, setReceiver] = useState<string>("")
  const [amount, setAmount] = useState<string>("0")

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-2xl">ETH Transfer</Label>
      <div>
        <Label>Receiver Address</Label>
        <Input
          value={receiver}
          onChange={(e) => setReceiver(e.target.value || "")}
        />
      </div>
      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value || "")}
        />
      </div>
      <Button
        className="max-w-48"
        onClick={() => {
          if (!isAddress(receiver)) {
            toast({
              title: "Error",
              description: `Invalid receiver address "${receiver}".`,
              variant: "destructive",
            })
            return
          }

          if (Number.isNaN(parseFloat(amount))) {
            toast({
              title: "Error",
              description: `Invalid amount "${amount}".`,
              variant: "destructive",
            })
            return
          }

          onAddAction({
            to: EthFowardContract.address,
            value: parseEther(amount),
            data: encodeFunctionData({
              abi: EthFowardContract.abi,
              functionName: "forward",
              args: [receiver],
            }),
          })
        }}
      >
        Add Transfer
      </Button>
    </div>
  )
}
