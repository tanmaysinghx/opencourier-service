package com.tanmaysinghx.opencourier_server.web.rest;

import com.tanmaysinghx.opencourier_server.OpencourierServerApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/database")
@CrossOrigin(origins = "*")
public class DatabaseController {

	@GetMapping("/status")
	public ResponseEntity<Map<String, Object>> getDatabaseStatus() {
		String dbUrl = System.getProperty("spring.datasource.url", "jdbc:h2:file:~/.opencourier/data/opencourier");
		boolean isH2 = dbUrl.toLowerCase().contains("jdbc:h2:");
		return ResponseEntity.ok(Map.of(
			"isEmbeddedH2", isH2,
			"currentUrl", dbUrl
		));
	}

	@PostMapping("/test")
	public ResponseEntity<Map<String, Object>> testConnection(@RequestBody Map<String, Object> request) {
		String dbType = (String) request.getOrDefault("dbType", "postgresql");
		String host = (String) request.getOrDefault("host", "localhost");
		int port = Integer.parseInt(request.getOrDefault("port", 5432).toString());
		String dbName = (String) request.getOrDefault("dbName", "opencourier");
		String username = (String) request.getOrDefault("username", "opencourier");
		String password = (String) request.getOrDefault("password", "");

		String jdbcUrl;
		if ("mysql".equalsIgnoreCase(dbType)) {
			jdbcUrl = String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true", host, port, dbName);
		} else {
			jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
		}

		try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password)) {
			return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Target connection verified successfully! Database engine ready for Liquibase migration."
			));
		} catch (Exception e) {
			return ResponseEntity.ok(Map.of(
				"success", false,
				"message", "Connection failed: " + e.getMessage()
			));
		}
	}

	@PostMapping("/migrate")
	public ResponseEntity<Map<String, Object>> executeMigration(@RequestBody Map<String, Object> request) {
		String dbType = (String) request.getOrDefault("dbType", "postgresql");
		String host = (String) request.getOrDefault("host", "localhost");
		int port = Integer.parseInt(request.getOrDefault("port", 5432).toString());
		String dbName = (String) request.getOrDefault("dbName", "opencourier");
		String username = (String) request.getOrDefault("username", "opencourier");
		String password = (String) request.getOrDefault("password", "");

		String jdbcUrl;
		String driverClass;
		if ("mysql".equalsIgnoreCase(dbType)) {
			jdbcUrl = String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true", host, port, dbName);
			driverClass = "com.mysql.cj.jdbc.Driver";
		} else {
			jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, dbName);
			driverClass = "org.postgresql.Driver";
		}

		try {
			Path propsFile = OpencourierServerApplication.resolveCourierHome().resolve("opencourier.properties");
			String content = String.format(
				"spring.datasource.url=%s\nspring.datasource.driver-class-name=%s\nspring.datasource.username=%s\nspring.datasource.password=%s\n",
				jdbcUrl, driverClass, username, password
			);
			Files.writeString(propsFile, content);

			OpencourierServerApplication.restart();

			return ResponseEntity.ok(Map.of(
				"success", true,
				"message", "Migration configuration persisted to ~/.opencourier/opencourier.properties. Server restarting..."
			));
		} catch (IOException e) {
			return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
		}
	}
}
