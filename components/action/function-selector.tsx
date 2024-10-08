import { useEffect, useState } from "react"
import { decodeCamelCase } from "@/utils/case"
import { InputValue } from "@/utils/input-values"
import { AbiFunction } from "abitype"
import { encodeFunctionData, Hex } from "viem"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useToast } from "../ui/use-toast"
import { InputParameter } from "./input-parameter"

interface IFunctionSelectorProps {
  abi: AbiFunction[]
  actionEntered: (calldata: Hex, value: bigint) => void
}
export const FunctionSelector = ({
  abi,
  actionEntered,
}: IFunctionSelectorProps) => {
  const { toast } = useToast()
  const [selectedAbiItem, setSelectedAbiItem] = useState<
    AbiFunction | undefined
  >()
  const [inputValues, setInputValues] = useState<InputValue[]>([])
  const [value, setValue] = useState<string>("")

  useEffect(() => {
    // Clean up if another function is selected
    setInputValues([])
  }, [abi])

  const onParameterChange = (paramIdx: number, value: InputValue) => {
    const newInputValues = [...inputValues]
    newInputValues[paramIdx] = value
    setInputValues(newInputValues)
  }

  const onAddAction = () => {
    if (!abi || !selectedAbiItem) return

    // The values we have now are the result of
    // validation having happened at the specific components

    for (let i = 0; i < selectedAbiItem.inputs.length; i++) {
      if (inputValues[i] === null || inputValues[i] === undefined) {
        return toast({
          title: "Invalid parameters",
          description:
            "Make sure that you have filled all the parameters and that they contain valid values",
          variant: "destructive",
        })
      }
    }

    try {
      const data = encodeFunctionData({
        abi,
        functionName: selectedAbiItem.name,
        args: inputValues,
      })
      actionEntered(data, BigInt(value ?? "0"))

      setInputValues([])

      // Clean up the form
      setSelectedAbiItem(undefined)

      toast({ title: "New action added" })
    } catch (err) {
      console.error(err)
      toast({
        title: "Invalid parameters",
        description: "Check that the parameters you entered are correct",
        variant: "destructive",
      })
      return
    }
  }

  const functionAbiList = (abi || []).filter((item) => item.type === "function")

  return (
    <div className="bg-neutral-0 flex h-96 rounded-lg border border-neutral-200">
      {/* Side bar */}
      <div className="w-1/3 overflow-auto border-r border-neutral-200 px-2 py-4">
        <ul className="select-none space-y-1">
          {functionAbiList.map((fn, index) => (
            <li
              key={index}
              onClick={() => setSelectedAbiItem(fn)}
              className={`font-sm w-full rounded-xl px-3 py-2 text-left hover:cursor-pointer hover:bg-neutral-100 ${fn.name === selectedAbiItem?.name && "bg-neutral-100 font-semibold"}`}
            >
              {!["pure", "view"].includes(fn.stateMutability) ? (
                decodeCamelCase(fn.name)
              ) : (
                <div>
                  <span>{decodeCamelCase(fn.name)}</span>
                  <br />
                  <span className="text-xs text-neutral-300">(read only)</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Form */}
      <div className="bg-primary-50 w-2/3 overflow-y-auto rounded-r-lg py-4">
        {!!selectedAbiItem ? (
          <div className="">
            <div className="mx-4 mb-3 flex flex-row items-center justify-between border-b border-neutral-200 pb-4">
              <p className="text-md mr-3 font-semibold text-neutral-800">
                <code>{decodeCamelCase(selectedAbiItem?.name)}</code>
              </p>
              <div className="">
                <Button
                  className="!min-w-[110px]"
                  size="sm"
                  onClick={onAddAction}
                >
                  Add action
                </Button>
              </div>
            </div>
            {["pure", "view"].includes(
              selectedAbiItem?.stateMutability || ""
            ) && (
              <div className="mx-4">
                <span>
                  This function is marked as read only. An action with it would
                  have no impact
                </span>
              </div>
            )}
            {selectedAbiItem?.inputs.map((paramAbi, i) => (
              <div key={i} className="mx-4 my-3">
                <InputParameter
                  abi={paramAbi}
                  idx={i}
                  onChange={onParameterChange}
                />
              </div>
            ))}
            {selectedAbiItem?.stateMutability === "payable" ||
              (selectedAbiItem?.payable && (
                <div className="mx-4 my-3">
                  <Label>Value (in wei)</Label>
                  <Input
                    className=""
                    placeholder="1000000000000000000"
                    value={value}
                    onChange={(e) => setValue(e.target.value || "")}
                  />
                </div>
              ))}
          </div>
        ) : (
          <p className="ml-4 mt-2">Select a function from the list</p>
        )}
      </div>
    </div>
  )
}
