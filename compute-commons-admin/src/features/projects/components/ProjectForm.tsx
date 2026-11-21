import { Button, Checkbox, Modal, NumberInput, Select, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import type { CreateProjectInput, ProjectCategory, ProjectPriority, SchedulingStrategy } from '../types'

interface ProjectFormProps {
  opened: boolean
  onClose: () => void
  onSubmit: (project: CreateProjectInput) => void
}

export function ProjectForm({ opened, onClose, onSubmit }: ProjectFormProps) {
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      category: 'Climate' as ProjectCategory,
      taskCount: 100,
      cpuCoresPerTask: 4,
      memoryMbPerTask: 8192,
      estimatedDurationSeconds: 600,
      priority: 'Normal' as ProjectPriority,
      schedulingStrategy: 'Energy-aware' as SchedulingStrategy,
      postponeForRenewableEnergy: true,
    },
    validate: {
      name: (value) => value.trim().length < 3 ? 'Name must be at least 3 characters' : null,
      taskCount: (value) => value > 0 && Number.isInteger(value) ? null : 'Enter a positive whole number',
      cpuCoresPerTask: (value) => value > 0 ? null : 'Must be greater than zero',
      memoryMbPerTask: (value) => value > 0 ? null : 'Must be greater than zero',
      estimatedDurationSeconds: (value) => value > 0 ? null : 'Must be greater than zero',
    },
  })

  function submit(values: typeof form.values) {
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      priority: values.priority,
      schedulingStrategy: values.schedulingStrategy,
      requirements: {
        taskCount: values.taskCount,
        cpuCoresPerTask: values.cpuCoresPerTask,
        memoryMbPerTask: values.memoryMbPerTask,
        estimatedDurationSeconds: values.estimatedDurationSeconds,
        postponeForRenewableEnergy: values.postponeForRenewableEnergy,
      },
    })
    notifications.show({ title: 'Project created', message: `${values.name.trim()} was added to the queue`, color: 'green' })
    form.reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create new project" size="lg" centered>
      <form onSubmit={form.onSubmit(submit)}>
        <div className="form-grid">
          <TextInput label="Project name" placeholder="Enter a descriptive name" required {...form.getInputProps('name')} />
          <Select label="Category" data={['Climate', 'Biodiversity', 'Research', 'Other']} {...form.getInputProps('category')} />
          <Textarea label="Description" placeholder="Describe the project goals" className="form-span-2" autosize minRows={3} {...form.getInputProps('description')} />
          <NumberInput label="Number of tasks" min={1} {...form.getInputProps('taskCount')} />
          <NumberInput label="CPU cores per task" min={1} {...form.getInputProps('cpuCoresPerTask')} />
          <NumberInput label="Memory per task (MB)" min={1} {...form.getInputProps('memoryMbPerTask')} />
          <NumberInput label="Estimated duration (seconds)" min={1} {...form.getInputProps('estimatedDurationSeconds')} />
          <Select label="Priority" data={['Low', 'Normal', 'High', 'Critical']} {...form.getInputProps('priority')} />
          <Select label="Scheduling strategy" data={['Energy-aware', 'Performance-first', 'Balanced']} {...form.getInputProps('schedulingStrategy')} />
          <Checkbox className="form-span-2" label="Allow postponement until renewable energy availability improves" {...form.getInputProps('postponeForRenewableEnergy', { type: 'checkbox' })} />
        </div>
        <div className="modal-actions">
          <Button variant="default" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Modal>
  )
}
