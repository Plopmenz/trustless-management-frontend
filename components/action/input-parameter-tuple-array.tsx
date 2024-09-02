import { useEffect, useState } from "react"
import { decodeCamelCase } from "@/utils/case"
import { InputValue } from "@/utils/input-values"
import { AbiParameter } from "viem"

import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { InputParameterTuple } from "./input-parameter-tuple"

interface IInputParameterTupleArrayProps {
  abi: AbiParameter
  idx: number
  onChange: (paramIdx: number, value: Array<Record<string, InputValue>>) => any
}

export const InputParameterTupleArray = ({
  abi,
  idx,
  onChange,
}: IInputParameterTupleArrayProps) => {
  const [values, setValues] = useState<
    Array<Record<string, InputValue> | undefined>
  >([undefined])

  useEffect(() => {
    // Clean up if another function is selected
    setValues([undefined])
  }, [abi, idx])

  const onItemChange = (i: number, newVal: Record<string, InputValue>) => {
    const newValues = [...values]
    newValues[i] = newVal
    setValues(newValues)

    if (newValues.some((item) => !item)) return

    onChange(idx, newValues as Array<Record<string, InputValue>>)
  }

  const addMore = () => {
    const newValues = [...values, undefined]
    setValues(newValues)
  }

  const components: AbiParameter[] = (abi as any).components || []
  const someMissingName = components.some((c) => !c.name)

  return (
    <div>
      {!someMissingName ? (
        <div>
          {values.map((_, i) => (
            <div key={i} className="mt-6">
              <div className="flex justify-between">
                <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg mb-3">
                  {abi.name
                    ? decodeCamelCase(abi.name)
                    : "Parameter " + (idx + 1)}
                </p>
                <Label>{(i + 1).toString()}</Label>
              </div>

              <InputParameterTuple
                abi={abi}
                idx={i}
                onChange={onItemChange}
                hideTitle
              />
            </div>
          ))}
          <div className="flex justify-end mt-3">
            <Button size="sm" variant="secondary" onClick={addMore}>
              Add more{" "}
              {!abi.name ? "" : decodeCamelCase(abi.name).toLowerCase()}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-base font-normal leading-tight text-neutral-800 md:text-lg mb-3">
            {abi.name ? decodeCamelCase(abi.name) : "Parameter " + (idx + 1)}
          </p>
          <p>
            {"Cannot display the input fields" +
              (!abi.name
                ? ""
                : " for " + decodeCamelCase(abi.name).toLowerCase()) +
              ". The function definition is incomplete."}
          </p>
        </div>
      )}
    </div>
  )
}
