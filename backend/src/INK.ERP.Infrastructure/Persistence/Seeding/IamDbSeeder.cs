using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Seeding;

public static class IamDbSeeder
{
    public static async Task SeedAsync(AppDbContext context, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager, ILogger logger)
    {
        logger.LogInformation("Starting IAM Database Seeding...");

        // 0. Ensure security_audit_logs columns exist in PostgreSQL
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""UserId"" uuid NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Username"" character varying(100) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""EmployeeId"" character varying(100) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""EventType"" character varying(100) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Module"" character varying(100) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Description"" character varying(1000) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Success"" boolean NOT NULL DEFAULT TRUE;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""FailureReason"" character varying(1000) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Device"" character varying(250) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Browser"" character varying(250) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""OperatingSystem"" character varying(250) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Location"" character varying(250) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""Endpoint"" character varying(250) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""HttpMethod"" character varying(20) NULL;
                ALTER TABLE iam.security_audit_logs ADD COLUMN IF NOT EXISTS ""ProcessingTimeMs"" bigint NULL;
            ");
            logger.LogInformation("Updated PostgreSQL table iam.security_audit_logs schema.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Column migration for security_audit_logs skipped or handled.");
        }

        // 1. Seed Roles (12 Production Default Roles)
        var defaultRoles = new (string Code, string Name, string Description, int Priority, bool IsSystem)[]
        {
            ("ADMIN", "Administrator", "System Administrator with full master access", 1, true),
            ("SALES_MANAGER", "Sales Manager", "Manages sales operations, approvals, and reps", 2, true),
            ("SALES_REP", "Sales Representative", "Sales order processing and customer relations", 3, false),
            ("PURCHASE_MANAGER", "Purchase Manager", "Procurement, vendor management, and purchase approvals", 4, false),
            ("WAREHOUSE_MANAGER", "Warehouse Manager", "Warehouse inventory and dispatch logistics", 5, false),
            ("INVENTORY_MANAGER", "Inventory Manager", "Stock auditing, adjustments, and catalog management", 6, false),
            ("ACCOUNTANT", "Accountant", "Finance ledgers, vouchers, and invoicing", 7, false),
            ("HR_MANAGER", "HR Manager", "Human capital, employee onboarding, and access control", 8, false),
            ("SUPERVISOR", "Supervisor", "Shift supervisor with operational approval rights", 9, false),
            ("DRIVER", "Driver", "Delivery logistics, route verification, and proof of delivery", 10, false),
            ("DISTRIBUTOR_PORTAL", "Distributor Portal User", "External distributor portal access for order placement", 11, false),
            ("CUSTOMER_PORTAL", "Customer Portal User", "External customer portal access for self-service", 12, false)
        };

        foreach (var r in defaultRoles)
        {
            if (!await roleManager.RoleExistsAsync(r.Name))
            {
                var role = new ApplicationRole
                {
                    Id = Guid.NewGuid(),
                    Name = r.Name,
                    NormalizedName = r.Name.ToUpperInvariant(),
                    Code = r.Code,
                    Description = r.Description,
                    Priority = r.Priority,
                    IsSystem = r.IsSystem,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };
                await roleManager.CreateAsync(role);
                logger.LogInformation("Seeded Role: {RoleName}", r.Name);
            }
        }

        // 2. Seed Core Permission Groups / Modules
        var coreGroups = new (string Code, string Name, string Description, int DisplayOrder)[]
        {
            ("INVENTORY", "Inventory", "Stock levels, warehouses, stock adjustments and transfers", 1),
            ("SALES", "Sales", "Sales orders, invoicing, quotes, and customer accounts", 2),
            ("PROCUREMENT", "Procurement / Purchase", "Purchase orders, supplier management, and goods receipt", 3),
            ("FINANCE", "Finance", "General ledger, vouchers, payments, and financial statements", 4),
            ("SECURITY", "Security & IAM", "User accounts, role security profiles, policies, biometrics, and audit trail", 5),
            ("REPORTS", "Reports", "Business intelligence, operational reports, and export scheduling", 6),
            ("DASHBOARD", "Dashboard", "Executive KPI widgets, analytics charts, and operational overview", 7)
        };

        var groupDict = new Dictionary<string, Guid>();

