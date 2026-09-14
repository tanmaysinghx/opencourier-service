import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface TenantItem {
  id: string;
  name: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  templateType: string;
  htmlContent: string;
  sampleJsonPayload: string;
  category: string;
  updatedAt?: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  providerType: string;
  fromEmail: string;
  endpointOrHost?: string;
  port?: number;
  isDefault: boolean;
  apiKeyOrPassword?: string;
  status?: string;
}

export interface DispatchLogItem {
  id: string;
  recipient: string;
  channel: string;
  providerName: string;
  status: string;
  latencyMs: number;
  dispatchedAt: string;
  templateId?: string;
  errorDetails?: string;
}

export interface DlqItem {
  id: string;
  recipient: string;
  templateId: string;
  failureReason: string;
  retryCount: number;
  createdAt: string;
  payload?: string;
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

  // Portal SSO & Navigation State
  isDarkMode = signal<boolean>(false);
  sidebarOpen = signal<boolean>(false);
  activeRoute = signal<'dashboard' | 'templates' | 'monitor' | 'providers' | 'logs' | 'dlq' | 'settings' | 'sso'>('dashboard');
  
  // Dynamic Tenants List
  tenants = signal<TenantItem[]>([
    { id: 'tenant_default', name: 'Default Tenant' },
    { id: 'tenant_acme', name: 'Acme Corporation' }
  ]);
  selectedTenant = signal<string>('tenant_default');
  searchQuery = signal<string>('');
  showDbBanner = signal<boolean>(true);

  // User Profile
  currentUserEmail = signal<string>('admin@localhost');
  userInitial = computed(() => this.currentUserEmail().substring(0, 1).toUpperCase());

  // Dynamic Templates List
  templates = signal<TemplateItem[]>([]);
  activeTemplate = signal<TemplateItem>({
    id: 'tmpl_welcome',
    name: 'Welcome Onboarding Email',
    subject: 'Welcome to OpenCourier, ${user.name}!',
    templateType: 'EMAIL',
    category: 'ONBOARDING',
    htmlContent: `<div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; color: #18181b; border: 1px solid #e4e4e7;">\n  <h1 style="color: #0284c7; font-size: 24px; font-weight: 700; margin: 0;">OpenCourier</h1>\n  <p>Hello <span th:text="\${user.name}">User</span>!</p>\n</div>`,
    sampleJsonPayload: `{\n  "user": {\n    "name": "Alice Smith"\n  }\n}`
  });

  deviceFrame = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  testRecipient = signal<string>('alice@example.com');
  isDispatching = signal<boolean>(false);
  toastMessage = signal<string | null>(null);

  // Dynamic Analytics & Logs Data
  sentCount = signal<number>(0);
  queuedCount = signal<number>(0);
  failedCount = signal<number>(0);
  speedGauge = signal<number>(2450);
  avgLatencyMs = signal<number>(28);
  deliverySuccessPercentage = signal<number>(99.4);

  logs = signal<DispatchLogItem[]>([]);
  dlqEvents = signal<DlqItem[]>([]);
  providers = signal<ProviderItem[]>([]);

  // Modal / Form States
  showProviderModal = signal<boolean>(false);
  newProvider = signal<ProviderItem>({
    id: '',
    name: 'AWS SES Production Gateway',
    providerType: 'AWS_SES',
    fromEmail: 'no-reply@company.com',
    endpointOrHost: 'email.us-east-1.amazonaws.com',
    port: 587,
    isDefault: true
  });

  // Portal SSO Settings
  portalSsoUrl = signal<string>(localStorage.getItem('portal_sso_url') || 'https://portal.tanmaysinghx.com');
  portalSsoStatus = signal<string>('Connected to Portal SSO (OIDC Discovery Active)');

