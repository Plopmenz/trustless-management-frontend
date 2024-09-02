import { FC, useState } from "react"
import { Address, Hex, isAddress, PublicClient, zeroAddress } from "viem"

import { Action } from "@/types/action"
import { useAbi } from "@/hooks/useAbi"

import { AddressText } from "../text/address"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { FunctionSelector } from "./function-selector"

interface FunctionCallFormProps {
  publicClient: PublicClient
  onAddAction: (action: Action) => any
}
export const FunctionCallForm: FC<FunctionCallFormProps> = ({
  publicClient,
  onAddAction,
}) => {
  const [targetContract, setTargetContract] = useState<string>("")
  const {
    abi,
    isLoading: loadingAbi,
    isProxy,
    implementation,
  } = useAbi(targetContract as Address, publicClient)

  const actionEntered = (data: Hex, value: bigint) => {
    onAddAction({
      to: isAddress(targetContract) ? targetContract : zeroAddress,
      value,
      data,
    })
    setTargetContract("")
  }

  return (
    <div className="my-6">
      <div className="mb-3">
        <Label>Contract address</Label>
        <Input
          placeholder="0x1234..."
          value={targetContract}
          onChange={(e) => setTargetContract(e.target.value || "")}
        />
      </div>
      {loadingAbi ? (
        <p>Please wait...</p>
      ) : !targetContract ? (
        <p>Enter the address of the contract to call in a new action</p>
      ) : !isAddress(targetContract) ? (
        <p>The address of the contract is not valid</p>
      ) : !abi.length ? (
        <p>Cannot find any public interface for the given contract address</p>
      ) : (
        <div>
          <p className="mb-6 text-sm opacity-80">
            The given contract is a proxy of{" "}
            <AddressText>{implementation}</AddressText>
          </p>
          <FunctionSelector abi={abi} actionEntered={actionEntered} />
        </div>
      )}
    </div>
  )
}
