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

        // 1. Seed Roles
        var defaultRoles = new (string Code, string Name, string Description, int Priority, bool IsSystem)[]
        {
            ("ADMIN", "Administrator", "System Administrator with full access", 1, true),
            ("MANAGER", "Manager", "Business Operations Manager", 2, true),
            ("SALES_REP", "Sales Representative", "Sales and Customer Representative", 3, false),
            ("ACCOUNTANT", "Accountant", "Finance and Accounting Officer", 4, false),
            ("WAREHOUSE_MANAGER", "Warehouse Manager", "Inventory and Warehouse Operations Manager", 5, false)
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

        // 2. Seed Core Permission Groups
        var coreGroups = new (string Code, string Name, string Description, int DisplayOrder)[]
        {
            ("IAM_USERS", "User Management", "Permissions related to user account management", 1),
            ("IAM_ROLES", "Role & Permission Management", "Permissions related to roles and permissions", 2),
            ("PRODUCT", "Product Catalog", "Permissions related to products and categories", 3),
            ("CUSTOMER", "Customer Management", "Permissions related to customers", 4),
            ("SALES", "Sales Orders", "Permissions related to sales order processing", 5),
            ("INVENTORY", "Inventory & Warehouse", "Permissions related to inventory and warehouse", 6),
            ("FINANCE", "Finance & Accounting", "Permissions related to financial ledgers", 7),
            ("REPORTS", "Reports & Analytics", "Permissions related to reporting dashboards", 8)
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

        // 3. Seed Core Permissions
        var corePermissions = new (string GroupCode, string Code, string Name, string Description, int DisplayOrder)[]
        {
            ("IAM_USERS", "users:read", "View Users", "Allows viewing user lists and details", 1),
            ("IAM_USERS", "users:create", "Create User", "Allows creating new users", 2),
            ("IAM_USERS", "users:update", "Update User", "Allows updating user details", 3),
            ("IAM_USERS", "users:delete", "Delete User", "Allows soft deleting users", 4),
            ("IAM_USERS", "users:lock", "Lock/Unlock User", "Allows locking and unlocking user accounts", 5),

            ("IAM_ROLES", "roles:read", "View Roles", "Allows viewing roles", 1),
            ("IAM_ROLES", "roles:manage", "Manage Roles", "Allows creating, updating, deleting roles", 2),
            ("IAM_ROLES", "permissions:manage", "Manage Permissions", "Allows managing permission assignments", 3),

            ("PRODUCT", "products:read", "View Products", "Allows viewing products", 1),
            ("PRODUCT", "products:write", "Manage Products", "Allows creating and editing products", 2),

            ("CUSTOMER", "customers:read", "View Customers", "Allows viewing customer details", 1),
            ("CUSTOMER", "customers:write", "Manage Customers", "Allows managing customer records", 2),

            ("SALES", "sales:read", "View Sales Orders", "Allows viewing sales orders", 1),
            ("SALES", "sales:write", "Process Sales Orders", "Allows creating and managing sales orders", 2),

            ("INVENTORY", "inventory:read", "View Inventory", "Allows viewing stock levels", 1),
            ("INVENTORY", "inventory:write", "Manage Stock", "Allows adjusting inventory", 2),

            ("FINANCE", "finance:read", "View Ledger", "Allows viewing financial statements", 1),
            ("FINANCE", "finance:write", "Manage Transactions", "Allows creating financial transactions", 2),

            ("REPORTS", "reports:view", "View Reports", "Allows generating operational reports", 1)
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
