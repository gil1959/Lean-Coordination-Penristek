import TasksClient from "./TasksClient";
import { getMyTasks } from "./actions";

export default async function TasksPage() {
  const tasks = await getMyTasks();

  return (
    <div className="w-full">
      <TasksClient tasks={tasks} />
    </div>
  );
}
