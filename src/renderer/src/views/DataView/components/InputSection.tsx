import { Box, FormControl, FormLabel, Heading, NumberInput, VStack } from '@chakra-ui/react'
import { Person } from '../../../../../types/scenario'

// Propsの型定義
interface InputSectionProps {
  person: Person
  setPerson: (person: Person) => void
  title: string
}

export const InputSection = ({ person, setPerson, title }: InputSectionProps) => {
  // 汎用的な更新ハンドラ
  // ネストされたオブジェクトのプロパティを安全に更新します
  const handleChange = (path: string, value: number) => {
    // パスをキーの配列に分割
    const keys = path.split('.')
    // personオブジェクトをディープコピーして、元の状態を直接変更しないようにする
    const newPerson = JSON.parse(JSON.stringify(person))

    let current = newPerson
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = isNaN(value) ? 0 : value

    setPerson(newPerson)
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        {title}
      </Heading>
      {/* VStackのspacingをgapに変更 */}
      <VStack gap="4" align="stretch">
        {/* 年齢 */}
        <FormControl>
          <FormLabel>年齢</FormLabel>
          {/* NumberInputをv3の記法に修正 */}
          <NumberInput.Root
            value={person.age}
            onChange={(details) => handleChange('age', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
            <NumberInput.Stepper>
              <NumberInput.IncrementTrigger />
              <NumberInput.DecrementTrigger />
            </NumberInput.Stepper>
          </NumberInput.Root>
        </FormControl>

        {/* --- 収入 --- */}
        <Heading size="sm" mt={4}>
          収入
        </Heading>
        <FormControl>
          <FormLabel>給与収入</FormLabel>
          <NumberInput.Root
            value={person.income.salary}
            onChange={(details) => handleChange('income.salary', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
        <FormControl>
          <FormLabel>年金収入</FormLabel>
          <NumberInput.Root
            value={person.income.pension}
            onChange={(details) => handleChange('income.pension', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
        <FormControl>
          <FormLabel>その他所得</FormLabel>
          <NumberInput.Root
            value={person.income.other}
            onChange={(details) => handleChange('income.other', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>

        {/* --- 控除 --- */}
        <Heading size="sm" mt={4}>
          控除
        </Heading>
        <FormControl>
          <FormLabel>社会保険料</FormLabel>
          <NumberInput.Root
            value={person.deduction.socialInsurance}
            onChange={(details) => handleChange('deduction.socialInsurance', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
        <FormControl>
          <FormLabel>生命保険料</FormLabel>
          <NumberInput.Root
            value={person.deduction.lifeInsurance}
            onChange={(details) => handleChange('deduction.lifeInsurance', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
        <FormControl>
          <FormLabel>地震保険料</FormLabel>
          <NumberInput.Root
            value={person.deduction.earthquakeInsurance}
            onChange={(details) =>
              handleChange('deduction.earthquakeInsurance', details.valueAsNumber)
            }
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
        <FormControl>
          <FormLabel>iDeCo</FormLabel>
          <NumberInput.Root
            value={person.deduction.ideco}
            onChange={(details) => handleChange('deduction.ideco', details.valueAsNumber)}
            min={0}
          >
            <NumberInput.Field />
          </NumberInput.Root>
        </FormControl>
      </VStack>
    </Box>
  )
}
