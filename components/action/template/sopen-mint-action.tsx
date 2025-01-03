import { FC, useState } from "react"
import { encodeFunctionData, isAddress, parseAbi, parseUnits } from "viem"

import { Action } from "@/types/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface SOpenMintActionProps {
  onAddAction: (action: Action) => any
}
export const SOpenMintAction: FC<SOpenMintActionProps> = ({ onAddAction }) => {
  const { toast } = useToast()
  const [receiver, setReceiver] = useState<string>("")
  const [amount, setAmount] = useState<string>("0")

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-2xl">sOPEN Mint</Label>
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
            to: "0xc7b10907033Ca6e2FC00FCbb8CDD5cD89f141384",
            value: BigInt(0),
            data: encodeFunctionData({
              abi: parseAbi(["function mint(address account, uint256 amount)"]),
              functionName: "mint",
              args: [receiver, parseUnits(amount, 18)],
            }),
          })
        }}
      >
        Add Mint
      </Button>
    </div>
  )
}
