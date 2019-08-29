import Accordion from '@salesforce/design-system-react/components/accordion';
import AccordionPanel from '@salesforce/design-system-react/components/accordion/panel';
import Button from '@salesforce/design-system-react/components/button';
import Checkbox from '@salesforce/design-system-react/components/checkbox';
import Input from '@salesforce/design-system-react/components/input';
import Modal from '@salesforce/design-system-react/components/modal';
import i18n from 'i18next';
import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { LabelWithSpinner, useForm, useIsMounted } from '@/components/utils';
import { cancelChangeset } from '@/store/orgs/actions';
import { Changeset } from '@/store/orgs/reducer';
import { OBJECT_TYPES } from '@/utils/constants';
import { pluralize } from '@/utils/helpers';

interface Props {
  isOpen: boolean;
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFetchingChanges: React.Dispatch<React.SetStateAction<boolean>>;
  changeset: Changeset;
}

interface BooleanObject {
  [key: string]: boolean;
}

const CaptureModal = ({
  isOpen,
  toggleModal,
  toggleFetchingChanges,
  changeset,
}: Props) => {
  const [expandedPanels, setExpandedPanels] = useState<BooleanObject>({});
  const [capturingChanges, setCapturingChanges] = useState(false);
  const isMounted = useIsMounted();
  const submitButton = useRef<HTMLButtonElement | null>(null);

  const handleSuccess = () => {
    /* istanbul ignore else */
    if (isMounted.current) {
      setCapturingChanges(false);
      toggleModal(false);
      toggleFetchingChanges(false);
    }
  };

  const handleError = () => {
    /* istanbul ignore else */
    if (isMounted.current) {
      setCapturingChanges(false);
    }
  };

  const {
    inputs,
    errors,
    handleInputChange,
    setInputs,
    handleSubmit,
    resetForm,
  } = useForm({
    fields: { changes: [], message: '' },
    objectType: OBJECT_TYPES.CHANGESET,
    additionalData: { task: changeset.task },
    onSuccess: handleSuccess,
    onError: handleError,
    shouldSubscribeToObject: () => true,
  });
  const dispatch = useDispatch();

  const setChanges = (changes: string[]) => {
    setInputs({ ...inputs, changes });
  };

  const handlePanelToggle = (groupName: string) => {
    setExpandedPanels({
      ...expandedPanels,
      [groupName]: !expandedPanels[groupName],
    });
  };

  const handleSelectGroup = (groupName: string, checked: boolean) => {
    const newCheckedItems = new Set(inputs.changes as string[]);
    for (const { id } of changeset.changes[groupName]) {
      if (checked) {
        newCheckedItems.add(id);
      } else {
        newCheckedItems.delete(id);
      }
    }
    setChanges([...newCheckedItems]);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    { checked }: { checked: boolean },
  ) => {
    const newCheckedItems = new Set(inputs.changes as string[]);
    if (checked) {
      newCheckedItems.add(event.target.id);
    } else {
      newCheckedItems.delete(event.target.id);
    }
    setChanges([...newCheckedItems]);
  };

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    { checked }: { checked: boolean },
  ) => {
    if (checked) {
      const ids = Object.values(changeset.changes)
        .flat()
        .map(change => change.id);
      setChanges(ids);
    } else {
      setChanges([]);
    }
  };

  const handleSubmitClicked = () => {
    if (submitButton.current) {
      submitButton.current.click();
    }
  };

  const handleClose = () => {
    toggleModal(false);
    toggleFetchingChanges(false);
    dispatch(cancelChangeset(changeset));
    resetForm();
  };

  const submitChanges = (e: React.FormEvent<HTMLFormElement>) => {
    setCapturingChanges(true);
    handleSubmit(e);
  };

  const totalChanges = Object.values(changeset.changes).flat().length;
  const allChangesChecked = inputs.changes.length === totalChanges;
  const noChangesChecked = !inputs.changes.length;

  return (
    <Modal
      isOpen={isOpen}
      size="medium"
      heading={i18n.t('Select the changes to capture')}
      footer={[
        <Button key="cancel" label={i18n.t('Cancel')} onClick={handleClose} />,
        <Button
          key="submit"
          type="submit"
          label={
            capturingChanges ? (
              <LabelWithSpinner
                label={i18n.t('Capturing Selected Changes…')}
                variant="inverse"
              />
            ) : (
              i18n.t('Capture Selected Changes')
            )
          }
          variant="brand"
          onClick={handleSubmitClicked}
          disabled={!inputs.changes.length || capturingChanges}
        />,
      ]}
      onRequestClose={handleClose}
    >
      <form className="slds-form slds-p-around_large" onSubmit={submitChanges}>
        <div>
          <Checkbox
            id="select-all"
            labels={{
              label: `${i18n.t('Select All')}`,
            }}
            checked={allChangesChecked}
            indeterminate={!allChangesChecked && !noChangesChecked}
            errorText={errors.changes}
            onChange={handleSelectAllChange}
          />
          <span>
            {`(${totalChanges} ${pluralize(totalChanges, 'change')})`}
          </span>
        </div>
        {Object.keys(changeset.changes).map(groupName => {
          const children = changeset.changes[groupName];
          const handleThisPanelToggle = () => handlePanelToggle(groupName);
          const handleSelectThisGroup = (
            event: React.ChangeEvent<HTMLInputElement>,
            { checked }: { checked: boolean },
          ) => handleSelectGroup(groupName, checked);
          let checkedChildren = 0;
          let allChildrenChecked = false;
          let noChildrenChecked = true;
          for (const child of children) {
            if (inputs.changes.includes(child.id)) {
              noChildrenChecked = false;
              checkedChildren = checkedChildren + 1;
            }
          }
          if (checkedChildren === children.length) {
            allChildrenChecked = true;
          }

          return (
            <Accordion key={groupName}>
              <AccordionPanel
                expanded={Boolean(expandedPanels[groupName])}
                id={groupName}
                onTogglePanel={handleThisPanelToggle}
                title={groupName}
                summary={
                  <div>
                    <Checkbox
                      id={groupName}
                      labels={{ label: groupName }}
                      checked={allChildrenChecked}
                      indeterminate={!allChildrenChecked && !noChildrenChecked}
                      onChange={handleSelectThisGroup}
                    />
                    <span className="slds-text-body_regular">
                      {`(${children.length} ${pluralize(
                        children.length,
                        'change',
                      )})`}
                    </span>
                  </div>
                }
              >
                {changeset.changes[groupName].map(change => (
                  <Checkbox
                    key={change.id}
                    id={change.id}
                    labels={{
                      label: change.name,
                    }}
                    name="changes"
                    checked={inputs.changes.includes(change.id)}
                    onChange={handleChange}
                  />
                ))}
              </AccordionPanel>
            </Accordion>
          );
        })}
        <Input
          id="commit-message"
          label={i18n.t('Commit Message')}
          className="slds-form-element_stacked slds-p-left_none"
          name="message"
          value={inputs.message}
          required
          aria-required
          maxLength="50"
          errorText={errors.message}
          onChange={handleInputChange}
        />
        <button ref={submitButton} type="submit" style={{ display: 'none' }} />
      </form>
    </Modal>
  );
};

export default CaptureModal;
