package com.tanmaysinghx.opencourier_server.repository;

import com.tanmaysinghx.opencourier_server.domain.NotificationTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, String> {
	List<NotificationTemplate> findByTenantId(String tenantId);
	Optional<NotificationTemplate> findByIdAndTenantId(String id, String tenantId);
}
