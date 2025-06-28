import { atom } from 'jotai'
import { Scenario, Person } from '@myTypes/scenario'

const initialPerson: Person = {
  age: 40,
  income: {
    salary: 5000000,
    pension: 0,
    other: 0
  },
  deduction: {
    socialInsurance: 700000,
    lifeInsurance: 0,
    earthquakeInsurance: 0,
    ideco: 0
  }
}

const initialScenario: Scenario = {
  id: 'default',
  name: 'デフォルトシナリオ',
  mainPerson: { ...initialPerson },
  // spouseの初期状態も定義
  spouse: {
    ...initialPerson,
    age: 38,
    income: { salary: 2000000, pension: 0, other: 0 },
    deduction: { socialInsurance: 300000, lifeInsurance: 0, earthquakeInsurance: 0, ideco: 0 }
  },
  dependents: []
}

export const scenarioAtom = atom<Scenario>(initialScenario)

// 世帯主、配偶者、扶養家族にアクセスしやすくするための派生Atom
export const mainPersonAtom = atom(
  (get) => get(scenarioAtom).mainPerson,
  (get, set, newMainPerson: Person) => {
    const currentScenario = get(scenarioAtom)
    set(scenarioAtom, { ...currentScenario, mainPerson: newMainPerson })
  }
)

export const spouseAtom = atom(
  (get) => get(scenarioAtom).spouse,
  (get, set, newSpouse: Person) => {
    const currentScenario = get(scenarioAtom)
    set(scenarioAtom, { ...currentScenario, spouse: newSpouse })
  }
)

export const dependentsAtom = atom(
  (get) => get(scenarioAtom).dependents,
  (get, set, newDependents) => {
    const currentScenario = get(scenarioAtom)
    set(scenarioAtom, { ...currentScenario, dependents: newDependents })
  }
)