        foreach (var g in coreGroups)
        {
            var existingGroup = await context.PermissionGroups.FirstOrDefaultAsync(pg => pg.Code == g.Code);
            if (existingGroup == null)
            {
                var group = new PermissionGroup
                {
                    Id = Guid.NewGuid(),
                    Code = g.Code,
                    Name = g.Name,
                    Description = g.Description,
                    DisplayOrder = g.DisplayOrder,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };
                context.PermissionGroups.Add(group);
                await context.SaveChangesAsync();
                groupDict[g.Code] = group.Id;
                logger.LogInformation("Seeded Permission Group: {GroupName}", g.Name);
            }
            else
            {
                groupDict[g.Code] = existingGroup.Id;
            }
        }

        // 3. Seed Core Permissions per ERP Module & Action Matrix
        var corePermissions = new (string GroupCode, string Code, string Name, string Description, int DisplayOrder)[]
        {
            // Inventory Module Permissions
            ("INVENTORY", "inventory:view", "View Inventory", "View stock levels and warehouse data", 1),
            ("INVENTORY", "inventory:create", "Create Inventory", "Add new stock items or warehouse entries", 2),
            ("INVENTORY", "inventory:edit", "Edit Inventory", "Modify stock levels and item properties", 3),
            ("INVENTORY", "inventory:delete", "Delete Inventory", "Remove stock records or items", 4),
            ("INVENTORY", "inventory:approve", "Approve Stock Adjustments", "Approve inventory audits and transfers", 5),
            ("INVENTORY", "inventory:export", "Export Inventory Data", "Export stock reports to CSV/Excel", 6),
            ("INVENTORY", "inventory:print", "Print Barcodes & Stock Tags", "Print inventory labels and tags", 7),
            ("INVENTORY", "inventory:import", "Import Stock Records", "Bulk import stock items from CSV", 8),

            // Sales Module Permissions
            ("SALES", "sales:view", "View Sales", "View sales orders and customer invoices", 1),
            ("SALES", "sales:create", "Create Sales Order", "Create new sales quotes and orders", 2),
            ("SALES", "sales:edit", "Edit Sales Order", "Modify pending sales orders", 3),
            ("SALES", "sales:delete", "Delete Sales Order", "Cancel or soft delete sales orders", 4),
            ("SALES", "sales:approve", "Approve Sales Order", "Approve high-value sales orders", 5),
            ("SALES", "sales:reject", "Reject Sales Order", "Reject non-compliant sales orders", 6),
            ("SALES", "sales:export", "Export Sales Data", "Export sales invoices and customer lists", 7),
            ("SALES", "sales:print", "Print Receipts & Invoices", "Print sales order invoices and receipts", 8),

            // Procurement / Purchase Module Permissions
            ("PROCUREMENT", "procurement:view", "View Procurement", "View purchase orders and supplier catalog", 1),
            ("PROCUREMENT", "procurement:create", "Create Purchase Order", "Draft new purchase orders", 2),
            ("PROCUREMENT", "procurement:edit", "Edit Purchase Order", "Modify pending purchase orders", 3),
            ("PROCUREMENT", "procurement:delete", "Delete Purchase Order", "Delete purchase orders", 4),
            ("PROCUREMENT", "procurement:approve", "Approve Purchase Order", "Approve purchase orders for vendor release", 5),
            ("PROCUREMENT", "procurement:reject", "Reject Purchase Order", "Reject purchase requisitions", 6),
            ("PROCUREMENT", "procurement:export", "Export Procurement Data", "Export purchase orders and vendor ledgers", 7),
            ("PROCUREMENT", "procurement:print", "Print Purchase Orders", "Print purchase order documentation", 8),
            ("PROCUREMENT", "procurement:import", "Import Supplier Catalogs", "Bulk import vendor pricelists", 9),

            // Finance Module Permissions
            ("FINANCE", "finance:view", "View Financial Statements", "View general ledger, balance sheet, P&L", 1),
            ("FINANCE", "finance:create", "Create Financial Voucher", "Draft payment and journal vouchers", 2),
            ("FINANCE", "finance:edit", "Edit Financial Entries", "Modify unposted financial vouchers", 3),
            ("FINANCE", "finance:delete", "Delete Financial Vouchers", "Void or soft-delete journal entries", 4),
            ("FINANCE", "finance:approve", "Approve Financial Disbursal", "Approve disbursements and payments", 5),
            ("FINANCE", "finance:export", "Export Financial Ledgers", "Export ledger data for auditing", 6),
            ("FINANCE", "finance:print", "Print Financial Statements", "Print vouchers and P&L reports", 7),

            // Security Module Permissions
            ("SECURITY", "security:user_management", "User Management", "Manage user accounts, locking, and status", 1),
            ("SECURITY", "security:role_management", "Role Management", "Create, edit, clone, and assign roles & permissions", 2),
            ("SECURITY", "security:policies", "Authentication Policies", "Configure MFA, GPS geofencing, and password rules", 3),
            ("SECURITY", "security:biometrics", "Biometrics & Face Registration", "Enroll and manage face template biometrics", 4),
            ("SECURITY", "security:audit_logs", "Security Audit Trail", "View security audit trail logs and incidents", 5),
            ("SECURITY", "security:global_settings", "Global Platform Settings", "Manage enterprise system configurations", 6),

            // Reports Module Permissions
            ("REPORTS", "reports:view", "View Reports", "View analytical and operational reports", 1),
            ("REPORTS", "reports:export", "Export Reports", "Export reports to PDF, CSV, Excel", 2),
            ("REPORTS", "reports:schedule", "Schedule Automated Reports", "Configure automated report email dispatches", 3),
            ("REPORTS", "reports:print", "Print Reports", "Print operational reports", 4),

            // Dashboard Module Permissions
            ("DASHBOARD", "dashboard:view_dashboard", "View Dashboard", "Access main ERP dashboard overview", 1),
            ("DASHBOARD", "dashboard:view_kpi", "View Executive KPIs", "Access executive financial & sales KPIs", 2),
            ("DASHBOARD", "dashboard:view_analytics", "View Analytics Charts", "Access real-time interactive chart widgets", 3)
        };

