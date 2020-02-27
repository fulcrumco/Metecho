/* eslint-disable @typescript-eslint/camelcase */

import Button from '@salesforce/design-system-react/components/button';
import Modal from '@salesforce/design-system-react/components/modal';
import i18n from 'i18next';
import React, { useEffect, useState } from 'react';

import ChangesForm from '@/components/tasks/capture/changes';
import TargetDirectoriesForm from '@/components/tasks/capture/directories';
import { LabelWithSpinner, useForm, useIsMounted } from '@/components/utils';
import { Changeset, TargetDirectories } from '@/store/orgs/reducer';
import { ApiError } from '@/utils/api';
import { OBJECT_TYPES } from '@/utils/constants';

interface Props {
  orgId: string;
  changeset: Changeset;
  directories: TargetDirectories;
  isOpen: boolean;
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CommitData {
  changes: Changeset;
  commit_message: string;
  target_directory: string;
}

const CaptureModal = ({
  orgId,
  changeset,
  directories,
  isOpen,
  toggleModal,
}: Props) => {
  const [capturingChanges, setCapturingChanges] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const isMounted = useIsMounted();

  const nextPage = () => {
    setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    setPageIndex(pageIndex - 1 || 0);
  };

  const handleSuccess = () => {
    /* istanbul ignore else */
    if (isMounted.current) {
      setCapturingChanges(false);
      toggleModal(false);
      setPageIndex(0);
    }
  };

  // eslint-disable-next-line handle-callback-err
  const handleError = (
    err: ApiError,
    fieldErrors: { [key: string]: string },
  ) => {
    if (isMounted.current) {
      setCapturingChanges(false);
      if (fieldErrors.target_directory) {
        setPageIndex(0);
      } else if (fieldErrors.changes) {
        setPageIndex(1);
      } else if (fieldErrors.commit_message) {
        setPageIndex(2);
      }
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
    fields: {
      changes: {},
      commit_message: '',
      target_directory: directories.source?.[0] || 'src',
    } as CommitData,
    objectType: OBJECT_TYPES.COMMIT,
    url: window.api_urls.scratch_org_commit(orgId),
    onSuccess: handleSuccess,
    onError: handleError,
    shouldSubscribeToObject: false,
  });

  // When directories change, update default selection
  useEffect(() => {
    setInputs({
      ...inputs,
      target_directory: directories.source?.[0] || 'src',
    });
  }, [directories.source]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirSelected = Boolean(inputs.target_directory);
  const changesChecked = Object.values(inputs.changes).flat().length;

  const handleClose = () => {
    toggleModal(false);
    setPageIndex(0);
    resetForm();
  };

  const submitChanges = (e: React.FormEvent<HTMLFormElement>) => {
    setCapturingChanges(true);
    handleSubmit(e);
  };

  const headings = [
    i18n.t('Select the location to capture changes'),
    `${i18n.t('Select the changes to capture to')}: “${
      inputs.target_directory
    }”`,
    i18n.t('Describe the changes you are capturing'),
  ];

  const contents = [
    <TargetDirectoriesForm
      key="page-1-contents"
      directories={directories}
      inputs={inputs as CommitData}
      errors={errors}
      handleInputChange={handleInputChange}
    />,
    <ChangesForm
      key="page-2-contents"
      changeset={changeset}
      inputs={inputs as CommitData}
      errors={errors}
      handleInputChange={handleInputChange}
      setInputs={setInputs}
    />,
    <div key="page-3-contents">Page 3</div>,
  ];

  const footers = [
    <Button
      key="page-1-button-1"
      label={i18n.t('Save & Next')}
      variant="brand"
      onClick={nextPage}
      disabled={!dirSelected}
    />,
    [
      <Button
        key="page-2-button-1"
        label={i18n.t('Go Back')}
        variant="outline-brand"
        onClick={prevPage}
      />,
      // <Button
      //   key="page-2-button-2"
      //   label={i18n.t('Ignore Selected Changes')}
      //   variant="outline-brand"
      // />,
      <Button
        key="page-2-button-3"
        label={i18n.t('Save & Next')}
        variant="brand"
        onClick={nextPage}
        disabled={!changesChecked}
      />,
    ],
    [
      <Button
        key="page-3-button-1"
        label={i18n.t('Go Back')}
        variant="outline-brand"
        onClick={prevPage}
        disabled={capturingChanges}
      />,
      <Button
        key="page-3-button-2"
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
        onClick={submitChanges}
        disabled={capturingChanges}
      />,
    ],
  ];

  return (
    <Modal
      isOpen={isOpen}
      size="small"
      disableClose={capturingChanges}
      heading={headings[pageIndex]}
      footer={footers[pageIndex]}
      directional={pageIndex > 0}
      onRequestClose={handleClose}
    >
      {contents[pageIndex]}
    </Modal>
  );
};

export default CaptureModal;
