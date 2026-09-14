package com.tanmaysinghx.opencourier_server.repository;

import com.tanmaysinghx.opencourier_server.domain.DlqEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DlqEventRepository extends JpaRepository<DlqEvent, String> {
	List<DlqEvent> findByTenantIdOrderByCreatedAtDesc(String tenantId);
}
