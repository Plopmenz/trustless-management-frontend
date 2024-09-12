import { FC } from "react"
import { decodeFunctionData, formatUnits, parseAbi } from "viem"

import { Action } from "@/types/action"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface ShowActionProps {
  action: Action
}
export const ShowAction: FC<ShowActionProps> = ({ action }) => {
  const args = decodeFunctionData({
    abi: parseAbi(["function transfer(address to, uint256 amount)"]),
    data: action.data,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>USDT Transfer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <span>To: {args.args[0]}</span>
        <span>Amount: {formatUnits(args.args[1], 6)}</span>
      </CardContent>
    </Card>
  )
}