package com.sunrise.inventory_management_system.controller;

import jakarta.annotation.PostConstruct; // Use javax.annotation.PostConstruct if on older Spring Boot
import jcifs.CIFSContext;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbFile;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.Properties;

@RestController
@RequestMapping("/api/images")
//@CrossOrigin(origins = {"http://localhost:8080", "http://localhost:8081"}, allowCredentials = "true")
public class ImageController {

    private static final String SERVER_IP = "172.29.80.1";
    private static final String SHARE_NAME = "SunriseImages";
    private static final String USER = "Rohit Prabhakar";
    private static final String PASS = "Flamekaiser@14";
    private static final String DOMAIN = "";
    private CIFSContext authContext;

    /**
     * @PostConstruct ensures this runs ONCE when the server starts.
     * This creates the connection pool.
     */
    @PostConstruct
    public void initCifsContext() {
        try {
            Properties props = new Properties();
            props.setProperty("jcifs.smb.client.enableSMB2", "true");
            props.setProperty("jcifs.smb.client.useSMB2Negotiation", "true");
            props.setProperty("jcifs.smb.client.dfs.disabled", "true");

            props.setProperty("jcifs.smb.client.soTimeout", "5000"); // 5 sec socket timeout
            props.setProperty("jcifs.smb.client.connTimeout", "5000");

            PropertyConfiguration config = new PropertyConfiguration(props);
            CIFSContext baseContext = new BaseContext(config);

            // Store the authenticated context globally for this controller
            this.authContext = baseContext.withCredentials(new NtlmPasswordAuthenticator(DOMAIN, USER, PASS));

            System.out.println("SMB Context Initialized Successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize SMB Context", e);
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String filename) {
        try {
            String path = String.format("smb://%s/%s/%s", SERVER_IP, SHARE_NAME, filename);
            SmbFile remoteFile = new SmbFile(path, this.authContext);
            if (!remoteFile.exists()) {
                return ResponseEntity.notFound().build();
            }
            InputStream smbStream = remoteFile.getInputStream();
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(new InputStreamResource(smbStream));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}