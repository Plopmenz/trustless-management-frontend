import { useEffect, useState } from "react"
import { decodeCamelCase } from "@/utils/case"
import {
  handleStringValue,
  InputValue,
  isValidStringValue,
  readableTypeName,
} from "@/utils/input-values"
import { AbiParameter } from "viem"

import { Input } from "../ui/input"

interface IInputParameterTextProps {
  abi: AbiParameter
  idx: number
  onChange: (paramIdx: number, value: InputValue) => any
}

export const InputParameterText = ({
  abi,
  idx,
  onChange,
}: IInputParameterTextProps) => {
  const [value, setValue] = useState<string | null>(null)

  useEffect(() => {
    // Clean up if another function is selected
    setValue(null)
  }, [abi, idx])

  const handleValue = (val: string) => {
    setValue(val)

    const parsedValue = handleStringValue(val, abi.type)
    if (parsedValue === null) return

    onChange(idx, parsedValue)
  }

  return (
    <div className="flex">
      <Input
        name={
          "abi-input-" + idx + "-" + (abi.name || abi.internalType || abi.type)
        }
        placeholder={
          abi.type
            ? readableTypeName(abi.type)
            : decodeCamelCase(abi.name) || ""
        }
        value={value || ""}
        onChange={(e) => handleValue(e.target.value)}
      />
    </div>
  )
}
