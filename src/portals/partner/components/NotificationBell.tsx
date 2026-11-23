import { BellOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Popover, Typography } from 'antd';
import { listPartnerNotifications, markPartnerNotificationsRead } from '@/api/candidates';
import { QUERY_KEY } from '@/api/constant';
import { formatDateTime } from '@/domain/format';
import { NOTIFICATION_COPY, NOTIFICATION_REFETCH_MS, PARTNER_NOTIFICATIONS } from '../constant';
import { NotificationBellProps } from '../interface';

export const NotificationBell = ({ partnerId }: NotificationBellProps) => {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: QUERY_KEY.partnerNotifications(partnerId),
    queryFn: listPartnerNotifications,
    refetchInterval: NOTIFICATION_REFETCH_MS,
  });
  const markRead = useMutation({
    mutationFn: markPartnerNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY.partnerNotifications(partnerId) }),
  });
  const items = notifications.data?.notifications ?? [];
  const unreadCount = notifications.data?.unreadCount ?? 0;

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      title={PARTNER_NOTIFICATIONS.title}
      onOpenChange={open => {
        if (!open && unreadCount) markRead.mutate();
      }}
      content={
        <div className="partner-notifications">
          {!items.length && <Typography.Text type="secondary">{PARTNER_NOTIFICATIONS.empty}</Typography.Text>}
          {items.map(item => (
            <div key={item.id} className={item.read ? 'partner-notification' : 'partner-notification partner-notification-unread'}>
              <Typography.Text strong>{NOTIFICATION_COPY[item.type].title}</Typography.Text>
              <div>{NOTIFICATION_COPY[item.type].body(item.data)}</div>
              <div className="muted small">{formatDateTime(item.createdAt)}</div>
            </div>
          ))}
        </div>
      }
    >
      <Badge count={unreadCount} size="small">
        <Button
          shape="circle"
          icon={<BellOutlined />}
          aria-label={unreadCount ? `${PARTNER_NOTIFICATIONS.label}, ${unreadCount} unread` : PARTNER_NOTIFICATIONS.label}
        />
      </Badge>
    </Popover>
  );
};