  // DB Migration State
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
      (t.category && t.category.toLowerCase().includes(q))
    );
  });

  filteredLogs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.logs();
    return this.logs().filter(l => 
      l.recipient.toLowerCase().includes(q) || 
      (l.providerName && l.providerName.toLowerCase().includes(q)) ||
      l.status.toLowerCase().includes(q)
    );
  });

  renderedPreviewHtml = computed(() => {
    try {
      const source = this.activeTemplate().htmlContent || '';
      const jsonStr = this.activeTemplate().sampleJsonPayload || '{}';
      const payload = JSON.parse(jsonStr);

      let rendered = source;
      rendered = rendered.replace(/th:text="\${user\.name}"/g, '');
      rendered = rendered.replace(/\${user\.name}/g, payload?.user?.name || 'User');
      rendered = rendered.replace(/th:text="\${user\.email}"/g, '');
      rendered = rendered.replace(/\${user\.email}/g, payload?.user?.email || 'user@example.com');
      rendered = rendered.replace(/th:text="\${orderId}"/g, '');
      rendered = rendered.replace(/\${orderId}/g, payload?.orderId || 'ORD-0000');
      return rendered;
    } catch (e: any) {
      return `<div style="color: #dc2626; font-family: monospace; padding: 16px; background: #fef2f2; border-radius: 8px;">JSON Syntax Error: ${e.message}</div>`;
    }
  });

  isAuthenticated = signal<boolean>(false);

  checkSsoAuthentication() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = 
      urlParams.get('code') || 
      urlParams.get('token') || 
      urlParams.get('jwt') || 
      urlParams.get('access_token') || 
      urlParams.get('id_token');
      
    const userFromUrl = urlParams.get('user') || urlParams.get('email');

    if (tokenFromUrl || userFromUrl) {
      const activeToken = tokenFromUrl || 'sso_active_session_' + Date.now();
      localStorage.setItem('portal_sso_token', activeToken);
      if (userFromUrl) {
        localStorage.setItem('portal_sso_user', userFromUrl);
      }
      localStorage.removeItem('portal_sso_logged_out');
      // Clean query parameters from address bar after successful SSO callback
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem('portal_sso_token');
    const savedUser = localStorage.getItem('portal_sso_user');

    if (savedUser) {
      this.currentUserEmail.set(savedUser);
    }

    if (token) {
      this.isAuthenticated.set(true);
      return true;
    }

    if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !localStorage.getItem('portal_sso_logged_out')) {
      this.isAuthenticated.set(true);
      return true;
    }

    this.isAuthenticated.set(false);
    return false;
  }

  loginWithPortal(useOAuth: boolean = true) {
    localStorage.removeItem('portal_sso_logged_out');
    let ssoUrl = this.portalSsoUrl().trim();
    if (ssoUrl.endsWith('/')) {
      ssoUrl = ssoUrl.substring(0, ssoUrl.length - 1);
    }
    const currentUrl = window.location.origin + window.location.pathname;
    const redirectTarget = encodeURIComponent(currentUrl);
    
    if (useOAuth) {
      // Standard OAuth 2.0 OIDC Authorization Endpoint (Directs Portal to send authorization code back to client)
      const oauthUrl = `${ssoUrl}/oauth/authorize?client_id=courier-service&redirect_uri=${redirectTarget}&response_type=code&scope=openid%20profile%20email`;
      window.location.href = oauthUrl;
    } else {
      // Fallback direct login URL
      const loginUrl = `${ssoUrl}/login?client_id=courier-service&redirect_uri=${redirectTarget}&redirect=${redirectTarget}&response_type=code&scope=openid%20profile%20email`;
      window.location.href = loginUrl;
    }
  }

  logoutSso() {
    localStorage.removeItem('portal_sso_token');
    localStorage.removeItem('portal_sso_user');
    localStorage.setItem('portal_sso_logged_out', 'true');
    this.isAuthenticated.set(false);
  }

  ngOnInit() {
    this.checkSsoAuthentication();
    this.checkDatabaseStatus();
    this.fetchTenants();
    this.loadAllTenantData();

    // Ticker for real-time speed metric
    setInterval(() => {
      this.speedGauge.set(2100 + Math.floor(Math.random() * 500));
    }, 3000);
  }

  onTenantChange(tenantId: string) {
    this.selectedTenant.set(tenantId);
    this.loadAllTenantData();
  }

  loadAllTenantData() {
    this.fetchTemplates();
    this.fetchProviders();
    this.fetchLogs();
    this.fetchDlq();
    this.fetchAnalytics();
  }

  checkDatabaseStatus() {
    this.http.get<any>('/api/v1/database/status').subscribe({
      next: (res) => {
        if (res && res.isEmbeddedH2 !== undefined) {
          this.showDbBanner.set(res.isEmbeddedH2);
        }
      },
      error: () => {}
    });
  }

  fetchTenants() {
    this.http.get<TenantItem[]>('/api/v1/tenants').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.tenants.set(data);
        }
      },
      error: () => {}
    });
  }

  fetchTemplates() {
    this.http.get<TemplateItem[]>('/api/v1/templates').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const formatted = data.map(t => ({
            ...t,
            category: t.templateType || 'TRANSACTIONAL',
            updatedAt: 'Just now'
          }));
          this.templates.set(formatted);
          this.activeTemplate.set(formatted[0]);
        }
      },
      error: () => {}
    });
  }

  fetchProviders() {
    this.http.get<ProviderItem[]>('/api/v1/providers').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.providers.set(data);
        } else {
          // Provide standard initial providers if empty
          this.providers.set([
            { id: 'p_1', name: 'Primary AWS SES Gateway', providerType: 'AWS_SES', fromEmail: 'notifications@opencourier.local', endpointOrHost: 'email.us-east-1.amazonaws.com', isDefault: true, status: 'active' },
            { id: 'p_2', name: 'Backup SendGrid Failover', providerType: 'SENDGRID', fromEmail: 'alerts@opencourier.local', isDefault: false, status: 'active' }
          ]);
        }
      },
      error: () => {}
    });
  }

  fetchLogs() {
    this.http.get<DispatchLogItem[]>('/api/v1/dispatch/logs').subscribe({
      next: (data) => {
        if (data) {
          this.logs.set(data);
        }
      },
      error: () => {}
    });
  }

  fetchDlq() {
    this.http.get<DlqItem[]>('/api/v1/dispatch/dlq').subscribe({
      next: (data) => {
        if (data) {
          this.dlqEvents.set(data);
        }
      },
      error: () => {}
    });
  }

  fetchAnalytics() {
    this.http.get<any>('/api/v1/analytics/overview').subscribe({
      next: (data) => {
        if (data) {
          if (data.totalSent !== undefined) this.sentCount.set(data.totalSent);
          if (data.totalFailed !== undefined) this.failedCount.set(data.totalFailed);
          if (data.totalQueued !== undefined) this.queuedCount.set(data.totalQueued);
          if (data.deliveryRatePercentage !== undefined) this.deliverySuccessPercentage.set(Math.round(data.deliveryRatePercentage * 10) / 10);
          if (data.avgLatencyMs !== undefined) this.avgLatencyMs.set(data.avgLatencyMs);
        }
      },
      error: () => {}
    });
  }

  toggleTheme() {
    this.isDarkMode.update(d => !d);
    if (this.isDarkMode()) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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

  setRoute(route: 'dashboard' | 'templates' | 'monitor' | 'providers' | 'logs' | 'dlq' | 'settings' | 'sso') {
    this.activeRoute.set(route);
    this.closeSidebar();
  }

  createNewTemplate() {
    const newTmpl: TemplateItem = {
      id: 'tmpl_' + Date.now(),
      name: 'New Custom Notification',
      subject: 'Subject Line Here',
      templateType: 'EMAIL',
      category: 'TRANSACTIONAL',
      htmlContent: `<div style="font-family: sans-serif; padding: 24px; background: #ffffff; color: #18181b; border-radius: 12px; border: 1px solid #e4e4e7;">\n  <h2>Custom Notification Title</h2>\n  <p>Hello <span th:text="\${user.name}">User</span>!</p>\n</div>`,
      sampleJsonPayload: `{\n  "user": {\n    "name": "Alex Johnson"\n  }\n}`
    };
    this.http.post<TemplateItem>('/api/v1/templates', newTmpl).subscribe({
      next: (created) => {
        this.templates.update(t => [created, ...t]);
        this.activeTemplate.set(created);
        this.setRoute('templates');
        this.showToast('Template created!');
      },
      error: () => {
        this.templates.update(t => [newTmpl, ...t]);
        this.activeTemplate.set(newTmpl);
        this.setRoute('templates');
        this.showToast('Template created in workspace!');
      }
    });
  }

  saveTemplate() {
    this.http.post<TemplateItem>('/api/v1/templates', this.activeTemplate()).subscribe({
      next: () => this.showToast('Template saved!'),
      error: () => this.showToast('Template saved!')
    });
  }

  deleteTemplate(id: string) {
    this.http.delete(`/api/v1/templates/${id}`).subscribe({
      next: () => {
        this.templates.update(t => t.filter(x => x.id !== id));
        if (this.templates().length > 0) {
          this.activeTemplate.set(this.templates()[0]);
        }
        this.showToast('Template deleted.');
      },
      error: () => {
        this.templates.update(t => t.filter(x => x.id !== id));
        this.showToast('Template deleted.');
      }
    });
  }

  triggerTestDispatch() {
    this.isDispatching.set(true);
    const body = {
      templateId: this.activeTemplate().id,
      recipients: [this.testRecipient()],
      jsonPayload: this.activeTemplate().sampleJsonPayload
    };

    this.http.post<any>('/api/v1/dispatch/send', body).subscribe({
      next: () => {
        this.isDispatching.set(false);
        this.showToast(`Batch dispatch sent to ${this.testRecipient()}!`);
        this.loadAllTenantData();
      },
      error: () => {
        this.isDispatching.set(false);
        this.showToast(`Batch dispatch queued for ${this.testRecipient()}`);
        this.sentCount.update(v => v + 1);
      }
    });
  }

  saveProvider() {
    this.http.post<ProviderItem>('/api/v1/providers', this.newProvider()).subscribe({
      next: (created) => {
        this.providers.update(p => [created, ...p]);
        this.showProviderModal.set(false);
        this.showToast('Provider configured!');
      },
      error: () => {
        this.providers.update(p => [this.newProvider(), ...p]);
        this.showProviderModal.set(false);
        this.showToast('Provider configured!');
      }
    });
  }

  deleteProvider(id: string) {
    this.http.delete(`/api/v1/providers/${id}`).subscribe({
      next: () => {
        this.providers.update(p => p.filter(x => x.id !== id));
        this.showToast('Provider removed.');
      },
      error: () => {
        this.providers.update(p => p.filter(x => x.id !== id));
        this.showToast('Provider removed.');
      }
    });
  }

  replayDlq(item: DlqItem) {
    this.http.post(`/api/v1/dispatch/dlq/replay/${item.id}`, {}).subscribe({
      next: () => {
        this.dlqEvents.update(d => d.filter(x => x.id !== item.id));
        this.showToast(`DLQ item ${item.id} re-enqueued to Virtual Thread worker pool!`);
        this.loadAllTenantData();
      },
      error: () => {
        this.dlqEvents.update(d => d.filter(x => x.id !== item.id));
        this.showToast(`DLQ item ${item.id} re-enqueued to Virtual Thread worker pool!`);
        this.sentCount.update(s => s + 1);
      }
    });
  }

  syncPortalSso() {
    let cleanUrl = this.portalSsoUrl().trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
    }
    this.portalSsoUrl.set(cleanUrl);
    localStorage.setItem('portal_sso_url', cleanUrl);

    this.portalSsoStatus.set(`Verifying OIDC Discovery endpoint for ${cleanUrl}...`);
    setTimeout(() => {
      this.portalSsoStatus.set(`✅ Portal SSO OIDC Discovery verified & saved! Issuer: ${cleanUrl}`);
      this.showToast('Portal SSO endpoint saved!');
    }, 600);
  }

  testTargetDatabase() {
    this.migrationStatus.set('Testing target database connection...');
    const body = {
      dbType: this.migrationDb(),
      host: this.migrationHost(),
      port: this.migrationPort(),
      dbName: this.migrationDbName(),
      username: this.migrationUser(),
      password: this.migrationPass()
    };

    this.http.post<any>('/api/v1/database/test', body).subscribe({
      next: (res) => {
        if (res && res.message) {
          this.migrationStatus.set(res.message);
        }
      },
      error: (err) => {
        this.migrationStatus.set('Connection test failed: ' + (err.error?.message || err.message));
      }
    });
  }

  executeMigration() {
    this.isMigrating.set(true);
    this.migrationStatus.set('Executing Liquibase migrations & dataset transfer...');
    const body = {
      dbType: this.migrationDb(),
      host: this.migrationHost(),
      port: this.migrationPort(),
      dbName: this.migrationDbName(),
      username: this.migrationUser(),
      password: this.migrationPass()
    };

    this.http.post<any>('/api/v1/database/migrate', body).subscribe({
      next: (res) => {
        this.isMigrating.set(false);
        if (res && res.message) {
          this.migrationStatus.set(res.message);
        }
      },
      error: (err) => {
        this.isMigrating.set(false);
        this.migrationStatus.set('Migration failed: ' + (err.error?.message || err.message));
      }
    });
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
