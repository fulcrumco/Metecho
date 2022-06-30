import React from 'react';

import TaskTable from '@/js/components/tasks/table';
import useFetchUserTasks from '@/js/components/utils/useFetchUserTasks';

const UserTasks = () => {
  const { tasks } = useFetchUserTasks();

  return (
    <>
      {tasks?.length ? (
        <div className="slds-m-top_xx-large">
          <div className="slds-text-heading_large slds-m-bottom_small">
            Tasks With Unretrieved Changes
          </div>
          <div className="slds-m-bottom_medium slds-text-body_regular">
            Below is a list of Tasks where you are currently assigned as the
            Developer or Tester. If you have any Dev Orgs with unsaved work,
            access them from the Task page to retrieve changes before deleting
            your account.
          </div>

          <TaskTable
            tasks={tasks}
            isFetched
            canAssign={false}
            isRefreshingUsers={false}
            viewEpicsColumn
          />
        </div>
      ) : null}
    </>
  );
};
export default UserTasks;
