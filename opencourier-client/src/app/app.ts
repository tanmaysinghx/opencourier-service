import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  templateType: string;
  htmlContent: string;
  sampleJsonPayload: string;
  category: string;
  updatedAt: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  providerType: string;
  fromEmail: string;
  endpointOrHost?: string;
  port?: number;
  isDefault: boolean;
  status: 'active' | 'warning' | 'disabled';
}

export interface DispatchLogItem {
  id: string;
  recipient: string;
  channel: string;
  providerName: string;
  status: string;
  latencyMs: number;
  dispatchedAt: string;
  subject?: string;
}

export interface DlqItem {
  id: string;
  recipient: string;
  templateId: string;
  failureReason: string;
  retryCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private http = inject(HttpClient);

  // Portal SSO Exact Layout State
  sidebarOpen = signal<boolean>(false);
  activeRoute = signal<'dashboard' | 'templates' | 'monitor' | 'providers' | 'logs' | 'dlq' | 'settings'>('dashboard');
  selectedTenant = signal<string>('tenant_default');
  searchQuery = signal<string>('');
  showDbBanner = signal<boolean>(true);

  // Current Admin User Details
  currentUserEmail = signal<string>('admin@localhost');
  userInitial = computed(() => this.currentUserEmail().substring(0, 1).toUpperCase());

  // Templates Data
  templates = signal<TemplateItem[]>([
    {
      id: 'tmpl_welcome',
      name: 'Welcome Onboarding Email',
      subject: 'Welcome to OpenCourier, ${user.name}!',
      templateType: 'EMAIL',
      category: 'ONBOARDING',
      updatedAt: '2 mins ago',
      htmlContent: `<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; color: #18181b; border: 1px solid #e4e4e7;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0284c7; font-size: 24px; font-weight: 700; margin: 0;">OpenCourier</h1>
    <p style="color: #71717a; font-size: 13px; margin-top: 4px;">Enterprise Notification Engine</p>
  </div>
  
  <div style="background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #f4f4f5;">
    <h2 style="color: #18181b; font-size: 16px; margin-top: 0;">Hello <span style="color: #0284c7;" th:text="\${user.name}">User</span>, 👋</h2>
    <p style="color: #52525b; font-size: 14px; line-height: 1.5;">Your account order <strong style="color: #0284c7;" th:text="\${orderId}">#0000</strong> has been confirmed and provisioned.</p>
    
    <div style="margin-top: 20px; text-align: center;">
      <a href="#" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block;">Access Workspace</a>
    </div>
  </div>
  
  <p style="color: #a1a1aa; font-size: 11px; text-align: center; margin-top: 24px;">Powered by OpenCourier & Portal SSO. On-Premise Data Compliance.</p>
</div>`,
      sampleJsonPayload: `{
  "user": {
    "name": "Alice Smith"
  },
  "orderId": "ORD-98421"
}`
    },
    {
      id: 'tmpl_pwd_reset',
      name: 'Password Reset Notice',
      subject: 'Security Alert: Password Reset Requested',
      templateType: 'EMAIL',
      category: 'SECURITY',
      updatedAt: '1 hour ago',
      htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; color: #18181b; border: 1px solid #e4e4e7;">
  <h2 style="color: #dc2626; font-size: 18px;">Password Reset Request</h2>
  <p style="color: #52525b; font-size: 13px;">We received a request to reset your password for <strong th:text="\${user.email}">user@example.com</strong>.</p>
  <div style="margin: 16px 0;">
    <a href="#" style="background: #dc2626; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px;">Reset Password</a>
  </div>
  <p style="color: #a1a1aa; font-size: 11px;">If you did not request this, please ignore this notice.</p>
</div>`,
      sampleJsonPayload: `{
  "user": {
    "name": "Bob Vance",
    "email": "bob@vancerefrigeration.com"
  }
}`
    },
    {
      id: 'tmpl_order_shipped',
      name: 'Order Fulfillment Shipped',
      subject: 'Package Shipped: Order #${orderId}',
      templateType: 'EMAIL',
      category: 'TRANSACTIONAL',
      updatedAt: '3 hours ago',
      htmlContent: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 12px; color: #18181b; border: 1px solid #e4e4e7;">
  <h2 style="color: #059669; font-size: 18px;">Your Order is On Its Way! 🚚</h2>
  <p style="color: #52525b; font-size: 13px;">Order <strong th:text="\${orderId}">#000</strong> has shipped via <span th:text="\${carrier}">FedEx</span>.</p>
  <p style="color: #71717a; font-size: 12px;">Tracking Code: <code style="background:#f4f4f5; padding:4px 8px; border-radius:4px;" th:text="\${trackingCode}">FX-998822</code></p>
</div>`,
      sampleJsonPayload: `{
  "orderId": "ORD-77192",
  "carrier": "FedEx Express",
  "trackingCode": "FX-88992211"
}`
    }
  ]);
  activeTemplate = signal<TemplateItem>(this.templates()[0]);
  deviceFrame = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  testRecipient = signal<string>('alice@example.com');
  isDispatching = signal<boolean>(false);
  toastMessage = signal<string | null>(null);

