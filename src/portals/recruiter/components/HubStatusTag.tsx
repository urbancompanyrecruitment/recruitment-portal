import { Tag } from 'antd';
import { HUB_STATUS } from '../constant';
import { HubStatusTagProps } from '../interface';

export const HubStatusTag = ({ hub }: HubStatusTagProps) => {
  const status = hub ? HUB_STATUS.available : HUB_STATUS.pending;
  return <Tag color={status.color}>{status.label}</Tag>;
};
