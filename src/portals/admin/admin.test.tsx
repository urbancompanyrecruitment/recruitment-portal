import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { API_ERROR } from '@/api/constant';
import { ADMIN_ROLE_LABEL, LOCK_NO_EXPIRY_LABEL, PARTNER_STATE_TAG, RECRUITER_STATUS_TAG } from '@/domain/constant';
import {
  AdminRole,
  HubRowOutcome,
  ImportRowOutcome,
  LockOrigin,
  PartnerState,
  RecruiterStatus,
  SessionUser,
  SlotRowOutcome,
  UserRole,
} from '@/domain/interface';
import { CHANGE_PASSWORD } from '@/shared/components/constant';
import { ADMIN_SESSION, OPS_ADMIN_SESSION } from '@/test/constant';
import {
  ADMIN_ACCOUNTS as ADMIN_ACCOUNT_ROWS,
  ADMIN_LOCKS,
  ADMIN_PROFILE,
  AGGREGATORS as AGGREGATOR_ROWS,
  ALL_RECRUITERS,
  CANDIDATES,
  CITIES,
  INTERVIEW_CENTRES,
  KHIN,
  LIN,
  MIRA,
  OPS_ADMIN,
  PENDING_RECRUITER,
  RECRUITERS,
  REGISTERED_BY_ALEX,
  REGISTRATION_LOCK,
  SITI,
} from '@/test/fixtures';
import { ApiStub } from '@/test/interface';
import { renderWithProviders } from '@/test/renderWithProviders';
import { requestsTo, signedOut, stubApi } from '@/test/stubFetch';
import {
  ADMIN_ACCOUNTS,
  ADMIN_ACCOUNTS_NAV_ITEM,
  ADMIN_LOGIN,
  ADMIN_MESSAGE,
  AGGREGATORS,
  APPROVAL_REQUESTS,
  ACCESS_LOG,
  ADMIN_TOOLS,
  adminToolPath,
  CREATE_RECRUITER,
  CSV_FILE_CARD,
  CSV_FILES,
  DOWNLOAD_PAGE,
  HUB_OUTCOME_LABEL,
  IMPORT_OUTCOME_LABEL,
  LIST_FILTER,
  LOCK_ORIGIN_LABEL,
  OPS_UPLOAD_FILE_NAME,
  OVERVIEW_PAGE,
  PARTNERS_PAGE,
  PLACEMENTS_PAGE,
  RECRUITER_SEARCH,
  REGISTERED_BY_LABEL,
  RESET_PASSWORD,
  SINGAPORE_PHONE_FILTER_OPTIONS,
  SLOT_OUTCOME_LABEL,
  SLOT_UPLOAD,
  TAG_RECRUITER,
  TEMPORARY_PASSWORD,
} from './constant';
import AdminPortal from './index';
import { AdminTool } from './interface';

const BASE_STUBS: ApiStub[] = [
  { path: '/admin/partners', body: CANDIDATES },
  { path: '/partner/interview-cities', body: CITIES },
  { path: '/admin/slot-occupancy', body: [{ date: '2026-11-08', cityKey: 'tampines', slots: 10, booked: 2, capacity: 40 }] },
  { path: '/admin/interview-centres', body: INTERVIEW_CENTRES },
  { path: '/admin/recruiters', body: ALL_RECRUITERS },
  { path: '/admin/locks', body: ADMIN_LOCKS },
  { path: '/admin/admins', body: ADMIN_ACCOUNT_ROWS },
];

const findDialog = async (title: string) => {
  const [heading] = await screen.findAllByText(title);

  return heading.closest('.ant-modal') as HTMLElement;
};

