import Button from '@salesforce/design-system-react/components/button';
import Checkbox from '@salesforce/design-system-react/components/checkbox';
import DataTableCell from '@salesforce/design-system-react/components/data-table/cell';
import InputIcon from '@salesforce/design-system-react/components/icon/input-icon';
import Input from '@salesforce/design-system-react/components/input';
import Modal from '@salesforce/design-system-react/components/modal';
import i18n from 'i18next';
import { filter } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Project } from 'src/js/store/projects/reducer';

import ReSyncGithubUserButton from '~js/components/user/github/reSyncButton';
import {
  GitHubUserButton,
  TableCellProps,
} from '~js/components/user/githubUser';
import { SpinnerWrapper } from '~js/components/utils';
import { ThunkDispatch } from '~js/store';
import { refreshGitHubUsers } from '~js/store/projects/actions';
import { GitHubUser, User } from '~js/store/user/reducer';
import { selectUserState } from '~js/store/user/selectors';
import { ORG_TYPES, OrgTypes } from '~js/utils/constants';

const AssignUserModal = ({
  epicUsers,
  selectedUser,
  orgType,
  isOpen,
  onRequestClose,
  setUser,
  project,
}: {
  epicUsers: GitHubUser[];
  selectedUser: GitHubUser | null;
  orgType: OrgTypes;
  isOpen: boolean;
  onRequestClose: () => void;
  setUser: (user: GitHubUser | null, shouldAlertAssignee: boolean) => void;
  project: Project;
}) => {
  const currentUser = useSelector(selectUserState) as User;
  const dispatch = useDispatch<ThunkDispatch>();
  const [selection, setSelection] = useState<GitHubUser | null>(null);
  const [shouldAlertAssignee, setShouldAlertAssignee] = useState(true);
  const [autoToggle, setAutoToggle] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [findText, setFindText] = useState('');

  const handleAlertAssignee = (
    event: React.FormEvent<HTMLFormElement>,
    { checked }: { checked: boolean },
  ) => {
    setShouldAlertAssignee(checked);
    setAutoToggle(false);
  };
  const handleAssigneeSelection = (user: GitHubUser) => {
    const currentUserSelected = user.login === currentUser.username;
    setSelection(user);
    if (autoToggle) {
      setShouldAlertAssignee(!currentUserSelected);
    }
  };
  const handleClose = () => {
    onRequestClose();
    setSelection(null);
    setShouldAlertAssignee(true);
    setAutoToggle(true);
  };
  const handleSave = () => {
    if (selection) {
      const selectedAssignee = selection;
      setUser(selectedAssignee, shouldAlertAssignee);
      handleClose();
    }
  };

  const doRefreshGitHubUsers = useCallback(() => {
    /* istanbul ignore if */
    if (!project) {
      return;
    }
    setIsRefreshing(true);
    dispatch(refreshGitHubUsers(project.id)).finally(() =>
      setIsRefreshing(false),
    );
  }, [project, dispatch]);

  const handleFindTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFindText(e.target.value);
  };
  const usersWithoutAssignee = epicUsers.filter(
    (user) => user.id !== selectedUser?.id,
  );

  const heading =
    orgType === ORG_TYPES.QA
      ? i18n.t('Assign Tester')
      : i18n.t('Assign Developer');
  const checkboxLabel =
    orgType === ORG_TYPES.QA
      ? i18n.t('Notify Assigned Tester by Email')
      : i18n.t('Notify Assigned Developer by Email');
  const alertType =
    orgType === ORG_TYPES.DEV ? 'should_alert_dev' : 'should_alert_qa';

  const githubCollaboratorHeading = usersWithoutAssignee.length
    ? i18n.t('Other Github Collaborators')
    : i18n.t('Github Collaborators');

  const UserTableCell = ({
    item,
    handleUserClick,
    ...props
  }: TableCellProps) => {
    /* istanbul ignore if */
    if (!item) {
      return null;
    }
    const { login } = item;
    const handleClick = () => {
      handleUserClick(item);
    };
    return (
      <DataTableCell {...props} title={login}>
        <GitHubUserButton
          withName
          user={item}
          onClick={handleClick}
          className="slds-p-left_medium"
        />
      </DataTableCell>
    );
  };
  UserTableCell.displayName = DataTableCell.displayName;

  const emptyCollaboratorsText = (
    <p className="slds-p-top_small">
      <Trans i18nKey="noEpicCollaborators">
        There are no Epic Collaborators. Select GitHub users to add as
        Collaborators.
      </Trans>
    </p>
  );
  /* @@@ todo
    - filter users in second list that appear in the first
    - flatten the list into one list
  */
  const userList = [
    {
      heading: `${i18n.t('Epic Collaborators')}`,
      list: usersWithoutAssignee,
    },
    {
      heading: githubCollaboratorHeading,
      list: project.github_users,
    },
  ];
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      heading={heading}
      directional
      size="small"
      footer={[
        <Checkbox
          key="alert"
          labels={{ label: checkboxLabel }}
          className="slds-float_left slds-p-top_xx-small"
          name={alertType}
          checked={shouldAlertAssignee}
          onChange={handleAlertAssignee}
        />,
        <Button key="cancel" label={i18n.t('Cancel')} onClick={handleClose} />,
        <Button
          key="submit"
          label={i18n.t('Save')}
          variant="brand"
          onClick={handleSave}
        />,
      ]}
    >
      <div
        className="slds-grid
          slds-grid_vertical-align-start
          slds-p-horizontal_medium
          slds-p-top_medium"
      >
        <div
          className="slds-grid
            slds-wrap
            slds-shrink
            slds-p-right_medium
            slds-p-bottom_small"
        >
          <p>
            <Trans i18nKey="assignUserHelper">
              Assign any Github user to this role. If they are not already, the
              will also be added as an Epic Collaborator.
            </Trans>
          </p>
        </div>
        <div
          className="slds-grid
            slds-grow
            slds-shrink-none
            slds-grid_align-end
            slds-p-bottom_medium"
        >
          <ReSyncGithubUserButton
            isRefreshing={isRefreshing}
            refreshUsers={doRefreshGitHubUsers}
          />
        </div>
      </div>
      <div className="slds-is-relative">
        <div
          className="slds-medium-size_large
            slds-p-horizontal_medium
            slds-p-bottom_medium"
        >
          <Input
            id="quick-find-input"
            name="name"
            value={findText}
            onChange={handleFindTextChange}
            iconRight={
              <InputIcon
                assistiveText={{
                  icon: i18n.t('Search'),
                }}
                name="search"
                category="utility"
              />
            }
            placeholder={i18n.t('Quick Find')}
          />
        </div>
        {selectedUser && (
          <div className="slds-p-horizontal_medium slds-p-bottom_medium">
            <h3 className="slds-text-heading_medium slds-m-bottom_xx-small">
              {i18n.t('Currently Assigned')}
            </h3>
            <GitHubUserButton withName user={selectedUser} isAssigned />
          </div>
        )}
        <div>
          {userList.map((person, idx) => (
            <div key={idx} className="slds-p-horizontal_medium slds-p-bottom_medium">
              <h3 className="slds-text-heading_medium slds-m-bottom_xx-small ">
                {person.heading}
              </h3>
              <ul>
                {person.list.length
                  ? person.list.map((user, i) => (
                      <li key={user.id}>
                        <GitHubUserButton
                          withName
                          user={user}
                          isSelected={selection === user}
                          onClick={() => handleAssigneeSelection(user)}
                        />
                      </li>
                    ))
                  : emptyCollaboratorsText}
              </ul>
            </div>
          ))}
        </div>
        {isRefreshing && <SpinnerWrapper />}
      </div>
    </Modal>
  );
};

export default AssignUserModal;
