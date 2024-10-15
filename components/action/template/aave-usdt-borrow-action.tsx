import { FC, useState } from "react"
import { AavePoolContract } from "@/contracts/AavePool"
import { OpenmeshAdminContract } from "@/contracts/OpenmeshAdmin"
import { encodeFunctionData, parseUnits } from "viem"

import { Action } from "@/types/action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface AaveUSDTBorrowActionProps {
  onAddAction: (action: Action) => any
}
export const AaveUSDTBorrowAction: FC<AaveUSDTBorrowActionProps> = ({
  onAddAction,
}) => {
  const { toast } = useToast()
  const [amount, setAmount] = useState<string>("0")

  return (
    <div className="flex flex-col gap-3">
      <Label className="text-2xl">Aave USDT Borrow</Label>
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
            to: AavePoolContract.address,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: AavePoolContract.abi,
              functionName: "borrow",
              args: [
                "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                parseUnits(amount, 6),
                BigInt(2),
                0,
                OpenmeshAdminContract.address,
              ],
            }),
          })
        }}
      >
        Borrow USDT
      </Button>
    </div>
  )
}
