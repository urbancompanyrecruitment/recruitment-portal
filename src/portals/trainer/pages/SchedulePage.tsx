import { Card, Col, Empty, Flex, Row, Segmented, Switch, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidates, useSlots, useTrainers } from '@/api/hooks';
import { ASSESSMENT_STAGES, DAY_DATE_FORMAT, STAGE_LABEL } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { InterviewSlot, UserRole } from '@/domain/interface';
import { formatSlot } from '@/domain/slot';
import { useSessionUser } from '@/shared/auth/AuthProvider';
import { CandidateAvatar, PageHeader, ResultTag } from '@/shared/components/ui';
import { SCHEDULE_RANGE_OPTIONS, TRAINER_PATH, UNASSIGNED } from '../constant';
import { ScheduleRange } from '../interface';

export const SchedulePage = () => {
  const user = useSessionUser(UserRole.Trainer);
  const slots = useSlots();
  const candidates = useCandidates(user.geography);
  const trainers = useTrainers();
  const [onlyMine, setOnlyMine] = useState(true);
  const [range, setRange] = useState(ScheduleRange.Upcoming);
  const today = toIsoDate();

  const sessionsByDay = Object.entries(
    (slots.data ?? [])
      .filter(slot => slot.geography === user.geography)
      .filter(slot => !onlyMine || slot.trainerId === user.id)
      .filter(slot => (range === ScheduleRange.Upcoming ? slot.date >= today : slot.date < today))
      .reduce<Record<string, InterviewSlot[]>>(
        (days, slot) => ({ ...days, [slot.date]: [...(days[slot.date] ?? []), slot] }),
        {},
      ),
  );
  const days = range === ScheduleRange.Upcoming ? sessionsByDay : sessionsByDay.toReversed();

  return (
    <>
      <PageHeader
        title="My interview schedule"
        subtitle="The business team maintains dates, availability and trainer assignments."
      />
      <Flex justify="space-between" align="center" gap={12} wrap className="schedule-toolbar">
        <Segmented value={range} options={SCHEDULE_RANGE_OPTIONS} onChange={setRange} />
        <Flex align="center" gap={8}>
          <Switch id="only-my-sessions" checked={onlyMine} onChange={setOnlyMine} />
          <label htmlFor="only-my-sessions">Only my sessions</label>
        </Flex>
      </Flex>
      {slots.isLoading && <Card loading />}
      {!slots.isLoading && !days.length && (
        <Card>
          <Empty
            description={
              onlyMine
                ? 'No sessions assigned to you. Turn off “Only my sessions” to see your colleagues’ sessions.'
                : 'No sessions scheduled for your geography.'
            }
          />
        </Card>
      )}
      {days.map(([date, sessions]) => (
        <section key={date} className="schedule-day">
          <Flex align="center" gap={8} className="schedule-day-title">
            <Typography.Title level={5} style={{ margin: 0 }}>
              {dayjs(date).format(DAY_DATE_FORMAT)}
            </Typography.Title>
            {date === today && <Tag color="purple">Today</Tag>}
          </Flex>
          <Row gutter={[16, 16]}>
            {sessions.map(slot => {
              const booked = (candidates.data ?? []).filter(candidate => candidate.slotId === slot.id);
              const trainerName = trainers.data?.find(trainer => trainer.id === slot.trainerId)?.name ?? UNASSIGNED;
              return (
                <Col xs={24} xl={12} key={slot.id}>
                  <Card className="session-card">
                    <Flex justify="space-between" align="flex-start" gap={12} wrap>
                      <div>
                        <Typography.Text strong>{formatSlot(slot)}</Typography.Text>
                        <div className="muted small">
                          {slot.centre} · {slot.address}
                        </div>
                      </div>
                      <Flex gap={6} wrap>
                        <Tag>{slot.trainerId === user.id ? `${trainerName} (you)` : trainerName}</Tag>
                        {!slot.isOpen && <Tag color="warning">Closed</Tag>}
                      </Flex>
                    </Flex>
                    <div className="session-bookings">
                      <strong>
                        {booked.length} / {slot.capacity}
                      </strong>{' '}
                      booked
                    </div>
                    {!booked.length && <Typography.Text type="secondary">No candidates booked yet.</Typography.Text>}
                    <Flex vertical gap={8}>
                      {booked.map(candidate => (
                        <Link
                          key={candidate.id}
                          to={TRAINER_PATH.candidate(candidate.id)}
                          className="session-candidate"
                        >
                          <CandidateAvatar name={candidate.name} size={36} />
                          <div className="session-candidate-info">
                            <Typography.Text strong>{candidate.name}</Typography.Text>
                            <div className="muted small">{candidate.phone}</div>
                          </div>
                          <Flex gap={4} wrap>
                            {ASSESSMENT_STAGES.map(stage => (
                              <ResultTag key={stage} result={candidate.results[stage]} label={STAGE_LABEL[stage]} />
                            ))}
                          </Flex>
                        </Link>
                      ))}
                    </Flex>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </section>
      ))}
    </>
  );
};
