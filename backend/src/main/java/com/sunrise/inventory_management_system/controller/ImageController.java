package com.sunrise.inventory_management_system.controller;

import jakarta.annotation.PostConstruct;
import jcifs.CIFSContext;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.Properties;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    // Inject values from application.properties
    @Value("${smb.server.ip}")
    private String serverIp;

    @Value("${smb.share.name}")
    private String shareName;

    @Value("${smb.username}")
    private String user;

    @Value("${smb.password}")
    private String pass;

    @Value("${smb.domain}")
    private String domain;

    private CIFSContext authContext;

    @PostConstruct
    public void initCifsContext() {
        try {
            Properties props = new Properties();
            props.setProperty("jcifs.smb.client.enableSMB2", "true");
            props.setProperty("jcifs.smb.client.useSMB2Negotiation", "true");
            props.setProperty("jcifs.smb.client.dfs.disabled", "true");
            props.setProperty("jcifs.smb.client.soTimeout", "5000");
            props.setProperty("jcifs.smb.client.connTimeout", "5000");

            PropertyConfiguration config = new PropertyConfiguration(props);
            CIFSContext baseContext = new BaseContext(config);

            // Use the injected variables here
            this.authContext = baseContext.withCredentials(new NtlmPasswordAuthenticator(domain, user, pass));

            System.out.println("SMB Context Initialized for user: " + user);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize SMB Context", e);
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String filename) {
        try {
            // Use the injected serverIp and shareName
            String path = String.format("smb://%s/%s/%s", serverIp, shareName, filename);

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