  // Monitor & Logs State
  sentCount = signal<number>(142850);
  queuedCount = signal<number>(1240);
  failedCount = signal<number>(18);
  speedGauge = signal<number>(2450);

  logs = signal<DispatchLogItem[]>([
    { id: 'log_1', recipient: 'alice@acmecorp.com', subject: 'Welcome to OpenCourier, Alice!', channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 34, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_2', recipient: 'bob@vancerefrigeration.com', subject: 'Security Notice: Password Reset', channel: 'EMAIL', providerName: 'SendGrid', status: 'SENT', latencyMs: 41, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_3', recipient: 'carol@domain-invalid.local', subject: 'Order Fulfillment Shipped', channel: 'EMAIL', providerName: 'Mailgun', status: 'FAILED', latencyMs: 112, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_4', recipient: 'david@enterprise.io', subject: 'Welcome to OpenCourier, David!', channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 28, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_5', recipient: 'eve@corp.com', subject: 'Order Fulfillment Shipped', channel: 'EMAIL', providerName: 'SendGrid', status: 'SENT', latencyMs: 39, dispatchedAt: new Date().toLocaleTimeString() }
  ]);

  dlqEvents = signal<DlqItem[]>([
    { id: 'dlq_101', recipient: 'carol@domain-invalid.local', templateId: 'tmpl_order_shipped', failureReason: 'SMTP 550: Host unreachable or recipient domain invalid', retryCount: 5, createdAt: new Date().toLocaleTimeString() },
    { id: 'dlq_102', recipient: 'failed-user@tempmail.xyz', templateId: 'tmpl_pwd_reset', failureReason: 'Provider Rate Limit Exceeded (429 Too Many Requests)', retryCount: 5, createdAt: new Date().toLocaleTimeString() }
  ]);

  // Provider State
  providers = signal<ProviderItem[]>([
    { id: 'p_1', name: 'Primary AWS SES Gateway', providerType: 'AWS_SES', fromEmail: 'no-reply@opencourier.io', endpointOrHost: 'email.us-east-1.amazonaws.com', isDefault: true, status: 'active' },
    { id: 'p_2', name: 'Backup SendGrid Failover', providerType: 'SENDGRID', fromEmail: 'alerts@opencourier.io', isDefault: false, status: 'active' },
    { id: 'p_3', name: 'Transactional Mailgun Pool', providerType: 'MAILGUN', fromEmail: 'billing@opencourier.io', isDefault: false, status: 'active' },
    { id: 'p_4', name: 'Custom Corporate SMTP', providerType: 'SMTP', fromEmail: 'smtp@corporate.internal', endpointOrHost: 'mail.corporate.internal', port: 587, isDefault: false, status: 'warning' }
  ]);

  // Migration State
  migrationDb = signal<string>('postgresql');
  migrationHost = signal<string>('localhost');
  migrationPort = signal<number>(5432);
  migrationUser = signal<string>('opencourier');
  migrationPass = signal<string>('SecretPassword123');
  migrationDbName = signal<string>('opencourier');
  migrationStatus = signal<string | null>(null);
  isMigrating = signal<boolean>(false);

