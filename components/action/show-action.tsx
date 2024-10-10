import { FC } from "react"
import { EthFowardContract } from "@/contracts/EthFoward"
import { decodeFunctionData, formatEther, formatUnits, parseAbi } from "viem"

import { Action } from "@/types/action"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface ShowActionProps {
  action: Action
}
export const ShowAction: FC<ShowActionProps> = ({ action }) => {
  try {
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
  } catch {
    try {
      const args = decodeFunctionData({
        abi: EthFowardContract.abi,
        data: action.data,
      })

      return (
        <Card>
          <CardHeader>
            <CardTitle>ETH Transfer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <span>To: {args.args[0]}</span>
            <span>Amount: {formatEther(action.value)}</span>
          </CardContent>
        </Card>
      )
    } catch {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Custom action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <span>To: {action.to}</span>
            <span>Value: {formatEther(action.value)}</span>
            <span>Data: {action.data}</span>
          </CardContent>
        </Card>
      )
    }
  }
}
