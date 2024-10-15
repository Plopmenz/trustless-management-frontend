import { FC, useState } from "react"
import { AaveWrappedTokenGatewayV3Contract } from "@/contracts/AaveWrappedTokenGatewayV3"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { encodeFunctionData, parseEther } from "viem"

import { Action } from "@/types/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface AaveETHSupplyActionProps {
  onAddAction: (action: Action) => any
}
export const AaveETHSupplyAction: FC<AaveETHSupplyActionProps> = ({
  onAddAction,
}) => {
  const { toast } = useToast()
  const [amount, setAmount] = useState<string>("0")

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-2xl">Aave ETH Supply</Label>
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
          if (Number.isNaN(parseFloat(amount))) {
            toast({
              title: "Error",
              description: `Invalid amount "${amount}".`,
              variant: "destructive",
            })
            return
          }

          onAddAction({
            to: AaveWrappedTokenGatewayV3Contract.address,
            value: parseEther(amount),
            data: encodeFunctionData({
              abi: AaveWrappedTokenGatewayV3Contract.abi,
              functionName: "depositETH",
              args: [
                "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951",
                OpenmeshAdminContract.address,
                0,
              ],
            }),
          })
        }}
      >
        Supply ETH
      </Button>
    </div>
  )
}
