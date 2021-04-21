import DataTable from '@salesforce/design-system-react/components/data-table';
import DataTableColumn from '@salesforce/design-system-react/components/data-table/column';
import Icon from '@salesforce/design-system-react/components/icon';
import i18n from 'i18next';
import React from 'react';

import CollaboratorTableCell from '~js/components/epics/table/collaboratorCell';
import DetailTableCell from '~js/components/epics/table/detailCell';
import StatusTableCell from '~js/components/epics/table/statusCell';
import TourPopover from '~js/components/tour/popover';
import { Epic } from '~js/store/epics/reducer';

export interface TableCellProps {
  [key: string]: any;
  item?: Epic;
  className?: string;
}

const EpicTable = ({
  epics,
  projectSlug,
}: {
  epics: Epic[];
  projectSlug: string;
}) => {
  const items = epics.map((epic) => ({
    ...epic,
    numCollaborators: epic.github_users?.length || 0,
  }));

  return (
    <DataTable
      items={items}
      id="project-epics-table"
      noRowHover
      className="slds-is-relative"
    >
      <DataTableColumn
        key="details"
        label={
          <>
            {i18n.t('Epic')}
            <TourPopover
              align="right"
              heading={i18n.t('Epic name column')}
              body={i18n.t(
                'Epic Name describes a group of related Tasks. Select an Epic’s name to see the list of Tasks and Collaborators. To see the Epic on GitHub, select the branch link. A “branch” in Git is a way to create a new feature or make a modification to existing software, but not affect the main “trunk” of the Project.',
              )}
            />
          </>
        }
        property="name"
        width="100%"
        primaryColumn
      >
        <DetailTableCell projectSlug={projectSlug} />
      </DataTableColumn>
      <DataTableColumn
        key="status"
        label={
          <>
            {i18n.t('Status')}
            <TourPopover
              align="right"
              heading={i18n.t('Epic status column')}
              body={i18n.t(
                'An Epic begins with a status of Planned. The status changes to In Progress when a Developer creates a Dev Org for any Task in the Epic. When all the Epic’s Tasks are Complete — meaning all the Tasks have been Merged on GitHub — the Epic status changes to Review. The Epic status changes to Merged when the Epic has been added to the Project on GitHub.',
              )}
            />
          </>
        }
        property="status"
        width="0"
      >
        <StatusTableCell />
      </DataTableColumn>
      <DataTableColumn
        key="numCollaborators"
        label={
          <>
            <Icon
              category="utility"
              name="user"
              size="xx-small"
              className="slds-m-bottom_xx-small"
              containerClassName="slds-current-color"
              title={i18n.t('Collaborators')}
            />
            <TourPopover
              align="right"
              heading={i18n.t('Collaborators column')}
              body={i18n.t(
                'The Collaborators column shows the number of people working on the Epic. Anyone with permission to contribute to the Project on GitHub can be assigned as an Epic Collaborator.',
              )}
            />
          </>
        }
        property="numCollaborators"
        width="0"
      >
        <CollaboratorTableCell />
      </DataTableColumn>
    </DataTable>
  );
};

export default EpicTable;
