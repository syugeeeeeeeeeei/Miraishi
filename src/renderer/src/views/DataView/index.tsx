import { useAtom } from 'jotai';
import { mainPersonAtom, spouseAtom } from '../../atoms/scenarioAtoms';
import { InputSection } from './components/InputSection';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  VStack,
} from '@chakra-ui/react';

export const DataView = () => {
  const [mainPerson, setMainPerson] = useAtom(mainPersonAtom);
  const [spouse, setSpouse] = useAtom(spouseAtom);

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList>
            <Tab>世帯主</Tab>
            <Tab>配偶者</Tab>
          </TabList>
          <TabPanels mt={4}>
            <TabPanel>
              <InputSection title="世帯主の情報" person={mainPerson} setPerson={setMainPerson} />
            </TabPanel>
            <TabPanel>
              <InputSection title="配偶者の情報" person={spouse} setPerson={setSpouse} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />

        {/* ここに次のステップで扶養家族のセクションを追加します */}
      </VStack>
    </Box>
  );
};
