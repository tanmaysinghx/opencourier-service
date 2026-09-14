package com.tanmaysinghx.opencourier_server.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tenants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

	@Id
	private String id;

	@Column(nullable = false)
	private String name;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
