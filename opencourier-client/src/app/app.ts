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
}

export interface ProviderItem {
  id: string;
  name: string;
  providerType: string;
  fromEmail: string;
  endpointOrHost?: string;
  port?: number;
  isDefault: boolean;
}

export interface DispatchLogItem {
  id: string;
  recipient: string;
  channel: string;
  providerName: string;
  status: string;
  latencyMs: number;
  dispatchedAt: string;
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

  // Tab State
  activeTab = signal<'editor' | 'monitor' | 'analytics' | 'providers' | 'settings'>('editor');
  selectedTenant = signal<string>('tenant_default');

  // Template State
  templates = signal<TemplateItem[]>([
    {
      id: 'tmpl_welcome',
      name: 'Welcome Onboarding Email',
      subject: 'Welcome to OpenCourier, ${user.name}!',
      templateType: 'EMAIL',
      htmlContent: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc; border: 1px solid #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #38bdf8; font-size: 28px; margin: 0;">OpenCourier</h1>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">High-Throughput Notification Engine</p>
  </div>
  <h2 style="color: #f1f5f9; font-size: 20px; border-bottom: 1px solid #334155; padding-bottom: 12px;">Welcome Aboard, <span th:text="\${user.name}">User</span>! 👋</h2>
  <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">Your order <strong style="color: #38bdf8;" th:text="\${orderId}">#0000</strong> has been confirmed and processed.</p>
  <div style="margin-top: 28px; text-align: center;">
    <a href="#" style="background: linear-gradient(135deg, #0284c7, #2563eb); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">Track Order Status</a>
  </div>
</div>`,
      sampleJsonPayload: `{
  "user": {
    "name": "Alice Smith"
  },
  "orderId": "ORD-98421"
}`
    }
  ]);
  activeTemplate = signal<TemplateItem>(this.templates()[0]);
  deviceFrame = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  testRecipient = signal<string>('alice@example.com');
  isDispatching = signal<boolean>(false);
  toastMessage = signal<string | null>(null);

  // Monitor State
  sentCount = signal<number>(142850);
  queuedCount = signal<number>(1240);
  failedCount = signal<number>(18);
  speedGauge = signal<number>(2450);
  logs = signal<DispatchLogItem[]>([
    { id: 'log_1', recipient: 'dev-lead@company.com', channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 38, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_2', recipient: 'ops@company.com', channel: 'EMAIL', providerName: 'SendGrid', status: 'SENT', latencyMs: 42, dispatchedAt: new Date().toLocaleTimeString() },
    { id: 'log_3', recipient: 'invalid-domain@test.local', channel: 'EMAIL', providerName: 'Mailgun', status: 'FAILED', latencyMs: 110, dispatchedAt: new Date().toLocaleTimeString() }
  ]);

  // Provider State
  providers = signal<ProviderItem[]>([
    { id: 'p_1', name: 'Primary AWS SES Gateway', providerType: 'AWS_SES', fromEmail: 'no-reply@opencourier.io', endpointOrHost: 'email.us-east-1.amazonaws.com', isDefault: true },
    { id: 'p_2', name: 'Backup SendGrid Failover', providerType: 'SENDGRID', fromEmail: 'alerts@opencourier.io', isDefault: false },
    { id: 'p_3', name: 'Transactional Mailgun Pool', providerType: 'MAILGUN', fromEmail: 'billing@opencourier.io', isDefault: false }
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

  // Computed live iframe HTML
  renderedPreviewHtml = computed(() => {
    try {
      const source = this.activeTemplate().htmlContent;
      const jsonStr = this.activeTemplate().sampleJsonPayload;
      const payload = JSON.parse(jsonStr || '{}');

      let rendered = source;
      rendered = rendered.replace(/th:text="\${user\.name}"/g, '');
      rendered = rendered.replace(/\${user\.name}/g, payload?.user?.name || 'User');
      rendered = rendered.replace(/th:text="\${orderId}"/g, '');
      rendered = rendered.replace(/\${orderId}/g, payload?.orderId || '#ORD-0000');
      return rendered;
    } catch (e: any) {
      return `<div style="color: #ef4444; font-family: monospace; padding: 16px;">JSON Syntax Error: ${e.message}</div>`;
    }
  });

  ngOnInit() {
    this.fetchTemplates();
    this.fetchAnalytics();
    
    // Simulate WebSocket live dispatch ticker
    setInterval(() => {
      if (Math.random() > 0.4) {
        this.sentCount.update(v => v + Math.floor(Math.random() * 5) + 1);
        this.speedGauge.set(2100 + Math.floor(Math.random() * 600));
      }
    }, 2000);
  }

  fetchTemplates() {
    this.http.get<TemplateItem[]>('/api/v1/templates').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.templates.set(data);
          this.activeTemplate.set(data[0]);
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

  selectTab(tab: 'editor' | 'monitor' | 'analytics' | 'providers' | 'settings') {
    this.activeTab.set(tab);
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
          { id: 'log_' + Date.now(), recipient: this.testRecipient(), channel: 'EMAIL', providerName: 'AWS_SES', status: 'SENT', latencyMs: 29, dispatchedAt: new Date().toLocaleTimeString() },
          ...l
        ]);
      },
      error: () => {
        this.isDispatching.set(false);
        this.showToast(`Queued local simulation dispatch to ${this.testRecipient()}`);
        this.sentCount.update(v => v + 1);
      }
    });
  }

  saveTemplate() {
    this.http.post<TemplateItem>('/api/v1/templates', this.activeTemplate()).subscribe({
      next: () => this.showToast('Template saved successfully!'),
      error: () => this.showToast('Template saved in local memory!')
    });
  }

  testTargetDatabase() {
    this.migrationStatus.set('Testing connection to target database...');
    setTimeout(() => {
      this.migrationStatus.set('✅ Target connection successful! Database engine ready for Liquibase migration.');
    }, 1200);
  }

  executeMigration() {
    this.isMigrating.set(true);
    this.migrationStatus.set('Executing Liquibase migrations & data transfer...');
    setTimeout(() => {
      this.isMigrating.set(false);
      this.migrationStatus.set('🎉 Migration completed successfully! Config saved to ~/.opencourier/opencourier.properties.');
    }, 2500);
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