const renderPortal = (route: string, session: SessionUser | null = ADMIN_SESSION) =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/*" element={<AdminPortal />} />
    </Routes>,
    { route, sessions: session ? { [UserRole.Admin]: session } : {} },
  );

const OPS_UPLOAD_CSV =
  'name,phone,city_key,category_key,source_type,experiment_name\r\nThandar Aung,90000001,city_singapore_v2,cleaning_category,third_party,sg_recruitment_portal';

const uploadCsv = async (tool: AdminTool, content: string, fileName: string) => {
  await screen.findByRole('heading', { name: ADMIN_TOOLS[tool].title });

  await userEvent.upload(document.querySelector('input[type="file"]') as HTMLInputElement, new File([content], fileName, { type: 'text/csv' }));
};

describe('Admin portal', () => {
  it('signs an admin in with email and password, with no Google sign-in', async () => {
    const fetchMock = stubApi([...BASE_STUBS, signedOut(UserRole.Admin), { method: 'POST', path: '/admin/auth/login', body: ADMIN_PROFILE }]);
    renderPortal('/admin/overview', null);

    expect(await screen.findByText(ADMIN_LOGIN.title)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_LOGIN.note)).toBeInTheDocument();
    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/seeded|demo/i)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Email'), 'Admin@Example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Demo123!');
    await userEvent.click(screen.getByRole('button', { name: ADMIN_LOGIN.submit }));

    expect(await screen.findByRole('heading', { name: 'Admin overview' })).toBeInTheDocument();
    expect(screen.queryByText(/partner-recruitment-service|provider-onboarding-service|interview_slots/)).not.toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/auth/login')[0]).toEqual({ email: 'admin@example.com', password: 'Demo123!' });
  });

  it('shows why the sign-in failed', async () => {
    stubApi([signedOut(UserRole.Admin), { method: 'POST', path: '/admin/auth/login', status: 403, body: { error: { code: 'ADMIN_SUSPENDED' } } }]);
    renderPortal('/admin/login', null);

    await userEvent.type(await screen.findByLabelText('Email'), 'ops@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Demo123!');
    await userEvent.click(screen.getByRole('button', { name: ADMIN_LOGIN.submit }));

    expect(await screen.findByText(API_ERROR.adminSuspended)).toBeInTheDocument();
  });

  it('restores the admin session from the session cookie', async () => {
    stubApi([...BASE_STUBS, { path: '/admin/auth/me', body: ADMIN_PROFILE }]);
    renderPortal('/admin/overview', null);

    expect(await screen.findByRole('heading', { name: 'Admin overview' })).toBeInTheDocument();
    expect(screen.getByText(ADMIN_PROFILE.email)).toBeInTheDocument();
  });

  it('sends a signed-in admin from the sign-in page to the overview', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/login');

    expect(await screen.findByRole('heading', { name: 'Admin overview' })).toBeInTheDocument();
  });

  it('lets an admin change their own password from the header', async () => {
    const fetchMock = stubApi([...BASE_STUBS, { method: 'POST', path: '/admin/change-password', status: 204 }]);
    renderPortal('/admin/overview');

    await userEvent.click(await screen.findByRole('button', { name: CHANGE_PASSWORD.button }));
    await userEvent.type(await screen.findByLabelText(CHANGE_PASSWORD.currentLabel), 'Temp-Pass-123');
    await userEvent.type(screen.getByLabelText(CHANGE_PASSWORD.newLabel), 'AdminPass123!');
    await userEvent.type(screen.getByLabelText(CHANGE_PASSWORD.confirmLabel), 'AdminPass123!');
    await userEvent.click(screen.getByRole('button', { name: CHANGE_PASSWORD.submit }));

    expect(await screen.findByText(CHANGE_PASSWORD.success)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/change-password')[0]).toEqual({ currentPassword: 'Temp-Pass-123', newPassword: 'AdminPass123!' });
  }, 20000);

  it('keeps the overview to how the flow is doing and sends the admin to the partners tab for lists and files', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin');

    expect(await screen.findByRole('heading', { name: OVERVIEW_PAGE.title })).toBeInTheDocument();
    const totalTile = screen.getByText('Total signups').closest('.stat-tile') as HTMLElement;
    await waitFor(() => expect(within(totalTile).getByText(String(CANDIDATES.length))).toBeInTheDocument());
    const failedTile = screen.getByText('Verification failed', { selector: '.muted' }).closest('.stat-tile') as HTMLElement;
    expect(within(failedTile).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Recruitment funnel')).toBeInTheDocument();
    expect(screen.getByText('Upcoming interview slots')).toBeInTheDocument();

    expect(screen.queryByText('Lin Lin Htet')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /CSV/ })).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByRole('button', { name: new RegExp(TAG_RECRUITER.action) })).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText('Filter by status'));
    fireEvent.click(await screen.findByTitle(PARTNER_STATE_TAG[PartnerState.VerificationFailed].label));
    await waitFor(() => expect(within(totalTile).getByText('1')).toBeInTheDocument());

    expect(screen.getByRole('link', { name: 'Candidates' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: OVERVIEW_PAGE.partnersLink }));
    expect(await screen.findByRole('heading', { name: PARTNERS_PAGE.title })).toBeInTheDocument();
  });

  it('lists candidates on the candidates tab with their numbers, status, hub and recruiter, and nothing else', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates');

    expect(await screen.findByRole('heading', { name: PARTNERS_PAGE.title })).toBeInTheDocument();
    const row = (await screen.findByText('Lin Lin Htet')).closest('tr') as HTMLElement;
    expect(within(row).getByText('+6590000012')).toBeInTheDocument();
    expect(within(row).getByText(`${PARTNERS_PAGE.singaporePhonePrefix} +6590000012`)).toBeInTheDocument();
    expect(screen.queryByText('Lead created')).not.toBeInTheDocument();
    expect(screen.queryByText(/Urban Company|urbanclap|UC Verified/)).not.toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByRole('button', { name: /CSV/ })).not.toBeInTheDocument();
    expect(screen.getByText(`1–${CANDIDATES.length} of ${CANDIDATES.length}`)).toBeInTheDocument();
    expect(within(row).getByText(PARTNER_STATE_TAG[PartnerState.SignedUp].label)).toBeInTheDocument();
    const thandar = screen.getByText('Thandar Aung').closest('tr') as HTMLElement;
    expect(within(thandar).getByText('Alex Morgan')).toBeInTheDocument();
    expect(within(thandar).getByText(PARTNER_STATE_TAG[PartnerState.Verified].label)).toBeInTheDocument();
    const ana = screen.getByText('Ana Reyes').closest('tr') as HTMLElement;
    expect(within(ana).getByText('Tampines East')).toBeInTheDocument();
    const khin = screen.getByText(KHIN.name).closest('tr') as HTMLElement;
    expect(within(khin).getByText(PARTNER_STATE_TAG[PartnerState.VerificationFailed].label)).toBeInTheDocument();
    expect(within(khin).getByText(/Asia\/Yangon/)).toBeInTheDocument();
    expect(within(khin).queryByRole('button', { name: /Singapore number/ })).not.toBeInTheDocument();
  });

  it('filters the partners by status, so the ones who failed verification can be listed', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates');

    await screen.findByText('Lin Lin Htet');
    fireEvent.mouseDown(screen.getByLabelText('Filter by status'));
    fireEvent.click(await screen.findByTitle(PARTNER_STATE_TAG[PartnerState.VerificationFailed].label));

    await waitFor(() => expect(screen.queryByText('Lin Lin Htet')).not.toBeInTheDocument());
    expect(screen.getByText(KHIN.name)).toBeInTheDocument();
  });

  it('searches candidates by name, mobile number, hub or recruiter', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates');

    await screen.findByText('Lin Lin Htet');
    const search = screen.getByLabelText(PARTNERS_PAGE.searchLabel);

    await userEvent.type(search, '9000 0012');
    await waitFor(() => expect(screen.queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(screen.getByText('Lin Lin Htet')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'tampines east');
    await waitFor(() => expect(screen.queryByText('Lin Lin Htet')).not.toBeInTheDocument());
    expect(screen.getByText('Ana Reyes')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'jamie lee');
    await waitFor(() => expect(screen.queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'nobody here');
    expect(await screen.findByText(PARTNERS_PAGE.listEmpty)).toBeInTheDocument();
  }, 20000);

  it('links every CSV file and account form from the sidebar, each on its own page', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates');

    await screen.findByRole('heading', { name: PARTNERS_PAGE.title });

    Object.values(AdminTool).forEach(tool =>
      expect(screen.getByRole('link', { name: ADMIN_TOOLS[tool].label })).toHaveAttribute('href', adminToolPath(tool)),
    );

    await userEvent.click(screen.getByRole('link', { name: ADMIN_TOOLS[AdminTool.HubUpload].label }));

    expect(await screen.findByRole('heading', { name: ADMIN_TOOLS[AdminTool.HubUpload].title })).toBeInTheDocument();
    expect(screen.getByText(`Admin workspace / ${ADMIN_TOOLS[AdminTool.HubUpload].label}`)).toBeInTheDocument();
  });

  it('hides the create-admin link from an ordinary admin', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates', OPS_ADMIN_SESSION);

    await screen.findByRole('heading', { name: PARTNERS_PAGE.title });

    expect(screen.getByRole('link', { name: ADMIN_TOOLS[AdminTool.CreateRecruiter].label })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: ADMIN_TOOLS[AdminTool.CreateAdmin].label })).not.toBeInTheDocument();
  });

  it('states the format and the conditions of every CSV download and upload on its page', async () => {
    stubApi(BASE_STUBS);
    const pages: Array<[AdminTool, keyof typeof CSV_FILES]> = [
      [AdminTool.SignedUpDownload, 'signedUp'],
      [AdminTool.OpsUploadDownload, 'opsUpload'],
      [AdminTool.VerifiedUpload, 'verified'],
      [AdminTool.HubUpload, 'hubs'],
    ];

    for (const [tool, key] of pages) {
      const file = CSV_FILES[key];
      const view = renderPortal(adminToolPath(tool));
      expect(await screen.findByRole('heading', { name: file.title })).toBeInTheDocument();
      const card = screen.getByText(CSV_FILE_CARD.title, { selector: '.ant-card-head-title' }).closest('.ant-card') as HTMLElement;

      file.columns.forEach(column => expect(within(card).getByText(column, { selector: 'code' })).toBeInTheDocument());
      file.conditions.forEach(condition => expect(within(card).getByText(condition)).toBeInTheDocument());
      expect(within(card).getByRole('button', { name: new RegExp(file.action) })).toBeInTheDocument();
      expect(screen.queryByText(/Urban Company|urbanclap/)).not.toBeInTheDocument();

      view.unmount();
    }

    expect(CSV_FILES.opsUpload.conditions).toContain('Only candidates with a valid Singapore number are included.');
  });

  it('downloads the ops upload file for the current filters and says how many partners go into it', async () => {
    const createObjectURL = vi.fn((_file: Blob) => 'blob:ops-upload');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const fetchMock = stubApi([...BASE_STUBS, { path: '/admin/partners/ops-lead-upload.csv', text: OPS_UPLOAD_CSV }]);
    renderPortal(adminToolPath(AdminTool.OpsUploadDownload));

    const card = (await screen.findByText(CSV_FILE_CARD.title, { selector: '.ant-card-head-title' })).closest('.ant-card') as HTMLElement;
    expect(await within(card).findByText(DOWNLOAD_PAGE.summary(4, CANDIDATES.length, true))).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText('Filter by status'));
    fireEvent.click(await screen.findByTitle(PARTNER_STATE_TAG[PartnerState.Verified].label));
    expect(await within(card).findByText(DOWNLOAD_PAGE.summary(2, 2, true))).toBeInTheDocument();

    await userEvent.click(within(card).getByRole('button', { name: new RegExp(CSV_FILES.opsUpload.action) }));

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe(OPS_UPLOAD_FILE_NAME);
    expect(await createObjectURL.mock.calls[0][0].text()).toBe(OPS_UPLOAD_CSV);
    const requested = fetchMock.mock.calls.map(([input]) => String(input)).filter(url => url.includes('ops-lead-upload.csv'));
    expect(requested).toHaveLength(1);
    expect(requested[0].endsWith(`/admin/partners/ops-lead-upload.csv?state=${PartnerState.Verified}`)).toBe(true);

    click.mockRestore();
  });

  it('downloads the signed-up candidates file from its own page', async () => {
    const createObjectURL = vi.fn((_file: Blob) => 'blob:signed-up');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const fetchMock = stubApi([...BASE_STUBS, { path: '/admin/partners/export.csv', text: 'name,location,primary_mobile' }]);
    renderPortal(adminToolPath(AdminTool.SignedUpDownload));

    expect(await screen.findByText(DOWNLOAD_PAGE.summary(CANDIDATES.length, CANDIDATES.length, false))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(CSV_FILES.signedUp.action) }));

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(await createObjectURL.mock.calls[0][0].text()).toBe('name,location,primary_mobile');
    expect(fetchMock.mock.calls.map(([input]) => String(input)).filter(url => url.includes('ops-lead-upload.csv'))).toHaveLength(0);

    click.mockRestore();
  });

  it('adds a Singapore number through the admin endpoint', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/partners/${MIRA.id}/singapore-phone`, body: { ...MIRA, singaporePhone: '+6591234567', hasSingaporePhone: true } },
    ]);
    renderPortal('/admin/candidates');

    await userEvent.click(await screen.findByRole('button', { name: 'Add Singapore number for Mira Santos' }));
    await userEvent.type(await screen.findByLabelText('Singapore mobile number'), '+65 9123 4567');
    await userEvent.click(screen.getByRole('button', { name: 'Save number' }));

    expect(await screen.findByText(ADMIN_MESSAGE.singaporePhoneSaved)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/partners/${MIRA.id}/singapore-phone`)[0]).toEqual({ singaporePhone: '+65 9123 4567' });
  });

  it('uploads a verified list with a verified column, shows the counts and offers a fail CSV', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: '/admin/verification-imports',
        status: 201,
        body: {
          importId: 'imp-1',
          fileName: 'verified.csv',
          counts: { rows: 3, accepted: 1, rejected: 1, errors: 1 },
          rows: [
            { rowNumber: 1, primaryPhone: '+65 9000 0012', verified: 'true', outcome: ImportRowOutcome.Accepted, partnerId: LIN.id },
            { rowNumber: 2, primaryPhone: '+66 9000 0008', verified: 'FALSE', outcome: ImportRowOutcome.Rejected, partnerId: MIRA.id },
            { rowNumber: 3, primaryPhone: '+65 7777 7777', verified: 'maybe', outcome: ImportRowOutcome.InvalidVerified },
          ],
        },
      },
    ]);
    renderPortal(adminToolPath(AdminTool.VerifiedUpload));

    await uploadCsv(AdminTool.VerifiedUpload, 'verified,primary_mobile\ntrue,+65 9000 0012\nFALSE,"+66 9000 0008"\nmaybe,+65 7777 7777\n', 'verified.csv');

    expect(await screen.findByText('1 verified, 1 marked as verification failed, 1 not applied out of 3 rows.')).toBeInTheDocument();
    expect(screen.getByText(IMPORT_OUTCOME_LABEL[ImportRowOutcome.InvalidVerified])).toBeInTheDocument();
    expect(screen.queryByText(IMPORT_OUTCOME_LABEL[ImportRowOutcome.Rejected])).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download fail CSV/ })).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/verification-imports')[0]).toEqual({
      fileName: 'verified.csv',
      rows: [
        { primaryPhone: '+65 9000 0012', verified: 'true' },
        { primaryPhone: '+66 9000 0008', verified: 'FALSE' },
        { primaryPhone: '+65 7777 7777', verified: 'maybe' },
      ],
    });
  });

  it('uploads a hub list with phone number and hub name and reports the rows it could not apply', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: '/admin/hub-imports',
        body: {
          fileName: 'hubs.csv',
          counts: { rows: 2, updated: 1, errors: 1 },
          rows: [
            { rowNumber: 1, primaryPhone: '+65 9000 0012', hubName: 'Jurong West', outcome: HubRowOutcome.Updated, partnerId: LIN.id },
            { rowNumber: 2, primaryPhone: '+95 9000 0009', hubName: 'Bedok', outcome: HubRowOutcome.NotEligible, partnerId: KHIN.id },
          ],
        },
      },
    ]);
    renderPortal(adminToolPath(AdminTool.HubUpload));

    await uploadCsv(AdminTool.HubUpload, 'primary_mobile,hub_name\n+65 9000 0012,Jurong West\n+95 9000 0009,Bedok\n', 'hubs.csv');

    expect(await screen.findByText('1 hub updated, 1 not applied out of 2 rows.')).toBeInTheDocument();
    expect(screen.getByText(HUB_OUTCOME_LABEL[HubRowOutcome.NotEligible])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download hub fail CSV/ })).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/hub-imports')[0]).toEqual({
      fileName: 'hubs.csv',
      rows: [
        { primaryPhone: '+65 9000 0012', hubName: 'Jurong West' },
        { primaryPhone: '+95 9000 0009', hubName: 'Bedok' },
      ],
    });
  });

  it('creates a recruiter and shows the temporary password once', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/admin/recruiters', status: 201, body: { recruiter: { ...RECRUITERS[0], id: 'r-new', name: 'Sam Tan', email: 'sam@agency.sg', company: 'Agency' }, temporaryPassword: 'Temp-Pass-123' } },
    ]);
    renderPortal(adminToolPath(AdminTool.CreateRecruiter));

    await userEvent.type(await screen.findByLabelText('Name'), 'Sam Tan');
    await userEvent.type(screen.getByLabelText('Organisation'), 'Agency');
    await userEvent.type(screen.getByLabelText('Email'), 'Sam@agency.sg');
    await userEvent.click(screen.getByRole('button', { name: CREATE_RECRUITER.submit }));

    const dialog = await findDialog(TEMPORARY_PASSWORD.title('Sam Tan'));
    expect(within(dialog).getByText('Temp-Pass-123')).toBeInTheDocument();
    expect(within(dialog).getByText('sam@agency.sg')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/recruiters')[0]).toEqual({ name: 'Sam Tan', company: 'Agency', email: 'sam@agency.sg' });
  });

  it('lists incoming approval requests apart from the recruiters table and approves one', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/recruiters/${PENDING_RECRUITER.id}/status`, body: { ...PENDING_RECRUITER, status: 'active', active: true } },
    ]);
    renderPortal('/admin/recruiters');

    const requests = (await screen.findByText(`${APPROVAL_REQUESTS.title} (1)`)).closest('.ant-card') as HTMLElement;
    expect(await within(requests).findByText(PENDING_RECRUITER.name)).toBeInTheDocument();
    expect(within(requests).getByText(/SwiftStaff Agency · priya\.nair@swiftstaff\.sg/)).toBeInTheDocument();
    expect(within(requests).queryByText('Alex Morgan')).not.toBeInTheDocument();

    const table = screen.getByLabelText(RECRUITER_SEARCH.label).closest('.ant-card') as HTMLElement;
    expect(within(table).queryByText(PENDING_RECRUITER.name)).not.toBeInTheDocument();

    await userEvent.click(within(requests).getByRole('button', { name: `${APPROVAL_REQUESTS.approve} ${PENDING_RECRUITER.name}` }));

    expect(await screen.findByText(ADMIN_MESSAGE.recruiterAccessUpdated)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${PENDING_RECRUITER.id}/status`)[0]).toEqual({ status: 'active' });
  });

  it('rejects an approval request after confirmation', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/recruiters/${PENDING_RECRUITER.id}/status`, body: { ...PENDING_RECRUITER, status: 'rejected' } },
    ]);
    renderPortal('/admin/recruiters');

    await userEvent.click(await screen.findByRole('button', { name: `${APPROVAL_REQUESTS.reject} ${PENDING_RECRUITER.name}` }));

    expect(await screen.findByText(APPROVAL_REQUESTS.rejectTitle(PENDING_RECRUITER.name))).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${PENDING_RECRUITER.id}/status`)).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: APPROVAL_REQUESTS.reject }));

    await waitFor(() => expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${PENDING_RECRUITER.id}/status`)[0]).toEqual({ status: 'rejected' }));
  });

  it('shows how each recruiter is doing: locks acquired and placements submitted', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/recruiters');

    const table = (await screen.findByLabelText(RECRUITER_SEARCH.label)).closest('.ant-card') as HTMLElement;
    expect(within(table).getByRole('columnheader', { name: /Locks acquired/ })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: /Placements submitted/ })).toBeInTheDocument();

    const alex = (await within(table).findByText('Alex Morgan')).closest('tr') as HTMLElement;
    expect(within(alex).getAllByRole('cell').map(cell => cell.textContent).slice(3, 5)).toEqual(['7', '2']);
    const jamie = within(table).getByText('Jamie Lee').closest('tr') as HTMLElement;
    expect(within(jamie).getAllByRole('cell').map(cell => cell.textContent).slice(3, 5)).toEqual(['4', '0']);
  });

  it('suspends a recruiter through the status endpoint', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'PUT', path: `/admin/recruiters/${RECRUITERS[1].id}/status`, body: { ...RECRUITERS[1], status: 'suspended', active: false } },
    ]);
    renderPortal('/admin/recruiters');

    await userEvent.click(await screen.findByRole('button', { name: 'Suspend Jamie Lee' }));

    expect(await screen.findByText(ADMIN_MESSAGE.recruiterAccessUpdated)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${RECRUITERS[1].id}/status`)[0]).toEqual({ status: 'suspended' });
  });

  it('brings a suspended recruiter back and can still approve a rejected one', async () => {
    const suspended = { ...RECRUITERS[1], status: RecruiterStatus.Suspended, active: false };
    const rejected = { ...PENDING_RECRUITER, status: RecruiterStatus.Rejected };
    const fetchMock = stubApi([
      ...BASE_STUBS.filter(stub => stub.path !== '/admin/recruiters'),
      { path: '/admin/recruiters', body: [RECRUITERS[0], suspended, rejected] },
      { method: 'PUT', path: `/admin/recruiters/${suspended.id}/status`, body: RECRUITERS[1] },
      { method: 'PUT', path: `/admin/recruiters/${rejected.id}/status`, body: { ...rejected, status: 'active', active: true } },
    ]);
    renderPortal('/admin/recruiters');

    const table = (await screen.findByLabelText(RECRUITER_SEARCH.label)).closest('.ant-card') as HTMLElement;
    const jamie = (await within(table).findByText('Jamie Lee')).closest('tr') as HTMLElement;
    expect(within(jamie).getByText('Suspended')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Suspend Jamie Lee' })).not.toBeInTheDocument();

    await userEvent.click(within(jamie).getByRole('button', { name: 'Reactivate Jamie Lee' }));

    await waitFor(() => expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${suspended.id}/status`)[0]).toEqual({ status: 'active' }));

    await userEvent.click(screen.getByRole('button', { name: `Approve ${rejected.name}` }));

    await waitFor(() => expect(requestsTo(fetchMock, 'PUT', `/admin/recruiters/${rejected.id}/status`)[0]).toEqual({ status: 'active' }));
  });

  it('resets a recruiter password after confirmation and shows the temporary password to share', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: `/admin/recruiters/${RECRUITERS[1].id}/reset-password`, body: { temporaryPassword: 'Reset-Pass-456' } },
    ]);
    renderPortal('/admin/recruiters');

    await userEvent.click(await screen.findByRole('button', { name: `${RESET_PASSWORD.action} for Jamie Lee` }));

    expect(await screen.findByText(RESET_PASSWORD.confirmTitle('Jamie Lee'))).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/admin/recruiters/${RECRUITERS[1].id}/reset-password`)).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: RESET_PASSWORD.action }));

    const dialog = await findDialog(TEMPORARY_PASSWORD.title('Jamie Lee'));
    expect(within(dialog).getByText('Reset-Pass-456')).toBeInTheDocument();
    expect(within(dialog).getByText(RECRUITERS[1].email)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/admin/recruiters/${RECRUITERS[1].id}/reset-password`)).toHaveLength(1);
  });

  it('offers no password reset for partners, who sign in with their last name', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/candidates');

    expect(await screen.findByText('Mira Santos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(RESET_PASSWORD.action) })).not.toBeInTheDocument();
  });

  it('shows which recruiter registered a partner', async () => {
    stubApi([...BASE_STUBS.filter(stub => stub.path !== '/admin/partners'), { path: '/admin/partners', body: [...CANDIDATES, REGISTERED_BY_ALEX] }]);
    renderPortal('/admin/candidates');

    const row = (await screen.findByText(REGISTERED_BY_ALEX.name)).closest('tr') as HTMLElement;
    expect(within(row).getByText(`${REGISTERED_BY_LABEL} Alex Morgan · BrightPath Recruitment`)).toBeInTheDocument();
    const mira = screen.getByText('Mira Santos').closest('tr') as HTMLElement;
    expect(within(mira).queryByText(new RegExp(REGISTERED_BY_LABEL))).not.toBeInTheDocument();
  });

  it('tags a verified partner without a live lock to an approved recruiter', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: `/admin/partners/${SITI.id}/assign-recruiter`,
        status: 201,
        body: { ...REGISTRATION_LOCK, origin: LockOrigin.Admin, recruiterId: RECRUITERS[1].id, lockReleaseAt: new Date().toISOString() },
      },
    ]);
    renderPortal('/admin/candidates');

    const siti = (await screen.findByText('Siti Rahma')).closest('tr') as HTMLElement;
    const thandar = screen.getByText('Thandar Aung').closest('tr') as HTMLElement;
    const mira = screen.getByText('Mira Santos').closest('tr') as HTMLElement;
    await waitFor(() => expect(within(thandar).getByText('Alex Morgan')).toBeInTheDocument());
    expect(within(thandar).queryByRole('button', { name: new RegExp(TAG_RECRUITER.action) })).not.toBeInTheDocument();
    expect(within(mira).queryByRole('button', { name: new RegExp(TAG_RECRUITER.action) })).not.toBeInTheDocument();

    await userEvent.click(within(siti).getByRole('button', { name: `${TAG_RECRUITER.action}: Siti Rahma` }));

    const dialog = await findDialog(TAG_RECRUITER.title('Siti Rahma'));
    expect(within(dialog).getByText(TAG_RECRUITER.note)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: TAG_RECRUITER.submit }));
    expect(await within(dialog).findByText(TAG_RECRUITER.recruiterError)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/admin/partners/${SITI.id}/assign-recruiter`)).toHaveLength(0);

    fireEvent.mouseDown(within(dialog).getByLabelText(TAG_RECRUITER.recruiterLabel));
    const option = await screen.findByTitle('Jamie Lee · Horizon Recruitment');
    expect(screen.queryByTitle(/Priya Nair/)).not.toBeInTheDocument();
    fireEvent.click(option);
    await userEvent.click(within(dialog).getByRole('button', { name: TAG_RECRUITER.submit }));

    expect(await screen.findByText(ADMIN_MESSAGE.recruiterTagged)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/admin/partners/${SITI.id}/assign-recruiter`)[0]).toEqual({ recruiterId: RECRUITERS[1].id });
  }, 20000);

  it('lists the aggregators of each recruiter and adds one from the aggregators dialog', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: `/admin/recruiters/${RECRUITERS[1].id}/aggregators`,
        status: 201,
        body: { id: 'agg-new', recruiterId: RECRUITERS[1].id, name: 'Horizon Staffing', createdAt: new Date().toISOString() },
      },
    ]);
    renderPortal('/admin/recruiters');

    const table = (await screen.findByLabelText(RECRUITER_SEARCH.label)).closest('.ant-card') as HTMLElement;
    const alex = (await within(table).findByText('Alex Morgan')).closest('tr') as HTMLElement;
    const jamie = within(table).getByText('Jamie Lee').closest('tr') as HTMLElement;
    expect(within(table).getByRole('columnheader', { name: AGGREGATORS.column })).toBeInTheDocument();
    expect(within(alex).getByText(AGGREGATOR_ROWS[0].name)).toBeInTheDocument();
    expect(within(alex).getByText(AGGREGATOR_ROWS[1].name)).toBeInTheDocument();
    expect(within(jamie).getByText(AGGREGATORS.none)).toBeInTheDocument();

    await userEvent.click(within(jamie).getByRole('button', { name: `${AGGREGATORS.manage} of Jamie Lee` }));

    const dialog = await findDialog(AGGREGATORS.modalTitle('Jamie Lee'));
    expect(within(dialog).getByText(AGGREGATORS.empty)).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: AGGREGATORS.add }));
    expect(await within(dialog).findByText(AGGREGATORS.nameError)).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(AGGREGATORS.nameLabel), ' Horizon Staffing ');
    await userEvent.click(within(dialog).getByRole('button', { name: AGGREGATORS.add }));

    expect(await screen.findByText(ADMIN_MESSAGE.aggregatorAdded)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', `/admin/recruiters/${RECRUITERS[1].id}/aggregators`)[0]).toEqual({ name: 'Horizon Staffing' });
  }, 20000);

  it('removes an aggregator from a recruiter after confirmation', async () => {
    const path = `/admin/recruiters/${RECRUITERS[0].id}/aggregators/${AGGREGATOR_ROWS[0].id}`;
    const fetchMock = stubApi([...BASE_STUBS, { method: 'DELETE', path, status: 204 }]);
    renderPortal('/admin/recruiters');

    await userEvent.click(await screen.findByRole('button', { name: `${AGGREGATORS.manage} of Alex Morgan` }));

    const dialog = await findDialog(AGGREGATORS.modalTitle('Alex Morgan'));
    await userEvent.click(within(dialog).getByRole('button', { name: `${AGGREGATORS.remove} ${AGGREGATOR_ROWS[0].name}` }));

    expect(await screen.findByText(AGGREGATORS.removeTitle(AGGREGATOR_ROWS[0].name))).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'DELETE', path)).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: AGGREGATORS.remove }));

    expect(await screen.findByText(ADMIN_MESSAGE.aggregatorRemoved)).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'DELETE', path)).toHaveLength(1);
  }, 20000);

  it('searches recruiters by name, organisation or email', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/recruiters');

    const card = (await screen.findByLabelText(RECRUITER_SEARCH.label)).closest('.ant-card') as HTMLElement;
    expect(await within(card).findByText('Alex Morgan')).toBeInTheDocument();
    expect(within(card).getByText('Jamie Lee')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(RECRUITER_SEARCH.label), 'horizon');

    expect(within(card).getByText('Jamie Lee')).toBeInTheDocument();
    expect(within(card).queryByText('Alex Morgan')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(RECRUITER_SEARCH.label));
    await userEvent.type(screen.getByLabelText(RECRUITER_SEARCH.label), 'ALEX.MORGAN@');

    expect(within(card).getByText('Alex Morgan')).toBeInTheDocument();
    expect(within(card).queryByText('Jamie Lee')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(RECRUITER_SEARCH.label));
    await userEvent.type(screen.getByLabelText(RECRUITER_SEARCH.label), 'nobody');

    expect(within(card).getByText(RECRUITER_SEARCH.empty)).toBeInTheDocument();
  });

  it('lets a super admin create an admin account and manage the others, but not their own', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      { method: 'POST', path: '/admin/admins', status: 201, body: { admin: { ...OPS_ADMIN, id: 'a-new', name: 'Finance Admin', email: 'finance@example.com' }, temporaryPassword: 'Admin-Temp-123' } },
      { method: 'PUT', path: `/admin/admins/${OPS_ADMIN.id}/status`, body: { ...OPS_ADMIN, status: 'suspended', active: false } },
    ]);
    renderPortal('/admin/admins');

    expect(await screen.findByRole('heading', { name: ADMIN_ACCOUNTS.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ADMIN_ACCOUNTS_NAV_ITEM.label })).toBeInTheDocument();

    const list = screen.getByText(ADMIN_ACCOUNTS.listTitle).closest('.ant-card') as HTMLElement;
    const own = (await within(list).findByText(ADMIN_PROFILE.email)).closest('tr') as HTMLElement;
    expect(within(own).getByText(ADMIN_ACCOUNTS.ownAccount)).toBeInTheDocument();
    expect(within(own).queryByRole('button')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: `Suspend ${OPS_ADMIN.name}` }));

    await waitFor(() => expect(requestsTo(fetchMock, 'PUT', `/admin/admins/${OPS_ADMIN.id}/status`)[0]).toEqual({ status: 'suspended' }));
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(ADMIN_ACCOUNTS.searchLabel), 'ops@');
    await waitFor(() => expect(within(list).queryByText(ADMIN_PROFILE.email)).not.toBeInTheDocument());
    expect(within(list).getByText(OPS_ADMIN.email)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: ADMIN_TOOLS[AdminTool.CreateAdmin].label }));
    await userEvent.type(await screen.findByLabelText('Name'), 'Finance Admin');
    await userEvent.type(screen.getByLabelText('Email'), 'Finance@Example.com');
    await userEvent.click(screen.getByRole('button', { name: ADMIN_ACCOUNTS.createAction }));

    const dialog = await findDialog(TEMPORARY_PASSWORD.title('Finance Admin'));
    expect(within(dialog).getByText('Admin-Temp-123')).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/admins')[0]).toEqual({ name: 'Finance Admin', email: 'finance@example.com', role: 'admin' });
  }, 20000);

  it('hides admin account management from an ordinary admin', async () => {
    const fetchMock = stubApi(BASE_STUBS);
    renderPortal('/admin/admins', OPS_ADMIN_SESSION);

    expect(await screen.findByRole('heading', { name: 'Admin overview' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: ADMIN_ACCOUNTS_NAV_ITEM.label })).not.toBeInTheDocument();
    expect(requestsTo(fetchMock, 'GET', '/admin/admins')).toHaveLength(0);
  });

  it('lists upcoming generated slots per city', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/overview');

    const card = (await screen.findByText('Upcoming interview slots')).closest('.ant-card') as HTMLElement;
    expect(await within(card).findByText('Tampines')).toBeInTheDocument();
    expect(within(card).getByText('2 / 40')).toBeInTheDocument();
  });

  it('names the valid interview centres and their upload values on the slot upload card', async () => {
    stubApi(BASE_STUBS);
    renderPortal(adminToolPath(AdminTool.SlotUpload));

    const card = (await screen.findByText(CSV_FILE_CARD.title, { selector: '.ant-card-head-title' })).closest('.ant-card') as HTMLElement;

    expect(await within(card).findByText(SLOT_UPLOAD.centreCondition(INTERVIEW_CENTRES[0]))).toBeInTheDocument();
    expect(within(card).getByText(/centre "yangon" is the Yangon Interview Centre: Ye Tagon Tower/)).toBeInTheDocument();
    expect(within(card).getByText('start_time')).toBeInTheDocument();
    expect(within(card).getByText('end_time')).toBeInTheDocument();
    expect(within(card).getByText(/local time of that centre/)).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: new RegExp(SLOT_UPLOAD.guide.action) })).toBeInTheDocument();
  });

  it('offers a sample CSV next to every upload button, with the header row and example rows', async () => {
    const createObjectURL = vi.fn((_file: Blob) => 'blob:sample');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    stubApi(BASE_STUBS);
    const sampleButtonOn = async (tool: AdminTool) => {
      expect(await screen.findByRole('heading', { name: ADMIN_TOOLS[tool].title })).toBeInTheDocument();
      const card = screen.getByText(CSV_FILE_CARD.title, { selector: '.ant-card-head-title' }).closest('.ant-card') as HTMLElement;

      return within(card).queryByRole('button', { name: new RegExp(CSV_FILE_CARD.sampleAction) });
    };

    for (const [tool, hasSample] of [
      [AdminTool.SignedUpDownload, false],
      [AdminTool.OpsUploadDownload, false],
      [AdminTool.HubUpload, true],
    ] as Array<[AdminTool, boolean]>) {
      const view = renderPortal(adminToolPath(tool));

      expect(Boolean(await sampleButtonOn(tool))).toBe(hasSample);

      view.unmount();
    }

    const slots = renderPortal(adminToolPath(AdminTool.SlotUpload));
    await userEvent.click((await sampleButtonOn(AdminTool.SlotUpload)) as HTMLElement);
    slots.unmount();

    renderPortal(adminToolPath(AdminTool.VerifiedUpload));
    await userEvent.click((await sampleButtonOn(AdminTool.VerifiedUpload)) as HTMLElement);

    await waitFor(() => expect(click).toHaveBeenCalledTimes(2));
    expect(await createObjectURL.mock.calls[0][0].text()).toBe(
      '"centre","start_time","end_time","capacity"\r\n"singapore","09:00","10:00","4"\r\n"singapore","14:30","15:30","6"\r\n"yangon","10:00","11:00","4"',
    );
    expect(await createObjectURL.mock.calls[1][0].text()).toBe('"primary_mobile","verified"\r\n"+6591234567","true"\r\n"+959876543210","false"');

    click.mockRestore();
  });

  it('uploads interview slots and lists the rows that were not created, such as a centre outside the list', async () => {
    const fetchMock = stubApi([
      ...BASE_STUBS,
      {
        method: 'POST',
        path: '/admin/slot-imports',
        body: {
          fileName: 'slots.csv',
          counts: { rows: 3, created: 1, updated: 1, errors: 1 },
          rows: [
            { rowNumber: 1, centre: 'singapore', startTime: '09:00', endTime: '10:00', capacity: '6', outcome: SlotRowOutcome.Created },
            { rowNumber: 2, centre: 'yangon', startTime: '10:00', endTime: '11:30', capacity: '5', outcome: SlotRowOutcome.Updated },
            { rowNumber: 3, centre: 'Tampines', startTime: '11:00', endTime: '12:00', capacity: '4', outcome: SlotRowOutcome.UnknownCentre },
          ],
        },
      },
    ]);
    renderPortal(adminToolPath(AdminTool.SlotUpload));

    const card = (await screen.findByText(CSV_FILE_CARD.title, { selector: '.ant-card-head-title' })).closest('.ant-card') as HTMLElement;
    await userEvent.upload(
      card.querySelector('input[type="file"]') as HTMLInputElement,
      new File(['centre,start_time,end_time,capacity\nsingapore,09:00,10:00,6\nyangon,10:00,11:30,5\nTampines,11:00,12:00,4\n'], 'slots.csv', { type: 'text/csv' }),
    );

    expect(await screen.findByText('1 created, 1 updated, 1 not applied out of 3 rows.')).toBeInTheDocument();
    expect(screen.getByText(SLOT_OUTCOME_LABEL[SlotRowOutcome.UnknownCentre])).toBeInTheDocument();
    expect(screen.queryByText(SLOT_OUTCOME_LABEL[SlotRowOutcome.Created])).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(SLOT_UPLOAD.failCsvAction) })).toBeInTheDocument();
    expect(requestsTo(fetchMock, 'POST', '/admin/slot-imports')[0]).toEqual({
      fileName: 'slots.csv',
      rows: [
        { centre: 'singapore', startTime: '09:00', endTime: '10:00', capacity: '6' },
        { centre: 'yangon', startTime: '10:00', endTime: '11:30', capacity: '5' },
        { centre: 'Tampines', startTime: '11:00', endTime: '12:00', capacity: '4' },
      ],
    });
  });

  it('shows lock records with their state, origin, aggregator and the released profiles', async () => {
    const registrationLock = { ...REGISTRATION_LOCK, partnerName: 'Dewi Lestari', recruiterName: 'Alex Morgan', recruiterCompany: 'BrightPath Recruitment' };

    stubApi([...BASE_STUBS.filter(stub => stub.path !== '/admin/locks'), { path: '/admin/locks', body: [...ADMIN_LOCKS, registrationLock] }]);
    renderPortal('/admin/placements');

    const locks = (await screen.findByText('Recruiter locks')).closest('.ant-card') as HTMLElement;
    const thandarRow = (await within(locks).findByText('Thandar Aung')).closest('tr') as HTMLElement;
    expect(within(thandarRow).getByText('Active')).toBeInTheDocument();
    const anaRow = within(locks).getByText('Ana Reyes').closest('tr') as HTMLElement;
    expect(within(anaRow).getByText('Inactive')).toBeInTheDocument();
    expect(within(anaRow).getByText('Placement saved')).toBeInTheDocument();
    expect(within(anaRow).getByText('HomeCare Collective')).toBeInTheDocument();
    expect(within(anaRow).getByText(LOCK_ORIGIN_LABEL[LockOrigin.Admin])).toBeInTheDocument();
    expect(within(locks).getByRole('columnheader', { name: 'Aggregator' })).toBeInTheDocument();
    expect(within(thandarRow).queryByText(LOCK_ORIGIN_LABEL[LockOrigin.Recruiter])).not.toBeInTheDocument();
    const dewiRow = within(locks).getByText('Dewi Lestari').closest('tr') as HTMLElement;
    expect(within(dewiRow).getByText(LOCK_NO_EXPIRY_LABEL)).toBeInTheDocument();
    expect(within(dewiRow).getByText(LOCK_ORIGIN_LABEL[LockOrigin.Registration])).toBeInTheDocument();
    const released = screen.getByText('Released profiles').closest('.ant-card') as HTMLElement;
    expect(await within(released).findByText('Siti Rahma')).toBeInTheDocument();
    expect(within(released).getByText('Release time passed')).toBeInTheDocument();
  });

  it('searches locks and placements by candidate, recruiter, organisation or aggregator across both lists', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/placements');

    const locks = (await screen.findByText(PLACEMENTS_PAGE.locksTitle)).closest('.ant-card') as HTMLElement;
    const released = screen.getByText(PLACEMENTS_PAGE.releasedTitle).closest('.ant-card') as HTMLElement;
    await within(locks).findByText('Thandar Aung');
    const search = screen.getByLabelText(PLACEMENTS_PAGE.searchLabel);

    await userEvent.type(search, 'homecare');
    await waitFor(() => expect(within(locks).queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(within(locks).getByText('Ana Reyes')).toBeInTheDocument();
    expect(within(released).getByText(PLACEMENTS_PAGE.searchEmpty)).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'horizon');
    await waitFor(() => expect(within(locks).queryByText('Ana Reyes')).not.toBeInTheDocument());
    expect(within(locks).getByText('Siti Rahma')).toBeInTheDocument();
    expect(within(released).getByText('Siti Rahma')).toBeInTheDocument();
  });

  it('searches the profile access log on the recruiter access page', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/recruiters');

    const log = (await screen.findByText(ACCESS_LOG.title)).closest('.ant-card') as HTMLElement;
    await within(log).findByText('Thandar Aung');

    await userEvent.type(screen.getByLabelText(ACCESS_LOG.searchLabel), 'siti');

    await waitFor(() => expect(within(log).queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(within(log).getByText('Siti Rahma')).toBeInTheDocument();
  });

  it('filters candidates by Singapore number and by recruiter, and sends the Singapore-number filter with the downloads', async () => {
    const fetchMock = stubApi([...BASE_STUBS, { path: '/admin/partners/export.csv', text: 'name,location,primary_mobile' }]);
    const createObjectURL = vi.fn((_file: Blob) => 'blob:signed-up');
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const view = renderPortal('/admin/candidates');

    await screen.findByText('Lin Lin Htet');
    fireEvent.mouseDown(screen.getByLabelText('Filter by Singapore number'));
    fireEvent.click(await screen.findByTitle(SINGAPORE_PHONE_FILTER_OPTIONS[1].label));

    await waitFor(() => expect(screen.queryByText('Lin Lin Htet')).not.toBeInTheDocument());
    CANDIDATES.filter(candidate => !candidate.hasSingaporePhone).forEach(candidate => expect(screen.getByText(candidate.name)).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText('Filter by Singapore number'));
    fireEvent.click(await screen.findByTitle(SINGAPORE_PHONE_FILTER_OPTIONS[0].label));
    fireEvent.mouseDown(screen.getByLabelText(LIST_FILTER.recruiterLabel));
    fireEvent.click(await screen.findByTitle('Jamie Lee · Horizon Recruitment'));

    await waitFor(() => expect(screen.queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(screen.getByText('Siti Rahma')).toBeInTheDocument();
    view.unmount();

    renderPortal(adminToolPath(AdminTool.SignedUpDownload));
    await screen.findByText(DOWNLOAD_PAGE.summary(CANDIDATES.length, CANDIDATES.length, false));
    fireEvent.mouseDown(screen.getByLabelText('Filter by Singapore number'));
    fireEvent.click(await screen.findByTitle(SINGAPORE_PHONE_FILTER_OPTIONS[0].label));
    const withPhone = CANDIDATES.filter(candidate => candidate.hasSingaporePhone).length;
    expect(await screen.findByText(DOWNLOAD_PAGE.summary(withPhone, withPhone, false))).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: new RegExp(CSV_FILES.signedUp.action) }));

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    const requested = fetchMock.mock.calls.map(([input]) => String(input)).filter(url => url.includes('export.csv'));
    expect(requested[0].endsWith('/admin/partners/export.csv?hasSingaporePhone=true')).toBe(true);

    click.mockRestore();
  }, 20000);

  it('filters locks and placements by recruiter and by how the lock was made', async () => {
    stubApi(BASE_STUBS);
    renderPortal('/admin/placements');

    const locks = (await screen.findByText(PLACEMENTS_PAGE.locksTitle)).closest('.ant-card') as HTMLElement;
    await within(locks).findByText('Thandar Aung');

    fireEvent.mouseDown(screen.getByLabelText(LIST_FILTER.originLabel));
    fireEvent.click(await screen.findByTitle(LOCK_ORIGIN_LABEL[LockOrigin.Admin]));
    await waitFor(() => expect(within(locks).queryByText('Thandar Aung')).not.toBeInTheDocument());
    expect(within(locks).getByText('Ana Reyes')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText(LIST_FILTER.recruiterLabel));
    fireEvent.click(await screen.findByTitle('Jamie Lee · Horizon Recruitment'));
    expect(await within(locks).findByText(PLACEMENTS_PAGE.searchEmpty)).toBeInTheDocument();
  });

  it('filters recruiters by account status and admins by role', async () => {
    stubApi(BASE_STUBS);
    const view = renderPortal('/admin/recruiters');

    const table = (await screen.findByLabelText(RECRUITER_SEARCH.label)).closest('.ant-card') as HTMLElement;
    await within(table).findByText('Alex Morgan');
    fireEvent.mouseDown(screen.getByLabelText(LIST_FILTER.recruiterStatusLabel));
    fireEvent.click(await screen.findByTitle(RECRUITER_STATUS_TAG[RecruiterStatus.Suspended].label));
    expect(await within(table).findByText(RECRUITER_SEARCH.empty)).toBeInTheDocument();
    view.unmount();

    renderPortal('/admin/admins');
    const list = (await screen.findByText(ADMIN_ACCOUNTS.listTitle)).closest('.ant-card') as HTMLElement;
    await within(list).findByText(ADMIN_PROFILE.email);
    fireEvent.mouseDown(screen.getByLabelText(LIST_FILTER.adminRoleLabel));
    fireEvent.click(await screen.findByTitle(ADMIN_ROLE_LABEL[AdminRole.Admin]));

    await waitFor(() => expect(within(list).queryByText(ADMIN_PROFILE.email)).not.toBeInTheDocument());
    expect(within(list).getByText(OPS_ADMIN.email)).toBeInTheDocument();
  });
});
