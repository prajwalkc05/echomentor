import { PageHeader, AdminPage, SectionCard, Input, ActionBtn } from '../components/AdminUI';

export function AdminSubscriptions() {
  return (
    <AdminPage>
      <PageHeader title="Subscription Plans" subtitle="Manage pricing and features" />
      <div className="grid grid-cols-3 gap-6">
        {['FREE', 'PRO', 'PREMIUM'].map((plan, i) => (
          <SectionCard key={plan} title={plan}>
            <div className="space-y-3">
              <Input value={['₹0', '₹199', '₹499'][i]} onChange={() => {}} placeholder="Price" />
              <Input value="Unlimited Chat" onChange={() => {}} placeholder="Feature" />
              <ActionBtn label="Save Changes" onClick={() => {}} variant="success" />
            </div>
          </SectionCard>
        ))}
      </div>
    </AdminPage>
  );
}

export function AdminAIUsage() {
  return (
    <AdminPage>
      <PageHeader title="AI Usage Monitor" subtitle="Track API requests and costs" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Total Requests', '12,450'],
          ['Today', '340'],
          ['Token Usage', '2.4M'],
          ['Cost', '₹1,240'],
        ].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent AI Requests">
        <p className="text-gray-500 text-sm">Request logs will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminResume() {
  return (
    <AdminPage>
      <PageHeader title="Resume Analytics" subtitle="Track resume generation and downloads" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total Resumes', '842'], ['Today', '28'], ['Most Used', 'Template 2'], ['Downloads', '1,204']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Resumes">
        <p className="text-gray-500 text-sm">Resume activity will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminPPT() {
  return (
    <AdminPage>
      <PageHeader title="PPT Analytics" subtitle="Presentations generated" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['Total PPTs', '524'], ['Today', '15'], ['Avg Slides', '12'], ['Downloads', '680']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Presentations">
        <p className="text-gray-500 text-sm">Presentation activity will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminCourses() {
  return (
    <AdminPage>
      <PageHeader title="Course Management" subtitle="Add, edit, and feature courses" action={<ActionBtn label="+ Add Course" onClick={() => {}} />} />
      <SectionCard title="All Courses">
        <p className="text-gray-500 text-sm">Course list will appear here. Admin can add/edit/delete courses.</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminOpportunities() {
  return (
    <AdminPage>
      <PageHeader title="Opportunities Management" subtitle="Jobs, internships, hackathons, scholarships" />
      <div className="flex gap-2 mb-6">
        {['Jobs', 'Internships', 'Hackathons', 'Scholarships'].map(t => (
          <button key={t} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-purple-600 hover:text-white transition-colors text-sm">{t}</button>
        ))}
      </div>
      <SectionCard title="Pending Approvals">
        <p className="text-gray-500 text-sm">Opportunities awaiting approval will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminNotifications() {
  return (
    <AdminPage>
      <PageHeader title="Send Notifications" subtitle="Broadcast to users" />
      <SectionCard title="Create Notification">
        <div className="space-y-4">
          <Input value="" onChange={() => {}} placeholder="Title" />
          <textarea placeholder="Message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none" />
          <div className="flex gap-2">
            {['All Users', 'Free', 'Pro', 'Premium'].map(a => (
              <button key={a} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:bg-purple-600 hover:text-white transition-colors text-xs">{a}</button>
            ))}
          </div>
          <ActionBtn label="Send Notification" onClick={() => {}} />
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminCoupons() {
  return (
    <AdminPage>
      <PageHeader title="Coupons & Discounts" subtitle="Create and manage promo codes" action={<ActionBtn label="+ New Coupon" onClick={() => {}} />} />
      <SectionCard title="Active Coupons">
        <div className="space-y-2">
          {[
            ['SAVE50', '50% off', 'Expires: Dec 31'],
            ['WELCOME20', '20% off', 'Expires: Jan 15'],
            ['PREMIUM30', '₹30 off', 'Expires: Feb 01'],
          ].map(([code, disc, exp]) => (
            <div key={code} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-semibold text-sm">{code}</p>
                <p className="text-gray-500 text-xs">{disc} • {exp}</p>
              </div>
              <ActionBtn label="Edit" onClick={() => {}} variant="ghost" />
            </div>
          ))}
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminSettings() {
  return (
    <AdminPage>
      <PageHeader title="Platform Settings" subtitle="Configure EchoMentor" />
      <SectionCard title="General">
        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs block mb-1">Platform Name</label>
            <Input value="EchoMentor" onChange={() => {}} />
          </div>
          <div>
            <label className="text-gray-500 text-xs block mb-1">Support Email</label>
            <Input value="support@echomentor.com" onChange={() => {}} />
          </div>
          <ActionBtn label="Save Settings" onClick={() => {}} variant="success" />
        </div>
      </SectionCard>
    </AdminPage>
  );
}

export function AdminSecurity() {
  return (
    <AdminPage>
      <PageHeader title="Security & Monitoring" subtitle="Track failed logins and suspicious activity" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Failed Logins', '12'], ['Blocked Users', '3'], ['Suspicious Activities', '7']].map(([l, v]) => (
          <div key={l} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{l}</p>
            <p className="text-white text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <SectionCard title="Recent Security Events">
        <p className="text-gray-500 text-sm">Security logs will appear here</p>
      </SectionCard>
    </AdminPage>
  );
}
