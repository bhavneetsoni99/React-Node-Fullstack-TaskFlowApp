import type { TaskStatus } from '../../types/types';
import { TASK_STATUS_OPTIONS } from '../../utils/constants';

interface TaskStatusSelectProps {
  value: TaskStatus | '';
  onChange: (status: TaskStatus) => void;
  includePlaceholder?: boolean;
  placeholderText?: string;
  label?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
  testId?: string;
  disabled?: boolean;
}

export function TaskStatusSelect({
  value,
  onChange,
  includePlaceholder = false,
  placeholderText = 'Change Status...',
  label,
  id,
  ariaLabel,
  className,
  testId,
}: TaskStatusSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') return;
    onChange(e.target.value as TaskStatus);
  };

  const selectElement = (
    <select
      id={id}
      value={value}
      onChange={handleChange}
      aria-label={ariaLabel || (label ? undefined : 'Select task status')}
      className={className}
      data-testid={testId || 'task-status-select'}
    >
      {includePlaceholder && (
        <option value="" disabled>
          {placeholderText}
        </option>
      )}
      {TASK_STATUS_OPTIONS.map(({ key, label: optionLabel }) => (
        <option key={key} value={key}>
          {optionLabel}
        </option>
      ))}
    </select>
  );

  if (label) {
    if (id) {
      return (
        <>
          <label htmlFor={id}>{label}</label>
          {selectElement}
        </>
      );
    }

    return (
      <label>
        <span>{label}</span>
        {selectElement}
      </label>
    );
  }

  return selectElement;
}
