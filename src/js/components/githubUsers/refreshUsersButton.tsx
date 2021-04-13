import Button from '@salesforce/design-system-react/components/button';
import i18n from 'i18next';
import React from 'react';

import { LabelWithSpinner } from '~js/components/utils';

interface Props {
  isRefreshing: boolean;
  refreshUsers: () => void;
}
const RefreshGitHubUsersButton = ({ isRefreshing, refreshUsers }: Props) => (
  <>
    {isRefreshing ? (
      <Button
        label={
          <LabelWithSpinner label={i18n.t('Syncing GitHub Collaborators…')} />
        }
        variant="outline-brand"
        disabled
      />
    ) : (
      <Button
        label={i18n.t('Re-Sync GitHub Collaborators')}
        variant="outline-brand"
        iconCategory="utility"
        iconName="refresh"
        iconPosition="left"
        onClick={refreshUsers}
      />
    )}
  </>
);

export default RefreshGitHubUsersButton;
