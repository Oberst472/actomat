/* global React, Field, Input, Textarea, Button, Icon */

const TaskRow = ({ task, onChange, onRemove, dense, canRemove, index }) => {
  return (
    <div className={`group ${dense ? "py-3" : "py-4"} first:pt-0 last:pb-0`}>
      {/* Top row: index, Task ID, Hours, delete */}
      <div className="flex items-end gap-3">
        <div className="size-7 shrink-0 grid place-items-center rounded-md bg-input ring-1 ring-border text-muted text-[11px] font-mono tabular-nums mb-0.5">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="w-44 shrink-0">
          <Field label="Task ID">
            <Input
              value={task.id}
              onChange={(e) => onChange({ ...task, id: e.target.value.toUpperCase() })}
              placeholder="CORE-152"
              className="font-mono tracking-tight"
            />
          </Field>
        </div>

        <div className="grow" />

        <div className="w-32 shrink-0">
          <Field label="Hours">
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              value={task.hours}
              onChange={(e) => onChange({ ...task, hours: e.target.value })}
              placeholder="0.0"
              suffix="h"
              className="text-right tabular-nums"
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          title="Remove task"
          className="size-8 shrink-0 grid place-items-center rounded-md text-muted hover:text-danger hover:bg-danger-soft disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted transition mb-0.5"
        >
          <Icon name="trash" size={15} />
        </button>
      </div>

      {/* Description row */}
      <div className="mt-3 pl-10">
        <Field label="Description">
          <Textarea
            value={task.description}
            rows={2}
            onChange={(e) => onChange({ ...task, description: e.target.value })}
            placeholder="What was done in this task…"
          />
        </Field>
      </div>
    </div>
  );
};

window.TaskRow = TaskRow;
