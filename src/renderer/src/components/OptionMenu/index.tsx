import React from 'react'
import { Box } from '@chakra-ui/react'
import { FaFileInvoiceDollar, FaFilePdf, FaInfoCircle, FaRegCopyright } from 'react-icons/fa'
import type {
  Scenario,
  ScenarioComparisonPdfExportRequest,
  TaxSchema
} from '@myTypes/miraishi'
import { ScenarioComparisonPdfDialog } from './ScenarioComparisonPdfMenu/ScenarioComparisonPdfDialog'
import { SystemRadialMenu, type SystemRadialMenuItem } from './SystemMenu/SystemRadialMenu'
import { TaxRuleDialog } from './TaxRuleMenu/TaxRuleDialog'

interface OptionMenuProps {
  allScenarios: Scenario[]
  activeScenarioIds: string[]
  defaultUntilYear: number
  defaultAverageOvertimeHours: number
  isTaxRuleDialogOpen: boolean
  isTaxSchemaLoading: boolean
  initialTaxSchema: TaxSchema | null
  onOpenTaxRuleDialog: () => void
  onCloseTaxRuleDialog: () => void
  onTaxRuleApplied: (nextTaxSchema: TaxSchema) => Promise<void>
  isScenarioComparisonPdfDialogOpen: boolean
  isPdfExporting: boolean
  onOpenScenarioComparisonPdfDialog: () => void
  onCloseScenarioComparisonPdfDialog: () => void
  onExportScenarioComparisonPdf: (payload: ScenarioComparisonPdfExportRequest) => Promise<void>
  onShowInfo: () => void
  onShowCredit: () => void
}

export function OptionMenu({
  allScenarios,
  activeScenarioIds,
  defaultUntilYear,
  defaultAverageOvertimeHours,
  isTaxRuleDialogOpen,
  isTaxSchemaLoading,
  initialTaxSchema,
  onOpenTaxRuleDialog,
  onCloseTaxRuleDialog,
  onTaxRuleApplied,
  isScenarioComparisonPdfDialogOpen,
  isPdfExporting,
  onOpenScenarioComparisonPdfDialog,
  onCloseScenarioComparisonPdfDialog,
  onExportScenarioComparisonPdf,
  onShowInfo,
  onShowCredit
}: OptionMenuProps): React.JSX.Element {
  const systemMenuItems: SystemRadialMenuItem[] = [
    {
      id: 'tax-rule',
      label: '税金ルール',
      icon: FaFileInvoiceDollar,
      onClick: onOpenTaxRuleDialog
    },
    {
      id: 'scenario-comparison-pdf',
      label: '比較レポート(PDF)',
      icon: FaFilePdf,
      onClick: onOpenScenarioComparisonPdfDialog
    },
    {
      id: 'info',
      label: 'インフォ',
      icon: FaInfoCircle,
      onClick: onShowInfo
    },
    {
      id: 'credits',
      label: 'クレジット',
      icon: FaRegCopyright,
      onClick: onShowCredit
    }
  ]

  return (
    <>
      <Box position="fixed" left="14px" bottom="24px" zIndex={30}>
        <SystemRadialMenu items={systemMenuItems} />
      </Box>

      <TaxRuleDialog
        isOpen={isTaxRuleDialogOpen}
        isLoading={isTaxSchemaLoading}
        initialTaxSchema={initialTaxSchema}
        onCloseWithoutChanges={onCloseTaxRuleDialog}
        onApplied={onTaxRuleApplied}
      />

      <ScenarioComparisonPdfDialog
        isOpen={isScenarioComparisonPdfDialogOpen}
        isExporting={isPdfExporting}
        scenarios={allScenarios}
        defaultScenarioIds={activeScenarioIds}
        defaultUntilYear={defaultUntilYear}
        defaultAverageOvertimeHours={defaultAverageOvertimeHours}
        onClose={onCloseScenarioComparisonPdfDialog}
        onExport={onExportScenarioComparisonPdf}
      />
    </>
  )
}
