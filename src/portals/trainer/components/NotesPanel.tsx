import { Button, Card, Flex, Form, Input, Typography } from 'antd';
import { addCandidateNote } from '@/api/candidates';
import { formatDateTime } from '@/domain/format';
import { useAppMutation } from '@/shared/hooks/useAppMutation';
import { SUCCESS_MESSAGE, TRAINER_ERROR } from '../constant';
import { CandidatePanelProps, NoteFormValues } from '../interface';

export const NotesPanel = ({ candidate, trainerName }: CandidatePanelProps) => {
  const [form] = Form.useForm<NoteFormValues>();
  const addNote = useAppMutation(
    ({ text }: NoteFormValues) => addCandidateNote(candidate.id, text.trim(), trainerName),
    SUCCESS_MESSAGE.noteAdded,
  );
  const notes = candidate.notes.toSorted((a, b) => b.at.localeCompare(a.at));

  return (
    <Card title="Trainer comments and notes">
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={values => addNote.mutate(values, { onSuccess: () => form.resetFields() })}
      >
        <Form.Item
          name="text"
          label="Add a comment"
          rules={[{ required: true, whitespace: true, message: TRAINER_ERROR.noteRequired }]}
        >
          <Input.TextArea rows={3} placeholder="Interview observations, follow-ups or coaching needs" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={addNote.isPending}>
          Add note
        </Button>
      </Form>
      <Flex vertical gap={12} className="notes-list">
        {!notes.length && <Typography.Text type="secondary">No notes yet.</Typography.Text>}
        {notes.map(note => (
          <div key={note.id} className="note-item">
            <div className="muted small">
              {note.by} · {formatDateTime(note.at)}
            </div>
            <Typography.Paragraph style={{ margin: '4px 0 0' }}>{note.text}</Typography.Paragraph>
          </div>
        ))}
      </Flex>
    </Card>
  );
};