        var allPermissionIds = new List<Guid>();

        foreach (var p in corePermissions)
        {
            var existingPerm = await context.Permissions.FirstOrDefaultAsync(perm => perm.Code == p.Code);
            if (existingPerm == null)
            {
                var groupGuid = groupDict[p.GroupCode];
                var perm = new Permission
                {
                    Id = Guid.NewGuid(),
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    PermissionGroupId = groupGuid,
                    DisplayOrder = p.DisplayOrder,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };
                context.Permissions.Add(perm);
                await context.SaveChangesAsync();
                allPermissionIds.Add(perm.Id);
                logger.LogInformation("Seeded Permission: {PermissionCode}", p.Code);
            }
            else
            {
                allPermissionIds.Add(existingPerm.Id);
            }
        }

        // 4. Link All Permissions to ADMIN Role
        var adminRole = await roleManager.FindByNameAsync("Administrator");
        if (adminRole != null)
        {
            foreach (var permId in allPermissionIds)
            {
                var exists = await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id && rp.PermissionId == permId);
                if (!exists)
                {
                    context.RolePermissions.Add(new RolePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = adminRole.Id,
                        PermissionId = permId,
                        CreatedAtUtc = DateTime.UtcNow
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // 5. Seed First Administrator User
        const string adminEmail = "admin@inkerp.com";
        const string adminUsername = "admin";

        var adminUser = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.NormalizedUserName == adminUsername.ToUpperInvariant() || u.NormalizedEmail == adminEmail.ToUpperInvariant());
        if (adminUser == null)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = adminUsername,
                NormalizedUserName = adminUsername.ToUpperInvariant(),
                Email = adminEmail,
                NormalizedEmail = adminEmail.ToUpperInvariant(),
                EmailConfirmed = true,
                FirstName = "System",
                LastName = "Administrator",
                DisplayName = "System Administrator",
                IsActive = true,
                IsLocked = false,
                IsDeleted = false,
                CreatedAtUtc = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(user, "AdminPassword123!");
            if (createResult.Succeeded)
            {
                user.PasswordHash = "HASHED:AdminPassword123!";
                user.IsActive = true;
                user.IsLocked = false;
                user.IsDeleted = false;
                await userManager.UpdateAsync(user);
                adminUser = user;
                logger.LogInformation("Seeded Default Administrator Account: {Email}", adminEmail);
            }
            else
            {
                logger.LogError("Failed to create default Admin user: {Errors}", string.Join(", ", createResult.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            adminUser.PasswordHash = "HASHED:AdminPassword123!";
            adminUser.IsActive = true;
            adminUser.IsLocked = false;
            adminUser.IsDeleted = false;
            adminUser.AccessFailedCount = 0;
            adminUser.LockoutEnd = null;
            context.Users.Update(adminUser);
            await context.SaveChangesAsync();
            logger.LogInformation("Updated Default Administrator Account password and status: {Email}", adminEmail);
        }

        if (adminUser != null && adminRole != null)
        {
            var roleExists = await context.IAMUserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id && !ur.IsDeleted);
            if (!roleExists)
            {
                context.IAMUserRoles.Add(new UserRole
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUser.Id,
                    RoleId = adminRole.Id,
                    CreatedAtUtc = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
        }

        logger.LogInformation("IAM Database Seeding Completed Successfully.");
    }
}
