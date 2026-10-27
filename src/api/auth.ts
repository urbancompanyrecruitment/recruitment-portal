import { SessionUser, UserRole } from '@/domain/interface';
import { BUSINESS_ACCOUNT, DEMO_PASSWORD } from '@/mocks/constant';
import { mockQuery } from './client';
import { API_ERROR } from './constant';

export const signIn = (role: UserRole, loginId: string, password: string): Promise<SessionUser> =>
  mockQuery(db => {
    const trimmedLogin = loginId.trim();
    if (password !== DEMO_PASSWORD) throw new Error(API_ERROR.invalidCredentials);

    const trainer = db.trainers.find(item => item.active && item.loginId === trimmedLogin);
    const recruiter = db.recruiters.find(item => item.active && item.loginId === trimmedLogin);
    const accounts: Record<UserRole, SessionUser | undefined> = {
      [UserRole.Trainer]: trainer && {
        id: trainer.id,
        name: trainer.name,
        role,
        subtitle: trainer.geography,
        geography: trainer.geography,
      },
      [UserRole.Recruiter]: recruiter && { id: recruiter.id, name: recruiter.name, role, subtitle: recruiter.company },
      [UserRole.Business]:
        trimmedLogin === BUSINESS_ACCOUNT.loginId
          ? { id: BUSINESS_ACCOUNT.id, name: BUSINESS_ACCOUNT.name, role, subtitle: BUSINESS_ACCOUNT.subtitle }
          : undefined,
    };

    const account = accounts[role];
    if (!account) throw new Error(API_ERROR.invalidCredentials);
    return account;
  });
