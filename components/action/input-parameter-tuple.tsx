import { useEffect, useState } from "react"
import { decodeCamelCase } from "@/utils/case"
import { InputValue } from "@/utils/input-values"
import { AbiParameter } from "viem"

import { InputParameter } from "./input-parameter"

interface IInputParameterTupleProps {
  abi: AbiParameter
  idx: number
  onChange: (paramIdx: number, value: Record<string, InputValue>) => any
  hideTitle?: boolean
}

export const InputParameterTuple = ({
  abi,
  idx,
  onChange,
  hideTitle,
}: IInputParameterTupleProps) => {
  const [values, setValues] = useState<Array<InputValue | undefined>>([])

  useEffect(() => {
    // Clean up if another function is selected
    setValues([])
  }, [abi, idx])

  const onItemChange = (i: number, newVal: InputValue) => {
    const newValues = [...values]
    newValues[i] = newVal
    setValues(newValues)

    // Report up
    const result: Record<string, InputValue> = {}

    for (let i = 0; i < components.length; i++) {
      // Skip if incomplete
      if (newValues[i] === undefined || newValues[i] === null) return
      // Arrange as an object
      result[components[i].name!] = newValues[i]!
    }

    onChange(idx, result)
  }

  const components: AbiParameter[] = (abi as any).components || []
  const someMissingName = components.some((c) => !c.name)

  return (
    <div>
      {!hideTitle && (
        <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg mb-3">
          {abi.name ? decodeCamelCase(abi.name) : "Parameter " + (idx + 1)}
        </p>
      )}

      {!someMissingName ? (
        <div className="ml-6">
          {components.map((item, i) => (
            <div key={i} className="mb-3">
              <InputParameter abi={item} idx={i} onChange={onItemChange} />
            </div>
          ))}
        </div>
      ) : (
        <p>
          {"Cannot display the input fields" +
            (!abi.name
              ? ""
              : " for " + decodeCamelCase(abi.name).toLowerCase()) +
            ". The function definition is incomplete."}
        </p>
      )}
    </div>
  )
}
