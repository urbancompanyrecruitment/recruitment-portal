import { ComponentType } from 'react';
import { PageHeader } from '@/shared/components/ui';
import { CandidateDownload } from '../components/CandidateDownload';
import { CreateAdminForm } from '../components/CreateAdminForm';
import { CreateRecruiterForm } from '../components/CreateRecruiterForm';
import { HubUpload } from '../components/HubUpload';
import { SlotUpload } from '../components/SlotUpload';
import { VerifiedUpload } from '../components/VerifiedUpload';
import { ADMIN_TOOLS } from '../constant';
import { AdminTool, ToolPageProps } from '../interface';

const SignedUpDownload = () => <CandidateDownload file="signedUp" />;

const OpsUploadDownload = () => <CandidateDownload file="opsUpload" />;

const TOOL_CONTENT: Record<AdminTool, ComponentType> = {
  [AdminTool.SignedUpDownload]: SignedUpDownload,
  [AdminTool.OpsUploadDownload]: OpsUploadDownload,
  [AdminTool.VerifiedUpload]: VerifiedUpload,
  [AdminTool.HubUpload]: HubUpload,
  [AdminTool.SlotUpload]: SlotUpload,
  [AdminTool.CreateRecruiter]: CreateRecruiterForm,
  [AdminTool.CreateAdmin]: CreateAdminForm,
};

export const ToolPage = ({ tool }: ToolPageProps) => {
  const Content = TOOL_CONTENT[tool];

  return (
    <>
      <PageHeader title={ADMIN_TOOLS[tool].title} subtitle={ADMIN_TOOLS[tool].subtitle} />
      <Content />
    </>
  );
};
