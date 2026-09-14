package com.tanmaysinghx.opencourier_server.service.dispatch;

import com.tanmaysinghx.opencourier_server.domain.DispatchLog;
import com.tanmaysinghx.opencourier_server.domain.NotificationTemplate;
import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import com.tanmaysinghx.opencourier_server.repository.DispatchLogRepository;
import com.tanmaysinghx.opencourier_server.repository.NotificationTemplateRepository;
import com.tanmaysinghx.opencourier_server.service.engine.ThymeleafTemplateService;
import com.tanmaysinghx.opencourier_server.service.provider.NotificationProvider;
import com.tanmaysinghx.opencourier_server.service.provider.ProviderRoutingService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.stereotype.Service;

@Service
public class VirtualThreadDispatchService {

	private final ExecutorService virtualThreadExecutor;
	private final ThymeleafTemplateService templateService;
	private final ProviderRoutingService providerRoutingService;
	private final DispatchLogRepository dispatchLogRepository;
	private final NotificationTemplateRepository templateRepository;
	private final DeadLetterQueueService dlqService;

	public VirtualThreadDispatchService(
			ThymeleafTemplateService templateService,
			ProviderRoutingService providerRoutingService,
			DispatchLogRepository dispatchLogRepository,
			NotificationTemplateRepository templateRepository,
			DeadLetterQueueService dlqService) {
		this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
		this.templateService = templateService;
		this.providerRoutingService = providerRoutingService;
		this.dispatchLogRepository = dispatchLogRepository;
		this.templateRepository = templateRepository;
		this.dlqService = dlqService;
	}

	public void dispatchBatch(String tenantId, String templateId, List<String> recipients, String jsonPayload) {
		virtualThreadExecutor.submit(() -> {
			NotificationTemplate template = templateRepository.findByIdAndTenantId(templateId, tenantId).orElse(null);
			String subject = template != null ? template.getSubject() : "Notification";
			String sourceHtml = template != null ? template.getHtmlContent() : "<div>Default Message</div>";
			
			String renderedHtml = templateService.renderHtml(sourceHtml, jsonPayload);

			NotificationProvider provider = providerRoutingService.resolveProvider(tenantId);
			ProviderConfig config = providerRoutingService.resolveConfig(tenantId);

			for (String recipient : recipients) {
				virtualThreadExecutor.submit(() -> {
					long start = System.currentTimeMillis();
					try {
						provider.sendEmail(config, recipient, subject, renderedHtml);
						long latency = System.currentTimeMillis() - start;

						DispatchLog log = DispatchLog.builder()
							.id("log_" + UUID.randomUUID().toString())
							.tenantId(tenantId)
							.templateId(templateId)
							.recipient(recipient)
							.channel("EMAIL")
							.providerName(provider.getProviderType())
							.status("SENT")
							.latencyMs(latency)
							.dispatchedAt(LocalDateTime.now())
							.build();
						dispatchLogRepository.save(log);
					} catch (Exception e) {
						long latency = System.currentTimeMillis() - start;
						DispatchLog log = DispatchLog.builder()
							.id("log_" + UUID.randomUUID().toString())
							.tenantId(tenantId)
							.templateId(templateId)
							.recipient(recipient)
							.channel("EMAIL")
							.providerName(provider.getProviderType())
							.status("FAILED")
							.latencyMs(latency)
							.errorDetails(e.getMessage())
							.dispatchedAt(LocalDateTime.now())
							.build();
						dispatchLogRepository.save(log);

						dlqService.recordFailure(tenantId, templateId, recipient, jsonPayload, 1, e.getMessage());
					}
				});
			}
		});
	}
}