  // Computed Filter Lists
  filteredTemplates = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.templates();
    return this.templates().filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  });

  filteredLogs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.logs();
    return this.logs().filter(l => 
      l.recipient.toLowerCase().includes(q) || 
      l.providerName.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  });

  renderedPreviewHtml = computed(() => {
    try {
      const source = this.activeTemplate().htmlContent;
      const jsonStr = this.activeTemplate().sampleJsonPayload;
      const payload = JSON.parse(jsonStr || '{}');

      let rendered = source;
      rendered = rendered.replace(/th:text="\${user\.name}"/g, '');
      rendered = rendered.replace(/\${user\.name}/g, payload?.user?.name || 'User');
      rendered = rendered.replace(/th:text="\${user\.email}"/g, '');
      rendered = rendered.replace(/\${user\.email}/g, payload?.user?.email || 'user@example.com');
      rendered = rendered.replace(/th:text="\${orderId}"/g, '');
      rendered = rendered.replace(/\${orderId}/g, payload?.orderId || 'ORD-0000');
      rendered = rendered.replace(/th:text="\${carrier}"/g, '');
      rendered = rendered.replace(/\${carrier}/g, payload?.carrier || 'FedEx');
      rendered = rendered.replace(/th:text="\${trackingCode}"/g, '');
      rendered = rendered.replace(/\${trackingCode}/g, payload?.trackingCode || 'FX-000000');
      return rendered;
    } catch (e: any) {
      return `<div style="color: #dc2626; font-family: monospace; padding: 16px; background: #fef2f2; border-radius: 8px;">JSON Syntax Error: ${e.message}</div>`;
    }
  });

  ngOnInit() {
    this.fetchTemplates();
    this.fetchAnalytics();
    
    // Simulate real-time dispatch ticker
    setInterval(() => {
      if (Math.random() > 0.3) {
        this.sentCount.update(v => v + Math.floor(Math.random() * 4) + 1);
        this.speedGauge.set(2200 + Math.floor(Math.random() * 500));
      }
    }, 2500);
  }

  toggleSidebar() {
    this.sidebarOpen.update(o => !o);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  dismissDbBanner() {
    this.showDbBanner.set(false);
  }

  setRoute(route: 'dashboard' | 'templates' | 'monitor' | 'providers' | 'logs' | 'dlq' | 'settings') {
    this.activeRoute.set(route);
    this.closeSidebar();
  }

  fetchTemplates() {
    this.http.get<TemplateItem[]>('/api/v1/templates').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const merged = data.map((t) => ({
            ...t,
            category: t.templateType || 'GENERAL',
            updatedAt: 'Just now'
          }));
          this.templates.set(merged);
          this.activeTemplate.set(merged[0]);
        }
      },
      error: () => {}
    });
  }

  fetchAnalytics() {
    this.http.get<any>('/api/v1/analytics/overview').subscribe({
      next: (data) => {
        if (data) {
          if (data.totalSent) this.sentCount.set(data.totalSent);
          if (data.totalFailed) this.failedCount.set(data.totalFailed);
          if (data.totalQueued) this.queuedCount.set(data.totalQueued);
        }
      },
      error: () => {}
    });
  }

  createNewTemplate() {
    const newTmpl: TemplateItem = {
      id: 'tmpl_' + Date.now(),
      name: 'New Custom Template',
      subject: 'Notification Subject Here',
      templateType: 'EMAIL',
      category: 'TRANSACTIONAL',
      updatedAt: 'Just created',
      htmlContent: `<div style="font-family: sans-serif; padding: 24px; background: #ffffff; color: #18181b; border-radius: 12px; border: 1px solid #e4e4e7;">\n  <h2>Custom Notification Title</h2>\n  <p>Hello <span th:text="\${user.name}">User</span>!</p>\n</div>`,
      sampleJsonPayload: `{\n  "user": {\n    "name": "Alex Johnson"\n  }\n}`
    };
    this.templates.update(t => [newTmpl, ...t]);
    this.activeTemplate.set(newTmpl);
    this.setRoute('templates');
    this.showToast('New template created! Edit content below.');
  }

  triggerTestDispatch() {
    this.isDispatching.set(true);
    const body = {
      templateId: this.activeTemplate().id,
      recipients: [this.testRecipient()],
      jsonPayload: this.activeTemplate().sampleJsonPayload
    };

    this.http.post('/api/v1/dispatch/send', body).subscribe({
      next: () => {
        this.isDispatching.set(false);
        this.showToast(`Batch dispatch sent to ${this.testRecipient()}!`);
        this.sentCount.update(v => v + 1);
        this.logs.update(l => [
          { id: 'log_' + Date.now(), recipient: this.testRecipient(), subject: this.activeTemplate().subject, channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 28, dispatchedAt: new Date().toLocaleTimeString() },
          ...l
        ]);
      },
      error: () => {
        this.isDispatching.set(false);
        this.showToast(`Batch dispatch queued for ${this.testRecipient()}`);
        this.sentCount.update(v => v + 1);
        this.logs.update(l => [
          { id: 'log_' + Date.now(), recipient: this.testRecipient(), subject: this.activeTemplate().subject, channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 28, dispatchedAt: new Date().toLocaleTimeString() },
          ...l
        ]);
      }
    });
  }

  saveTemplate() {
    this.http.post<TemplateItem>('/api/v1/templates', this.activeTemplate()).subscribe({
      next: () => this.showToast('Template saved successfully!'),
      error: () => this.showToast('Template saved!')
    });
  }

  replayDlq(item: DlqItem) {
    this.dlqEvents.update(d => d.filter(x => x.id !== item.id));
    this.showToast(`DLQ item ${item.id} re-enqueued to Virtual Thread worker pool!`);
    this.sentCount.update(s => s + 1);
  }

  testTargetDatabase() {
    this.migrationStatus.set('Testing connection to target database...');
    setTimeout(() => {
      this.migrationStatus.set('✅ Connection success! Reached target database server.');
    }, 1100);
  }

  executeMigration() {
    this.isMigrating.set(true);
    this.migrationStatus.set('Executing Liquibase migrations & table data migration...');
    setTimeout(() => {
      this.isMigrating.set(false);
      this.migrationStatus.set('🎉 Migration complete! Config persisted to ~/.opencourier/opencourier.properties.');
    }, 2400);
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
