package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import com.tanmaysinghx.opencourier_server.repository.ProviderConfigRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ProviderRoutingService {

	private final ProviderConfigRepository providerConfigRepository;
	private final Map<String, NotificationProvider> providerMap = new HashMap<>();

	public ProviderRoutingService(ProviderConfigRepository providerConfigRepository, List<NotificationProvider> providers) {
		this.providerConfigRepository = providerConfigRepository;
		for (NotificationProvider provider : providers) {
			this.providerMap.put(provider.getProviderType(), provider);
		}
	}

	public NotificationProvider resolveProvider(String tenantId) {
		Optional<ProviderConfig> defaultConfig = providerConfigRepository.findByTenantIdAndIsDefaultTrue(tenantId);
		if (defaultConfig.isPresent()) {
			NotificationProvider provider = providerMap.get(defaultConfig.get().getProviderType());
			if (provider != null) {
				return provider;
			}
		}
		// Fallback to default SMTP or AWS SES
		return providerMap.getOrDefault("AWS_SES", providerMap.get("SMTP"));
	}

	public ProviderConfig resolveConfig(String tenantId) {
		return providerConfigRepository.findByTenantIdAndIsDefaultTrue(tenantId)
			.orElse(ProviderConfig.builder()
				.id("default_cfg")
				.tenantId(tenantId)
				.providerType("AWS_SES")
				.name("Default System Provider")
				.fromEmail("notifications@opencourier.local")
				.isDefault(true)
				.build());
	}
}
