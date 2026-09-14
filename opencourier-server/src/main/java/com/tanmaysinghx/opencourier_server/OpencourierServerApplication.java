package com.tanmaysinghx.opencourier_server;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
@EnableAsync
public class OpencourierServerApplication {

	private static ConfigurableApplicationContext context;
	private static String[] savedArgs = new String[0];

	public static void main(String[] args) {
		savedArgs = args != null ? args : new String[0];
		String[] normalizedArgs = normalizeArguments(args);
		initCourierDirectories();
		configureDialectAutoDetection();
		context = SpringApplication.run(OpencourierServerApplication.class, normalizedArgs);
	}

	public static void restart() {
		Thread restartThread = new Thread(() -> {
			try {
				Thread.sleep(800);
				if (context != null) {
					context.close();
				}
				initCourierDirectories();
				String[] normalizedArgs = normalizeArguments(savedArgs);
				context = SpringApplication.run(OpencourierServerApplication.class, normalizedArgs);
			} catch (Exception e) {
				System.exit(0);
			}
		}, "opencourier-restart");
		restartThread.setDaemon(false);
		restartThread.start();
	}

	public static String[] normalizeArguments(String[] args) {
		if (args == null || args.length == 0) {
			return new String[0];
		}
		List<String> normalized = new ArrayList<>();
		for (int i = 0; i < args.length; i++) {
			String arg = args[i];
			if (arg.startsWith("--httpPort=")) {
				normalized.add("--server.port=" + arg.substring("--httpPort=".length()));
			} else if (arg.equals("--httpPort") && i + 1 < args.length) {
				normalized.add("--server.port=" + args[++i]);
			} else if (arg.startsWith("--courierHome=")) {
				String home = arg.substring("--courierHome=".length());
				System.setProperty("COURIER_HOME", home);
				normalized.add("--courier.home=" + home);
			} else if (arg.equals("--courierHome") && i + 1 < args.length) {
				String home = args[++i];
				System.setProperty("COURIER_HOME", home);
				normalized.add("--courier.home=" + home);
			} else if (arg.startsWith("--prefix=")) {
				normalized.add("--server.servlet.context-path=" + arg.substring("--prefix=".length()));
			} else {
				normalized.add(arg);
			}
		}
		return normalized.toArray(new String[0]);
	}

	public static Path resolveCourierHome() {
		String homeEnv = System.getenv("COURIER_HOME");
		if (homeEnv != null && !homeEnv.isBlank()) {
			return Paths.get(homeEnv);
		}
		String homeProp = System.getProperty("COURIER_HOME");
		if (homeProp != null && !homeProp.isBlank()) {
			return Paths.get(homeProp);
		}
		return Paths.get(System.getProperty("user.home"), ".opencourier");
	}

	private static void initCourierDirectories() {
		try {
			Path home = resolveCourierHome();
			Path dataDir = home.resolve("data");
			Path secretsDir = home.resolve("secrets");
			Files.createDirectories(dataDir);
			Files.createDirectories(secretsDir);

			Path initialPassFile = secretsDir.resolve("initialAdminPassword");
			if (!Files.exists(initialPassFile)) {
				byte[] randomBytes = new byte[18];
				new SecureRandom().nextBytes(randomBytes);
				String pass = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
				Files.writeString(initialPassFile, pass);
				
				System.out.println("*************************************************************");
				System.out.println("OpenCourier initial setup required. Administrative account created:");
				System.out.println("  Username: admin@localhost");
				System.out.println("  Password: " + pass);
				System.out.println("Password written to: " + initialPassFile.toAbsolutePath());
				System.out.println("*************************************************************");
			}

			Path propsFile = home.resolve("opencourier.properties");
			if (Files.exists(propsFile) && System.getProperty("spring.config.import") == null) {
				System.setProperty("spring.config.import", "optional:file:" + propsFile.toAbsolutePath());
			}
		} catch (IOException ignored) {
		}
	}

	private static void configureDialectAutoDetection() {
		String dbUrl = System.getenv("DB_URL");
		if (dbUrl == null || dbUrl.isBlank()) {
			dbUrl = System.getenv("SPRING_DATASOURCE_URL");
		}
		if (dbUrl == null || dbUrl.isBlank()) {
			dbUrl = System.getProperty("spring.datasource.url");
		}
		if (dbUrl != null && (dbUrl.toLowerCase().contains(":mysql:") || dbUrl.toLowerCase().contains(":mariadb:"))) {
			System.setProperty("spring.jpa.properties.hibernate.type.preferred_boolean_jdbc_type", "TINYINT");
			if (System.getProperty("spring.profiles.active") == null && System.getenv("SPRING_PROFILES_ACTIVE") == null) {
				System.setProperty("spring.profiles.active", "mysql");
			}
		}
	}
}
