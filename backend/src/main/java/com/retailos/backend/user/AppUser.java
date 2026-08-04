package com.retailos.backend.user;

import com.retailos.backend.expiryrecord.ExpiryRecord;
import com.retailos.backend.writeoff.Writeoff;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    private String username;

    @Column(name = "password_hashed")
    private String passwordHashed;

    @Column(name = "pin_hashed")
    private String pinHashed;

    @OneToMany(mappedBy = "createdUser")
    private List<ExpiryRecord> updatedExpiryRecord = new ArrayList<>();

    @OneToMany(mappedBy = "updatedUser")
    private List<ExpiryRecord> createdExpiryRecord = new ArrayList<>();

    @OneToMany(mappedBy = "writeoffUser")
    private List<Writeoff> writeoffList = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHashed() {
        return passwordHashed;
    }

    public void setPasswordHashed(String passwordHashed) {
        this.passwordHashed = passwordHashed;
    }

    public String getPinHashed() {
        return pinHashed;
    }

    public void setPinHashed(String pinHashed) {
        this.pinHashed = pinHashed;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AppUser appUser = (AppUser) o;
        return id != null && id.equals(appUser.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
