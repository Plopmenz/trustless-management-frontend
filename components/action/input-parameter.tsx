import { InputValue } from "@/utils/input-values"
import { AbiParameter } from "viem"

import { InputParameterArray } from "./input-parameter-array"
import { InputParameterText } from "./input-parameter-text"
import { InputParameterTuple } from "./input-parameter-tuple"
import { InputParameterTupleArray } from "./input-parameter-tuple-array"

interface IInputParameterProps {
  abi: AbiParameter
  idx: number
  onChange: (paramIdx: number, value: InputValue) => any
}

export const InputParameter = ({
  abi,
  idx,
  onChange,
}: IInputParameterProps) => {
  if (abi.type === "tuple[]") {
    return <InputParameterTupleArray abi={abi} idx={idx} onChange={onChange} />
  } else if (abi.type.endsWith("[]")) {
    return <InputParameterArray abi={abi} idx={idx} onChange={onChange} />
  } else if (abi.type === "tuple") {
    return <InputParameterTuple abi={abi} idx={idx} onChange={onChange} />
  } else {
    return <InputParameterText abi={abi} idx={idx} onChange={onChange} />
  }
}
